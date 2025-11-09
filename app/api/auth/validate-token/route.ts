import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Check if user still exists in database
    await dbConnect();
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    // Token is invalid or expired
    return NextResponse.json(
      { message: "Invalid token" },
      { status: 401 }
    );
  }
}
