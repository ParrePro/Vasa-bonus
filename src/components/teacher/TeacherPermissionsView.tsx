import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Shield, User, Crown, ChevronRight, ArrowLeft, Check, X, UserCog, KeyRound } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TeacherPermission {
  id: string;
  user_id: string;
  name: string;
  email: string;
  can_give_points: boolean;
  can_add_rewards: boolean;
  can_add_campaigns: boolean;
  can_fulfill_rewards: boolean;
  can_fulfill_campaigns: boolean;
  can_remove_students: boolean;
}

interface TeacherPermissionsViewProps {
  classId: string;
  mentorId: string;
  onMentorChanged?: () => void;
}

const permissions = [
  { key: 'can_give_points', label: 'Give Points', description: 'Can award or deduct points from students' },
  { key: 'can_add_rewards', label: 'Add Rewards', description: 'Can create and manage rewards for the class' },
  { key: 'can_add_campaigns', label: 'Add Campaigns', description: 'Can create and manage campaigns' },
  { key: 'can_fulfill_rewards', label: 'Fulfill Rewards', description: 'Can approve or reject reward requests' },
  { key: 'can_fulfill_campaigns', label: 'Fulfill Campaigns', description: 'Can confirm campaign completions' },
  { key: 'can_remove_students', label: 'Remove Students', description: 'Can remove students from the class' },
];

const TeacherPermissionsView = ({ classId, mentorId, onMentorChanged }: TeacherPermissionsViewProps) => {
  const [teachers, setTeachers] = useState<TeacherPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherPermission | null>(null);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState<TeacherPermission | null>(null);
  const [password, setPassword] = useState("");
  const [transferring, setTransferring] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTeachers();
  }, [classId]);

  const loadTeachers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/classes/${classId}/teachers`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load teachers');
      }

      const data = await response.json();
      setTeachers(data);
    } catch (error: any) {
      console.error('Error loading teachers:', error);
      toast({
        title: "Error",
        description: "Failed to load teacher permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (teacherId: string, permission: string, value: boolean) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/classes/${classId}/teachers/${teacherId}/permissions`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ [permission]: value }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update permission');
      }

      // Update local state
      setTeachers(prev => prev.map(t => 
        t.user_id === teacherId ? { ...t, [permission]: value } : t
      ));
      
      // Update selected teacher if viewing
      if (selectedTeacher && selectedTeacher.user_id === teacherId) {
        setSelectedTeacher(prev => prev ? { ...prev, [permission]: value } : null);
      }

      toast({
        title: "Permission updated",
        description: "Teacher permission has been updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update permission",
        variant: "destructive",
      });
    }
  };

  const countPermissions = (teacher: TeacherPermission) => {
    return permissions.filter(p => teacher[p.key as keyof TeacherPermission] === true).length;
  };

  const handleTransferMentor = async () => {
    if (!transferTarget || !password) return;

    setTransferring(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/classes/${classId}/transfer-mentor`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            newMentorId: transferTarget.user_id,
            password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to transfer mentor role');
      }

      toast({
        title: "Success",
        description: `${transferTarget.name} is now the mentor of this class`,
      });

      setTransferDialogOpen(false);
      setTransferTarget(null);
      setPassword("");
      setSelectedTeacher(null);
      
      // Reload data and notify parent
      loadTeachers();
      if (onMentorChanged) {
        onMentorChanged();
      }
    } catch (error: any) {
      console.error('Error transferring mentor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to transfer mentor role",
        variant: "destructive",
      });
    } finally {
      setTransferring(false);
    }
  };

  const openTransferDialog = (teacher: TeacherPermission) => {
    setTransferTarget(teacher);
    setPassword("");
    setTransferDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading teachers...</div>;
  }

  if (teachers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No co-teachers in this class yet.</p>
          <p className="text-sm mt-2">When you add co-teachers, you can manage their permissions here.</p>
        </CardContent>
      </Card>
    );
  }

  // Show individual teacher permissions view
  if (selectedTeacher) {
    const isMentor = selectedTeacher.user_id === mentorId;

    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedTeacher(null)}
          className="mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teachers
        </Button>

        <Card className={isMentor ? 'border-primary/50 bg-primary/5' : ''}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className={isMentor ? 'bg-primary text-primary-foreground' : ''}>
                  {selectedTeacher.name?.charAt(0) || 'T'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">{selectedTeacher.name}</CardTitle>
                  {isMentor && (
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Mentor
                    </Badge>
                  )}
                </div>
                <CardDescription>{selectedTeacher.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isMentor ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
                <Shield className="w-5 h-5" />
                <span>Mentors have full permissions and cannot be restricted.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground mb-4">Manage Permissions</h3>
                {permissions.map((perm) => (
                  <div 
                    key={perm.key} 
                    className="flex items-center justify-between space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <Label className="text-base font-medium">{perm.label}</Label>
                      <p className="text-sm text-muted-foreground">{perm.description}</p>
                    </div>
                    <Switch
                      checked={selectedTeacher[perm.key as keyof TeacherPermission] as boolean}
                      onCheckedChange={(checked) => updatePermission(selectedTeacher.user_id, perm.key, checked)}
                    />
                  </div>
                ))}

                {/* Make Mentor Button */}
                <div className="pt-4 border-t mt-6">
                  <Button
                    variant="outline"
                    className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                    onClick={() => openTransferDialog(selectedTeacher)}
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Make {selectedTeacher.name} the Mentor
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    This will transfer all mentor privileges to this teacher. You will need to enter your password.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transfer Mentor Confirmation Dialog */}
        <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Transfer Mentor Role
              </DialogTitle>
              <DialogDescription>
                You are about to make <strong>{transferTarget?.name}</strong> the mentor of this class.
                This action will:
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 py-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                <ul className="list-disc list-inside space-y-1 text-amber-800">
                  <li><strong>{transferTarget?.name}</strong> will become the new mentor with full permissions</li>
                  <li>You will become a regular co-teacher</li>
                  <li>Your permissions will be reset to default co-teacher permissions</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Enter your password to confirm
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your account password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setTransferDialogOpen(false);
                  setPassword("");
                }}
                disabled={transferring}
              >
                Cancel
              </Button>
              <Button
                onClick={handleTransferMentor}
                disabled={!password || transferring}
                className="bg-primary"
              >
                {transferring ? "Transferring..." : "Confirm Transfer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Show list of teachers
  return (
    <div className="space-y-3">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Teacher Permissions</h3>
        <p className="text-sm text-muted-foreground">Click on a teacher to manage their permissions</p>
      </div>

      {teachers.map((teacher) => {
        const isMentor = teacher.user_id === mentorId;
        const permCount = countPermissions(teacher);

        return (
          <Card 
            key={teacher.id} 
            className={`cursor-pointer hover:bg-muted/50 transition-colors ${isMentor ? 'border-primary/50 bg-primary/5' : ''}`}
            onClick={() => setSelectedTeacher(teacher)}
          >
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={isMentor ? 'bg-primary text-primary-foreground' : ''}>
                    {teacher.name?.charAt(0) || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{teacher.name}</span>
                    {isMentor && (
                      <Badge className="bg-gradient-to-r from-primary to-secondary text-white shrink-0">
                        <Crown className="w-3 h-3 mr-1" />
                        Mentor
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{teacher.email}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {isMentor ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Full Access
                    </Badge>
                  ) : (
                    <Badge 
                      variant={permCount === permissions.length ? "default" : permCount === 0 ? "destructive" : "secondary"}
                      className="flex items-center gap-1"
                    >
                      {permCount === permissions.length ? (
                        <Check className="w-3 h-3" />
                      ) : permCount === 0 ? (
                        <X className="w-3 h-3" />
                      ) : null}
                      {permCount}/{permissions.length} permissions
                    </Badge>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Transfer Mentor Confirmation Dialog */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Transfer Mentor Role
            </DialogTitle>
            <DialogDescription>
              You are about to make <strong>{transferTarget?.name}</strong> the mentor of this class.
              This action will:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <ul className="list-disc list-inside space-y-1 text-amber-800">
                <li><strong>{transferTarget?.name}</strong> will become the new mentor with full permissions</li>
                <li>You will become a regular co-teacher</li>
                <li>Your permissions will be reset to default co-teacher permissions</li>
              </ul>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Enter your password to confirm
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Your account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTransferDialogOpen(false);
                setPassword("");
              }}
              disabled={transferring}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTransferMentor}
              disabled={!password || transferring}
              className="bg-primary"
            >
              {transferring ? "Transferring..." : "Confirm Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherPermissionsView;
