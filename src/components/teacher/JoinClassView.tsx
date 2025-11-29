import { useState } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const JoinClassView = () => {
  const [classCode, setClassCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const joinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("id, name")
        .eq("code", classCode.toUpperCase())
        .single();

      if (classError || !classData) throw new Error("Invalid class code");

      const { error } = await supabase
        .from("class_members")
        .insert({
          class_id: classData.id,
          user_id: session.user.id,
          is_teacher: true,
        });

      if (error) throw error;

      toast({
        title: "Class joined!",
        description: `You've joined "${classData.name}" as a teacher.`,
      });

      setClassCode("");
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

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Join an Existing Class</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={joinClass} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="joinCode">Class Code</Label>
              <Input
                id="joinCode"
                type="text"
                placeholder="Enter 6-digit code"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value)}
                maxLength={6}
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter the class code provided by the mentor to join as a co-teacher.
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Joining..." : "Join Class"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinClassView;
