import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/local-client";
import { API_URL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTierFavicon } from "@/hooks/use-tier-favicon";
import { LogOut } from "lucide-react";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import GivePointsView from "@/components/teacher/GivePointsView";
import CreateClassView from "@/components/teacher/CreateClassView";
import JoinClassView from "@/components/teacher/JoinClassView";
import FulfilledRewardsView from "@/components/teacher/FulfilledRewardsView";
import AccountSettings from "@/components/AccountSettings";

type View = "give-points" | "create-class" | "join-class" | "fulfilled" | "settings";

const TeacherDashboard = () => {
  const [currentView, setCurrentView] = useState<View>("give-points");
  const [userName, setUserName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [classes, setClasses] = useState<{ id: string; name: string; code: string }[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use teacher favicon
  useTierFavicon('basic', 'teacher');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "teacher")
      .single();

    if (!data) {
      navigate("/role-selection");
      return;
    }

    loadUserName();
    loadClasses();
  };

  const loadUserName = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", session.user.id)
      .single();

    if (data) {
      setUserName(data.name);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await fetch(`${API_URL}/classes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setClasses(data.map((c: any) => ({ id: c.id, name: c.name, code: c.code })));
        // Set school name from first class (all classes should be from same school)
        if (data.length > 0 && data[0].school_name) {
          setSchoolName(data[0].school_name);
        }
      }
    } catch (error) {
      console.error("Failed to load classes:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
    navigate("/auth");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <TeacherSidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="flex-1 flex flex-col">
        <header className="border-b bg-card/50 backdrop-blur-sm px-6 py-6 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Teacher Dashboard</h1>
            {userName && <p className="text-base text-muted-foreground mt-2">Welcome back, {userName}</p>}
            {schoolName && <p className="text-sm text-muted-foreground">School: <span className="font-medium text-foreground">{schoolName}</span></p>}
          </div>
          <Button variant="secondary" size="sm" onClick={handleSignOut} className="shadow-md">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {currentView === "give-points" && <GivePointsView />}
          {currentView === "create-class" && <CreateClassView />}
          {currentView === "join-class" && <JoinClassView />}
          {currentView === "fulfilled" && <FulfilledRewardsView />}
          {currentView === "settings" && <AccountSettings userRole="teacher" classes={classes} onClassDeleted={loadClasses} />}
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
