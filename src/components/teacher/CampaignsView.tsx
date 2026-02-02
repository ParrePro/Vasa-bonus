import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, Zap, Trophy } from "lucide-react";

interface CampaignsViewProps {
  classId: string;
  canAddCampaigns?: boolean;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  campaign_type: 'multiplier' | 'set_points';
  multiplier_value: number | null;
  points_value: number | null;
  duration_type: string | null;
  duration_days: number | null;
  max_participations: number | null;
  available_from: string | null;
  available_until: string | null;
  active: boolean;
}

const CampaignsView = ({ classId, canAddCampaigns = true }: CampaignsViewProps) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [campaignType, setCampaignType] = useState<'multiplier' | 'set_points'>('multiplier');
  const [multiplierValue, setMultiplierValue] = useState("1.5");
  const [pointsValue, setPointsValue] = useState("100");
  const [durationType, setDurationType] = useState<"2_minutes" | "1_week" | "1_month" | "1_year" | "custom" | "unlimited">("1_week");
  const [customDurationDays, setCustomDurationDays] = useState("30");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([classId]);
  const [allClasses, setAllClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [participationLimit, setParticipationLimit] = useState<"once" | "unlimited" | "custom">("unlimited");
  const [customParticipationLimit, setCustomParticipationLimit] = useState("3");
  const guideButtonClickedRef = useRef(false);

  const { toast } = useToast();

  useEffect(() => {
    loadCampaigns();
    loadAllClasses();
  }, [classId]);

  // Listen for guide button click events
  useEffect(() => {
    const handleGuideButtonClick = () => {
      guideButtonClickedRef.current = true;
    };
    window.addEventListener('guide-button-clicked', handleGuideButtonClick);
    return () => {
      window.removeEventListener('guide-button-clicked', handleGuideButtonClick);
    };
  }, []);

  const loadAllClasses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if user is developer
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'developer')
      .single();

    if (roleData) {
      // Developers can see all classes
      const { data: allClasses, error: classesError } = await supabase
        .from('classes')
        .select('id, name');

      if (classesError) {
        console.error('Error loading classes for developer:', classesError);
      }

      setAllClasses(allClasses || []);
      return;
    }

    // Get classes where user is mentor
    const { data: mentorClasses } = await supabase
      .from('classes')
      .select('id, name')
      .eq('mentor_id', user.id);

    // Get classes where user is a teacher
    const { data: teacherMemberships } = await supabase
      .from('class_members')
      .select('class_id')
      .eq('user_id', user.id)
      .eq('is_teacher', true);

    if (teacherMemberships && teacherMemberships.length > 0) {
      const teacherClassIds = teacherMemberships.map(m => m.class_id);
      const { data: teacherClasses } = await supabase
        .from('classes')
        .select('id, name')
        .in('id', teacherClassIds);

      // Combine and deduplicate
      const allClassesMap = new Map();
      [...(mentorClasses || []), ...(teacherClasses || [])].forEach(cls => {
        allClassesMap.set(cls.id, cls);
      });
      setAllClasses(Array.from(allClassesMap.values()));
    } else {
      setAllClasses(mentorClasses || []);
    }
  };

  const loadCampaigns = async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('class_id', classId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading campaigns:', error);
      return;
    }

    setCampaigns((data || []) as Campaign[]);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCampaignType('multiplier');
    setMultiplierValue("1.5");
    setPointsValue("100");
    setDurationType("1_week");
    setCustomDurationDays("30");
    setSelectedClasses([classId]);
    setImageFile(null);
    setAvailableFrom("");
    setAvailableUntil("");
    setParticipationLimit("unlimited");
    setCustomParticipationLimit("3");
    setEditingCampaign(null);
  };

  const handleSaveCampaign = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a campaign title",
        variant: "destructive",
      });
      return;
    }

    if (selectedClasses.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one class",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let imageUrl = editingCampaign?.image_url || null;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('reward-images')
        .upload(filePath, imageFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
        return;
      }

      const publicUrlData = supabase.storage
        .from('reward-images')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

      const durationDays = durationType === 'custom' ? parseInt(customDurationDays) : 
                          durationType === '2_minutes' ? 0 : // special 2-minute test duration handled in confirmation logic
                          durationType === '1_week' ? 7 :
                          durationType === '1_month' ? 30 :
                          durationType === '1_year' ? 365 : null;

    // Format datetime values to ISO string with timezone
    const formatDateTime = (dateTimeLocal: string) => {
      if (!dateTimeLocal) return null;
      try {
        const date = new Date(dateTimeLocal);
        return date.toISOString();
      } catch {
        return null;
      }
    };

    const campaignData = {
      title,
      description,
      campaign_type: campaignType,
      multiplier_value: campaignType === 'multiplier' ? parseFloat(multiplierValue) : null,
      points_value: campaignType === 'set_points' ? parseInt(pointsValue) : null,
      duration_type: campaignType === 'multiplier' ? durationType : null,
      duration_days: campaignType === 'multiplier' ? durationDays : null,
      max_participations: participationLimit === 'once' ? 1 : 
                          participationLimit === 'custom' ? parseInt(customParticipationLimit) : null,
      image_url: imageUrl,
      available_from: formatDateTime(availableFrom),
      available_until: formatDateTime(availableUntil),
      class_id: classId,
      created_by: user.id,
    };

    let result;

    if (editingCampaign) {
      result = await supabase
        .from('campaigns')
        .update(campaignData)
        .eq('id', editingCampaign.id);

      // Update campaign_classes
      if (!result.error) {
        await supabase.from('campaign_classes').delete().eq('campaign_id', editingCampaign.id);
        const classInserts = selectedClasses.map(cid => ({
          campaign_id: editingCampaign.id,
          class_id: cid
        }));
        await supabase.from('campaign_classes').insert(classInserts);
      }
    } else {
      const { data: insertedData, error: insertError } = await supabase
        .from('campaigns')
        .insert(campaignData)
        .select()
        .single();

      result = { data: insertedData, error: insertError };

      // Insert campaign_classes for new campaign
      if (!insertError && insertedData) {
        const classInserts = selectedClasses.map(cid => ({
          campaign_id: insertedData.id,
          class_id: cid
        }));
        await supabase.from('campaign_classes').insert(classInserts);
      }
    }

    if (result.error) {
      console.error('Error updating campaign:', result.error);
        toast({
          title: "Error",
          description: "Failed to save campaign",
          variant: "destructive",
        });
        return;
      }

    toast({
      title: "Success",
      description: editingCampaign ? "Campaign updated" : "Campaign created",
    });

    setDialogOpen(false);
    resetForm();
    loadCampaigns();
  };

  const handleEditCampaign = async (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setTitle(campaign.title);
    setDescription(campaign.description || "");
    setCampaignType(campaign.campaign_type);
    setMultiplierValue(campaign.multiplier_value?.toString() || "1.5");
    setPointsValue(campaign.points_value?.toString() || "100");
    setDurationType((campaign as any).duration_type || "1_week");
    setCustomDurationDays((campaign as any).duration_days?.toString() || "30");
    
    // Convert ISO timestamps to datetime-local format (YYYY-MM-DDTHH:mm)
    const formatForDateTimeLocal = (isoString: string | null) => {
      if (!isoString) return "";
      try {
        const date = new Date(isoString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      } catch {
        return "";
      }
    };
    
    setAvailableFrom(formatForDateTimeLocal(campaign.available_from));
    setAvailableUntil(formatForDateTimeLocal(campaign.available_until));
    
    // Set participation limit
    if (campaign.max_participations === 1) {
      setParticipationLimit("once");
    } else if (campaign.max_participations === null) {
      setParticipationLimit("unlimited");
    } else {
      setParticipationLimit("custom");
      setCustomParticipationLimit(campaign.max_participations.toString());
    }

    // Load selected classes for this campaign
    const { data } = await supabase
      .from('campaign_classes')
      .select('class_id')
      .eq('campaign_id', campaign.id);
    
    if (data && data.length > 0) {
      setSelectedClasses(data.map(cc => cc.class_id));
    } else {
      setSelectedClasses([classId]);
    }

    setDialogOpen(true);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    const { error } = await supabase
      .from('campaigns')
      .update({ active: false })
      .eq('id', campaignId);

    if (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Campaign deleted",
    });

    loadCampaigns();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Campaigns</h2>
        {canAddCampaigns && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            // Only allow closing, never auto-close on outside clicks
            // Dialog will only close via the X button
            if (open === false) {
              // Ignore all close attempts - only the close button can close this
              return;
            }
            setDialogOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button data-guide="add-campaign-button">
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>{editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}</DialogTitle>
              <button
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M18 6l-12 12M6 6l12 12"></path>
                </svg>
                <span className="sr-only">Close</span>
              </button>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Campaign Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Book Club, Homework Challenge"
                  data-guide="campaign-title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the campaign..."
                  data-guide="campaign-description"
                />
              </div>

              <div>
                <Label htmlFor="campaign-type">Campaign Type</Label>
                <Select value={campaignType} onValueChange={(value: 'multiplier' | 'set_points') => setCampaignType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiplier" data-guide="campaign-type-multiplier">Points Multiplier</SelectItem>
                    <SelectItem value="set_points" data-guide="campaign-type-set">Set Points Reward</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {campaignType === 'multiplier' && (
                <div>
                  <Label htmlFor="multiplier">Multiplier Value</Label>
                  <Input
                    id="multiplier"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={multiplierValue}
                    onChange={(e) => setMultiplierValue(e.target.value)}
                    data-guide="campaign-multiplier-input"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Students will earn {multiplierValue}x points while this campaign is active
                  </p>
                </div>
              )}

              {campaignType === 'set_points' && (
                <div>
                  <Label htmlFor="points">Points Reward</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={pointsValue}
                    onChange={(e) => setPointsValue(e.target.value)}
                    data-guide="campaign-points-input"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Students will receive {pointsValue} points when confirmed
                  </p>
                </div>
              )}

              {campaignType === 'multiplier' && (
                <div>
                  <Label htmlFor="durationType">Multiplier Duration</Label>
                  <Select value={durationType} onValueChange={(value: any) => setDurationType(value)}>
                    <SelectTrigger data-guide="campaign-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2_minutes">2 Minutes (Test)</SelectItem>
                      <SelectItem value="1_week">1 Week</SelectItem>
                      <SelectItem value="1_month">1 Month</SelectItem>
                      <SelectItem value="1_year">1 Year</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {campaignType === 'multiplier' && durationType === 'custom' && (
                <div>
                  <Label htmlFor="customDurationDays">Duration (Days)</Label>
                  <Input
                    id="customDurationDays"
                    type="number"
                    min="1"
                    value={customDurationDays}
                    onChange={(e) => setCustomDurationDays(e.target.value)}
                    placeholder="30"
                    data-guide="campaign-duration"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="image">Campaign Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  data-guide="campaign-image"
                />
              </div>

              <div>
                <Label htmlFor="available-from">Available From (Optional)</Label>
                <Input
                  id="available-from"
                  type="datetime-local"
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                  data-guide="campaign-availability"
                />
              </div>

              <div>
                <Label htmlFor="available-until">Available Until (Optional)</Label>
                <Input
                  id="available-until"
                  type="datetime-local"
                  value={availableUntil}
                  onChange={(e) => setAvailableUntil(e.target.value)}
                  data-guide="campaign-availability"
                />
              </div>

              <div>
                <Label htmlFor="participation-limit">Participation Limit</Label>
                <Select value={participationLimit} onValueChange={(v: "once" | "unlimited" | "custom") => setParticipationLimit(v)}>
                  <SelectTrigger data-guide="campaign-max-participations">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once per student</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {participationLimit === 'custom' && (
                <div>
                  <Label htmlFor="custom-limit">Maximum Participations</Label>
                  <Input
                    id="custom-limit"
                    type="number"
                    min="1"
                    value={customParticipationLimit}
                    onChange={(e) => setCustomParticipationLimit(e.target.value)}
                    placeholder="3"
                    data-guide="campaign-max-participations"
                  />
                </div>
              )}

              <div>
                <Label>Post to Classes</Label>
                <div className="border rounded-md p-4 space-y-2 max-h-48 overflow-y-auto">
                  {allClasses.map((cls) => (
                    <div key={cls.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`class-${cls.id}`}
                        checked={selectedClasses.includes(cls.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClasses([...selectedClasses, cls.id]);
                          } else {
                            setSelectedClasses(selectedClasses.filter(id => id !== cls.id));
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={`class-${cls.id}`} className="text-sm cursor-pointer">
                        {cls.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveCampaign} className="w-full" data-guide="create-campaign-submit">
                {editingCampaign ? 'Update Campaign' : 'Create Campaign'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className={`overflow-hidden ${!campaign.active && 'opacity-50'}`}>
            {campaign.image_url && (
              <div className="h-48 overflow-hidden">
                <img 
                  src={campaign.image_url} 
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{campaign.title}</CardTitle>
                {!campaign.active && (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
              <CardDescription>{campaign.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  {campaign.campaign_type === 'multiplier' && (
                    <Badge className="bg-gradient-to-r from-primary to-primary-glow text-white font-semibold shadow-sm">
                      <Zap className="w-3 h-3 mr-1" />
                      {campaign.multiplier_value}x Points Multiplier
                    </Badge>
                  )}
                  {campaign.campaign_type === 'set_points' && (
                    <Badge className="bg-gradient-to-r from-secondary to-primary text-white font-semibold shadow-sm">
                      <Trophy className="w-3 h-3 mr-1" />
                      {campaign.points_value} Points Reward
                    </Badge>
                  )}
                  {campaign.available_until && (
                    <Badge variant="outline">
                      Until {new Date(campaign.available_until).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {canAddCampaigns && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditCampaign(campaign)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {canAddCampaigns && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {campaigns.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No campaigns yet. Create your first campaign to get started!
        </p>
      )}
    </div>
  );
};

export default CampaignsView;