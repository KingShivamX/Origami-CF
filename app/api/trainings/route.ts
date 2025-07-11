import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Training from "@/models/Training";
import User from "@/models/User";
import { verifyAuth } from "@/lib/auth";

async function getUserFromToken(request: NextRequest) {
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
    await dbConnect();
    const body = await req.json();
    const newTraining = new Training({
      ...body,
      user: user?._id,
    });
    await newTraining.save();
    return NextResponse.json(
      { message: "Training saved successfully", training: newTraining },
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
    await dbConnect();
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
