import getUser from "@/utils/codeforces/getUser";
import getRankFromRating from "@/utils/getRankFromRating";

export interface UserSyncData {
  rating: number;
  rank: string;
  maxRating: number;
  maxRank: string;
  organization?: string;
  lastSyncTime: number;
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

    return {
      rating: cfUser.rating ?? 0,
      rank: cfUser.rank ?? getRankFromRating(cfUser.rating ?? 0),
      maxRating: cfUser.maxRating ?? 0,
      maxRank:
        cfUser.maxRank ??
        (cfUser.maxRating ? getRankFromRating(cfUser.maxRating) : "Unrated"),
      organization: cfUser.organization,
      lastSyncTime: Date.now(),
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
