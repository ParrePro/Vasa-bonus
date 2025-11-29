import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/local-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle, Settings } from "lucide-react";
import ProfileCustomization from "@/components/ProfileCustomization";

interface AccountSettingsProps {
  userRole: "student" | "teacher" | "developer";
  classes?: { id: string; name: string; code: string }[];
  onClassDeleted?: () => void;
  tier?: 'basic' | 'silver' | 'gold' | 'ruby';
}

const AccountSettings = ({ userRole, classes = [], onClassDeleted, tier = 'basic' }: AccountSettingsProps) => {
  const [password, setPassword] = useState("");
  const [deleteClassId, setDeleteClassId] = useState<string | null>(null);
  const [classPassword, setClassPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classDeleteDialogOpen, setClassDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter your password to confirm deletion.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      await supabase.auth.signOut();
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setPassword("");
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!deleteClassId) return;
    
    if (!classPassword.trim()) {
      toast({
        title: "Error",
        description: "Please enter your password to confirm deletion.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/classes/${deleteClassId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ password: classPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete class");
      }

      toast({
        title: "Class deleted",
        description: "The class has been permanently deleted.",
      });
      
      if (onClassDeleted) {
        onClassDeleted();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setClassPassword("");
      setDeleteClassId(null);
      setClassDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Customization - for students */}
      {userRole === "student" && (
        <ProfileCustomization tier={tier} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Account Settings
          </CardTitle>
          <CardDescription>
            Manage your account and classes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Delete Class Section - for teachers only (developers manage from school view) */}
          {userRole === "teacher" && classes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Classes
              </h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete a class and all its data. This action cannot be undone.
              </p>
              <div className="space-y-2">
                {classes.map((cls) => (
                  <div key={cls.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-sm text-muted-foreground">Code: {cls.code}</p>
                    </div>
                    <AlertDialog open={classDeleteDialogOpen && deleteClassId === cls.id} onOpenChange={(open) => {
                      setClassDeleteDialogOpen(open);
                      if (!open) {
                        setDeleteClassId(null);
                        setClassPassword("");
                      }
                    }}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => setDeleteClassId(cls.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="w-5 h-5" />
                            Delete Class
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete <strong>{cls.name}</strong>? This will permanently remove all students, points, rewards, and campaigns associated with this class. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="space-y-2 py-4">
                          <Label htmlFor="classPassword">Enter your password to confirm</Label>
                          <Input
                            id="classPassword"
                            type="password"
                            placeholder="Your password"
                            value={classPassword}
                            onChange={(e) => setClassPassword(e.target.value)}
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteClass}
                            disabled={loading || !classPassword.trim()}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {loading ? "Deleting..." : "Delete Class"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Delete Account Section - for all roles */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Danger Zone
            </h3>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
              setDeleteDialogOpen(open);
              if (!open) setPassword("");
            }}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Delete Account
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you absolutely sure? This will permanently delete your account, all your classes, points history, and any other data associated with your account. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2 py-4">
                  <Label htmlFor="password">Enter your password to confirm</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={loading || !password.trim()}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {loading ? "Deleting..." : "Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
