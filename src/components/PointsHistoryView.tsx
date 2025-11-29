import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PointsHistoryViewProps {
  studentId: string;
  classId: string;
}

interface PointsTransaction {
  id: string;
  points: number;
  reason: string;
  created_at: string;
  profiles?: {
    name: string;
  };
}

const PointsHistoryView = ({ studentId, classId }: PointsHistoryViewProps) => {
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPointsHistory();
  }, [studentId, classId]);

  const loadPointsHistory = async () => {
    setLoading(true);
    try {
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("points_transactions")
        .select("*")
        .eq("student_id", studentId)
        .eq("class_id", classId)
        .order("created_at", { ascending: false });

      if (transactionsError) {
        console.error("Error loading points history:", transactionsError);
        return;
      }

      // Get teacher names for all transactions
      if (transactionsData && transactionsData.length > 0) {
        const teacherIds = [...new Set(transactionsData.map(t => t.teacher_id))];
        const { data: teacherProfiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", teacherIds);

        const enrichedData = transactionsData.map(transaction => ({
          ...transaction,
          profiles: teacherProfiles?.find(p => p.id === transaction.teacher_id)
        }));

        console.log("Points history data:", enrichedData);
        setPointsHistory(enrichedData as PointsTransaction[]);
      } else {
        setPointsHistory([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Points History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Points History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {pointsHistory.length === 0 ? (
          <p className="text-muted-foreground">No points history yet.</p>
        ) : (
          pointsHistory.map((transaction) => (
            <div key={transaction.id} className="border-b pb-3 last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{transaction.reason}</p>
                  <p className="text-sm text-muted-foreground">
                    Given by {transaction.profiles?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.created_at).toLocaleDateString()} at{" "}
                    {new Date(transaction.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <span className="font-bold text-primary">+{transaction.points}</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default PointsHistoryView;
