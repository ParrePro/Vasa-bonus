// Utility functions for teacher selection in rewards and campaigns

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
    
    // Fetch teachers for each class
    for (const classId of classIds) {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/classes/${classId}/teachers`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const classTeachers = await response.json();
        classTeachers.forEach((teacher: any) => {
          if (!teachers.has(teacher.user_id)) {
            teachers.set(teacher.user_id, {
              id: teacher.user_id,
              name: teacher.name,
              email: teacher.email,
            });
          }
        });
      }
    }

    return Array.from(teachers.values()).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching teachers from classes:', error);
    return [];
  }
}
