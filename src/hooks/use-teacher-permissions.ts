import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/local-client';

export interface TeacherPermissions {
  is_mentor: boolean;
  is_developer: boolean;
  can_give_points: boolean;
  can_add_rewards: boolean;
  can_add_campaigns: boolean;
  can_fulfill_rewards: boolean;
  can_fulfill_campaigns: boolean;
  can_remove_students: boolean;
  can_manage_permissions: boolean;
}

const defaultPermissions: TeacherPermissions = {
  is_mentor: false,
  is_developer: false,
  can_give_points: false,
  can_add_rewards: false,
  can_add_campaigns: false,
  can_fulfill_rewards: false,
  can_fulfill_campaigns: false,
  can_remove_students: false,
  can_manage_permissions: false,
};

export function useTeacherPermissions(classId: string | undefined) {
  const [permissions, setPermissions] = useState<TeacherPermissions>(defaultPermissions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) {
      setLoading(false);
      return;
    }

    const fetchPermissions = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/classes/${classId}/my-permissions`,
          {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPermissions(data);
        }
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [classId]);

  return { permissions, loading };
}
