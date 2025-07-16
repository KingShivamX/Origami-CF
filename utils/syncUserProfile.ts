import getUser from "@/utils/codeforces/getUser";
import getRankFromRating from "@/utils/getRankFromRating";

export interface UserSyncData {
  rating: number;
  rank: string;
  maxRating: number;
  maxRank: string;
  organization?: string;
  lastSyncTime: number;
  avatar: string;
}

export async function syncUserProfile(
  codeforcesHandle: string
): Promise<UserSyncData | null> {
  try {
    const cfUserResponse = await getUser(codeforcesHandle);

    if (!cfUserResponse.success) {
      console.error(
        "Failed to fetch user data from Codeforces:",
        cfUserResponse.error
      );
      return null;
    }

    const cfUser = cfUserResponse.data;

    // Handle rating and rank for current stats
    const currentRating = cfUser.rating ?? 0;
    const currentRank =
      cfUser.rank ??
      (currentRating === 0 ? "Unrated" : getRankFromRating(currentRating));

    // Handle rating and rank for max stats
    const maxRating = cfUser.maxRating ?? 0;
    const maxRank =
      cfUser.maxRank ??
      (maxRating === 0 ? "Unrated" : getRankFromRating(maxRating));

    return {
      rating: currentRating,
      rank: currentRank,
      maxRating: maxRating,
      maxRank: maxRank,
      organization: cfUser.organization,
      lastSyncTime: Date.now(),
      avatar: cfUser.avatar,
    };
  } catch (error) {
    console.error("Error syncing user profile:", error);
    return null;
  }
}

export function shouldSyncProfile(lastSyncTime?: number): boolean {
  if (!lastSyncTime) return true; // Never synced before

  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  return now - lastSyncTime >= twentyFourHours;
}
 