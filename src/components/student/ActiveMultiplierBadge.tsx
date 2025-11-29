import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActiveMultiplier {
  id: string;
  campaign: {
    title: string;
    multiplier_value: number;
  };
  expires_at: string | null;
}

export const ActiveMultiplierBadge = () => {
  const [activeMultipliers, setActiveMultipliers] = useState<ActiveMultiplier[]>([]);

  useEffect(() => {
    loadActiveMultipliers();

    const channel = supabase
      .channel('active-multipliers')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'campaign_participations' },
        () => {
          loadActiveMultipliers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadActiveMultipliers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('campaign_participations')
      .select(`
        id,
        campaign_id,
        expires_at
      `)
      .eq('student_id', user.id)
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${now}`);

    if (error) {
      console.error('Error loading active multipliers:', error);
      return;
    }

    if (!data || data.length === 0) {
      setActiveMultipliers([]);
      return;
    }

    // Fetch campaign data
    const campaignIds = [...new Set(data.map((p: any) => p.campaign_id))];
    const { data: campaignsData } = await supabase
      .from('campaigns')
      .select('id, title, multiplier_value, campaign_type')
      .in('id', campaignIds)
      .eq('campaign_type', 'multiplier');

    if (!campaignsData) return;

    const campaignsMap = new Map(campaignsData.map(c => [c.id, c]));

    const transformed = data
      .map((item: any) => {
        const campaign = campaignsMap.get(item.campaign_id);
        if (!campaign) return null;
        
        return {
          id: item.id,
          campaign: {
            title: campaign.title,
            multiplier_value: campaign.multiplier_value || 2,
          },
          expires_at: item.expires_at,
        };
      })
      .filter(Boolean) as ActiveMultiplier[];

    setActiveMultipliers(transformed);
  };

  if (activeMultipliers.length === 0) return null;

  return (
    <div className="space-y-2">
      {activeMultipliers.map((multiplier) => (
        <Badge 
          key={multiplier.id}
          className="bg-gradient-to-r from-primary to-primary-glow text-white font-semibold shadow-lg animate-pulse"
        >
          <Zap className="w-3 h-3 mr-1" />
          {multiplier.campaign.multiplier_value}x Active
          {multiplier.expires_at && (
            <span className="ml-2 text-xs opacity-90">
              (expires {formatDistanceToNow(new Date(multiplier.expires_at), { addSuffix: true })})
            </span>
          )}
        </Badge>
      ))}
    </div>
  );
};
