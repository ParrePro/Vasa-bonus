// Utility functions for teacher selection in rewards and campaigns
import { supabase } from "@/integrations/supabase/local-client";

export interface TeacherOption {
  id: string;
  name: string;
  email: string;
}

/**
 * Get unique teachers from selected classes
 * Used when creating rewards/campaigns to select which teachers can fulfill them
 */
export async function getTeachersFromClasses(classIds: string[], accessToken: string): Promise<TeacherOption[]> {
  try {
    const teachers = new Map<string, TeacherOption>();
    
    // Fetch teachers for each class using Supabase
    const { data: classMembers, error } = await supabase
      .from('class_members')
      .select(`
        user_id,
        profiles!user_id(name),
        auth_users!user_id(email)
      `)
      .in('class_id', classIds)
      .eq('is_teacher', true);

    if (error) {
      console.error('Error fetching teachers from classes:', error);
      return [];
    }

    // Build unique teachers map
    if (classMembers) {
      classMembers.forEach((member: any) => {
        if (!teachers.has(member.user_id) && member.profiles && member.auth_users) {
          teachers.set(member.user_id, {
            id: member.user_id,
            name: member.profiles.name || 'Unknown',
            email: member.auth_users.email || '',
          });
        }
      });
    }

    return Array.from(teachers.values()).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching teachers from classes:', error);
    return [];
  }
}
