import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/local-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { GraduationCap, User, Code } from "lucide-react";
import rewardsPattern from "@/assets/rewards-pattern.jpg";

const RoleSelection = () => {
  const [loading, setLoading] = useState(false);
  const [hasRole, setHasRole] = useState(false);
  const [showTeacherCode, setShowTeacherCode] = useState(false);
  const [showDeveloperCode, setShowDeveloperCode] = useState(false);
  const [teacherCode, setTeacherCode] = useState("");
  const [developerCode, setDeveloperCode] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkRole();
  }, []);

  const checkRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase.roles.checkRole();

    if (data?.hasRole) {
      setHasRole(true);
      redirectByRole(data.role);
    }
  };

  const redirectByRole = (role: string) => {
    switch (role) {
      case "teacher":
        navigate("/teacher");
        break;
      case "student":
        navigate("/student");
        break;
      case "developer":
        navigate("/developer");
        break;
    }
  };

  const handleTeacherSelect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      if (!teacherCode) throw new Error("School code is required");

      const { data, error } = await supabase.roles.assignTeacher(teacherCode);
      if (error) throw error;

      toast({
        title: "Welcome teacher!",
        description: "You've successfully joined as a teacher.",
      });

      redirectByRole("teacher");
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

  const handleDeveloperSelect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      if (developerCode !== "Hjärtatclutchar") {
        throw new Error("Invalid developer code");
      }

      const { data, error } = await supabase.roles.assignDeveloper();
      if (error) throw error;

      toast({
        title: "Developer access granted!",
        description: "Welcome to developer mode.",
      });

      redirectByRole("developer");
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

  const selectRole = async (role: "student") => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.roles.assignStudent();
      if (error) throw error;

      toast({
        title: "Role selected!",
        description: `You are now a ${role}.`,
      });

      redirectByRole(role);
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

  if (hasRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Redirecting...</p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${rewardsPattern})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/95 to-background/90 backdrop-blur-sm" />
      
      <div className="max-w-5xl w-full space-y-12 relative z-10">
        <div className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in">
            Choose Your Role
          </h1>
          <p className="text-xl text-muted-foreground">Select how you want to use the platform</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:border-primary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 backdrop-blur-md bg-card/95">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lg animate-pulse">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Teacher</CardTitle>
              <CardDescription className="text-base">Create classes and give points to students</CardDescription>
            </CardHeader>
            <CardContent>
              {!showTeacherCode ? (
                <Button 
                  className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary-glow hover:opacity-90" 
                  onClick={() => setShowTeacherCode(true)} 
                  disabled={loading}
                >
                  Select Teacher
                </Button>
              ) : (
                <form onSubmit={handleTeacherSelect} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacherCode">School Code</Label>
                    <Input
                      id="teacherCode"
                      type="text"
                      placeholder="Enter school code"
                      value={teacherCode}
                      onChange={(e) => setTeacherCode(e.target.value)}
                      required
                      className="border-primary/30"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowTeacherCode(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-primary-glow" disabled={loading}>
                      Join
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="hover:border-secondary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 cursor-pointer backdrop-blur-md bg-card/95" onClick={() => selectRole("student")}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-lg animate-pulse">
                <User className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Student</CardTitle>
              <CardDescription className="text-base">Join classes and earn loyalty points</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full h-12 text-lg bg-gradient-to-r from-secondary to-primary hover:opacity-90" disabled={loading}>
                Select Student
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:border-accent transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 backdrop-blur-md bg-card/95">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-accent to-destructive flex items-center justify-center shadow-lg animate-pulse">
                <Code className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl">Developer</CardTitle>
              <CardDescription className="text-base">Manage schools and technical settings</CardDescription>
            </CardHeader>
            <CardContent>
              {!showDeveloperCode ? (
                <Button 
                  className="w-full h-12 text-lg bg-gradient-to-r from-accent to-destructive hover:opacity-90" 
                  onClick={() => setShowDeveloperCode(true)} 
                  disabled={loading}
                >
                  Select Developer
                </Button>
              ) : (
                <form onSubmit={handleDeveloperSelect} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="developerCode">Developer Code</Label>
                    <Input
                      id="developerCode"
                      type="password"
                      placeholder="Enter developer code"
                      value={developerCode}
                      onChange={(e) => setDeveloperCode(e.target.value)}
                      required
                      className="border-accent/30"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDeveloperCode(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-gradient-to-r from-accent to-destructive" disabled={loading}>
                      Enter
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
