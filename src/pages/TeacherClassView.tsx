import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/local-client";
import { API_URL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useTierFavicon } from "@/hooks/use-tier-favicon";
import { useTeacherPermissions } from "@/hooks/use-teacher-permissions";
import { ArrowLeft, Search, Plus, Gift, Mail, Package, BarChart3, Zap, Pencil, Shield, Star, CheckSquare, Square, Users as UsersIcon, Users2 } from "lucide-react";
import ClassMembersView from "@/components/student/ClassMembersView";
import PointsHistoryView from "@/components/PointsHistoryView";
import RewardsView from "@/components/teacher/RewardsView";
import CampaignsView from "@/components/teacher/CampaignsView";
import PendingCampaignsView from "@/components/teacher/PendingCampaignsView";
import MessagesView from "@/components/teacher/MessagesView";
import PendingRewardsView from "@/components/teacher/PendingRewardsView";
import ClassStats from "@/components/developer/ClassStats";
import TeacherPermissionsView from "@/components/teacher/TeacherPermissionsView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import StyledAvatar from "@/components/StyledAvatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const TeacherClassView = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { permissions } = useTeacherPermissions(classId);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [teacherCount, setTeacherCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [defaultReasons, setDefaultReasons] = useState<any[]>([]);
  const [isMentor, setIsMentor] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customPoints, setCustomPoints] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [pendingRewardsCount, setPendingRewardsCount] = useState(0);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  // Bulk selection and favorites state
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkPoints, setBulkPoints] = useState("");
  const [bulkReason, setBulkReason] = useState("");
  const [bulkMode, setBulkMode] = useState(false);

  // Use teacher favicon (developer takes priority if isDeveloper)
  useTierFavicon('basic', isDeveloper ? 'developer' : 'teacher');

  useEffect(() => {
    loadClassInfo();
    loadDefaultReasons();
    checkIfMentor();

    checkIfDeveloper();
    loadStudents();
    loadNotificationCounts();
    loadFavorites();
  }, [classId]);

  useEffect(() => {
    if (selectedStudent && classId) {
      loadTotalPoints();
    }
  }, [selectedStudent, classId]);

  const loadTotalPoints = async () => {
    if (!selectedStudent || !classId) return;

    const { data } = await supabase
      .from("points_transactions")
      .select("points")
      .eq("student_id", selectedStudent.id)
      .eq("class_id", classId);

    const total = data?.reduce((sum, transaction) => sum + transaction.points, 0) || 0;
    setTotalPoints(total);
  };

  const loadClassInfo = async () => {
    if (!classId) return;

    const { data } = await supabase
      .from("classes")
      .select("*")
      .eq("id", classId)
      .single();

    setClassInfo(data);
    setLoading(false);
  };

  const loadStudents = async () => {
    if (!classId) return;

    try {
      console.log("Loading students for class:", classId);
      
      // Get all members to count teachers
      const { data: allMemberData } = await supabase
        .from("class_members")
        .select("user_id, is_teacher")
        .eq("class_id", classId);
      
      if (allMemberData) {
        setTeacherCount(allMemberData.filter(m => m.is_teacher).length);
      }
      
      const { data: memberData, error: memberError } = await supabase
        .from("class_members")
        .select("user_id")
        .eq("class_id", classId)
        .eq("is_teacher", false);

      console.log("Member data:", memberData, "Error:", memberError);

      if (memberError) {
        console.error("Error loading members:", memberError);
        return;
      }

      if (memberData && memberData.length > 0) {
        const userIds = memberData.map((m) => m.user_id);
        console.log("User IDs to fetch profiles for:", userIds);
        
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, avatar_skin, avatar_hair, avatar_hair_color, avatar_eyes, avatar_accessory, avatar_background, avatar_border, avatar_effect")
          .in("id", userIds);

        console.log("Profile data:", profileData, "Error:", profileError);

        if (profileError) {
          console.error("Error loading profiles:", profileError);
          return;
        }

        // Map profile data with avatar customization
        const studentsWithAvatar = (profileData || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          points: 0, // Will be populated below
          customization: {
            avatar_skin: p.avatar_skin,
            avatar_hair: p.avatar_hair,
            avatar_hair_color: p.avatar_hair_color,
            avatar_eyes: p.avatar_eyes,
            avatar_accessory: p.avatar_accessory,
            avatar_background: p.avatar_background,
            avatar_border: p.avatar_border,
            avatar_effect: p.avatar_effect,
          }
        }));

        // Fetch points for all students
        if (userIds.length > 0) {
          const { data: pointsData } = await supabase
            .from("points_transactions")
            .select("student_id, points")
            .eq("class_id", classId)
            .in("student_id", userIds);

          // Create a map of student points
          const pointsMap = new Map<string, number>();
          pointsData?.forEach((transaction: any) => {
            const current = pointsMap.get(transaction.student_id) || 0;
            pointsMap.set(transaction.student_id, current + transaction.points);
          });

          // Update students with their points
          studentsWithAvatar.forEach((student: any) => {
            student.points = pointsMap.get(student.id) || 0;
          });
        }

        setStudents(studentsWithAvatar);
      } else {
        console.log("No student members found");
        setStudents([]);
      }
    } catch (error) {
      console.error("Error in loadStudents:", error);
    }
  };

  const loadDefaultReasons = async () => {
    const { data } = await supabase
      .from("default_point_reasons")
      .select("*")
      .order("points", { ascending: false });

    if (data) {
      // Deduplicate by reason text - keep first occurrence only
      const seen = new Set<string>();
      const uniqueReasons = data.filter((reason) => {
        if (seen.has(reason.reason)) {
          return false;
        }
        seen.add(reason.reason);
        return true;
      });
      setDefaultReasons(uniqueReasons);
    }
  };

  const checkIfMentor = async () => {
    if (!classId) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("classes")
      .select("mentor_id")
      .eq("id", classId)
      .single();

    setIsMentor(data?.mentor_id === session.user.id);
  };

  const checkIfDeveloper = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase.rpc("is_developer", { _user_id: session.user.id });
    setIsDeveloper(data || false);
  };

  const loadNotificationCounts = async () => {
    if (!classId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Load unread messages count for current teacher only
    const { data: messages } = await supabase
      .from("messages")
      .select("id")
      .eq("class_id", classId)
      .eq("teacher_id", user.id)
      .eq("is_read", false);


    setUnreadMessagesCount(messages?.length || 0);

    // Load pending rewards count (tangible and privilege only)
    const { data: rewards } = await supabase
      .from("reward_purchases")
      .select("id, reward_id")
      .eq("class_id", classId)
      .eq("status", "pending");

    if (rewards && rewards.length > 0) {
      const rewardIds = [...new Set(rewards.map(r => r.reward_id))];
      const { data: rewardDetails } = await supabase
        .from("rewards")
        .select("id, category")
        .in("id", rewardIds);

      // Create a map of reward id to category
      const categoryMap = new Map(rewardDetails?.map(r => [r.id, r.category]) || []);
      
      // Count purchases where the reward is tangible or privilege
      const pendingCount = rewards.filter(purchase => {
        const category = categoryMap.get(purchase.reward_id);
        return category === "tangible" || category === "privilege";
      }).length;

      setPendingRewardsCount(pendingCount);
    } else {
      setPendingRewardsCount(0);
    }

    // Subscribe to real-time updates
    const messagesChannel = supabase
      .channel('messages-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `class_id=eq.${classId}`,
        },
        async () => {
          // Reload counts when messages change
          const { data: updatedMessages } = await supabase
            .from("messages")
            .select("id")
            .eq("class_id", classId)
            .eq("teacher_id", user.id)
            .eq("is_read", false);
          

          
          setUnreadMessagesCount(updatedMessages?.length || 0);
        }
      )
      .subscribe();

    const rewardsChannel = supabase
      .channel('rewards-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reward_purchases',
          filter: `class_id=eq.${classId}`,
        },
        async () => {
          // Reload counts when reward purchases change
          const { data: updatedRewards } = await supabase
            .from("reward_purchases")
            .select("id, reward_id")
            .eq("class_id", classId)
            .eq("status", "pending");

          if (updatedRewards && updatedRewards.length > 0) {
            const rewardIds = updatedRewards.map(r => r.reward_id);
            const { data: rewardDetails } = await supabase
              .from("rewards")
              .select("id, category")
              .in("id", rewardIds);

            const pendingCount = rewardDetails?.filter(
              r => r.category === "tangible" || r.category === "privilege"
            ).length || 0;

            setPendingRewardsCount(pendingCount);
          } else {
            setPendingRewardsCount(0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(rewardsChannel);
    };
  };

  const loadFavorites = async () => {
    if (!classId) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_URL}/points/favorites/${classId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const favoriteIds = await response.json();
        setFavorites(new Set(favoriteIds));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_URL}/points/favorites/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ studentId, classId }),
      });

      if (response.ok) {
        const { isFavorite } = await response.json();
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          if (isFavorite) {
            newFavorites.add(studentId);
          } else {
            newFavorites.delete(studentId);
          }
          return newFavorites;
        });

        toast({
          title: isFavorite ? "Added to favorites" : "Removed from favorites",
          description: isFavorite ? "Student will appear at the top of your list" : "Student removed from favorites",
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(studentId)) {
        newSelected.delete(studentId);
      } else {
        newSelected.add(studentId);
      }
      return newSelected;
    });
  };

  const selectAllStudents = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleBulkPoints = async () => {
    const points = parseInt(bulkPoints);
    if (!points || !bulkReason.trim() || selectedStudents.size === 0) {
      toast({
        title: "Error",
        description: "Please select students and enter points and reason",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/points/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          studentIds: Array.from(selectedStudents),
          classId,
          points,
          reason: bulkReason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to give points');
      }

      const result = await response.json();
      
      toast({
        title: "Points given!",
        description: `${result.count} students received ${points} points for ${bulkReason}`,
      });

      setBulkDialogOpen(false);
      setBulkPoints("");
      setBulkReason("");
      setSelectedStudents(new Set());
      setBulkMode(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const giveBulkPointsPreset = async (points: number, reason: string) => {
    if (selectedStudents.size === 0) {
      toast({
        title: "No students selected",
        description: "Please select at least one student",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/points/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          studentIds: Array.from(selectedStudents),
          classId,
          points,
          reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to give points');
      }

      const result = await response.json();
      
      toast({
        title: "Points given!",
        description: `${result.count} students received ${points} points for ${reason}`,
      });

      setSelectedStudents(new Set());
      setBulkMode(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const kickStudent = async (studentId: string) => {
    if (!classId) return;

    // Check permission
    if (!permissions.can_remove_students) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to remove students from this class",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("class_members")
        .delete()
        .eq("class_id", classId)
        .eq("user_id", studentId)
        .eq("is_teacher", false);

      if (error) throw error;

      toast({
        title: "Student removed",
        description: "The student has been removed from the class",
      });

      loadStudents();
      setSelectedStudent(null);
      setTotalPoints(0);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const givePoints = async (points: number, reason: string) => {
    if (!selectedStudent || !classId) return;

    // Check permission
    if (!permissions.can_give_points) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to give points in this class",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Check for active multiplier campaigns - use separate queries
      const { data: participations } = await supabase
        .from("campaign_participations")
        .select("id, campaign_id")
        .eq("student_id", selectedStudent.id)
        .eq("class_id", classId)
        .eq("status", "active");

      // Calculate final points with multipliers
      let finalPoints = points;
      let appliedMultipliers: string[] = [];
      
      if (participations && participations.length > 0) {
        const campaignIds = participations.map(p => p.campaign_id);
        const { data: campaigns } = await supabase
          .from("campaigns")
          .select("id, campaign_type, multiplier_value")
          .in("id", campaignIds);
        
        if (campaigns) {
          campaigns.forEach((campaign: any) => {
            if (campaign.campaign_type === 'multiplier' && campaign.multiplier_value) {
              finalPoints = Math.floor(finalPoints * campaign.multiplier_value);
              appliedMultipliers.push(`${campaign.multiplier_value}x`);
            }
          });
        }
      }

      // Use backend API to add points (this will also award tier points)
      const response = await fetch(`${API_URL}/points`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          classId: classId,
          points: finalPoints,
          reason: appliedMultipliers.length > 0 
            ? `${reason} (${appliedMultipliers.join(', ')} campaign bonus)` 
            : reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to give points');
      }

      toast({
        title: "Points given!",
        description: appliedMultipliers.length > 0
          ? `${selectedStudent.name} received ${finalPoints} points (${points} base + ${appliedMultipliers.join(', ')} campaign bonus) for ${reason}`
          : `${selectedStudent.name} received ${points} points for ${reason}`,
      });

      // Dispatch custom event for guide completion
      document.dispatchEvent(new CustomEvent('guide-event', {
        detail: { action: 'points-given' }
      }));

      // Reload total points
      loadTotalPoints();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCustomPoints = async () => {
    const points = parseInt(customPoints);
    if (!points || !customReason.trim()) {
      toast({
        title: "Error",
        description: "Please enter both points and reason",
        variant: "destructive",
      });
      return;
    }

    await givePoints(points, customReason);
    setCustomDialogOpen(false);
    setCustomPoints("");
    setCustomReason("");
  };

  const handleRenameClass = async () => {
    if (!newClassName.trim()) {
      toast({
        title: "Error",
        description: "Class name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/classes/${classId}`, {
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

      setClassInfo({ ...classInfo, name: data.name });
      toast({
        title: "Class renamed",
        description: `Class has been renamed to "${data.name}"`,
      });
      setRenameDialogOpen(false);
      setNewClassName("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredStudents = students
    .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aFav = favorites.has(a.id);
      const bFav = favorites.has(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return a.name.localeCompare(b.name);
    });

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!classInfo) {
    return <div className="p-6">Class not found</div>;
  }

  if (selectedStudent) {
    return (
      <div className="min-h-screen bg-background" data-student-panel={selectedStudent.id}>
        <header className="border-b px-6 py-4">
          <Button variant="ghost" onClick={() => { setSelectedStudent(null); setTotalPoints(0); }} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Class
          </Button>
          <div className="flex items-center gap-4">
            <StyledAvatar 
              name={selectedStudent.name} 
              customization={selectedStudent.customization}
              size={64}
              className="flex-shrink-0"
            />
            <div>
              <h1 className="text-2xl font-bold">{selectedStudent.name}</h1>
              <p className="text-sm text-muted-foreground">{classInfo.name}</p>
              <p className="text-lg font-semibold text-primary mt-1">{totalPoints} points</p>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Give Points</CardTitle>
              {!permissions.can_give_points && (
                <p className="text-sm text-muted-foreground">You don't have permission to give points.</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {permissions.can_give_points && defaultReasons.map((reason) => (
                <Button
                  key={reason.id}
                  className="w-full justify-between"
                  variant="outline"
                  onClick={() => givePoints(reason.points, reason.reason)}
                  data-guide="submit-points"
                >
                  <span>{reason.reason}</span>
                  <span className="font-bold text-primary">+{reason.points}</span>
                </Button>
              ))}
              
              {permissions.can_give_points && (
              <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Custom Points
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Give Custom Points</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="points">Points</Label>
                      <Input
                        id="points"
                        type="number"
                        placeholder="Enter points amount"
                        value={customPoints}
                        onChange={(e) => setCustomPoints(e.target.value)}
                        data-guide="points-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea
                        id="reason"
                        placeholder="Enter reason for points"
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        data-guide="points-note"
                      />
                    </div>
                    <Button className="w-full" onClick={handleCustomPoints} data-guide="submit-points">
                      Give Points
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              )}
            </CardContent>
          </Card>

          <PointsHistoryView studentId={selectedStudent.id} classId={classId!} />

          {permissions.can_remove_students && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="w-full" variant="destructive">
                  Remove Student from Class
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove {selectedStudent.name} from {classInfo.name}. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => kickStudent(selectedStudent.id)}>
                    Remove Student
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4">
        <Button variant="ghost" onClick={() => navigate("/teacher")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">{classInfo.name}</h1>
          {(isMentor || isDeveloper) && (
            <Dialog open={renameDialogOpen} onOpenChange={(open) => {
              setRenameDialogOpen(open);
              if (open) setNewClassName(classInfo.name);
            }}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Pencil className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename Class</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Class Name</Label>
                    <Input
                      id="className"
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
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">Class Code: {classInfo.code}</p>
      </header>

      <main className="p-6">
        <Tabs defaultValue="members" className="w-full">
          <TabsList className={`grid w-full ${isDeveloper ? 'grid-cols-8' : (isMentor ? 'grid-cols-6' : 'grid-cols-5')}`}>
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="rewards" data-guide="rewards-tab">
              <Gift className="w-4 h-4 mr-2" />
              Rewards
            </TabsTrigger>
            <TabsTrigger value="campaigns" data-guide="campaigns-tab">
              <Zap className="w-4 h-4 mr-2" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="messages" className="relative">
              <Mail className="w-4 h-4 mr-2" />
              Messages
              {unreadMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadMessagesCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              <Package className="w-4 h-4 mr-2" />
              Pending
              {pendingRewardsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingRewardsCount}
                </span>
              )}
            </TabsTrigger>
            {(isMentor || isDeveloper) && (
              <TabsTrigger value="permissions">
                <Shield className="w-4 h-4 mr-2" />
                Permissions
              </TabsTrigger>
            )}
            {isDeveloper && (
              <TabsTrigger value="stats">
                <BarChart3 className="w-4 h-4 mr-2" />
                Stats
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="members" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Teachers & Mentors
                  <Badge variant="secondary" className="ml-2">{teacherCount}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ClassMembersView classId={classId!} showOnlyTeachers />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Students
                    <Badge variant="secondary" className="ml-2">{students.length}</Badge>
                  </CardTitle>
                  {permissions.can_give_points && filteredStudents.length > 0 && (
                    <Button
                      variant={bulkMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setBulkMode(!bulkMode);
                        setSelectedStudents(new Set());
                      }}
                    >
                      <Users2 className="w-4 h-4 mr-2" />
                      {bulkMode ? "Exit Bulk Mode" : "Bulk Select"}
                    </Button>
                  )}
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {bulkMode && selectedStudents.size > 0 && (
                  <div className="flex items-center gap-3 mt-3 p-3 bg-primary/10 rounded-lg">
                    <span className="text-sm font-medium">{selectedStudents.size} student{selectedStudents.size > 1 ? 's' : ''} selected</span>
                    <div className="flex-1" />
                    <Button variant="ghost" size="sm" onClick={() => setSelectedStudents(new Set())}>
                      Clear
                    </Button>
                    <Button variant="ghost" size="sm" onClick={selectAllStudents}>
                      {selectedStudents.size === filteredStudents.length ? "Deselect All" : "Select All"}
                    </Button>
                    <Button size="sm" onClick={() => setBulkDialogOpen(true)}>
                      <Gift className="w-4 h-4 mr-2" />
                      Give Points
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredStudents.length === 0 ? (
                  <p className="text-muted-foreground">No students in this class yet.</p>
                ) : (
                  filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        selectedStudents.has(student.id) ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                      } ${!bulkMode ? 'cursor-pointer' : ''}`}
                      onClick={() => {
                        if (bulkMode) {
                          toggleStudentSelection(student.id);
                        } else {
                          setSelectedStudent(student);
                        }
                      }}
                      data-guide="student-select"
                    >
                      {bulkMode && (
                        <div className="flex items-center">
                          {selectedStudents.has(student.id) ? (
                            <CheckSquare className="w-5 h-5 text-primary" />
                          ) : (
                            <Square className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      <button
                        className="p-1 hover:bg-accent rounded transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(student.id, e);
                        }}
                        title={favorites.has(student.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star className={`w-5 h-5 ${favorites.has(student.id) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                      </button>
                      <StyledAvatar 
                        name={student.name} 
                        customization={student.customization}
                        size={40}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {favorites.has(student.id) && <span className="text-yellow-500">★ Favorite • </span>}
                          Student
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">{student.points || 0}</p>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Bulk Points Dialog */}
            <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Give Points to {selectedStudents.size} Student{selectedStudents.size > 1 ? 's' : ''}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="max-h-32 overflow-y-auto p-2 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Selected students:</p>
                    <div className="flex flex-wrap gap-1">
                      {students
                        .filter(s => selectedStudents.has(s.id))
                        .map(s => (
                          <span key={s.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {s.name}
                          </span>
                        ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Quick Select Reason</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {defaultReasons.map((reason) => (
                        <Button
                          key={reason.id}
                          variant={bulkPoints === String(reason.points) && bulkReason === reason.reason ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setBulkPoints(String(reason.points));
                            setBulkReason(reason.reason);
                          }}
                          className="justify-between text-left"
                        >
                          <span className="truncate">{reason.reason}</span>
                          <span className="ml-1 font-bold">+{reason.points}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bulkPoints">Points</Label>
                    <Input
                      id="bulkPoints"
                      type="number"
                      placeholder="Enter points amount"
                      value={bulkPoints}
                      onChange={(e) => setBulkPoints(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bulkReason">Reason</Label>
                    <Textarea
                      id="bulkReason"
                      placeholder="Enter reason for points"
                      value={bulkReason}
                      onChange={(e) => setBulkReason(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" onClick={handleBulkPoints} disabled={!bulkPoints || !bulkReason}>
                    Give {bulkPoints || 0} Points to {selectedStudents.size} Student{selectedStudents.size > 1 ? 's' : ''}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="rewards" className="mt-6">
            <RewardsView classId={classId!} canAddRewards={permissions.can_add_rewards} />
          </TabsContent>

          <TabsContent value="campaigns" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Manage Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <CampaignsView classId={classId!} canAddCampaigns={permissions.can_add_campaigns} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pending Confirmations</CardTitle>
              </CardHeader>
              <CardContent>
                <PendingCampaignsView classId={classId!} canFulfillCampaigns={permissions.can_fulfill_campaigns} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="mt-6">
            <MessagesView classId={classId!} />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <PendingRewardsView classId={classId!} canFulfillRewards={permissions.can_fulfill_rewards} />
          </TabsContent>

          {(isMentor || isDeveloper) && (
            <TabsContent value="permissions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Teacher Permissions
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manage what co-teachers can do in this class. Mentors always have full permissions.
                  </p>
                </CardHeader>
                <CardContent>
                  <TeacherPermissionsView 
                    classId={classId!} 
                    mentorId={classInfo?.mentor_id} 
                    onMentorChanged={loadClassInfo}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {isDeveloper && (
            <TabsContent value="stats" className="mt-6">
              <ClassStats classId={classId!} />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherClassView;
