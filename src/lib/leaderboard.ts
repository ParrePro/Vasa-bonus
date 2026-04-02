import { API_URL } from "./utils";

export interface TeacherLeaderboardEntry {
  teacher_id: string;
  teacher_name: string;
  total_points_given: number;
  total_transactions: number;
}

export async function getSchoolTeacherLeaderboard(
  schoolId: string
): Promise<TeacherLeaderboardEntry[]> {
  try {
    const response = await fetch(
      `${API_URL}/schools/${schoolId}/teacher-leaderboard`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch teacher leaderboard");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching teacher leaderboard:", error);
    throw error;
  }
}

export async function getTopTeachersByPoints(
  schoolId: string,
  limit: number = 5
): Promise<TeacherLeaderboardEntry[]> {
  const leaderboard = await getSchoolTeacherLeaderboard(schoolId);
  return leaderboard.slice(0, limit);
}

export async function getTotalPointsGivenBySchool(
  schoolId: string
): Promise<number> {
  const leaderboard = await getSchoolTeacherLeaderboard(schoolId);
  return leaderboard.reduce(
    (total, entry) => total + entry.total_points_given,
    0
  );
}
