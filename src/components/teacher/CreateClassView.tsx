import { useState } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { API_URL } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

const CreateClassView = () => {
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdClass, setCreatedClass] = useState<any>(null);
  const { toast } = useToast();

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error("Not authenticated");

      // Generate class code
      const codeResponse = await fetch(`${API_URL}/classes/generate-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const codeData = await codeResponse.json();
      if (!codeResponse.ok) {
        throw new Error(codeData.error || 'Failed to generate class code');
      }

      // Create the class
      const createResponse = await fetch(`${API_URL}/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: className,
          code: codeData.code,
        }),
      });

      const classData = await createResponse.json();
      if (!createResponse.ok) {
        throw new Error(classData.error || 'Failed to create class');
      }

      setCreatedClass(classData);
      setClassName("");
      toast({
        title: "Class created!",
        description: `Your class "${classData.name}" has been created.`,
      });
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

  const copyCode = () => {
    if (createdClass) {
      navigator.clipboard.writeText(createdClass.code);
      toast({
        title: "Copied!",
        description: "Class code copied to clipboard.",
      });
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Class</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createClass} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="className">Class Name</Label>
              <Input
                id="className"
                type="text"
                placeholder="e.g., Math 101"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Class"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {createdClass && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="text-primary">Class Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Class Name</p>
              <p className="font-semibold">{createdClass.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Class Code</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-primary">{createdClass.code}</p>
                <Button variant="outline" size="icon" onClick={copyCode}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Share this code with students and teachers to join your class.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreateClassView;
