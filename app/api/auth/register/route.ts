import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import getUser from "@/utils/codeforces/getUser";
import getRankFromRating from "@/utils/getRankFromRating";

export async function POST(req: NextRequest) {
  if (!process.env.JWT_SECRET) {
    console.error("FATAL: JWT_SECRET environment variable is not set.");
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    await dbConnect();
    const { codeforcesHandle, pin } = await req.json();

    if (!codeforcesHandle || !pin) {
      return NextResponse.json(
        { message: "Codeforces handle and PIN are required" },
        { status: 400 }
      );
    }

    // Normalize username: trim spaces and convert to lowercase
    const normalizedHandle = codeforcesHandle.trim().toLowerCase();

    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { message: "PIN must be a 4-digit number" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ codeforcesHandle: normalizedHandle });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const cfUserResponse = await getUser(normalizedHandle);
    if (!cfUserResponse.success) {
      return NextResponse.json(
        { message: "Invalid Codeforces handle" },
        { status: 400 }
      );
    }

    const cfUser = cfUserResponse.data;
    const rating = cfUser.rating ?? 0;
    const rank = cfUser.rank ?? getRankFromRating(rating);
    const hashedPassword = await bcrypt.hash(pin, 10);

    const newUser = new User({
      codeforcesHandle: normalizedHandle,
      pin: hashedPassword,
      rating: rating,
      avatar: cfUser.avatar,
      rank: rank,
      maxRating: cfUser.maxRating ?? 0,
      maxRank:
        cfUser.maxRank ??
        (cfUser.maxRating ? getRankFromRating(cfUser.maxRating) : "Unrated"),
      organization: cfUser.organization,
      lastSyncTime: Date.now(),
    });

    await newUser.save();
    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
