import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, Save, X } from "lucide-react";

interface PointReason {
  id: string;
  reason: string;
  points: number;
  created_at: string;
}

const DefaultPointReasons = () => {
  const [reasons, setReasons] = useState<PointReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [newReason, setNewReason] = useState("");
  const [newPoints, setNewPoints] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editReason, setEditReason] = useState("");
  const [editPoints, setEditPoints] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReasons();
  }, []);

  const loadReasons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("default_point_reasons")
        .select("*")
        .order("points", { ascending: false });

      if (error) throw error;
      setReasons(data || []);
    } catch (error: any) {
      console.error("Error loading reasons:", error);
      toast({
        title: "Error",
        description: "Failed to load point reasons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddReason = async () => {
    if (!newReason.trim() || !newPoints) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await (supabase
        .from("default_point_reasons")
        .insert({
          reason: newReason.trim(),
          points: parseInt(newPoints),
        })
        .select()
        .single() as Promise<{ data: PointReason | null; error: any }>);

      if (error) throw error;
      if (!data) throw new Error("No data returned");

      setReasons([...reasons, data]);
      setNewReason("");
      setNewPoints("");
      toast({
        title: "Success",
        description: "Point reason added successfully",
      });
    } catch (error: any) {
      console.error("Error adding reason:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add point reason",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReason = async (id: string) => {
    try {
      const { error } = await supabase
        .from("default_point_reasons")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setReasons(reasons.filter((r) => r.id !== id));
      toast({
        title: "Success",
        description: "Point reason deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting reason:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete point reason",
        variant: "destructive",
      });
    }
  };

  const handleEditReason = async (id: string) => {
    if (!editReason.trim() || !editPoints) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await (supabase
        .from("default_point_reasons")
        .update({
          reason: editReason.trim(),
          points: parseInt(editPoints),
        })
        .eq("id", id)
        .select()
        .single() as Promise<{ data: PointReason | null; error: any }>);

      if (error) throw error;
      if (!data) throw new Error("No data returned");

      setReasons(reasons.map((r) => (r.id === id ? data : r)));
      setEditingId(null);
      toast({
        title: "Success",
        description: "Point reason updated successfully",
      });
    } catch (error: any) {
      console.error("Error updating reason:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update point reason",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (reason: PointReason) => {
    setEditingId(reason.id);
    setEditReason(reason.reason);
    setEditPoints(reason.points.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditReason("");
    setEditPoints("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Default Point Giving Options</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            These are the point options that all teachers can use across all schools
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add new reason form */}
          <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
            <h3 className="font-semibold">Add New Point Option</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  placeholder="e.g., Helping a classmate"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  placeholder="e.g., 5"
                  value={newPoints}
                  onChange={(e) => setNewPoints(e.target.value)}
                  min="1"
                />
              </div>
            </div>
            <Button
              onClick={handleAddReason}
              disabled={saving}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Option
            </Button>
          </div>

          {/* List of existing reasons */}
          <div className="space-y-3">
            <h3 className="font-semibold">Current Options</h3>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : reasons.length === 0 ? (
              <p className="text-muted-foreground">No point options yet</p>
            ) : (
              <div className="space-y-2">
                {reasons.map((reason) => (
                  <div
                    key={reason.id}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    {editingId === reason.id ? (
                      <>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Reason"
                            value={editReason}
                            onChange={(e) => setEditReason(e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Points"
                            value={editPoints}
                            onChange={(e) => setEditPoints(e.target.value)}
                            min="1"
                          />
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleEditReason(reason.id)}
                          disabled={saving}
                        >
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <p className="font-medium">{reason.reason}</p>
                          <p className="text-sm text-muted-foreground">
                            {reason.points} points
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(reason)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteReason(reason.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">How this works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            • Changes made here apply to all teachers across all schools
          </p>
          <p>
            • Teachers will see these options as buttons in their class view
          </p>
          <p>
            • Teachers can still give custom points with any reason they want
          </p>
          <p>
            • Editing a reason updates the text, but doesn't change past transactions
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DefaultPointReasons;
