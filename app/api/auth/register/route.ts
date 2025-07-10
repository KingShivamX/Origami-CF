import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import getUser from "@/utils/codeforces/getUser";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { codeforcesHandle, password } = await req.json();

    if (!codeforcesHandle || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ codeforcesHandle });
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this handle already exists" },
        { status: 409 }
      );
    }

    // Check if the Codeforces user exists
    const cfUserResponse = await getUser(codeforcesHandle);
    if (!cfUserResponse.success) {
      return NextResponse.json(
        { message: "Codeforces user not found" },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const profile = cfUserResponse.data;

    const newUser = new User({
      codeforcesHandle,
      password: hashedPassword,
      rating: profile.rating,
      avatar: profile.avatar,
      rank: profile.rank,
      maxRank: profile.maxRank,
      maxRating: profile.maxRating,
      organization: profile.organization,
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
