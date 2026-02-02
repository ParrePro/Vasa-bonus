import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Package, X } from "lucide-react";
import { format } from "date-fns";

interface PendingRewardsViewProps {
  classId: string;
  canFulfillRewards?: boolean;
}

const PendingRewardsView = ({ classId, canFulfillRewards = true }: PendingRewardsViewProps) => {
  const [pendingRewards, setPendingRewards] = useState<any[]>([]);
  const [currentTeacherId, setCurrentTeacherId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentTeacher = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentTeacherId(user.id);
      }
    };
    getCurrentTeacher();
  }, []);

  useEffect(() => {
    loadPendingRewards();

    // Subscribe to realtime updates for reward purchases
    const channel = supabase
      .channel('reward-purchases-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reward_purchases',
          filter: `class_id=eq.${classId}`,
        },
        () => {
          console.log('Reward purchase changed, reloading...');
          loadPendingRewards();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId, currentTeacherId]);

  const loadPendingRewards = async () => {
    if (!currentTeacherId) return;

    const { data: purchases, error } = await supabase
      .from("reward_purchases")
      .select("id, reward_id, student_id, class_id, status, purchased_at")
      .eq("class_id", classId)
      .eq("status", "pending")
      .order("purchased_at", { ascending: false });

    if (error) {
      console.error("Error loading pending rewards:", error);
      setPendingRewards([]);
      return;
    }

    if (!purchases || purchases.length === 0) {
      setPendingRewards([]);
      return;
    }

    // Check if current user is a developer
    const { data: devRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", currentTeacherId)
      .eq("role", "developer")
      .single();

    const isDeveloper = !!devRole;

    // Filter purchases: show rewards where current teacher is in reward_teachers table OR is a developer
    const rewardIds = [...new Set(purchases.map((p) => p.reward_id))];
    
    if (isDeveloper) {
      // Developers can see all pending rewards for this class
      const filteredRewardIds = rewardIds;
      const studentIds = [...new Set(purchases.map((p) => p.student_id))];

      const [{ data: rewards }, { data: profiles }, { data: classData }] = await Promise.all([
        supabase
          .from("rewards")
          .select("id, title, category, image_url")
          .in("id", filteredRewardIds),
        supabase
          .from("profiles")
          .select("id, name")
          .in("id", studentIds),
        supabase
          .from("classes")
          .select("id, name")
          .eq("id", classId)
          .single(),
      ]);

      const rewardMap = (rewards || []).reduce((acc: any, r: any) => {
        acc[r.id] = r;
        return acc;
      }, {} as Record<string, any>);

      const profileMap = (profiles || []).reduce((acc: any, p: any) => {
        acc[p.id] = p.name;
        return acc;
      }, {} as Record<string, string>);

      const combined = purchases.map((p: any) => ({
        ...p,
        reward: rewardMap[p.reward_id],
        studentName: profileMap[p.student_id] || "Unknown Student",
        className: classData?.name || "Unknown Class",
      }));

      setPendingRewards(combined);
    } else {
      // Teachers can only see rewards they're explicitly assigned to
      const { data: rewardTeachers } = await supabase
        .from("reward_teachers")
        .select("reward_id")
        .eq("teacher_id", currentTeacherId)
        .in("reward_id", rewardIds);

      const authorizedRewardIds = new Set((rewardTeachers || []).map(rt => rt.reward_id));
      const filteredPurchases = purchases.filter(p => authorizedRewardIds.has(p.reward_id));

      if (filteredPurchases.length === 0) {
        setPendingRewards([]);
        return;
      }

      const filteredRewardIds = [...new Set(filteredPurchases.map((p) => p.reward_id))];
      const studentIds = [...new Set(filteredPurchases.map((p) => p.student_id))];

      const [{ data: rewards }, { data: profiles }, { data: classData }] = await Promise.all([
        supabase
          .from("rewards")
          .select("id, title, category, image_url")
          .in("id", filteredRewardIds),
        supabase
          .from("profiles")
          .select("id, name")
          .in("id", studentIds),
        supabase
          .from("classes")
          .select("id, name")
          .eq("id", classId)
          .single(),
      ]);

      const rewardMap = (rewards || []).reduce((acc: any, r: any) => {
        acc[r.id] = r;
        return acc;
      }, {} as Record<string, any>);

      const profileMap = (profiles || []).reduce((acc: any, p: any) => {
        acc[p.id] = p.name;
        return acc;
      }, {} as Record<string, string>);

      const combined = filteredPurchases.map((p: any) => ({
        ...p,
        reward: rewardMap[p.reward_id],
        studentName: profileMap[p.student_id] || "Unknown Student",
        className: classData?.name || "Unknown Class",
      }));

      setPendingRewards(combined);
    }
  };

  const handleFulfill = async (purchaseId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/functions/fulfill-reward`,
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
        throw new Error(result.error || 'Failed to fulfill reward');
      }

      toast({ title: "Reward marked as fulfilled!" });
      loadPendingRewards();
    } catch (error: any) {
      console.error("Error fulfilling reward:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to fulfill reward",
        variant: "destructive" 
      });
    }
  };

  const handleReject = async (purchaseId: string) => {
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
      loadPendingRewards();
    } catch (error: any) {
      console.error("Error rejecting reward:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to reject reward",
        variant: "destructive" 
      });
    }
  };

  const tangibleRewards = pendingRewards.filter(
    (r) => r.reward?.category === "tangible"
  );
  const privilegeRewards = pendingRewards.filter(
    (r) => r.reward?.category === "privilege"
  );
  const symbolicRewards = pendingRewards.filter(
    (r) => r.reward?.category === "symbolic"
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Pending Rewards to Fulfill</h2>

      {tangibleRewards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tangible Rewards ({tangibleRewards.length})</h3>
          {tangibleRewards.map((purchase) => (
            <Card
              key={purchase.id}
              className="border-l-4 border-l-yellow-500"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      {purchase.studentName} • {purchase.className}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(purchase.purchased_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Badge variant="secondary">Action Required</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  {purchase.reward?.image_url && (
                    <img
                      src={purchase.reward.image_url}
                      alt={purchase.reward.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{purchase.reward?.title}</p>
                    <Badge className="mt-1">{purchase.reward?.category}</Badge>
                  </div>
                </div>
                {canFulfillRewards && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleFulfill(purchase.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Fulfilled
                    </Button>
                    <Button
                      onClick={() => handleReject(purchase.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {privilegeRewards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">One Time Privileges ({privilegeRewards.length})</h3>
          {privilegeRewards.map((purchase) => (
            <Card
              key={purchase.id}
              className="border-l-4 border-l-blue-500"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      {purchase.studentName} • {purchase.className}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(purchase.purchased_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Badge variant="secondary">Action Required</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  {purchase.reward?.image_url && (
                    <img
                      src={purchase.reward.image_url}
                      alt={purchase.reward.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{purchase.reward?.title}</p>
                    <Badge className="mt-1">one time privilege</Badge>
                  </div>
                </div>
                {canFulfillRewards && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleFulfill(purchase.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Fulfilled
                    </Button>
                    <Button
                      onClick={() => handleReject(purchase.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {symbolicRewards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">
            Symbolic Rewards ({symbolicRewards.length})
          </h3>
          {symbolicRewards.map((purchase) => (
            <Card
              key={purchase.id}
              className="border-l-4 border-l-purple-500 opacity-70"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      {purchase.studentName} • {purchase.className}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(purchase.purchased_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Badge variant="outline">Symbolic</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {purchase.reward?.image_url && (
                    <img
                      src={purchase.reward.image_url}
                      alt={purchase.reward.title}
                      className="w-16 h-16 rounded object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{purchase.reward?.title}</p>
                    <p className="text-sm text-muted-foreground">No action required</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pendingRewards.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No pending rewards to fulfill.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PendingRewardsView;
