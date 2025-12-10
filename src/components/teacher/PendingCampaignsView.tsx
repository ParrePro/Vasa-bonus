import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Zap, Trophy, X } from "lucide-react";

interface PendingCampaignsViewProps {
  classId: string;
  canFulfillCampaigns?: boolean;
}

interface PendingParticipation {
  id: string;
  student_id: string;
  campaign_id: string;
  class_id: string;
  joined_at: string;
  campaign: {
    title: string;
    description: string;
    campaign_type: 'multiplier' | 'set_points';
    multiplier_value: number | null;
    points_value: number | null;
    duration_type: string | null;
    duration_days: number | null;
  };
  student: {
    name: string;
  };
  class: {
    name: string;
  };
}

const PendingCampaignsView = ({ classId, canFulfillCampaigns = true }: PendingCampaignsViewProps) => {
  const [pendingParticipations, setPendingParticipations] = useState<PendingParticipation[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPendingParticipations();

    const channel = supabase
      .channel('pending-campaigns')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaign_participations' },
        () => {
          loadPendingParticipations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

  const loadPendingParticipations = async () => {
    const { data, error } = await supabase
      .from('campaign_participations')
      .select(`
        id,
        student_id,
        campaign_id,
        class_id,
        joined_at
      `)
      .eq('class_id', classId)
      .eq('status', 'pending')
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error loading pending participations:', error);
      return;
    }

    if (!data || data.length === 0) {
      setPendingParticipations([]);
      return;
    }

    // Fetch related data separately
    const campaignIds = [...new Set(data.map(p => p.campaign_id))];
    const studentIds = [...new Set(data.map(p => p.student_id))];

    const [campaignsData, studentsData, classData] = await Promise.all([
      supabase.from('campaigns').select('id, title, description, campaign_type, multiplier_value, points_value, duration_type, duration_days').in('id', campaignIds),
      supabase.from('profiles').select('id, name').in('id', studentIds),
      supabase.from('classes').select('id, name').eq('id', classId).single()
    ]);

    if (campaignsData.error || studentsData.error || classData.error) {
      console.error('Error loading related data:', { campaignsData, studentsData, classData });
      return;
    }

    // Create lookup maps
    const campaignsMap = new Map(campaignsData.data?.map(c => [c.id, c]) || []);
    const studentsMap = new Map(studentsData.data?.map(s => [s.id, s]) || []);

    // Transform the data
    const transformedData = data.map(item => {
      const campaign = campaignsMap.get(item.campaign_id);
      const student = studentsMap.get(item.student_id);
      
      return {
        id: item.id,
        student_id: item.student_id,
        campaign_id: item.campaign_id,
        class_id: item.class_id,
        joined_at: item.joined_at,
        campaign: {
          title: campaign?.title || 'Unknown Campaign',
          description: campaign?.description || '',
          campaign_type: campaign?.campaign_type as 'multiplier' | 'set_points',
          multiplier_value: campaign?.multiplier_value,
          points_value: campaign?.points_value,
          duration_type: campaign?.duration_type,
          duration_days: campaign?.duration_days,
        },
        student: {
          name: student?.name || 'Unknown Student',
        },
        class: {
          name: classData.data?.name || 'Unknown Class',
        }
      };
    });

    setPendingParticipations(transformedData as PendingParticipation[]);
  };

  const handleConfirm = async (participationId: string, campaignType: string, pointsValue: number | null) => {
    if (!canFulfillCampaigns) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to confirm campaign participations",
        variant: "destructive",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to confirm campaigns",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/functions/confirm-campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          participationId,
          classId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.error || "Failed to confirm participation",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: campaignType === 'set_points' 
          ? "Participation confirmed and points awarded" 
          : "Student is now in the campaign",
      });

      loadPendingParticipations();
    } catch (error) {
      console.error('Error confirming participation:', error);
      toast({
        title: "Error",
        description: "Failed to confirm participation",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (participationId: string) => {
    if (!canFulfillCampaigns) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to reject campaign participations",
        variant: "destructive",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to reject campaigns",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/functions/reject-campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          participationId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.error || "Failed to reject participation",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Campaign participation rejected",
      });

      loadPendingParticipations();
    } catch (error) {
      console.error('Error rejecting participation:', error);
      toast({
        title: "Error",
        description: "Failed to reject participation",
        variant: "destructive",
      });
    }
  };

  if (pendingParticipations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No pending campaign participations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pendingParticipations.map((participation) => (
        <Card key={participation.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>{participation.campaign.title}</CardTitle>
                <CardDescription>
                  {participation.student.name} from {participation.class.name}
                </CardDescription>
              </div>
              <Badge variant="outline">
                {new Date(participation.joined_at).toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {participation.campaign.description}
                </p>
                {participation.campaign.campaign_type === 'multiplier' && (
                  <Badge className="bg-gradient-to-r from-primary to-primary-glow text-white font-semibold shadow-sm">
                    <Zap className="w-3 h-3 mr-1" />
                    {participation.campaign.multiplier_value}x Points Multiplier
                  </Badge>
                )}
                {participation.campaign.campaign_type === 'set_points' && (
                  <Badge className="bg-gradient-to-r from-secondary to-primary text-white font-semibold shadow-sm">
                    <Trophy className="w-3 h-3 mr-1" />
                    {participation.campaign.points_value} Points Reward
                  </Badge>
                )}
              </div>
              {canFulfillCampaigns && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleConfirm(
                      participation.id, 
                      participation.campaign.campaign_type,
                      participation.campaign.points_value
                    )}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirm
                  </Button>
                  <Button
                    onClick={() => handleReject(participation.id)}
                    variant="destructive"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PendingCampaignsView;