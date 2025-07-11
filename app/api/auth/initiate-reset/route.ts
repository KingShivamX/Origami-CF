import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { handle } = await req.json();

    if (!handle) {
      return NextResponse.json(
        { message: "Codeforces handle is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ codeforcesHandle: handle });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Create a short-lived token for the verification process
    const verificationToken = jwt.sign(
      { userId: user._id, handle: user.codeforcesHandle },
      process.env.JWT_SECRET!,
      { expiresIn: "5m" } // Token is valid for 5 minutes
    );

    return NextResponse.json({ verificationToken });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
