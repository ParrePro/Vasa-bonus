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
    
    console.log('Fetching teachers for class IDs:', classIds);

    // First, get all teacher user_ids from class_members
    const { data: classMembers, error: membersError } = await supabase
      .from('class_members')
      .select('user_id')
      .in('class_id', classIds)
      .eq('is_teacher', true);

    console.log('Class members query result:', { classMembers, membersError });

    if (membersError || !classMembers || classMembers.length === 0) {
      console.error('Error fetching class members:', membersError);
      return [];
    }

    const userIds = [...new Set(classMembers.map(m => m.user_id))];
    console.log('User IDs found:', userIds);

    // Then fetch profile and auth info for those users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', userIds);

    console.log('Profiles query result:', { profiles, profilesError });

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return [];
    }

    const { data: authUsers, error: authError } = await supabase
      .from('auth_users')
      .select('id, email')
      .in('id', userIds);

    console.log('Auth users query result:', { authUsers, authError });

    if (authError) {
      console.error('Error fetching auth users:', authError);
      return [];
    }

    // Build maps for easy lookup
    const profileMap = new Map((profiles || []).map(p => [p.id, p]));
    const authMap = new Map((authUsers || []).map(a => [a.id, a]));

    // Combine data
    userIds.forEach(userId => {
      if (!teachers.has(userId)) {
        const profile = profileMap.get(userId);
        const auth = authMap.get(userId);
        
        if (profile && auth) {
          teachers.set(userId, {
            id: userId,
            name: profile.name || 'Unknown',
            email: auth.email || '',
          });
        }
      }
    });

    console.log('Final teachers:', Array.from(teachers.values()));
    return Array.from(teachers.values()).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching teachers from classes:', error);
    return [];
  }
}
