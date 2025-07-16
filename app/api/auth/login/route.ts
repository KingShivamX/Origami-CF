import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { syncUserProfile, shouldSyncProfile } from "@/utils/syncUserProfile";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { codeforcesHandle, pin } = await req.json();

    if (!codeforcesHandle || !pin) {
      return NextResponse.json(
        { message: "Codeforces handle and PIN are required" },
        { status: 400 }
      );
    }

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { message: "PIN must be a 4-digit number" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ codeforcesHandle });
    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if profile sync is needed and update if necessary
    let updatedUser = user;
    if (shouldSyncProfile(user.lastSyncTime)) {
      const syncData = await syncUserProfile(user.codeforcesHandle);
      if (syncData) {
        updatedUser = await User.findByIdAndUpdate(
          user._id,
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
      }
    }

    const token = jwt.sign(
      { userId: updatedUser._id },
      process.env.JWT_SECRET!,
      {
        expiresIn: "14d",
      }
    );

    return NextResponse.json({
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
      token,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
