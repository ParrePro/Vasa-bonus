import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trophy, Zap, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface CampaignsViewProps {
  classId: string;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  campaign_type: 'multiplier' | 'set_points';
  multiplier_value: number | null;
  points_value: number | null;
  available_from: string | null;
  available_until: string | null;
  duration_type: string | null;
  duration_days: number | null;
  max_participations: number | null;
}

interface Participation {
  campaign_id: string;
  status: 'pending' | 'active' | 'completed';
  expires_at: string | null;
}

const CampaignsView = ({ classId }: CampaignsViewProps) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCampaigns();
    loadParticipations();

    const channel = supabase
      .channel('campaign-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaign_participations' },
        () => {
          loadParticipations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

  const loadCampaigns = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No user found for loadCampaigns');
      return;
    }

    // Get user's class
    const { data: memberData, error: memberError } = await supabase
      .from('class_members')
      .select('class_id')
      .eq('user_id', user.id)
      .eq('is_teacher', false)
      .single();

    console.log('Member data:', memberData, 'Error:', memberError);

    if (!memberData) return;

    // Load campaigns available in the student's class via campaign_classes
    const { data: campaignClassData, error: ccError } = await supabase
      .from('campaign_classes')
      .select('campaign_id')
      .eq('class_id', memberData.class_id);

    console.log('Campaign class data:', campaignClassData, 'Error:', ccError);

    if (!campaignClassData || campaignClassData.length === 0) {
      setCampaigns([]);
      return;
    }

    const campaignIds = campaignClassData.map(cc => cc.campaign_id);
    console.log('Campaign IDs to load:', campaignIds);

    // Load active campaigns for this class
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .in('id', campaignIds)
      .eq('active', true)
      .order('created_at', { ascending: false });

    console.log('Campaigns loaded:', data, 'Error:', error);

    if (error) {
      console.error('Error loading campaigns:', error);
      return;
    }

    // Filter by availability dates client-side
    const now = new Date();
    const availableCampaigns = (data || []).filter((campaign: any) => {
      const fromOk = !campaign.available_from || new Date(campaign.available_from) <= now;
      const untilOk = !campaign.available_until || new Date(campaign.available_until) >= now;
      console.log('Campaign', campaign.title, 'fromOk:', fromOk, 'untilOk:', untilOk);
      return fromOk && untilOk;
    });

    console.log('Available campaigns after date filter:', availableCampaigns);
    setCampaigns(availableCampaigns as Campaign[]);
  };

  const loadParticipations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('campaign_participations')
      .select('campaign_id, status, expires_at')
      .eq('student_id', user.id)
      .eq('class_id', classId);

    if (error) {
      console.error('Error loading participations:', error);
      return;
    }

    setParticipations((data || []) as Participation[]);
  };

  const handleJoinCampaign = async (campaignId: string) => {
    setJoiningId(campaignId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Use the backend API to join campaign (this also sends email notifications)
    const { data, error } = await supabase.functions.invoke('join-campaign', {
      body: { campaignId, classId }
    });

    if (error || !data?.success) {
      setJoiningId(null);
      toast({
        title: "Error",
        description: error || data?.error || "Failed to join campaign",
        variant: "destructive",
      });
      return;
    }

    setJoiningId(null);

    toast({
      title: "Request Sent",
      description: "Your teacher will confirm your participation",
    });

    // Reload both campaigns and participations to show pending status
    loadCampaigns();
    loadParticipations();
  };

  const getParticipationStatus = (campaignId: string) => {
    return participations.find(p => p.campaign_id === campaignId);
  };

  const getParticipationCount = (campaignId: string) => {
    return participations.filter(p => p.campaign_id === campaignId).length;
  };

  const isExpired = (participation: Participation | undefined) => {
    if (!participation?.expires_at) return false;
    return new Date(participation.expires_at) < new Date();
  };

  const canJoinCampaign = (campaign: Campaign) => {
    const count = getParticipationCount(campaign.id);
    // If max_participations is null, unlimited joins allowed
    if (campaign.max_participations === null) return true;
    return count < campaign.max_participations;
  };

  const availableCampaigns = campaigns.filter(c => {
    const participation = getParticipationStatus(c.id);
    const hasActiveOrPending = participations.some(
      p => p.campaign_id === c.id && (p.status === 'pending' || (p.status === 'active' && !isExpired(p)))
    );
    // Show if can join and doesn't have an active/pending participation
    return canJoinCampaign(c) && !hasActiveOrPending;
  });

  const activeCampaigns = campaigns.filter(c => {
    const participation = getParticipationStatus(c.id);
    // Only show active campaigns that are NOT expired
    return participation?.status === 'active' && !isExpired(participation);
  });

  const pendingCampaigns = campaigns.filter(c => {
    const participation = getParticipationStatus(c.id);
    return participation?.status === 'pending';
  });

  return (
    <div className="space-y-8">
      {activeCampaigns.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Active Campaigns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCampaigns.map((campaign) => {
              const participation = getParticipationStatus(campaign.id);
              return (
              <Card key={campaign.id} className="overflow-hidden border-primary/20 shadow-lg">
                {campaign.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={campaign.image_url} 
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{campaign.title}</CardTitle>
                    <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-sm">
                      Active
                    </Badge>
                  </div>
                  <CardDescription>{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {campaign.campaign_type === 'multiplier' && (
                      <Badge className="bg-gradient-to-r from-primary to-primary-glow text-white font-semibold shadow-sm">
                        <Zap className="w-3 h-3 mr-1" />
                        {campaign.multiplier_value}x Points Multiplier
                      </Badge>
                    )}
                    {campaign.campaign_type === 'set_points' && (
                      <Badge className="bg-gradient-to-r from-secondary to-primary text-white font-semibold shadow-sm">
                        <Trophy className="w-3 h-3 mr-1" />
                        {campaign.points_value} Points Reward
                      </Badge>
                    )}
                    {participation?.expires_at && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          Expires {formatDistanceToNow(new Date(participation.expires_at), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                    {participation?.expires_at && (
                      <p className="text-xs text-muted-foreground">
                        ({format(new Date(participation.expires_at), "MMM d, yyyy 'at' h:mm a")})
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>
      )}

      {pendingCampaigns.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Pending Confirmation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingCampaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden opacity-75">
                {campaign.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={campaign.image_url} 
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{campaign.title}</CardTitle>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-sm">
                      Pending
                    </Badge>
                  </div>
                  <CardDescription>{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {campaign.campaign_type === 'multiplier' && (
                      <Badge className="bg-gradient-to-r from-primary to-primary-glow text-white font-semibold shadow-sm">
                        <Zap className="w-3 h-3 mr-1" />
                        {campaign.multiplier_value}x Points Multiplier
                      </Badge>
                    )}
                    {campaign.campaign_type === 'set_points' && (
                      <Badge className="bg-gradient-to-r from-secondary to-primary text-white font-semibold shadow-sm">
                        <Trophy className="w-3 h-3 mr-1" />
                        {campaign.points_value} Points Reward
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">Available Campaigns</h2>
        {availableCampaigns.length === 0 ? (
          <p className="text-muted-foreground">No campaigns available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCampaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                {campaign.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={campaign.image_url} 
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{campaign.title}</CardTitle>
                  <CardDescription>{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {campaign.campaign_type === 'multiplier' && (
                        <Badge className="bg-gradient-to-r from-primary to-primary-glow text-white font-semibold shadow-sm">
                          <Zap className="w-3 h-3 mr-1" />
                          {campaign.multiplier_value}x Points Multiplier
                        </Badge>
                      )}
                      {campaign.campaign_type === 'set_points' && (
                        <Badge className="bg-gradient-to-r from-secondary to-primary text-white font-semibold shadow-sm">
                          <Trophy className="w-3 h-3 mr-1" />
                          {campaign.points_value} Points Reward
                        </Badge>
                      )}
                      {campaign.duration_type && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>
                            Duration: {
                              campaign.duration_type === '2_minutes' ? '2 minutes' :
                              campaign.duration_type === '1_week' ? '1 week' :
                              campaign.duration_type === '1_month' ? '1 month' :
                              campaign.duration_type === '1_year' ? '1 year' :
                              campaign.duration_type === 'custom' && campaign.duration_days ? `${campaign.duration_days} days` :
                              campaign.duration_type === 'unlimited' ? 'Unlimited' : 'N/A'
                            }
                          </span>
                        </div>
                      )}
                      {campaign.available_until && (
                        <Badge variant="outline">
                          Available until {new Date(campaign.available_until).toLocaleDateString()}
                        </Badge>
                      )}
                      {campaign.max_participations !== null && (
                        <div className="text-sm text-muted-foreground">
                          Limit: {campaign.max_participations === 1 ? 'Once per student' : `${campaign.max_participations} times per student`}
                          {getParticipationCount(campaign.id) > 0 && (
                            <span className="ml-1">
                              ({getParticipationCount(campaign.id)}/{campaign.max_participations} used)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handleJoinCampaign(campaign.id)}
                      disabled={joiningId === campaign.id}
                    >
                      {joiningId === campaign.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        'Join Campaign'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignsView;