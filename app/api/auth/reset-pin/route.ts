import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { verifyAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();

    // This part handles the "Forgot PIN" flow
    if (body.resetToken) {
      if (!body.newPin || !/^\d{4}$/.test(body.newPin)) {
        return NextResponse.json(
          { message: "New PIN must be a 4-digit number." },
          { status: 400 }
        );
      }

      const decoded = jwt.verify(body.resetToken, process.env.JWT_SECRET!) as {
        userId: string;
      };
      const user = await User.findById(decoded.userId);

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      const hashedNewPin = await bcrypt.hash(body.newPin, 10);
      await User.findByIdAndUpdate(decoded.userId, { pin: hashedNewPin });

      return NextResponse.json({ message: "PIN has been reset successfully." });
    }

    // This part handles the simple reset for logged-in users
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyAuth(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (
      !body.oldPin ||
      !body.newPin ||
      !/^\d{4}$/.test(body.oldPin) ||
      !/^\d{4}$/.test(body.newPin)
    ) {
      return NextResponse.json(
        { message: "Both current and new PINs must be 4-digit numbers." },
        { status: 400 }
      );
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(body.oldPin, user.pin);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Incorrect current PIN." },
        { status: 401 }
      );
    }

    const hashedNewPin = await bcrypt.hash(body.newPin, 10);
    await User.findByIdAndUpdate(decoded.userId, { pin: hashedNewPin });

    return NextResponse.json({ message: "PIN reset successfully." });
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
