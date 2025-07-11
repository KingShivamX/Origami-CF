import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import UpsolvedProblem from "@/models/UpsolvedProblem";
import { verifyAuth } from "@/lib/auth";
import { TrainingProblem } from "@/types/TrainingProblem";

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

export async function GET(request: NextRequest) {
  await dbConnect();

  const { user, error } = await getUserFromToken(request);
  if (error) return error;

  try {
    const upsolvedProblems = await UpsolvedProblem.find({ user: user._id });
    return NextResponse.json(upsolvedProblems);
  } catch (err) {
    console.error("Error fetching upsolved problems:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();

  const { user, error } = await getUserFromToken(request);
  if (error) return error;

  try {
    const problems: TrainingProblem[] = await request.json();
    const problemsToInsert = problems.map((p) => ({ ...p, user: user._id }));

    // Use insertMany with ordered: false to continue on duplicate key errors
    await UpsolvedProblem.insertMany(problemsToInsert, { ordered: false });

    return NextResponse.json(
      { message: "Upsolved problems added" },
      { status: 201 }
    );
  } catch (err: any) {
    // Ignore duplicate key errors, which are expected
    if (err.code === 11000) {
      return NextResponse.json(
        { message: "Upsolved problems added (some may have been duplicates)" },
        { status: 201 }
      );
    }
    console.error("Error creating upsolved problems:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  await dbConnect();

  const { user, error } = await getUserFromToken(request);
  if (error) return error;

  try {
    const problemsToUpdate: TrainingProblem[] = await request.json();
    if (!Array.isArray(problemsToUpdate) || problemsToUpdate.length === 0) {
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 }
      );
    }

    const bulkOps = problemsToUpdate.map((problem) => ({
      updateOne: {
        filter: {
          user: user._id,
          contestId: problem.contestId,
          index: problem.index,
        },
        update: { $set: { solvedTime: problem.solvedTime } },
      },
    }));

    await UpsolvedProblem.bulkWrite(bulkOps);

    return NextResponse.json(
      { message: "Upsolved problems updated" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating upsolved problems:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  await dbConnect();

  const { user, error } = await getUserFromToken(request);
  if (error) return error;

  try {
    const { contestId, index } = await request.json();

    if (!contestId || !index) {
      return NextResponse.json(
        { message: "Missing contestId or index" },
        { status: 400 }
      );
    }

    await UpsolvedProblem.deleteOne({ user: user._id, contestId, index });

    return NextResponse.json(
      { message: "Problem deleted from upsolve list" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting upsolved problem:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
