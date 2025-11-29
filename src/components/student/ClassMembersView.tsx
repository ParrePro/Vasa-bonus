import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/local-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StyledAvatar from "@/components/StyledAvatar";

interface ClassMembersViewProps {
  classId: string;
  showOnlyTeachers?: boolean;
}

interface AvatarCustomization {
  avatar_skin?: string;
  avatar_hair?: string;
  avatar_hair_color?: string;
  avatar_eyes?: string;
  avatar_accessory?: string;
  avatar_background?: string;
  avatar_border?: string;
  avatar_effect?: string;
}

interface Member {
  id: string;
  name: string;
  isTeacher: boolean;
  isMentor: boolean;
  customization?: AvatarCustomization;
}

const ClassMembersView = ({ classId, showOnlyTeachers = false }: ClassMembersViewProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    loadCurrentUser();
    loadMembers();
  }, [classId]);

  const loadCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUserId(session.user.id);
    }
  };

  const loadMembers = async () => {
    setLoading(true);
    try {
      // Get class info to find the mentor
      const { data: classData } = await supabase
        .from("classes")
        .select("mentor_id")
        .eq("id", classId)
        .single();

      const mentorId = classData?.mentor_id;

      // Get all class members
      const { data: memberData, error: memberError } = await supabase
        .from("class_members")
        .select("user_id, is_teacher")
        .eq("class_id", classId);

      if (memberError) {
        console.error("Error loading members:", memberError);
        return;
      }

      if (memberData && memberData.length > 0) {
        // Get profile data for all members including avatar customization
        const userIds = memberData.map((m) => m.user_id);
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, avatar_skin, avatar_hair, avatar_hair_color, avatar_eyes, avatar_accessory, avatar_background, avatar_border, avatar_effect")
          .in("id", userIds);

        if (profileError) {
          console.error("Error loading profiles:", profileError);
          return;
        }

        // Combine the data
        const membersList = memberData.map((m) => {
          const profile = profileData?.find((p) => p.id === m.user_id);
          return {
            id: m.user_id,
            name: profile?.name || "Unknown",
            isTeacher: m.is_teacher,
            isMentor: m.user_id === mentorId,
            customization: profile ? {
              avatar_skin: profile.avatar_skin,
              avatar_hair: profile.avatar_hair,
              avatar_hair_color: profile.avatar_hair_color,
              avatar_eyes: profile.avatar_eyes,
              avatar_accessory: profile.avatar_accessory,
              avatar_background: profile.avatar_background,
              avatar_border: profile.avatar_border,
              avatar_effect: profile.avatar_effect,
            } : undefined,
          };
        });

        setMembers(membersList);
      }
    } finally {
      setLoading(false);
    }
  };

  const teachers = members.filter((m) => m.isTeacher);
  const students = members.filter((m) => !m.isTeacher);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Teacher avatar - just initials with nice gradient
  const TeacherAvatar = ({ name, isMentor }: { name: string; isMentor: boolean }) => (
    <div 
      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
        isMentor 
          ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
          : 'bg-gradient-to-br from-primary to-purple-600'
      }`}
    >
      {getInitials(name)}
    </div>
  );

  if (showOnlyTeachers) {
    return (
      <div className="space-y-2">
        {loading ? (
          <p className="text-muted-foreground">Loading members...</p>
        ) : teachers.length === 0 ? (
          <p className="text-muted-foreground">No teachers in this class yet.</p>
        ) : (
          teachers.map((member) => (
            <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
              <TeacherAvatar name={member.name} isMentor={member.isMentor} />
              <div className="flex-1">
                <p className="font-medium">
                  {member.name} {member.id === currentUserId && "(You)"}
                </p>
                <p className="text-sm text-muted-foreground capitalize">
                  {member.isMentor ? "Mentor" : "Teacher"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Teachers & Mentors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-muted-foreground">Loading members...</p>
          ) : teachers.length === 0 ? (
            <p className="text-muted-foreground">No teachers in this class yet.</p>
          ) : (
            teachers.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <TeacherAvatar name={member.name} isMentor={member.isMentor} />
                <div className="flex-1">
                  <p className="font-medium">
                    {member.name} {member.id === currentUserId && "(You)"}
                  </p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {member.isMentor ? "Mentor" : "Teacher"}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-muted-foreground">Loading members...</p>
          ) : students.length === 0 ? (
            <p className="text-muted-foreground">No students in this class yet.</p>
          ) : (
            students.map((member) => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <StyledAvatar 
                  name={member.name} 
                  customization={member.customization}
                  size={40}
                />
                <div className="flex-1">
                  <p className="font-medium">
                    {member.name} {member.id === currentUserId && "(You)"}
                  </p>
                  <p className="text-sm text-muted-foreground">Student</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassMembersView;
