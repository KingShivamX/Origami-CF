import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Training from "@/models/Training";
import { verifyAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const verified = await verifyAuth(token);
  if (!verified) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const newTraining = new Training({
      ...body,
      user: verified.userId,
    });
    await newTraining.save();
    return NextResponse.json(
      { message: "Training saved successfully", training: newTraining },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const verified = await verifyAuth(token);
  if (!verified) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const trainings = await Training.find({ user: verified.userId }).sort({
      startTime: -1,
    });
    return NextResponse.json(trainings);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
