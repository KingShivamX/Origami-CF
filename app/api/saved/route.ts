import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import CustomProblem from "@/models/CustomProblem";
import { TrainingProblem } from "@/types/TrainingProblem";

async function getUserFromToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    await dbConnect();
    const user = await User.findById(decoded.userId);
    return user;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const customProblems = await CustomProblem.find({ userId: user._id }).sort({
      createdAt: 1,
    });

    return NextResponse.json(customProblems);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const problemData: TrainingProblem = await request.json();

    await dbConnect();

    // Check if problem already exists for this user
    const existingProblem = await CustomProblem.findOne({
      userId: user._id,
      contestId: problemData.contestId,
      index: problemData.index,
    });

    if (existingProblem) {
      return NextResponse.json(
        { message: "Problem already exists" },
        { status: 409 }
      );
    }

    const customProblem = new CustomProblem({
      userId: user._id,
      contestId: problemData.contestId,
      index: problemData.index,
      name: problemData.name,
      rating: problemData.rating,
      tags: problemData.tags,
      url: problemData.url,
      solvedTime: problemData.solvedTime,
    });

    await customProblem.save();

    return NextResponse.json(
      { message: "Problem added successfully" },
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

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const solvedProblems: TrainingProblem[] = await request.json();

    await dbConnect();

    // Update solved times for the specified problems
    for (const problem of solvedProblems) {
      await CustomProblem.findOneAndUpdate(
        {
          userId: user._id,
          contestId: problem.contestId,
          index: problem.index,
        },
        { solvedTime: problem.solvedTime },
        { new: true }
      );
    }

    return NextResponse.json({ message: "Problems updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { contestId, index } = await request.json();

    await dbConnect();

    const deletedProblem = await CustomProblem.findOneAndDelete({
      userId: user._id,
      contestId,
      index,
    });

    if (!deletedProblem) {
      return NextResponse.json(
        { message: "Problem not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Problem deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
