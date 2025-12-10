import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Mail, X } from "lucide-react";
import { format } from "date-fns";

interface MessagesViewProps {
  classId: string;
}

const MessagesView = ({ classId }: MessagesViewProps) => {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    loadMessages();

    // Subscribe to realtime updates for messages
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `class_id=eq.${classId}`,
        },
        () => {
          console.log('New message received, reloading...');
          loadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId]);

  const loadMessages = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: baseMessages, error } = await supabase
      .from("messages")
      .select(
        "id, class_id, teacher_id, student_id, message, message_type, is_read, created_at, reward_purchase_id, campaign_participation_id"
      )
      .eq("class_id", classId)
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });

    console.log("Messages query result for user:", user.id, "data:", baseMessages, "error:", error);

    if (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
      return;
    }

    if (!baseMessages || baseMessages.length === 0) {
      setMessages([]);
      return;
    }

    const studentIds = [...new Set(baseMessages.map((m: any) => m.student_id as string))];
    const purchaseIds = [...new Set(
      baseMessages
        .map((m: any) => m.reward_purchase_id as string | null)
        .filter((id): id is string => !!id)
    )];

    const participationIds = [...new Set(
      baseMessages
        .map((m: any) => m.campaign_participation_id as string | null)
        .filter((id): id is string => !!id)
    )];

    const [profilesResult, purchasesResult, classResult, participationsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, name")
        .in("id", studentIds),
      purchaseIds.length
        ? supabase
            .from("reward_purchases")
            .select("id, status, reward_id")
            .in("id", purchaseIds)
        : Promise.resolve({ data: [], error: null } as any),
      supabase
        .from("classes")
        .select("id, name")
        .eq("id", classId)
        .single(),
      participationIds.length
        ? supabase
            .from("campaign_participations")
            .select("id, status, campaign_id")
            .in("id", participationIds)
        : Promise.resolve({ data: [], error: null } as any),
    ]);

    const { data: profileData } = profilesResult as any;
    const { data: purchaseData } = purchasesResult as any;
    const { data: classData } = classResult as any;
    const { data: participationData } = participationsResult as any;

    const rewardIds = [...new Set((purchaseData || []).map((p: any) => p.reward_id as string))] as string[];
    const campaignIds = [...new Set((participationData || []).map((p: any) => p.campaign_id as string))] as string[];

    const [rewardsResult, campaignsResult] = await Promise.all([
      rewardIds.length
        ? supabase.from("rewards").select("id, title, category").in("id", rewardIds)
        : Promise.resolve({ data: [] } as any),
      campaignIds.length
        ? supabase.from("campaigns").select("id, title").in("id", campaignIds)
        : Promise.resolve({ data: [] } as any),
    ]);

    const { data: rewardsData } = rewardsResult as any;
    const { data: campaignsData } = campaignsResult as any;

    const profileMap = (profileData || []).reduce((acc: any, p: any) => {
      acc[p.id] = p.name;
      return acc;
    }, {} as Record<string, string>);

    const purchasesMap = (purchaseData || []).reduce((acc: any, p: any) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<string, any>);

    const participationsMap = (participationData || []).reduce((acc: any, p: any) => {
      acc[p.id] = p;
      return acc;
    }, {} as Record<string, any>);

    const rewardsMap = (rewardsData || []).reduce((acc: any, r: any) => {
      acc[r.id] = r;
      return acc;
    }, {} as Record<string, any>);

    const campaignsMap = (campaignsData || []).reduce((acc: any, c: any) => {
      acc[c.id] = c;
      return acc;
    }, {} as Record<string, any>);

    const enrichedMessages = baseMessages.map((m: any) => {
      const purchase = m.reward_purchase_id
        ? purchasesMap[m.reward_purchase_id]
        : null;
      const reward = purchase ? rewardsMap[purchase.reward_id] : null;
      
      const participation = m.campaign_participation_id
        ? participationsMap[m.campaign_participation_id]
        : null;
      const campaign = participation ? campaignsMap[participation.campaign_id] : null;

      return {
        ...m,
        studentName: profileMap[m.student_id] || "Unknown Student",
        className: classData?.name || "Unknown Class",
        reward,
        purchaseStatus: purchase?.status || null,
        campaign,
        participationStatus: participation?.status || null,
      };
    });

    setMessages(enrichedMessages);
  };

  const handleFulfill = async (messageId: string, purchaseId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    console.log("Fulfilling purchase:", purchaseId);

    const { error: updateError } = await supabase
      .from("reward_purchases")
      .update({
        status: "fulfilled",
        fulfilled_at: new Date().toISOString(),
        fulfilled_by: user.id,
      })
      .eq("id", purchaseId);

    if (updateError) {
      console.error("Error fulfilling reward:", updateError);
      toast({ title: "Error fulfilling reward", variant: "destructive" });
      return;
    }

    // Mark ALL messages related to this purchase as read
    const { error: messageError } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("reward_purchase_id", purchaseId);

    if (messageError) {
      console.error("Error updating messages:", messageError);
    }

    toast({ title: "Reward marked as fulfilled!" });
    loadMessages();
  };

  const handleApproveCampaign = async (messageId: string, participationId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    console.log("Approving campaign participation:", participationId);

    // First, get the participation to find the campaign_id and student_id
    const { data: participationData } = await supabase
      .from("campaign_participations")
      .select("campaign_id, student_id, class_id")
      .eq("id", participationId)
      .single();

    if (!participationData) {
      toast({ title: "Error finding participation", variant: "destructive" });
      return;
    }

    // Get the campaign to check type and duration
    const { data: campaignData } = await supabase
      .from("campaigns")
      .select("title, campaign_type, points_value, duration_type, duration_days")
      .eq("id", participationData.campaign_id)
      .single();

    if (!campaignData) {
      toast({ title: "Error finding campaign", variant: "destructive" });
      return;
    }

    // Calculate expires_at based on campaign duration
    let expiresAt: string | null = null;
    const now = new Date();
    if (campaignData.duration_type === '2_minutes') {
      expiresAt = new Date(now.getTime() + 2 * 60 * 1000).toISOString();
    } else if (campaignData.duration_type === '1_week') {
      expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (campaignData.duration_type === '1_month') {
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (campaignData.duration_type === '1_year') {
      expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
    } else if (campaignData.duration_type === 'custom' && campaignData.duration_days) {
      expiresAt = new Date(now.getTime() + campaignData.duration_days * 24 * 60 * 60 * 1000).toISOString();
    }
    // If duration_type is 'unlimited' or null, expiresAt stays null

    // For set_points campaigns, award the points immediately
    if (campaignData.campaign_type === 'set_points' && campaignData.points_value) {
      // Create a points transaction
      const { error: pointsError } = await supabase
        .from("points_transactions")
        .insert({
          student_id: participationData.student_id,
          class_id: participationData.class_id,
          points: campaignData.points_value,
          reason: `Campaign reward: ${campaignData.title}`,
          teacher_id: user.id,
        });

      if (pointsError) {
        console.error("Error awarding campaign points:", pointsError);
        toast({ title: "Error awarding points", variant: "destructive" });
        return;
      }
    }

    const { error: updateError } = await supabase
      .from("campaign_participations")
      .update({
        status: campaignData.campaign_type === 'set_points' ? "completed" : "active",
        joined_at: new Date().toISOString(),
        expires_at: expiresAt,
      })
      .eq("id", participationId);

    if (updateError) {
      console.error("Error approving campaign:", updateError);
      toast({ title: "Error approving campaign request", variant: "destructive" });
      return;
    }

    // Mark the message as read
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", messageId);

    toast({ title: "Campaign participation approved!" });
    loadMessages();
  };

  const handleMarkRead = async (messageId: string) => {
    await supabase.from("messages").update({ is_read: true }).eq("id", messageId);
    loadMessages();
  };

  const handleRejectReward = async (purchaseId: string, messageId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/functions/reject-reward`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ purchaseId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject reward');
      }

      toast({ title: "Reward rejected and points refunded!" });
      loadMessages();
    } catch (error: any) {
      console.error("Error rejecting reward:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to reject reward",
        variant: "destructive" 
      });
    }
  };

  const handleRejectCampaign = async (participationId: string, messageId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/functions/reject-campaign`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ participationId }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject campaign');
      }

      toast({ title: "Campaign participation rejected!" });
      loadMessages();
    } catch (error: any) {
      console.error("Error rejecting campaign:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to reject campaign",
        variant: "destructive" 
      });
    }
  };

   const pendingMessages = messages.filter((m) => !m.is_read && (m.purchaseStatus === "pending" || m.participationStatus === "pending"));
   const readMessages = messages.filter((m) => m.is_read || (m.purchaseStatus !== "pending" && m.participationStatus !== "pending"));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Messages</h2>

      {pendingMessages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pending ({pendingMessages.length})</h3>
          {pendingMessages.map((message) => (
            <Card key={message.id} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      {message.studentName} • {message.className}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Badge variant="secondary">New</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{message.message}</p>
                {message.reward && (
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold">Reward:</span>{" "}
                      {message.reward.title}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Type:</span>{" "}
                      {message.reward.category}
                    </p>
                    <div className="flex gap-2">
                      {message.purchaseStatus === "pending" &&
                        (message.reward?.category === "tangible" || message.reward?.category === "privilege") && (
                          <>
                            <Button
                              onClick={() => handleFulfill(message.id, message.reward_purchase_id)}
                              size="sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Fulfilled
                            </Button>
                            <Button
                              onClick={() => handleRejectReward(message.reward_purchase_id, message.id)}
                              variant="destructive"
                              size="sm"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </>
                      )}

                      <Button
                        variant="outline"
                        onClick={() => handleMarkRead(message.id)}
                        size="sm"
                      >
                        Mark as Read
                      </Button>
                    </div>
                  </div>
                )}
                {message.campaign && message.participationStatus === "pending" && (
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold">Campaign:</span>{" "}
                      {message.campaign.title}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveCampaign(message.id, message.campaign_participation_id)}
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectCampaign(message.campaign_participation_id, message.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleMarkRead(message.id)}
                        size="sm"
                      >
                        Mark as Read
                      </Button>
                    </div>
                  </div>
                )}
                {!message.reward && !message.campaign && (
                  <Button
                    variant="outline"
                    onClick={() => handleMarkRead(message.id)}
                    size="sm"
                  >
                    Mark as Read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {readMessages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">
            Read Messages ({readMessages.length})
          </h3>
          {readMessages.map((message) => (
            <Card key={message.id} className="opacity-60">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      {message.studentName}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>{message.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {messages.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No messages yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MessagesView;
