import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";

interface AccountHistoryProps {
  classId: string;
  userId: string;
}

interface HistoryItem {
  id: string;
  type: "points" | "reward";
  date: Date;
  description: string;
  amount?: number;
  category?: string;
  teacherName?: string;
  teacherId?: string;
  isDeveloper?: boolean;
  isGiftSent?: boolean;
  isGiftReceived?: boolean;
  isOwnTransaction?: boolean;
}

const AccountHistory = ({ classId, userId }: AccountHistoryProps) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, [classId, userId]);

  const loadHistory = async () => {
    // Load points transactions
    const { data: pointsData, error: pointsError } = await supabase
      .from("points_transactions")
      .select(`
        id,
        points,
        reason,
        created_at,
        teacher_id,
        student_id
      `)
      .eq("student_id", userId)
      .eq("class_id", classId);

    if (pointsError) {
      console.error("Error loading points:", pointsError);
    }

    // Get teacher names separately
    let teacherNames: Record<string, string> = {};
    let developerIds: Set<string> = new Set();
    
    if (pointsData && pointsData.length > 0) {
      const teacherIds = [...new Set(pointsData.map((t: any) => t.teacher_id).filter(Boolean))];
      if (teacherIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", teacherIds);
        
        if (profilesError) {
          console.error("Error loading profiles:", profilesError);
        }
        
        if (profiles) {
          teacherNames = profiles.reduce((acc, p) => ({ ...acc, [p.id]: p.name }), {});
        }

        // Check which teachers are developers
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("user_id")
          .in("user_id", teacherIds)
          .eq("role", "developer");
        
        if (roleData) {
          developerIds = new Set(roleData.map(r => r.user_id));
        }
      }
    }

    // Load reward purchases
    const { data: rewardsData } = await supabase
      .from("reward_purchases")
      .select("id, purchased_at, status, reward_id")
      .eq("student_id", userId)
      .eq("class_id", classId);

    // Get reward details separately
    let rewardDetails: Record<string, any> = {};
    if (rewardsData && rewardsData.length > 0) {
      const rewardIds = [...new Set(rewardsData.map((r: any) => r.reward_id))];
      const { data: rewards } = await supabase
        .from("rewards")
        .select("id, title, points_cost, category")
        .in("id", rewardIds);
      
      if (rewards) {
        rewardDetails = rewards.reduce((acc: any, r: any) => ({ ...acc, [r.id]: r }), {});
      }
    }

    const items: HistoryItem[] = [];

    // Add points transactions
    if (pointsData) {
      pointsData.forEach((transaction: any) => {
        const reason = transaction.reason || '';
        const teacherId = transaction.teacher_id;
        const studentId = transaction.student_id;
        
        // Determine if this is a gift transaction
        const isGiftSent = reason.startsWith('Gifted ');
        const isGiftReceived = reason.includes(' as a gift from ') || (reason.includes('Received ') && reason.includes(' from '));
        const isDeveloper = developerIds.has(teacherId);
        // If teacher_id equals student_id and it's the current user, it's their own gift
        const isOwnGift = teacherId === studentId && studentId === userId;
        
        // Extract sender name from gift received reason (e.g., "Received 57 points as a gift from Parre")
        let giftSenderName = '';
        if (isGiftReceived) {
          const fromMatch = reason.match(/from (.+)$/);
          if (fromMatch) {
            giftSenderName = fromMatch[1];
          }
        }
        
        items.push({
          id: transaction.id,
          type: "points",
          date: new Date(transaction.created_at),
          description: transaction.reason,
          amount: transaction.points,
          teacherName: isGiftReceived && giftSenderName ? giftSenderName : (teacherNames[teacherId] || "Unknown"),
          teacherId: teacherId,
          isDeveloper,
          isGiftSent: isGiftSent && isOwnGift,
          isGiftReceived,
          isOwnTransaction: isOwnGift,
        });
      });
    }

    // Don't add reward purchases separately - they're already shown as negative points transactions

    // Sort by date descending
    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    setHistory(items);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                item.amount! > 0
                  ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                  : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`p-2 rounded-full ${
                    item.amount! > 0
                      ? "bg-green-200 dark:bg-green-900"
                      : "bg-red-200 dark:bg-red-900"
                  }`}
                >
                  {item.amount! > 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.description}</p>
                  <div className="flex gap-2 items-center">
                    <p className="text-sm text-muted-foreground">
                      {format(item.date, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    {item.isGiftSent ? (
                      <Badge variant="outline" className="text-xs bg-pink-50 border-pink-200 text-pink-700">
                        By {item.teacherName} (You)
                      </Badge>
                    ) : item.isGiftReceived ? (
                      <Badge variant="outline" className="text-xs bg-pink-50 border-pink-200 text-pink-700">
                        From {item.teacherName}
                      </Badge>
                    ) : item.isDeveloper && item.teacherName ? (
                      <Badge variant="outline" className="text-xs bg-purple-50 border-purple-200 text-purple-700">
                        By {item.teacherName} (Developer)
                      </Badge>
                    ) : item.teacherName ? (
                      <Badge variant="outline" className="text-xs">
                        By {item.teacherName}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${
                    item.amount! > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.amount! > 0 ? "+" : ""}{item.amount! < 0 ? item.amount! : item.amount!}
                </p>
              </div>
            </div>
          ))}

          {history.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No history yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountHistory;
