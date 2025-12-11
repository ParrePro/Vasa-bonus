import { useState } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Trash2, AlertTriangle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface StudentSearchDeleteProps {
  schoolId: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  created_at: string;
  total_points: number;
  class_count: number;
}

const StudentSearchDelete = ({ schoolId }: StudentSearchDeleteProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [developerPassword, setDeveloperPassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setStudents([]);
      return;
    }

    setLoading(true);
    try {
      // Get all classes in the school
      const { data: classes } = await supabase
        .from("classes")
        .select("id")
        .eq("school_id", schoolId);

      if (!classes || classes.length === 0) {
        toast({ title: "No classes found in this school" });
        setLoading(false);
        return;
      }

      const classIds = classes.map(c => c.id);

      // Search for students by name or email
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name");

      if (!profiles || profiles.length === 0) {
        toast({ title: "No students found" });
        setStudents([]);
        setLoading(false);
        return;
      }

      // Filter by search term locally
      const filteredProfiles = profiles.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Filter students who are in classes at this school
      const studentIds = filteredProfiles.map(p => p.id);
      const { data: members } = await supabase
        .from("class_members")
        .select("user_id, class_id")
        .in("user_id", studentIds)
        .in("class_id", classIds)
        .eq("is_teacher", false);

      if (!members || members.length === 0) {
        toast({ title: "No students found in this school" });
        setStudents([]);
        setLoading(false);
        return;
      }

      // Get unique student IDs
      const schoolStudentIds = [...new Set(members.map(m => m.user_id))];

      // Get auth emails
      const { data: authUsers } = await supabase
        .from("auth_users")
        .select("id, email")
        .in("id", schoolStudentIds);

      // Get points for each student
      const { data: points } = await supabase
        .from("points_transactions")
        .select("student_id, points");

      const pointsMap = new Map<string, number>();
      (points || []).forEach(p => {
        const current = pointsMap.get(p.student_id) || 0;
        pointsMap.set(p.student_id, current + p.points);
      });

      // Combine data
      const resultsMap = new Map<string, Student>();
      filteredProfiles.forEach(profile => {
        if (schoolStudentIds.includes(profile.id)) {
          const email = authUsers?.find(u => u.id === profile.id)?.email || "Unknown";
          const classCount = members.filter(m => m.user_id === profile.id).length;
          resultsMap.set(profile.id, {
            id: profile.id,
            name: profile.name,
            email,
            created_at: new Date().toISOString(),
            total_points: pointsMap.get(profile.id) || 0,
            class_count: classCount,
          });
        }
      });

      setStudents(Array.from(resultsMap.values()));
    } catch (error) {
      console.error("Search error:", error);
      toast({ 
        title: "Search failed", 
        description: "Error searching for students",
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteStudentId || !deletePassword.trim() || !developerPassword.trim()) {
      toast({ 
        title: "Missing information", 
        description: "Please fill in all required fields",
        variant: "destructive" 
      });
      return;
    }

    setDeleteLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/functions/delete-student`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            studentId: deleteStudentId,
            password: deletePassword,
            developerPassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete student');
      }

      toast({ 
        title: "Student deleted",
        description: "The student account has been permanently deleted.",
      });

      // Remove student from list
      setStudents(students.filter(s => s.id !== deleteStudentId));
      setDeleteStudentId(null);
      setDeletePassword("");
      setDeveloperPassword("");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to delete student",
        variant: "destructive" 
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search & Delete Students</CardTitle>
        <p className="text-sm text-muted-foreground mt-2">Search for students in this school and delete their accounts. This action is permanent.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <Input
              placeholder="Search by student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            <Search className="w-4 h-4 mr-2" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        {students.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold">Found {students.length} student(s)</p>
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">
                      {student.class_count} class{student.class_count !== 1 ? 'es' : ''}
                    </Badge>
                    <Badge variant="secondary">
                      {student.total_points} points
                    </Badge>
                  </div>
                </div>
                <AlertDialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteStudentId(student.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  {deleteStudentId === student.id && (
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          Delete Student Account
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete <strong>{student.name}</strong>'s account and all associated data including:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Class memberships</li>
                            <li>Points transactions</li>
                            <li>Rewards</li>
                            <li>Messages</li>
                          </ul>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <label className="text-sm font-medium">Student's Password</label>
                          <Input
                            type="password"
                            placeholder="Enter student's account password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Developer Password</label>
                          <Input
                            type="password"
                            placeholder="Enter developer mode password"
                            value={developerPassword}
                            onChange={(e) => setDeveloperPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                          setDeleteStudentId(null);
                          setDeletePassword("");
                          setDeveloperPassword("");
                        }}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteStudent}
                          disabled={deleteLoading || !deletePassword.trim() || !developerPassword.trim()}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {deleteLoading ? "Deleting..." : "Delete Permanently"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  )}
                </AlertDialog>
              </div>
            ))}
          </div>
        )}

        {students.length === 0 && searchTerm && !loading && (
          <p className="text-center text-muted-foreground py-4">No students found matching your search.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentSearchDelete;
