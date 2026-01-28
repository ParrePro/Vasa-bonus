import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Plus, Gift, Trash2, Edit, Clock, Calendar } from "lucide-react";

interface RewardsViewProps {
  classId: string;
  canAddRewards?: boolean;
}

interface Class {
  id: string;
  name: string;
}

const RewardsView = ({ classId, canAddRewards = true }: RewardsViewProps) => {
  const [rewards, setRewards] = useState<any[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([classId]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pointsCost, setPointsCost] = useState("");
  const [rewardType, setRewardType] = useState<"one-time" | "recurring">("one-time");
  const [durationType, setDurationType] = useState<"one-week" | "one-month" | "custom" | "forever" | null>(null);
  const [customDays, setCustomDays] = useState("");
  const [category, setCategory] = useState<"tangible" | "symbolic" | "privilege">("tangible");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [purchaseLimitType, setPurchaseLimitType] = useState<"once" | "unlimited" | "custom">("unlimited");
  const [purchaseLimitCount, setPurchaseLimitCount] = useState("");
  const [availabilityType, setAvailabilityType] = useState<"always" | "limited">("always");
  const [scheduleForLater, setScheduleForLater] = useState(false);
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");

  useEffect(() => {
    loadRewards();
    loadClasses();
  }, [classId]);

  const loadRewards = async () => {
    try {
      const { data: rewardClassData, error: rcError } = await supabase
        .from("reward_classes")
        .select("reward_id")
        .eq("class_id", classId);

      if (rcError || !rewardClassData) {
        console.error("Error loading reward_classes:", rcError);
        return;
      }

      const rewardIds = rewardClassData.map(rc => rc.reward_id);
      
      if (rewardIds.length === 0) {
        setRewards([]);
        return;
      }

      const { data: rewardsData, error: rError } = await supabase
        .from("rewards")
        .select("*")
        .in("id", rewardIds);

      if (rError) {
        console.error("Error loading rewards:", rError);
      } else {
        const rewardsList = rewardsData?.filter(r => r && r.active) || [];
        setRewards(rewardsList);
      }
    } catch (error) {
      console.error("Error in loadRewards:", error);
    }
  };

  const loadClasses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is a developer
      const { data: devRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "developer")
        .single();

      if (devRole) {
        // Developer: get all classes in the same school as the current class
        const { data: currentClass } = await supabase
          .from("classes")
          .select("school_id")
          .eq("id", classId)
          .single();

        if (currentClass?.school_id) {
          const { data: classesData, error: classesError } = await supabase
            .from("classes")
            .select("id, name")
            .eq("school_id", currentClass.school_id);

          if (classesError) {
            console.error("Error loading classes:", classesError);
          } else {
            setClasses(classesData || []);
          }
        }
        return;
      }

      // Teacher: get only classes where user is a teacher member
      const { data: memberData, error: memberError } = await supabase
        .from("class_members")
        .select("class_id")
        .eq("user_id", user.id)
        .eq("is_teacher", true);

      if (memberError || !memberData) {
        console.error("Error loading class_members:", memberError);
        return;
      }

      const classIds = memberData.map(m => m.class_id);
      
      if (classIds.length === 0) {
        setClasses([]);
        return;
      }

      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("id, name")
        .in("id", classIds);

      if (classesError) {
        console.error("Error loading classes:", classesError);
      } else {
        setClasses(classesData || []);
      }
    } catch (error) {
      console.error("Error in loadClasses:", error);
    }
  };

  const handleSaveReward = async () => {
    if (!title || !pointsCost || selectedClasses.length === 0 || !selectedClasses[0]) {
      toast({ title: "Please fill in required fields and select at least one class", variant: "destructive" });
      return;
    }

    // Validate duration for recurring rewards
    if (rewardType === "recurring" && !durationType) {
      toast({ title: "Please select a duration for long term rewards", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Authentication error", description: "Please sign in again", variant: "destructive" });
      return;
    }

    // Check if user has teacher or developer role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["teacher", "developer"]);

    if (roleError || !roleData || roleData.length === 0) {
      toast({ 
        title: "Permission denied", 
        description: "You must have a teacher or developer role", 
        variant: "destructive" 
      });
      return;
    }

    let uploadedImageUrl: string | null = null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("reward-images")
        .upload(filePath, imageFile);

      if (uploadError || !uploadData) {
        console.error("Error uploading reward image:", uploadError);
        toast({
          title: "Error uploading image",
          description: uploadError?.message || "Please try again.",
          variant: "destructive",
        });
        return;
      }

      const publicUrlData = supabase.storage
        .from("reward-images")
        .getPublicUrl(uploadData.path);

      uploadedImageUrl = publicUrlData.publicUrl;
    }

    let durationDays = null;
    if (rewardType === "recurring") {
      if (durationType === "one-week") durationDays = 7;
      else if (durationType === "one-month") durationDays = 30;
      else if (durationType === "custom") durationDays = parseInt(customDays);
      // "forever" durationType means null duration_days
    }

    // Calculate availability dates
    let availableFromDate = null;
    let availableUntilDate = null;
    
    if (scheduleForLater && availableFrom) {
      availableFromDate = new Date(availableFrom).toISOString();
    }
    
    if (availabilityType === "limited") {
      availableUntilDate = availableUntil ? new Date(availableUntil).toISOString() : null;
    }

    const rewardData = {
      class_id: selectedClasses[0],
      title,
      description,
      points_cost: parseInt(pointsCost),
      reward_type: rewardType,
      duration_type: rewardType === "recurring" ? durationType : null,
      duration_days: durationDays,
      category,
      image_url: uploadedImageUrl || (editingReward?.image_url || null),
      created_by: user.id,
      purchase_limit_type: purchaseLimitType,
      purchase_limit_count: purchaseLimitType === "custom" ? parseInt(purchaseLimitCount) : null,
      available_from: availableFromDate,
      available_until: availableUntilDate,
    };

    let reward;
    let rewardError;

    if (editingReward) {
      // Update existing reward
      const { data, error } = await supabase
        .from("rewards")
        .update(rewardData)
        .eq("id", editingReward.id)
        .select()
        .single();
      reward = data;
      rewardError = error;
    } else {
      // Create new reward
      const { data, error } = await supabase
        .from("rewards")
        .insert(rewardData)
        .select()
        .single();
      reward = data;
      rewardError = error;
    }

    if (rewardError || !reward) {
      toast({ 
        title: editingReward ? "Error updating reward" : "Error creating reward", 
        description: rewardError?.message, 
        variant: "destructive" 
      });
      return;
    }

    // Link reward to selected classes (only for new rewards)
    if (!editingReward) {
      const rewardClassEntries = selectedClasses.map(classId => ({
        reward_id: reward.id,
        class_id: classId,
      }));

      const { error: linkError } = await supabase.from("reward_classes").insert(rewardClassEntries);

      if (linkError) {
        toast({ title: "Error linking reward to classes", description: linkError.message, variant: "destructive" });
        // Rollback: delete the reward
        await supabase.from("rewards").delete().eq("id", reward.id);
        return;
      }
    }

    toast({ title: editingReward ? "Reward updated successfully!" : "Reward created successfully!" });
    resetForm();
    setDialogOpen(false);
    loadRewards();
  };

  const handleDeleteReward = async (rewardId: string) => {
    const { error } = await supabase
      .from("rewards")
      .update({ active: false })
      .eq("id", rewardId);

    if (error) {
      toast({ title: "Error deleting reward", variant: "destructive" });
    } else {
      toast({ title: "Reward deleted" });
      loadRewards();
    }
  };

  const resetForm = () => {
    setEditingReward(null);
    setTitle("");
    setDescription("");
    setPointsCost("");
    setRewardType("one-time");
    setDurationType(null);
    setCustomDays("");
    setCategory("tangible");
    setImageFile(null);
    setImagePreview("");
    setPurchaseLimitType("unlimited");
    setPurchaseLimitCount("");
    setAvailabilityType("always");
    setScheduleForLater(false);
    setAvailableFrom("");
    setAvailableUntil("");
    setSelectedClasses([classId]);
  };

  const handleEditReward = (reward: any) => {
    setEditingReward(reward);
    setTitle(reward.title);
    setDescription(reward.description || "");
    setPointsCost(reward.points_cost.toString());
    setRewardType(reward.reward_type);
    setDurationType(reward.duration_type);
    setCustomDays(reward.duration_days?.toString() || "");
    setCategory(reward.category);
    setImagePreview(reward.image_url || "");
    setPurchaseLimitType(reward.purchase_limit_type);
    setPurchaseLimitCount(reward.purchase_limit_count?.toString() || "");
    
    // Set availability fields
    if (reward.available_until) {
      setAvailabilityType("limited");
      setAvailableUntil(reward.available_until.slice(0, 16));
    } else {
      setAvailabilityType("always");
    }
    
    if (reward.available_from) {
      setScheduleForLater(true);
      setAvailableFrom(reward.available_from.slice(0, 16));
    } else {
      setScheduleForLater(false);
    }
    
    setDialogOpen(true);
  };

  const toggleClassSelection = (classIdToToggle: string) => {
    setSelectedClasses(prev => 
      prev.includes(classIdToToggle)
        ? prev.filter(id => id !== classIdToToggle)
        : [...prev, classIdToToggle]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Rewards</h2>
        {canAddRewards && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            // Don't close if the click originated from a guide button
            if (!open && sessionStorage.getItem('guide-button-clicked') === 'true') {
              return;
            }
            setDialogOpen(open);
            if (!open) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button data-guide="add-reward-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Reward
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingReward ? "Edit Reward" : "Create New Reward"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Homework Pass"
                  data-guide="reward-title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Skip one homework assignment"
                  data-guide="reward-description"
                />
              </div>

              <div>
                <Label htmlFor="points">Points Cost *</Label>
                <Input
                  id="points"
                  type="number"
                  value={pointsCost}
                  onChange={(e) => setPointsCost(e.target.value)}
                  placeholder="50"
                  data-guide="reward-points"
                />
              </div>

              <div>
                <Label>Category *</Label>
                <div className="flex gap-2 mt-2 flex-wrap" data-guide="reward-category">
                  <Button
                    type="button"
                    variant={category === "tangible" ? "default" : "outline"}
                    onClick={() => setCategory("tangible")}
                  >
                    Tangible
                  </Button>
                  <Button
                    type="button"
                    variant={category === "symbolic" ? "default" : "outline"}
                    onClick={() => setCategory("symbolic")}
                  >
                    Symbolic
                  </Button>
                  <Button
                    type="button"
                    variant={category === "privilege" ? "default" : "outline"}
                    onClick={() => setCategory("privilege")}
                  >
                    One Time Privilege
                  </Button>
                </div>
              </div>

              <div>
                <Label>Reward Type *</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant={rewardType === "one-time" ? "default" : "outline"}
                    onClick={() => {
                      setRewardType("one-time");
                      setDurationType(null);
                    }}
                  >
                    One Time
                  </Button>
                  <Button
                    type="button"
                    variant={rewardType === "recurring" ? "default" : "outline"}
                    onClick={() => setRewardType("recurring")}
                  >
                    Long Term
                  </Button>
                </div>
              </div>

              {rewardType === "recurring" && (
                <div>
                  <Label>Duration *</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Button
                      type="button"
                      variant={durationType === "one-week" ? "default" : "outline"}
                      onClick={() => setDurationType("one-week")}
                    >
                      1 Week
                    </Button>
                    <Button
                      type="button"
                      variant={durationType === "one-month" ? "default" : "outline"}
                      onClick={() => setDurationType("one-month")}
                    >
                      1 Month
                    </Button>
                    <Button
                      type="button"
                      variant={durationType === "custom" ? "default" : "outline"}
                      onClick={() => setDurationType("custom")}
                    >
                      Custom
                    </Button>
                    <Button
                      type="button"
                      variant={durationType === "forever" ? "default" : "outline"}
                      onClick={() => setDurationType("forever")}
                    >
                      Forever
                    </Button>
                  </div>
                  {durationType === "custom" && (
                    <Input
                      type="number"
                      className="mt-2"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      placeholder="Number of days"
                    />
                  )}
                </div>
              )}

              <div>
                <Label>Purchase Limit *</Label>
                <div className="flex gap-2 mt-2 flex-wrap" data-guide="reward-purchase-limit">
                  <Button
                    type="button"
                    variant={purchaseLimitType === "once" ? "default" : "outline"}
                    onClick={() => {
                      setPurchaseLimitType("once");
                      setPurchaseLimitCount("");
                    }}
                  >
                    Once
                  </Button>
                  <Button
                    type="button"
                    variant={purchaseLimitType === "unlimited" ? "default" : "outline"}
                    onClick={() => {
                      setPurchaseLimitType("unlimited");
                      setPurchaseLimitCount("");
                    }}
                  >
                    Unlimited
                  </Button>
                  <Button
                    type="button"
                    variant={purchaseLimitType === "custom" ? "default" : "outline"}
                    onClick={() => setPurchaseLimitType("custom")}
                  >
                    Custom
                  </Button>
                </div>
                {purchaseLimitType === "custom" && (
                  <Input
                    type="number"
                    className="mt-2"
                    value={purchaseLimitCount}
                    onChange={(e) => setPurchaseLimitCount(e.target.value)}
                    placeholder="Number of times student can purchase"
                    min="1"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="image">Reward Image (optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    } else {
                      setImageFile(null);
                      setImagePreview("");
                    }
                  }}
                  data-guide="reward-image"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Reward preview"
                    className="w-full h-32 object-cover rounded-md mt-3"
                  />
                )}
              </div>

              <div>
                <Label>Availability Period *</Label>
                <div className="flex gap-2 mt-2 flex-wrap" data-guide="reward-availability">
                  <Button
                    type="button"
                    variant={availabilityType === "always" ? "default" : "outline"}
                    onClick={() => {
                      setAvailabilityType("always");
                      setAvailableUntil("");
                    }}
                  >
                    Always Available
                  </Button>
                  <Button
                    type="button"
                    variant={availabilityType === "limited" ? "default" : "outline"}
                    onClick={() => setAvailabilityType("limited")}
                  >
                    Limited Time Period
                  </Button>
                </div>
                {availabilityType === "limited" && (
                  <div className="mt-3">
                    <Label htmlFor="availableUntil">Available Until</Label>
                    <Input
                      id="availableUntil"
                      type="datetime-local"
                      value={availableUntil}
                      onChange={(e) => setAvailableUntil(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="scheduleForLater"
                  checked={scheduleForLater}
                  onCheckedChange={(checked) => {
                    setScheduleForLater(checked as boolean);
                    if (!checked) setAvailableFrom("");
                  }}
                />
                <Label htmlFor="scheduleForLater" className="cursor-pointer">
                  Schedule for later
                </Label>
              </div>

              {scheduleForLater && (
                <div>
                  <Label htmlFor="availableFrom">Available From</Label>
                  <Input
                    id="availableFrom"
                    type="datetime-local"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                  />
                </div>
              )}

              {!editingReward && (
                <div>
                  <Label>Select Classes *</Label>
                  <div className="space-y-2 mt-2 max-h-40 overflow-y-auto border rounded-md p-3">
                    {classes.map((cls) => (
                      <div key={cls.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={cls.id}
                          checked={selectedClasses.includes(cls.id)}
                          onCheckedChange={() => toggleClassSelection(cls.id)}
                        />
                        <label
                          htmlFor={cls.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {cls.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleSaveReward} className="w-full" data-guide="create-reward-submit">
                {editingReward ? "Update Reward" : "Create Reward"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const now = new Date();
          const availableFrom = reward.available_from ? new Date(reward.available_from) : null;
          const availableUntil = reward.available_until ? new Date(reward.available_until) : null;
          
          let availabilityStatus = "";
          let availabilityColor = "";
          if (availableFrom && availableFrom > now) {
            availabilityStatus = `Available from ${availableFrom.toLocaleDateString()}`;
            availabilityColor = "text-yellow-600";
          } else if (availableUntil && availableUntil < now) {
            availabilityStatus = "Expired";
            availabilityColor = "text-red-600";
          } else if (availableFrom && availableUntil) {
            availabilityStatus = `Until ${availableUntil.toLocaleDateString()}`;
            availabilityColor = "text-green-600";
          } else if (availableFrom) {
            availabilityStatus = "Currently Available";
            availabilityColor = "text-green-600";
          }

          return (
            <Card key={reward.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{reward.title}</CardTitle>
                  <div className="flex gap-1">
                    {canAddRewards && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditReward(reward)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    {canAddRewards && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteReward(reward.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {availabilityStatus && (
                  <div className={`flex items-center gap-1 text-xs ${availabilityColor} mt-1`}>
                    <Clock className="w-3 h-3" />
                    <span>{availabilityStatus}</span>
                  </div>
                )}
              </CardHeader>
            <CardContent>
              {reward.image_url && (
                <img
                  src={reward.image_url}
                  alt={reward.title}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              )}
              <p className="text-sm text-muted-foreground mb-2">{reward.description}</p>
              <div className="flex items-center gap-2 text-sm">
                <Gift className="w-4 h-4" />
                <span className="font-semibold">{reward.points_cost} points</span>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {reward.category}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary-foreground">
                  {reward.reward_type === "one-time" 
                    ? "One Time" 
                    : reward.duration_days 
                      ? `${reward.duration_days} days` 
                      : "Forever"}
                </span>
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
            <p className="text-muted-foreground">No rewards created yet. Add your first reward!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RewardsView;
