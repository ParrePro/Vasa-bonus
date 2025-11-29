import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface SchoolTransactionsProps {
  schoolId: string;
}

const SchoolTransactions = ({ schoolId }: SchoolTransactionsProps) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [schoolId]);

  const loadTransactions = async () => {
    setLoading(true);
    
    // Get all classes in the school
    const { data: classes } = await supabase
      .from("classes")
      .select("id, name")
      .eq("school_id", schoolId);

    if (!classes || classes.length === 0) {
      setLoading(false);
      return;
    }

    const classIds = classes.map(c => c.id);
    const classMap = Object.fromEntries(classes.map(c => [c.id, c.name]));

    // Get all points transactions for these classes
    const { data: pointsData, error: pointsError } = await supabase
      .from("points_transactions")
      .select(`
        *,
        student:profiles!points_transactions_student_id_fkey(name),
        teacher:profiles!points_transactions_teacher_id_fkey(name)
      `)
      .in("class_id", classIds);

    if (pointsError) {
      console.error("Error loading points transactions:", pointsError);
    }

    // Get all reward purchases for these classes
    const { data: purchasesData, error: purchasesError } = await supabase
      .from("reward_purchases")
      .select(`
        *,
        student:profiles!reward_purchases_student_id_fkey(name),
        reward:rewards(title, points_cost)
      `)
      .in("class_id", classIds);

    if (purchasesError) {
      console.error("Error loading reward purchases:", purchasesError);
    }

    // Combine and format all transactions
    const combined = [
      ...(pointsData || []).map((t: any) => ({
        id: t.id,
        type: 'points' as const,
        date: t.created_at,
        studentName: t.student?.name || "Unknown",
        className: classMap[t.class_id] || "Unknown Class",
        description: t.reason,
        points: t.points,
        teacherName: t.teacher?.name || "Unknown",
      })),
      ...(purchasesData || []).map((p: any) => ({
        id: p.id,
        type: 'purchase' as const,
        date: p.purchased_at,
        studentName: p.student?.name || "Unknown",
        className: classMap[p.class_id] || "Unknown Class",
        description: `Purchased: ${p.reward?.title || "Unknown Reward"}`,
        points: -(p.reward?.points_cost || 0),
        teacherName: null,
      })),
    ];

    // Sort by date, most recent first
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setTransactions(combined);
    setLoading(false);
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return <div className="text-muted-foreground">No transactions found.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div className="flex-1">
                <p className="font-medium">{transaction.studentName}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.className}
                </p>
                <p className="text-sm text-muted-foreground">{transaction.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {transaction.teacherName ? `By ${transaction.teacherName} • ` : ""}
                  {format(new Date(transaction.date), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <div className={`text-lg font-bold ${transaction.points > 0 ? "text-green-600" : "text-red-600"}`}>
                {transaction.points > 0 ? "+" : ""}{transaction.points}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolTransactions;
