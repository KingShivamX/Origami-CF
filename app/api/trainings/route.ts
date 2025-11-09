import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Training from "@/models/Training";
import User from "@/models/User";
import { verifyAuth } from "@/lib/auth";
import { calculateRatingChange, getRatingTier } from "@/utils/ratingSystem";

async function getUserFromToken(request: NextRequest) {
  await dbConnect(); // Ensure DB connection before any query
  const token = request.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
    };
  }

  const decoded = await verifyAuth(token);
  if (!decoded) {
    return {
      error: NextResponse.json({ message: "Invalid token" }, { status: 401 }),
    };
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    return {
      error: NextResponse.json({ message: "User not found" }, { status: 404 }),
    };
  }
  return { user };
}

export async function POST(req: NextRequest) {
  const { error, user } = await getUserFromToken(req);
  if (error) {
    return error;
  }

  try {
    const body = await req.json();
    
    // Save training first
    const newTraining = new Training({
      ...body,
      user: user?._id,
    });
    await newTraining.save();

    // Calculate rating change using the new system
    const currentRating = user?.rating || 1500;
    const ratingChange = calculateRatingChange(body, currentRating);
    
    // Update user's rating and rank
    const newRatingTier = getRatingTier(ratingChange.newRating);
    const maxRating = Math.max(user?.maxRating || 1500, ratingChange.newRating);
    const maxRatingTier = getRatingTier(maxRating);
    
    await User.findByIdAndUpdate(user?._id, {
      rating: ratingChange.newRating,
      rank: newRatingTier.tier,
      maxRating: maxRating,
      maxRank: maxRatingTier.tier,
    });

    return NextResponse.json(
      { 
        message: "Training saved successfully", 
        training: newTraining,
        ratingChange: {
          oldRating: ratingChange.oldRating,
          newRating: ratingChange.newRating,
          ratingDelta: ratingChange.ratingDelta,
          newRank: newRatingTier.tier,
          isNewMaxRating: ratingChange.newRating === maxRating,
          performance: ratingChange.performance,
          solvedCount: ratingChange.solvedCount,
          totalProblems: ratingChange.totalProblems,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving training:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { error, user } = await getUserFromToken(req);
  if (error) {
    return error;
  }

  try {
    const trainings = await Training.find({ user: user?._id }).sort({
      startTime: -1,
    });
    return NextResponse.json(trainings);
  } catch (error) {
    console.error("Error fetching trainings:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
