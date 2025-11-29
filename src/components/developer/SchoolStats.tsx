import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface SchoolStatsProps {
  schoolId: string;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const SchoolStats = ({ schoolId }: SchoolStatsProps) => {
  const [pointsByReason, setPointsByReason] = useState<any[]>([]);
  const [topRewards, setTopRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [schoolId]);

  const loadStats = async () => {
    setLoading(true);

    try {
      // Get all classes in the school
      const { data: classes } = await supabase
        .from("classes")
        .select("id")
        .eq("school_id", schoolId);

      if (!classes || classes.length === 0) {
        setLoading(false);
        return;
      }

      const classIds = classes.map(c => c.id);

      // Get points by reason (only positive points awarded, exclude reward purchases)
      const { data: transactions } = await supabase
        .from("points_transactions")
        .select("reason, points")
        .in("class_id", classIds)
        .gt("points", 0);

      if (transactions) {
        const reasonMap = new Map<string, number>();
        transactions.forEach(t => {
          // Consolidate all gift-related transactions into a single "Gifts" category
          let reason = t.reason;
          if (reason.includes(' as a gift from ') || reason.startsWith('Received ') && reason.includes(' from ')) {
            reason = 'Gifts';
          }
          const current = reasonMap.get(reason) || 0;
          reasonMap.set(reason, current + t.points);
        });

        const reasonData = Array.from(reasonMap.entries())
          .map(([reason, points]) => ({ reason, points }))
          .sort((a, b) => b.points - a.points)
          .slice(0, 10);

        setPointsByReason(reasonData);
      }

      // Get most purchased rewards - fetch purchases first, then rewards
      const { data: purchases } = await supabase
        .from("reward_purchases")
        .select("reward_id")
        .in("class_id", classIds);

      if (purchases && purchases.length > 0) {
        // Get unique reward IDs
        const rewardIds = [...new Set(purchases.map(p => p.reward_id))];
        
        // Fetch reward titles
        const { data: rewards } = await supabase
          .from("rewards")
          .select("id, title")
          .in("id", rewardIds);

        // Create rewards map
        const rewardsMap = new Map<string, string>();
        rewards?.forEach(r => rewardsMap.set(r.id, r.title));

        // Count purchases per reward
        const rewardCountMap = new Map<string, { title: string; count: number }>();
        purchases.forEach(p => {
          const title = rewardsMap.get(p.reward_id) || "Unknown";
          const current = rewardCountMap.get(p.reward_id) || { title, count: 0 };
          rewardCountMap.set(p.reward_id, { title, count: current.count + 1 });
        });

        const rewardData = Array.from(rewardCountMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setTopRewards(rewardData);
      } else {
        setTopRewards([]);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }

    setLoading(false);
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading statistics...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Points Distribution by Reason</CardTitle>
        </CardHeader>
        <CardContent>
          {pointsByReason.length === 0 ? (
            <p className="text-muted-foreground">No data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={pointsByReason}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="reason" 
                  angle={-45} 
                  textAnchor="end" 
                  height={120}
                  stroke="hsl(var(--foreground))"
                />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="points" fill="hsl(var(--primary))">
                  {pointsByReason.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Most Purchased Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          {topRewards.length === 0 ? (
            <p className="text-muted-foreground">No data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={topRewards}
                  dataKey="count"
                  nameKey="title"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={(entry) => entry.title}
                >
                  {topRewards.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolStats;
