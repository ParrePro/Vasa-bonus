import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/local-client";
import { API_URL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTierFavicon } from "@/hooks/use-tier-favicon";
import { LogOut, Copy, Building2, CheckCircle, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FulfilledRewardsView from "@/components/teacher/FulfilledRewardsView";
import AccountSettings from "@/components/AccountSettings";

const DeveloperDashboard = () => {
  const [userName, setUserName] = useState("");
  const [schools, setSchools] = useState<any[]>([]);
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Use developer favicon
  useTierFavicon('basic', 'developer');

  useEffect(() => {
    checkAuth();
    loadSchools();
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
      .eq("role", "developer")
      .single();

    if (!data) {
      navigate("/role-selection");
      return;
    }

    loadUserName();
  };

  const loadUserName = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      const data = await response.json();
      if (data.name) {
        setUserName(data.name);
      }
    } catch (error) {
      console.error('Failed to load user name:', error);
    }
  };

  const loadSchools = async () => {
    try {
      const response = await fetch(`${API_URL}/schools`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      const data = await response.json();
      if (Array.isArray(data)) {
        setSchools(data);
      }
    } catch (error) {
      console.error('Failed to load schools:', error);
    }
  };

  const createSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/schools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ name: schoolName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create school');
      }

      toast({
        title: "School created!",
        description: `${schoolName} has been created successfully.`,
      });

      setSchoolName("");
      loadSchools();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: "School code copied to clipboard.",
    });
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
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Developer Dashboard</h1>
          {userName && <p className="text-sm text-muted-foreground mt-1">Welcome, {userName}</p>}
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </header>

      <main className="p-6 max-w-6xl mx-auto space-y-6">
        <Tabs defaultValue="schools" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="schools">
              <Building2 className="w-4 h-4 mr-2" />
              Schools
            </TabsTrigger>
            <TabsTrigger value="fulfilled">
              <CheckCircle className="w-4 h-4 mr-2" />
              Fulfilled Rewards
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schools" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New School</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createSchool} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      type="text"
                      placeholder="e.g., Lincoln High School"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create School"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Schools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {schools.length === 0 ? (
                  <p className="text-muted-foreground">No schools created yet.</p>
                ) : (
                  schools.map((school) => (
                    <div
                      key={school.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{school.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Code: <span className="font-mono font-bold">{school.code}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyCode(school.code)}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy Code
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/developer/school/${school.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fulfilled" className="mt-6">
            <FulfilledRewardsView />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <AccountSettings userRole="developer" />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DeveloperDashboard;
