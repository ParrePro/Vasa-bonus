import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal } from "lucide-react";

interface TeacherLeaderboardEntry {
  teacher_id: string;
  teacher_name: string;
  total_points_given: number;
  total_transactions: number;
}

interface TeacherLeaderboardProps {
  schoolId: string;
}

const TeacherLeaderboard = ({ schoolId }: TeacherLeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<TeacherLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [schoolId]);

  const loadLeaderboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/schools/${schoolId}/teacher-leaderboard`,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load teacher leaderboard");
      }

      const data = await response.json();
      setLeaderboard(data);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load leaderboard"
      );
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (position: number) => {
    if (position === 0) {
      return <Trophy className="w-5 h-5 text-yellow-500" />;
    } else if (position === 1) {
      return <Medal className="w-5 h-5 text-gray-400" />;
    } else if (position === 2) {
      return <Medal className="w-5 h-5 text-orange-600" />;
    }
    return <span className="text-sm font-semibold text-gray-600">#{position + 1}</span>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teacher Points Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teacher Points Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Teacher Points Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No teachers have given points yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Teacher Points Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.teacher_id}
              className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center justify-center w-8">
                {getMedalIcon(index)}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{entry.teacher_name}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.total_transactions} transaction
                  {entry.total_transactions !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-right">
                <Badge variant="default" className="text-base">
                  {entry.total_points_given} pts
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherLeaderboard;
