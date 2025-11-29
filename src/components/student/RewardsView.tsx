import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Gift, ShoppingCart, Loader2, Heart } from "lucide-react";

interface RewardsViewProps {
  classId: string;
  studentPoints: number;
  onPurchase: () => void;
}

interface Classmate {
  id: string;
  name: string;
}

const RewardsView = ({ classId, studentPoints, onPurchase }: RewardsViewProps) => {
  const [rewards, setRewards] = useState<any[]>([]);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [giftingId, setGiftingId] = useState<string | null>(null);
  const [purchaseCounts, setPurchaseCounts] = useState<Record<string, number>>({});
  const [classmates, setClassmates] = useState<Classmate[]>([]);
  
  // Gift dialog state
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [giftPassword, setGiftPassword] = useState("");

  useEffect(() => {
    loadRewards();
    loadClassmates();
  }, [classId]);

  const loadClassmates = async () => {
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

  const loadRewards = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // First get reward_classes for this class
    const { data: rewardClasses, error: rcError } = await supabase
      .from("reward_classes")
      .select("reward_id")
      .eq("class_id", classId);

    if (rcError) {
      console.error("Error loading reward_classes:", rcError);
      return;
    }

    if (!rewardClasses || rewardClasses.length === 0) {
      setRewards([]);
      return;
    }

    // Get the reward IDs
    const rewardIds = rewardClasses.map(rc => rc.reward_id);

    // Fetch the actual rewards
    const { data: rewardsData, error: rewardsError } = await supabase
      .from("rewards")
      .select("*")
      .in("id", rewardIds);

    if (rewardsError) {
      console.error("Error loading rewards:", rewardsError);
      return;
    }

    const now = new Date();
    const rewardsList = rewardsData?.filter(r => {
      if (!r || !r.active) return false;
      
      // Check availability
      const availableFrom = r.available_from ? new Date(r.available_from) : null;
      const availableUntil = r.available_until ? new Date(r.available_until) : null;
      
      // If has start date and it's in the future, not available yet
      if (availableFrom && availableFrom > now) return false;
      
      // If has end date and it's passed, not available anymore
      if (availableUntil && availableUntil < now) return false;
      
      return true;
    }) || [];
    
    setRewards(rewardsList.sort((a, b) => a.points_cost - b.points_cost));

    // Load purchase counts for all rewards
    if (rewardsList.length > 0) {
      const activeRewardIds = rewardsList.map(r => r.id);
      const { data: purchases } = await supabase
        .from("reward_purchases")
        .select("reward_id")
        .eq("student_id", user.id)
        .in("reward_id", activeRewardIds);

      const counts: Record<string, number> = {};
      purchases?.forEach(p => {
        counts[p.reward_id] = (counts[p.reward_id] || 0) + 1;
      });
      setPurchaseCounts(counts);
    }
  };

  const handlePurchase = async (reward: any) => {
    if (studentPoints < reward.points_cost) {
      toast({ title: "Not enough points!", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      setPurchasingId(reward.id);

      // Call edge function to handle purchase securely
      const { data, error } = await supabase.functions.invoke("purchase-reward", {
        body: {
          rewardId: reward.id,
          classId: classId,
        },
      });

      if (error || !data?.success) {
        const description = (data as any)?.error || error?.message || "Please try again";
        toast({
          title: "Error purchasing reward",
          description,
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Reward purchased successfully!" });
      onPurchase();
    } finally {
      setPurchasingId(null);
    }
  };

  const openGiftDialog = (reward: any) => {
    setSelectedReward(reward);
    setSelectedRecipient("");
    setGiftPassword("");
    setGiftDialogOpen(true);
  };

  const handleGiftReward = async () => {
    if (!selectedReward || !selectedRecipient || !giftPassword) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    try {
      setGiftingId(selectedReward.id);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('http://localhost:3001/api/gifts/reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          recipientId: selectedRecipient,
          rewardId: selectedReward.id,
          classId,
          password: giftPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error gifting reward",
          description: data.error || "Please try again",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "🎁 Reward gifted!",
        description: `${data.message}. You earned ${data.tierPointsAwarded} tier points!`,
      });

      setGiftDialogOpen(false);
      onPurchase();
    } catch (error) {
      console.error('Gift reward error:', error);
      toast({
        title: "Error",
        description: "Failed to gift reward. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGiftingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Available Rewards</h2>
        <div className="text-lg font-semibold">
          Your Points: <span className="text-primary">{studentPoints}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const canAfford = studentPoints >= reward.points_cost;
          const purchaseCount = purchaseCounts[reward.id] || 0;
          
          // Check if purchase limit is reached
          let limitReached = false;
          let limitMessage = "";
          if (reward.purchase_limit_type === "once" && purchaseCount >= 1) {
            limitReached = true;
            limitMessage = "Already Purchased";
          } else if (reward.purchase_limit_type === "custom" && reward.purchase_limit_count) {
            if (purchaseCount >= reward.purchase_limit_count) {
              limitReached = true;
              limitMessage = "Purchase Limit Reached";
            }
          }

          return (
            <Card key={reward.id} className={!canAfford ? "opacity-60" : ""}>
              <CardHeader>
                <CardTitle className="text-lg">{reward.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {reward.image_url && (
                  <img
                    src={reward.image_url}
                    alt={reward.title}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                )}
                <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                <div className="flex items-center gap-2 text-sm mb-3">
                  <Gift className="w-4 h-4" />
                  <span className="font-semibold">{reward.points_cost} points</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-primary to-primary-glow text-white font-semibold shadow-sm">
                    {reward.category}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-secondary to-primary text-white font-semibold shadow-sm">
                    {reward.reward_type === "one-time" ? "One Time" : `${reward.duration_days} days`}
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-accent to-destructive text-white font-semibold shadow-sm">
                    {reward.purchase_limit_type === "once" 
                      ? "Once only" 
                      : reward.purchase_limit_type === "custom" 
                      ? `${reward.purchase_limit_count}x max`
                      : "Unlimited"}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handlePurchase(reward)}
                    disabled={!canAfford || purchasingId === reward.id || limitReached}
                    className="w-full"
                  >
                    {purchasingId === reward.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4 mr-2" />
                    )}
                    {purchasingId === reward.id
                      ? "Processing..."
                      : limitReached
                      ? limitMessage
                      : canAfford
                      ? "Purchase for Myself"
                      : "Not Enough Points"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openGiftDialog(reward)}
                    disabled={!canAfford || giftingId === reward.id}
                    className="w-full border-pink-200 hover:bg-pink-50 hover:border-pink-300"
                    title="Gift this reward to a classmate (+3 tier points)"
                  >
                    {giftingId === reward.id ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Heart className="w-4 h-4 mr-2 text-pink-500" />
                    )}
                    <span className="text-pink-600">Gift to Classmate</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rewards.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No rewards available yet. Check back later!</p>
          </CardContent>
        </Card>
      )}

      {/* Gift Reward Dialog */}
      <Dialog open={giftDialogOpen} onOpenChange={setGiftDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Gift Reward to Classmate
            </DialogTitle>
            <DialogDescription>
              Gift "{selectedReward?.title}" to a classmate. You'll earn 3 tier points! 🎁
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">{selectedReward?.title}</p>
              <p className="text-sm text-muted-foreground">Cost: {selectedReward?.points_cost} points</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Select Classmate</Label>
              <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose who to gift this to..." />
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
              onClick={handleGiftReward} 
              className="w-full"
              disabled={!selectedRecipient || !giftPassword || giftingId !== null}
            >
              {giftingId ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Heart className="w-4 h-4 mr-2" />
              )}
              Gift Reward (+3 tier points)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RewardsView;
