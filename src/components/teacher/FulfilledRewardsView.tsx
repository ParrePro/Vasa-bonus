import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface FulfilledReward {
  id: string;
  fulfilled_at: string;
  fulfilled_by: string | null;
  reward: {
    title: string;
    category: string;
    points_cost: number;
  };
  student: {
    name: string;
  };
  class: {
    name: string;
  };
  fulfiller: {
    name: string;
    isDeveloper?: boolean;
  } | null;
}

const FulfilledRewardsView = () => {
  const [fulfilledRewards, setFulfilledRewards] = useState<FulfilledReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFulfilledRewards();
  }, []);

  const loadFulfilledRewards = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Load last 10 fulfilled reward purchases
    const { data: purchasesData, error } = await supabase
      .from("reward_purchases")
      .select("id, fulfilled_at, fulfilled_by, class_id, student_id, reward_id")
      .eq("status", "fulfilled")
      .order("fulfilled_at", { ascending: false })
      .limit(10);

    console.log("Fulfilled rewards query result:", purchasesData, error);

    if (error || !purchasesData || purchasesData.length === 0) {
      console.error("Error loading fulfilled rewards:", error);
      setFulfilledRewards([]);
      setLoading(false);
      return;
    }

    // Get unique IDs
    const rewardIds = [...new Set(purchasesData.map((item: any) => item.reward_id))];
    const classIds = [...new Set(purchasesData.map((item: any) => item.class_id))];
    const studentIds = [...new Set(purchasesData.map((item: any) => item.student_id))];
    const fulfillerIds = [...new Set(purchasesData.map((item: any) => item.fulfilled_by).filter(Boolean))];

    // Fetch rewards, classes, profiles, and user roles separately
    const allProfileIds = [...new Set([...studentIds, ...fulfillerIds])];
    const [rewardsResult, classesResult, profilesResult, rolesResult] = await Promise.all([
      supabase.from("rewards").select("id, title, category, points_cost").in("id", rewardIds),
      supabase.from("classes").select("id, name").in("id", classIds),
      supabase.from("profiles").select("id, name").in("id", allProfileIds),
      fulfillerIds.length > 0 
        ? supabase.from("user_roles").select("user_id, role").in("user_id", fulfillerIds).eq("role", "developer")
        : Promise.resolve({ data: [] }),
    ]);

    // Build a set of developer user IDs
    const developerIds = new Set((rolesResult.data || []).map((r: any) => r.user_id));

    const rewardsMap = (rewardsResult.data || []).reduce((acc: any, r: any) => {
      acc[r.id] = r;
      return acc;
    }, {});

    const classesMap = (classesResult.data || []).reduce((acc: any, c: any) => {
      acc[c.id] = c;
      return acc;
    }, {});

    const profilesMap = (profilesResult.data || []).reduce((acc: any, p: any) => {
      acc[p.id] = p.name;
      return acc;
    }, {});

    const formatted = purchasesData.map((item: any) => {
      const fulfillerName = item.fulfilled_by ? profilesMap[item.fulfilled_by] : null;
      const isDeveloper = item.fulfilled_by ? developerIds.has(item.fulfilled_by) : false;
      return {
        id: item.id,
        fulfilled_at: item.fulfilled_at,
        fulfilled_by: item.fulfilled_by,
        reward: rewardsMap[item.reward_id] || { title: "Unknown", category: "unknown", points_cost: 0 },
        student: { name: profilesMap[item.student_id] || "Unknown student" },
        class: classesMap[item.class_id] || { name: "Unknown class" },
        fulfiller: item.fulfilled_by ? { 
          name: fulfillerName || "Unknown",
          isDeveloper 
        } : null,
      };
    });

    setFulfilledRewards(formatted);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Recently Fulfilled Rewards (Last 10)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fulfilledRewards.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No fulfilled rewards yet
            </p>
          ) : (
            <div className="space-y-3">
              {fulfilledRewards.map((item) => (
                <Card key={item.id} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold">{item.reward.title}</h3>
                          <Badge variant="outline">
                            {item.reward.category}
                          </Badge>
                          <Badge variant="secondary">
                            {item.reward.points_cost} points
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>
                            <span className="font-medium">Class:</span>{" "}
                            {item.class.name}
                          </p>
                          <p>
                            <span className="font-medium">Student:</span>{" "}
                            {item.student.name}
                          </p>
                          <p>
                            <span className="font-medium">Fulfilled by:</span>{" "}
                            {item.fulfiller?.name || "Unknown"}
                            {item.fulfiller?.isDeveloper && (
                              <span className="text-primary ml-1">(Developer)</span>
                            )}
                          </p>
                          <p>
                            <span className="font-medium">Date:</span>{" "}
                            {format(new Date(item.fulfilled_at), "PPp")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FulfilledRewardsView;
