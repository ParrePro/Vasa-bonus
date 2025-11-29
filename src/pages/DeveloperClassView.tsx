import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/local-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTierFavicon } from "@/hooks/use-tier-favicon";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";

const DeveloperClassView = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [editingPoints, setEditingPoints] = useState<string | null>(null);
  const [newPoints, setNewPoints] = useState("");

  // Use developer favicon
  useTierFavicon('basic', 'developer');

  useEffect(() => {
    loadClassData();
  }, [classId]);

  const loadClassData = async () => {
    if (!classId) return;

    // Load class details
    const { data: cls } = await supabase
      .from("classes")
      .select("*, profiles!classes_mentor_id_fkey(name), schools(name)")
      .eq("id", classId)
      .single();

    if (cls) {
      setClassData(cls);
    }

    // Load students with their points
    const { data: members } = await supabase
      .from("class_members")
      .select("user_id")
      .eq("class_id", classId)
      .eq("is_teacher", false);

    if (members) {
      const studentsWithPoints = await Promise.all(
        members.map(async (member) => {
          // Get student profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", member.user_id)
            .single();

          // Get student points
          const { data: transactions } = await supabase
            .from("points_transactions")
            .select("points")
            .eq("student_id", member.user_id)
            .eq("class_id", classId);

          const totalPoints = transactions?.reduce((sum, t) => sum + t.points, 0) || 0;

          return {
            id: member.user_id,
            name: profile?.name || "Unknown",
            points: totalPoints,
          };
        })
      );

      setStudents(studentsWithPoints);
    }
  };

  const handleEditPoints = async (studentId: string, adjustment: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Use backend API to add points (this will also award tier points)
      const response = await fetch('http://localhost:3001/api/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          studentId: studentId,
          classId: classId!,
          points: adjustment,
          reason: "Developer adjustment",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update points');
      }

      toast({
        title: "Points updated",
        description: `${adjustment > 0 ? "Added" : "Removed"} ${Math.abs(adjustment)} points.`,
      });

      setEditingPoints(null);
      setNewPoints("");
      loadClassData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!classData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/developer/school/${classData.school_id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{classData.name}</h1>
            <p className="text-sm text-muted-foreground">
              {classData.schools?.name} • Mentor: {classData.profiles?.name}
            </p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Students & Points Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {students.length === 0 ? (
              <p className="text-muted-foreground">No students in this class yet.</p>
            ) : (
              students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Current Points: <span className="font-bold">{student.points}</span>
                    </p>
                  </div>
                  {editingPoints === student.id ? (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Points"
                        value={newPoints}
                        onChange={(e) => setNewPoints(e.target.value)}
                        className="w-24"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleEditPoints(student.id, parseInt(newPoints))}
                        disabled={!newPoints}
                      >
                        Apply
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPoints(null);
                          setNewPoints("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingPoints(student.id)}
                    >
                      Adjust Points
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DeveloperClassView;
