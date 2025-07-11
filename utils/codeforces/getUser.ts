import { User } from "@/types/User";
import { SuccessResponse, ErrorResponse, Response } from "@/types/Response";

const getUser = async (handle: string): Promise<Response<User>> => {
  try {
    const res = await fetch(
      `https://codeforces.com/api/user.info?handles=${handle}`
    );
    const data = await res.json();
    if (data.status !== "OK") {
      return ErrorResponse("User not found");
    }
    const user = data.result[0];
    return SuccessResponse({
      codeforcesHandle: user.handle,
      rating: user.rating,
      rank: user.rank,
      avatar: user.avatar,
      maxRating: user.maxRating,
      maxRank: user.maxRank,
      organization: user.organization,
    } as User);
  } catch (error) {
    return ErrorResponse((error as Error).message);
  }
};

export default getUser;
