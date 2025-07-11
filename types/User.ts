export interface User {
  _id: string;
  codeforcesHandle: string;
  rating: number;
  avatar: string;
  rank: string;
  maxRating: number;
  maxRank: string;
  organization?: string;
  lastSyncTime?: number;
}
