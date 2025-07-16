import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { verifyAuth } from "@/lib/auth";
import { syncUserProfile, shouldSyncProfile } from "@/utils/syncUserProfile";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyAuth(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check if sync is needed (24 hours have passed or never synced)
    if (!shouldSyncProfile(user.lastSyncTime)) {
      return NextResponse.json({
        message: "Profile is up to date",
        user: {
          _id: user._id,
          codeforcesHandle: user.codeforcesHandle,
          rating: user.rating,
          avatar: user.avatar,
          rank: user.rank,
          maxRating: user.maxRating,
          maxRank: user.maxRank,
          organization: user.organization,
          lastSyncTime: user.lastSyncTime,
        },
      });
    }

    // Sync profile data from Codeforces
    const syncData = await syncUserProfile(user.codeforcesHandle);
    if (!syncData) {
      return NextResponse.json(
        { message: "Failed to sync profile data" },
        { status: 500 }
      );
    }

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        rating: syncData.rating,
        rank: syncData.rank,
        maxRating: syncData.maxRating,
        maxRank: syncData.maxRank,
        organization: syncData.organization,
        lastSyncTime: syncData.lastSyncTime,
        avatar: syncData.avatar,
      },
      { new: true }
    );

    return NextResponse.json({
      message: "Profile synced successfully",
      user: {
        _id: updatedUser._id,
        codeforcesHandle: updatedUser.codeforcesHandle,
        rating: updatedUser.rating,
        avatar: updatedUser.avatar,
        rank: updatedUser.rank,
        maxRating: updatedUser.maxRating,
        maxRank: updatedUser.maxRank,
        organization: updatedUser.organization,
        lastSyncTime: updatedUser.lastSyncTime,
      },
    });
  } catch (error) {
    console.error("Profile sync error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
