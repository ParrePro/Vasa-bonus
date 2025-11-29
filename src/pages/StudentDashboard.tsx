import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/local-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTierFavicon } from "@/hooks/use-tier-favicon";
import { useTierTheme } from "@/hooks/use-tier-theme";
import { LogOut, Trophy, Users, Gift, Package, Sparkles, Zap, Settings, Crown, Info, Heart, Loader2 } from "lucide-react";
import ClassMembersView from "@/components/student/ClassMembersView";
import RewardsView from "@/components/student/RewardsView";
import CampaignsView from "@/components/student/CampaignsView";
import AccountHistory from "@/components/AccountHistory";
import AccountSettings from "@/components/AccountSettings";
import TierBadge from "@/components/TierBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActiveMultiplierBadge } from "@/components/student/ActiveMultiplierBadge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import heroBanner from "@/assets/hero-banner.jpg";

interface Classmate {
  id: string;
  name: string;
}

const StudentDashboard = () => {
  const [classCode, setClassCode] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [schoolName, setSchoolName] = useState("");
  const [teacherCount, setTeacherCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [tierPoints, setTierPoints] = useState(0);
  const [currentTier, setCurrentTier] = useState<'basic' | 'silver' | 'gold' | 'ruby'>('basic');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [pendingRewards, setPendingRewards] = useState<any[]>([]);
  const [symbolicRewards, setSymbolicRewards] = useState<any[]>([]);
  
  // Gift points state
  const [giftPointsDialogOpen, setGiftPointsDialogOpen] = useState(false);
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  const [giftRecipient, setGiftRecipient] = useState("");
  const [giftAmount, setGiftAmount] = useState("");
  const [giftPassword, setGiftPassword] = useState("");
  const [giftingPoints, setGiftingPoints] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Update favicon based on tier (students use tier-based favicons)
  useTierFavicon(currentTier, 'student');
  
  // Get tier theme
  const tierTheme = useTierTheme(currentTier);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setCurrentUserId(session.user.id);

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "student")
      .single();

    if (!data) {
      navigate("/role-selection");
      return;
    }

    loadUserName();
    loadClasses();
    loadPoints();
    loadPendingRewards();
  };

  const loadUserName = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("profiles")
      .select("name, tier_points, current_tier")
      .eq("id", session.user.id)
      .single();

    if (data) {
      setUserName(data.name);
      setTierPoints(data.tier_points || 0);
      setCurrentTier(data.current_tier || 'basic');
    }
  };

  const loadClasses = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // First get the class_members records
    const { data: classMembers, error: membersError } = await supabase
      .from("class_members")
      .select("id, class_id, user_id, is_teacher")
      .eq("user_id", session.user.id)
      .eq("is_teacher", false);

    if (membersError) {
      console.error("Error loading class members:", membersError);
      return;
    }

    if (!classMembers || classMembers.length === 0) {
      setClasses([]);
      return;
    }

    // Get all class IDs
    const classIds = classMembers.map(cm => cm.class_id);

    // Get the classes data
    const { data: classesData, error: classesError } = await supabase
      .from("classes")
      .select("id, name, code, mentor_id, school_id")
      .in("id", classIds);

    if (classesError) {
      console.error("Error loading classes:", classesError);
      return;
    }

    // Get school name if we have classes with school_id
    if (classesData && classesData.length > 0 && classesData[0].school_id) {
      const { data: schoolData } = await supabase
        .from("schools")
        .select("name")
        .eq("id", classesData[0].school_id)
        .single();
      
      if (schoolData) {
        setSchoolName(schoolData.name);
      }
    }

    // Get member counts for the first class
    if (classesData && classesData.length > 0) {
      const { data: allMembers } = await supabase
        .from("class_members")
        .select("is_teacher")
        .eq("class_id", classesData[0].id);
      
      if (allMembers) {
        setTeacherCount(allMembers.filter(m => m.is_teacher).length);
        setStudentCount(allMembers.filter(m => !m.is_teacher).length);
      }
    }

    // Combine the data
    const combined = classMembers.map(member => ({
      ...member,
      classes: classesData?.find(c => c.id === member.class_id)
    }));

    setClasses(combined);
  };

  const loadPoints = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("points_transactions")
      .select("points")
      .eq("student_id", session.user.id);

    const total = data?.reduce((sum, transaction) => sum + transaction.points, 0) || 0;
    setTotalPoints(total);
    
    // Also reload tier info
    loadUserName();
  };

  const loadPendingRewards = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: purchasesData } = await supabase
      .from("reward_purchases")
      .select("id, reward_id, student_id, class_id, status, purchased_at, gifted_by, gifted_by_name")
      .eq("student_id", session.user.id)
      .eq("status", "pending");

    if (!purchasesData || purchasesData.length === 0) {
      setPendingRewards([]);
      setSymbolicRewards([]);
      return;
    }

    // Fetch reward details separately
    const rewardIds = [...new Set(purchasesData.map((p: any) => p.reward_id))];
    const { data: rewardsData } = await supabase
      .from("rewards")
      .select("id, title, category, image_url")
      .in("id", rewardIds);

    // Combine the data
    const rewardsMap = new Map((rewardsData || []).map((r: any) => [r.id, r]));
    const data = purchasesData.map((p: any) => ({
      ...p,
      rewards: rewardsMap.get(p.reward_id) || { title: 'Unknown', category: 'tangible', image_url: null }
    }));

    if (data) {
      const tangible = data.filter((p: any) => p.rewards.category === "tangible");
      const symbolic = data.filter((p: any) => p.rewards.category === "symbolic");
      const privilege = data.filter((p: any) => p.rewards.category === "privilege");
      setPendingRewards(tangible);
      setSymbolicRewards([...symbolic, ...privilege]);
    }
  };

  const joinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const existingClasses = await supabase
        .from("class_members")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("is_teacher", false);

      if (existingClasses.data && existingClasses.data.length > 0) {
        toast({
          title: "Already in a class",
          description: "You can only join one class at a time.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("id")
        .eq("code", classCode.toUpperCase())
        .single();

      if (classError || !classData) {
        toast({
          title: "Invalid class code",
          description: "Please check the code and try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("class_members").insert({
        class_id: classData.id,
        user_id: session.user.id,
        is_teacher: false,
      });

      if (error) {
        toast({
          title: "Error joining class",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "You've joined the class.",
        });
        setClassCode("");
        // Reload page to refresh all data and show the class dashboard
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      console.error("Error joining class:", error);
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully.",
    });
    navigate("/auth");
  };

  const handlePurchase = () => {
    loadPoints();
    loadPendingRewards();
    loadUserName(); // Reload tier points too
  };

  const loadClassmates = async (classId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`http://localhost:3001/api/gifts/classmates/${classId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClassmates(data);
      }
    } catch (error) {
      console.error('Error loading classmates:', error);
    }
  };

  const openGiftPointsDialog = () => {
    if (classes.length > 0) {
      loadClassmates(classes[0].class_id);
    }
    setGiftRecipient("");
    setGiftAmount("");
    setGiftPassword("");
    setGiftPointsDialogOpen(true);
  };

  const handleGiftPoints = async () => {
    const amount = parseInt(giftAmount);
    if (!giftRecipient || !amount || amount <= 0 || !giftPassword) {
      toast({
        title: "Please fill in all fields",
        description: "Select a classmate, enter points amount, and your password.",
        variant: "destructive",
      });
      return;
    }

    if (amount > totalPoints) {
      toast({
        title: "Not enough points",
        description: `You only have ${totalPoints} points to gift.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setGiftingPoints(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3001/api/gifts/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          recipientId: giftRecipient,
          classId: classes[0].class_id,
          points: amount,
          password: giftPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error gifting points",
          description: data.error || "Please try again",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "🎁 Points gifted!",
        description: data.message,
      });

      setGiftPointsDialogOpen(false);
      loadPoints(); // Refresh points
    } catch (error) {
      console.error('Gift points error:', error);
      toast({
        title: "Error",
        description: "Failed to gift points. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGiftingPoints(false);
    }
  };

  if (classes.length > 0) {
    const currentClass = classes[0].classes;
    return (
      <div className={`min-h-screen ${tierTheme.pageBg} transition-all duration-500`}>
        {/* Tier indicator ribbon */}
        {currentTier !== 'basic' && (
          <div className={`bg-gradient-to-r ${tierTheme.primaryGradient} text-white text-center py-1.5 text-sm font-medium flex items-center justify-center gap-2`}>
            <Crown className="w-4 h-4" />
            <span>VasaBonus {tierTheme.tierName} Member</span>
            <Crown className="w-4 h-4" />
          </div>
        )}
        
        <div 
          className={`h-64 relative overflow-hidden ${tierTheme.glowEffect}`}
          style={{
            backgroundImage: `url(${heroBanner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-b ${tierTheme.headerOverlay}`} />
          <div className={`absolute inset-0 bg-gradient-to-r ${tierTheme.headerBg} opacity-60`} />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="container mx-auto flex justify-between items-end">
              <div className="text-white drop-shadow-lg">
                {schoolName && <p className="text-sm opacity-75 mb-1">{schoolName}</p>}
                <h1 className="text-4xl font-bold flex items-center gap-3">
                  <Sparkles className={`w-8 h-8 ${tierTheme.sparkleColor} animate-pulse`} />
                  {currentClass.name}
                  <img src={tierTheme.tierIcon} alt={tierTheme.tierName} className="w-10 h-10" />
                </h1>
                {userName && <p className="text-lg mt-2 opacity-90">Welcome back, {userName}!</p>}
              </div>
              <Button variant="secondary" size="sm" onClick={handleSignOut} className="shadow-lg">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        <main className="container mx-auto p-6 space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className={`border-2 ${tierTheme.cardBorder} ${tierTheme.cardGlow} ${tierTheme.cardBg} transition-all duration-500 relative`}>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted/50 transition-colors">
                    <Info className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-lg">How to Earn Vasa Points</h4>
                    <p className="text-sm text-muted-foreground">
                      Teachers award Vasa Points for positive behaviors and achievements. Here are some ways you can earn points:
                    </p>
                    <div className="space-y-2 border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">🏆 Leadership</span>
                        <Badge variant="secondary">+15 pts</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">⭐ Excellent participation</span>
                        <Badge variant="secondary">+10 pts</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">📚 Great homework</span>
                        <Badge variant="secondary">+10 pts</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">🤝 Helping a classmate</span>
                        <Badge variant="secondary">+5 pts</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">💝 Kind action</span>
                        <Badge variant="secondary">+5 pts</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">✨ Good behavior</span>
                        <Badge variant="secondary">+5 pts</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground border-t pt-2">
                      Use your points to redeem rewards in the Rewards tab!
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${tierTheme.primaryGradient}`}>
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  Your Vasa Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-6xl font-bold bg-gradient-to-r ${tierTheme.pointsGradient} bg-clip-text text-transparent`}>{totalPoints}</p>
                <p className="text-muted-foreground mt-3 text-lg">Total loyalty points earned</p>
                <div className="mt-4 space-y-3">
                  <ActiveMultiplierBadge />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={openGiftPointsDialog}
                    disabled={totalPoints <= 0}
                  >
                    <Heart className="w-4 h-4 mr-2 text-pink-500" />
                    Gift Points to Classmate
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className={`border-2 ${tierTheme.cardBorder} ${tierTheme.cardGlow} ${tierTheme.cardBg} transition-all duration-500`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${tierTheme.secondaryGradient}`}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  Class Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Class Name</p>
                  <p className="font-semibold text-xl mt-1">{currentClass.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Class Code</p>
                  <p className="font-mono text-xl mt-1 tracking-wider">{currentClass.code}</p>
                </div>
                <div className="flex gap-6 pt-2 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Teachers</p>
                    <p className="font-semibold text-xl mt-1">{teacherCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Students</p>
                    <p className="font-semibold text-xl mt-1">{studentCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <TierBadge tier={currentTier} tierPoints={tierPoints} />
            </div>
          </div>

          {(pendingRewards.length > 0 || symbolicRewards.length > 0) && (
            <Card className={`border-2 ${tierTheme.cardBorder} ${tierTheme.cardGlow} ${tierTheme.cardBg}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${tierTheme.accentGradient}`}>
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  Pending Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRewards.map((purchase) => (
                    <div
                      key={purchase.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg ${
                        purchase.gifted_by_name 
                          ? "bg-pink-50 dark:bg-pink-950 border-pink-200 dark:border-pink-900" 
                          : "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900"
                      }`}
                    >
                      {purchase.rewards.image_url && (
                        <img
                          src={purchase.rewards.image_url}
                          alt={purchase.rewards.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{purchase.rewards.title}</p>
                        {purchase.gifted_by_name ? (
                          <Badge variant="secondary" className="mt-1 bg-pink-100 text-pink-800">
                            🎁 Gift from {purchase.gifted_by_name}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="mt-1">Tangible - Awaiting Fulfillment</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {symbolicRewards.map((purchase) => (
                    <div
                      key={purchase.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg ${
                        purchase.rewards.category === "privilege"
                          ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900"
                          : "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-900"
                      }`}
                    >
                      {purchase.rewards.image_url && (
                        <img
                          src={purchase.rewards.image_url}
                          alt={purchase.rewards.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold">{purchase.rewards.title}</p>
                        <Badge variant="secondary" className="mt-1">
                          {purchase.rewards.category === "privilege" 
                            ? "One Time Privilege - Active" 
                            : "Symbolic - Active"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="class" className="w-full">
            <TabsList className={`grid w-full grid-cols-5 h-14 bg-muted/50 ${tierTheme.cardBorder} border`}>
              <TabsTrigger value="class" className={`text-base ${tierTheme.tabActiveGradient} data-[state=active]:text-white transition-all duration-300`}>
                <Users className="w-5 h-5 mr-2" />
                Class
              </TabsTrigger>
              <TabsTrigger value="rewards" className={`text-base ${tierTheme.tabActiveGradient} data-[state=active]:text-white transition-all duration-300`}>
                <Gift className="w-5 h-5 mr-2" />
                Rewards
              </TabsTrigger>
              <TabsTrigger value="campaigns" className={`text-base ${tierTheme.tabActiveGradient} data-[state=active]:text-white transition-all duration-300`}>
                <Zap className="w-5 h-5 mr-2" />
                Campaigns
              </TabsTrigger>
              <TabsTrigger value="history" className={`text-base ${tierTheme.tabActiveGradient} data-[state=active]:text-white transition-all duration-300`}>
                <Trophy className="w-5 h-5 mr-2" />
                History
              </TabsTrigger>
              <TabsTrigger value="settings" className={`text-base ${tierTheme.tabActiveGradient} data-[state=active]:text-white transition-all duration-300`}>
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="class" className="space-y-6">
              <ClassMembersView classId={classes[0].class_id} />
            </TabsContent>

            <TabsContent value="rewards">
              <RewardsView
                classId={classes[0].class_id}
                studentPoints={totalPoints}
                onPurchase={handlePurchase}
              />
            </TabsContent>

            <TabsContent value="campaigns">
              <CampaignsView classId={classes[0].class_id} />
            </TabsContent>

            <TabsContent value="history">
              {currentUserId && (
                <AccountHistory
                  classId={classes[0].class_id}
                  userId={currentUserId}
                />
              )}
            </TabsContent>

            <TabsContent value="settings">
              <AccountSettings userRole="student" tier={currentTier} />
            </TabsContent>
          </Tabs>

          {/* Gift Points Dialog */}
          <Dialog open={giftPointsDialogOpen} onOpenChange={setGiftPointsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Gift Vasa Points
                </DialogTitle>
                <DialogDescription>
                  Share your points with a classmate! Note: Only Vasa Points are transferred, not tier points.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">Your current balance: <span className="font-bold text-primary">{totalPoints} points</span></p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">Select Classmate</Label>
                  <Select value={giftRecipient} onValueChange={setGiftRecipient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose who to gift points to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {classmates.map((classmate) => (
                        <SelectItem key={classmate.id} value={classmate.id}>
                          {classmate.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Points to Gift</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    max={totalPoints}
                    placeholder="Enter amount"
                    value={giftAmount}
                    onChange={(e) => setGiftAmount(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Confirm with your password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={giftPassword}
                    onChange={(e) => setGiftPassword(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password confirmation is required to prevent unauthorized gifting.
                  </p>
                </div>

                <Button 
                  onClick={handleGiftPoints} 
                  className="w-full"
                  disabled={!giftRecipient || !giftAmount || !giftPassword || giftingPoints}
                >
                  {giftingPoints ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Heart className="w-4 h-4 mr-2" />
                  )}
                  Gift {giftAmount || 0} Points
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Student Dashboard</h1>
          {userName && <p className="text-sm text-muted-foreground mt-1">Welcome, {userName}</p>}
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </header>

      <main className="container mx-auto p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Your Vasa Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-primary">{totalPoints}</p>
              <p className="text-muted-foreground mt-2">Total loyalty points earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join a Class</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={joinClass} className="space-y-4">
                <div>
                  <Label htmlFor="code">Class Code</Label>
                  <Input
                    id="code"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Joining..." : "Join Class"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              You haven't joined any classes yet. Enter a class code above to get started!
            </p>
          </CardContent>
        </Card>

        <AccountSettings userRole="student" tier={currentTier} />
      </main>
    </div>
  );
};

export default StudentDashboard;
