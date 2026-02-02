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
    console.log('Fetching teachers for class IDs:', classIds);

    // Call the backend endpoint to get teachers
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/classes/get-teachers`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ classIds }),
      }
    );

    console.log('Teachers API response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('Error fetching teachers:', error);
      return [];
    }

    const teachers: TeacherOption[] = await response.json();
    console.log('Teachers received:', teachers);

    return teachers.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching teachers from classes:', error);
    return [];
  }
}
