import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/local-client";
import { API_URL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTierFavicon } from "@/hooks/use-tier-favicon";
import { ArrowLeft, LogOut, BarChart3, Trash2, Settings, AlertTriangle, Pencil, Send } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import SchoolStats from "@/components/developer/SchoolStats";
import StudentSearchDelete from "@/components/developer/StudentSearchDelete";
import PointsTransfer from "@/components/developer/PointsTransfer";

type View = "classes" | "stats" | "students" | "settings" | "transfer";

const DeveloperSchoolView = () => {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [school, setSchool] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState<View>("classes");
  const [deletePassword, setDeletePassword] = useState("");
  const [developerPasswordForDelete, setDeveloperPasswordForDelete] = useState("");
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);
  const [deleteSchoolDialogOpen, setDeleteSchoolDialogOpen] = useState(false);
  const [deleteClassDialogOpen, setDeleteClassDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [renameSchoolDialogOpen, setRenameSchoolDialogOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState("");
  const [renameClassDialogOpen, setRenameClassDialogOpen] = useState(false);
  const [renameClassId, setRenameClassId] = useState<string | null>(null);
  const [newClassName, setNewClassName] = useState("");

  // Use developer favicon
  useTierFavicon('basic', 'developer');

  useEffect(() => {
    loadSchoolData();
  }, [schoolId]);

  const loadSchoolData = async () => {
    if (!schoolId) return;

    try {
      // Load school details
      const response = await fetch(`${API_URL}/schools/${schoolId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      const schoolData = await response.json();
      if (response.ok) {
        setSchool(schoolData);
      }
    } catch (error) {
      console.error('Failed to load school:', error);
    }

    loadClasses();
  };

  const loadClasses = async () => {
    if (!schoolId) return;

    try {
      const response = await fetch(`${API_URL}/classes?school_id=${schoolId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      const classesData = await response.json();
      if (response.ok && Array.isArray(classesData)) {
        setClasses(classesData);
      }
    } catch (error) {
      console.error('Error loading classes for developer view', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleRenameSchool = async () => {
    if (!newSchoolName.trim()) {
      toast({
        title: "Error",
        description: "School name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/schools/${schoolId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ name: newSchoolName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to rename school");
      }

      setSchool({ ...school, name: data.name });
      toast({
        title: "School renamed",
        description: `School has been renamed to "${data.name}"`,
      });
      setRenameSchoolDialogOpen(false);
      setNewSchoolName("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRenameClass = async () => {
    if (!renameClassId || !newClassName.trim()) {
      toast({
        title: "Error",
        description: "Class name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/classes/${renameClassId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ name: newClassName.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to rename class");
      }

      // Update the class in the list
      setClasses(classes.map(c => c.id === renameClassId ? { ...c, name: data.name } : c));
      toast({
        title: "Class renamed",
        description: `Class has been renamed to "${data.name}"`,
      });
      setRenameClassDialogOpen(false);
      setRenameClassId(null);
      setNewClassName("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClass = async () => {
    if (!deleteClassId || !deletePassword.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/classes/${deleteClassId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete class");
      }

      toast({
        title: "Class deleted",
        description: "The class has been permanently deleted.",
      });
      
      loadClasses();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDeletePassword("");
      setDeleteClassId(null);
      setDeleteClassDialogOpen(false);
    }
  };

  const handleDeleteSchool = async () => {
    if (!deletePassword.trim() || !developerPasswordForDelete.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/schools/${schoolId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ password: deletePassword, developerPassword: developerPasswordForDelete }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete school");
      }

      toast({
        title: "School deleted",
        description: "The school has been permanently deleted.",
      });
      
      navigate("/developer");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDeletePassword("");
      setDeveloperPasswordForDelete("");
      setDeleteSchoolDialogOpen(false);
    }
  };

  if (!school) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/developer")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Schools
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{school.name}</h1>
              <Dialog open={renameSchoolDialogOpen} onOpenChange={(open) => {
                setRenameSchoolDialogOpen(open);
                if (open) setNewSchoolName(school.name);
              }}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Rename School</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input
                        id="schoolName"
                        value={newSchoolName}
                        onChange={(e) => setNewSchoolName(e.target.value)}
                        placeholder="Enter new school name"
                      />
                    </div>
                    <Button onClick={handleRenameSchool} className="w-full">
                      Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-muted-foreground">
              Developer Mode • Code: <span className="font-mono font-bold">{school.code}</span>
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 border-r bg-card p-4 space-y-2">
          <div className="mb-8">
            <h2 className="text-lg font-semibold px-3">Navigation</h2>
          </div>
          
          <Button
            variant={currentView === "classes" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentView("classes")}
          >
            Classes
          </Button>

          <Button
            variant={currentView === "stats" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentView("stats")}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            School Stats
          </Button>

          <Button
            variant={currentView === "students" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentView("students")}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Students
          </Button>

          <Button
            variant={currentView === "transfer" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentView("transfer")}
          >
            <Send className="w-4 h-4 mr-2" />
            Transfer Points
          </Button>

          <div className="pt-4 mt-4 border-t">
            <Button
              variant={currentView === "settings" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setCurrentView("settings")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </aside>

        <main className="flex-1 p-6">
          {currentView === "classes" && (
            <Card>
              <CardHeader>
                <CardTitle>Classes in {school.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {classes.length === 0 ? (
                  <p className="text-muted-foreground">No classes created yet.</p>
                ) : (
                  classes.map((cls) => (
                    <div key={cls.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <Button
                        variant="ghost"
                        className="flex-1 justify-start"
                        onClick={() => navigate(`/teacher/class/${cls.id}`)}
                      >
                        <span>{cls.name}</span>
                        <span className="ml-2 text-sm text-muted-foreground">{cls.code}</span>
                      </Button>
                      <div className="flex items-center gap-2">
                        <Dialog open={renameClassDialogOpen && renameClassId === cls.id} onOpenChange={(open) => {
                          setRenameClassDialogOpen(open);
                          if (open) {
                            setRenameClassId(cls.id);
                            setNewClassName(cls.name);
                          } else {
                            setRenameClassId(null);
                            setNewClassName("");
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setRenameClassId(cls.id)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Rename Class</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="renameClassName">Class Name</Label>
                                <Input
                                  id="renameClassName"
                                  value={newClassName}
                                  onChange={(e) => setNewClassName(e.target.value)}
                                  placeholder="Enter new class name"
                                />
                              </div>
                              <Button onClick={handleRenameClass} className="w-full">
                                Save
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog open={deleteClassDialogOpen && deleteClassId === cls.id} onOpenChange={(open) => {
                          setDeleteClassDialogOpen(open);
                          if (!open) {
                            setDeleteClassId(null);
                            setDeletePassword("");
                          }
                        }}>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => setDeleteClassId(cls.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="w-5 h-5" />
                                Delete Class
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete <strong>{cls.name}</strong>? This will permanently remove all students, points, rewards, and campaigns associated with this class.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-2 py-4">
                              <Label htmlFor="classPassword">Enter your password to confirm</Label>
                              <Input
                                id="classPassword"
                                type="password"
                                placeholder="Your password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                              />
                          </div>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteClass}
                              disabled={loading || !deletePassword.trim()}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {loading ? "Deleting..." : "Delete Class"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {currentView === "stats" && (
            <SchoolStats schoolId={schoolId!} />
          )}

          {currentView === "students" && (
            <StudentSearchDelete schoolId={schoolId!} />
          )}

          {currentView === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  School Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Danger Zone
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this school and all its classes, students, points, rewards, and campaigns. This action cannot be undone.
                  </p>
                  <AlertDialog open={deleteSchoolDialogOpen} onOpenChange={(open) => {
                    setDeleteSchoolDialogOpen(open);
                    if (!open) {
                      setDeletePassword("");
                      setDeveloperPasswordForDelete("");
                    }
                  }}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete School
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                          <AlertTriangle className="w-5 h-5" />
                          Delete School
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you absolutely sure? This will permanently delete <strong>{school.name}</strong> and ALL its classes, students, points history, rewards, and campaigns. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="schoolPassword">Account Password</Label>
                          <Input
                            id="schoolPassword"
                            type="password"
                            placeholder="Your account password"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="developerPassword">Developer Mode Password</Label>
                          <Input
                            id="developerPassword"
                            type="password"
                            placeholder="Developer mode password"
                            value={developerPasswordForDelete}
                            onChange={(e) => setDeveloperPasswordForDelete(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground">
                            The password used to enter developer mode
                          </p>
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteSchool}
                          disabled={loading || !deletePassword.trim() || !developerPasswordForDelete.trim()}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {loading ? "Deleting..." : "Delete School"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}

          {currentView === "transfer" && (
            <PointsTransfer schoolId={schoolId || ""} />
          )}
        </main>
      </div>
    </div>
  );
};

export default DeveloperSchoolView;
