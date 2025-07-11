import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";

interface DecodedToken {
  userId: string;
  handle: string;
  iat: number;
  exp: number;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { verificationToken } = await req.json();

    if (!verificationToken) {
      return NextResponse.json(
        { message: "Verification token is required" },
        { status: 400 }
      );
    }

    const decoded = jwt.verify(
      verificationToken,
      process.env.JWT_SECRET!
    ) as DecodedToken;
    const { handle, iat } = decoded;

    // Fetch submissions directly from Codeforces API
    const submissionsUrl = `https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10`;
    const submissionsRes = await fetch(submissionsUrl);
    const submissionsData = await submissionsRes.json();

    if (submissionsData.status !== "OK") {
      return NextResponse.json(
        { message: "Could not fetch submissions from Codeforces." },
        { status: 500 }
      );
    }

    const submissions = submissionsData.result;

    const recentCompilationError = submissions.find(
      (sub: any) =>
        sub.problem.contestId === 4 &&
        sub.problem.index === "A" &&
        sub.verdict === "COMPILATION_ERROR" &&
        sub.creationTimeSeconds >= iat - 30
    );

    if (recentCompilationError) {
      // Create a new, longer-lived token that authorizes the actual PIN reset
      const resetToken = jwt.sign(
        { userId: decoded.userId },
        process.env.JWT_SECRET!,
        { expiresIn: "10m" } // This token is valid for 10 minutes
      );
      return NextResponse.json({ success: true, resetToken });
    } else {
      return NextResponse.json(
        {
          success: false,
          message:
            "Verification failed. No recent compilation error found for problem 4A.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: "Invalid or expired token." },
        { status: 401 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
