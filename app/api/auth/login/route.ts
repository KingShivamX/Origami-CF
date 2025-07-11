import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

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

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    return NextResponse.json({
      token,
      user: {
        _id: user._id,
        codeforcesHandle: user.codeforcesHandle,
        rating: user.rating,
        avatar: user.avatar,
        rank: user.rank,
        maxRating: user.maxRating,
        maxRank: user.maxRank,
        organization: user.organization,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
