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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const { user, error } = await getUserFromToken(request);
  if (error) return error;

  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Training ID is required" },
        { status: 400 }
      );
    }

    // Find and delete the training, ensuring it belongs to the current user
    const deletedTraining = await Training.findOneAndDelete({
      _id: id,
      user: user._id,
    });

    if (!deletedTraining) {
      return NextResponse.json(
        { message: "Training not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Training deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting training:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
