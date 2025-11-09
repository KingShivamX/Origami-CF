import { NextRequest, NextResponse } from "next/server";
import { migrateAllRatings, previewRatingMigration, recalculateUserRating } from "@/utils/ratingMigration";

/**
 * Admin API for rating migration
 * 
 * POST /api/admin/migrate-ratings - Run full migration
 * GET /api/admin/migrate-ratings - Preview migration
 * PUT /api/admin/migrate-ratings - Recalculate specific user
 */

// Security check - in production, you'd want proper admin authentication
const isAdminRequest = (req: NextRequest): boolean => {
  // For development, allow all requests
  // In production, add proper authentication here
  const adminKey = req.headers.get("x-admin-key");
  return adminKey === process.env.ADMIN_KEY || process.env.NODE_ENV === "development";
};

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🔍 Generating migration preview...");
    const preview = await previewRatingMigration();
    
    return NextResponse.json({
      message: "Migration preview generated successfully",
      preview,
    });
  } catch (error) {
    console.error("Preview error:", error);
    return NextResponse.json(
      { message: "Failed to generate preview", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { confirm } = body;

    if (!confirm) {
      return NextResponse.json(
        { message: "Migration requires confirmation. Send { 'confirm': true } in request body." },
        { status: 400 }
      );
    }

    console.log("🚀 Starting full rating migration...");
    const result = await migrateAllRatings();
    
    return NextResponse.json({
      message: "Rating migration completed successfully",
      result,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { message: "Migration failed", error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { codeforcesHandle } = await req.json();

    if (!codeforcesHandle) {
      return NextResponse.json(
        { message: "codeforcesHandle is required" },
        { status: 400 }
      );
    }

    console.log(`🔄 Recalculating rating for user: ${codeforcesHandle}`);
    const result = await recalculateUserRating(codeforcesHandle);
    
    return NextResponse.json({
      message: `Rating recalculated successfully for ${codeforcesHandle}`,
      result,
    });
  } catch (error) {
    console.error("User recalculation error:", error);
    return NextResponse.json(
      { message: "Failed to recalculate user rating", error: String(error) },
      { status: 500 }
    );
  }
}
