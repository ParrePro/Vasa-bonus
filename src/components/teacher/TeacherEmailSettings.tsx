import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { API_URL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ClassEmailSetting {
  classId: string;
  className: string;
  receiveNotifications: boolean;
}

interface TeacherEmailSettingsProps {
  classes: { id: string; name: string; code: string }[];
}

const TeacherEmailSettings = ({ classes }: TeacherEmailSettingsProps) => {
  const [emailSettings, setEmailSettings] = useState<ClassEmailSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEmailSettings();
  }, [classes]);

  const loadEmailSettings = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_URL}/teacher/email-settings`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEmailSettings(data);
      } else {
        // If endpoint doesn't exist yet, create default settings from classes
        const settings = classes.map((cls) => ({
          classId: cls.id,
          className: cls.name,
          receiveNotifications: true,
        }));
        setEmailSettings(settings);
      }
    } catch (error) {
      console.error('Error loading email settings:', error);
      // Fallback: create default settings from classes
      const settings = classes.map((cls) => ({
        classId: cls.id,
        className: cls.name,
        receiveNotifications: true,
      }));
      setEmailSettings(settings);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (classId: string) => {
    setEmailSettings((prev) =>
      prev.map((setting) =>
        setting.classId === classId
          ? { ...setting, receiveNotifications: !setting.receiveNotifications }
          : setting
      )
    );
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${API_URL}/teacher/email-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ settings: emailSettings }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save email settings');
      }

      toast({
        title: "Success",
        description: "Email notification preferences saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader className="w-5 h-5 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Choose which classes you want to receive email notifications for
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {emailSettings.length === 0 ? (
          <p className="text-sm text-muted-foreground">You don't have any classes yet.</p>
        ) : (
          <>
            <div className="space-y-3">
              {emailSettings.map((setting) => (
                <div
                  key={setting.classId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <Label className="text-base font-medium cursor-pointer">
                      {setting.className}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {setting.receiveNotifications
                        ? "You will receive email notifications for this class"
                        : "Email notifications disabled for this class"}
                    </p>
                  </div>
                  <Switch
                    checked={setting.receiveNotifications}
                    onCheckedChange={() => handleToggle(setting.classId)}
                    disabled={saving}
                  />
                </div>
              ))}
            </div>
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full mt-4"
            >
              {saving ? "Saving..." : "Save Preferences"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherEmailSettings;
