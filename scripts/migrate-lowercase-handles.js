#!/usr/bin/env node

/**
 * One-time Migration: Lowercase all Codeforces handles in the DB
 *
 * Background:
 *   Old registrations stored the handle with original casing (e.g. "KingShivam").
 *   Newer code normalizes to lowercase on register/login. This mismatch prevents
 *   old users from logging in and breaks the forgot-password flow.
 *
 * What this script does:
 *   1. Finds all users with at least one uppercase letter in their handle.
 *   2. Checks if a lowercase version already exists (collision detection).
 *   3. Updates the handle to lowercase for non-conflicting records.
 *   4. Reports any conflicts that need manual resolution.
 *
 * Usage:
 *   node scripts/migrate-lowercase-handles.js
 *
 * Reads MONGO_URL from .env in the project root (no extra deps needed).
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// ── Load .env manually (no dotenv dependency needed) ────────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, "../.env");
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env file not found at:", envPath);
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const MONGO_URL = process.env.MONGO_URL;
if (!MONGO_URL) {
  console.error("❌ MONGO_URL is not set in .env");
  process.exit(1);
}

// ── Minimal User schema (mirrors models/User.ts) ─────────────────────────────
const UserSchema = new mongoose.Schema({
  codeforcesHandle: { type: String, required: true, unique: true },
  pin: { type: String, required: true },
  rating: Number,
  avatar: String,
  rank: String,
  maxRating: Number,
  maxRank: String,
  organization: String,
  lastSyncTime: Number,
});

const User = mongoose.models?.User ?? mongoose.model("User", UserSchema);

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔧 Origami-CF — Handle Lowercase Migration\n");

  await mongoose.connect(MONGO_URL);
  console.log("✅ Connected to MongoDB\n");

  // Find all users whose handle contains at least one uppercase letter
  const mixedCaseUsers = await User.find({ codeforcesHandle: /[A-Z]/ }).lean();

  if (mixedCaseUsers.length === 0) {
    console.log("✅ No mixed-case handles found. Database is already clean!");
    await mongoose.disconnect();
    return;
  }

  console.log(
    `🔍 Found ${mixedCaseUsers.length} handle(s) with uppercase characters:\n`
  );

  let updated = 0;
  let skipped = 0;
  const conflicts = [];

  for (const user of mixedCaseUsers) {
    const original = user.codeforcesHandle;
    const lowered = original.toLowerCase();

    if (original === lowered) continue; // already lowercase — safety guard

    process.stdout.write(`  Processing: "${original}" → "${lowered}" ... `);

    // Conflict check: does a doc with the lowercase handle *already* exist?
    const conflict = await User.findOne({
      codeforcesHandle: lowered,
      _id: { $ne: user._id },
    }).lean();

    if (conflict) {
      console.log(`⚠️  CONFLICT — "${lowered}" already exists (id: ${conflict._id}). Skipping.`);
      conflicts.push({ original, lowered, existingId: conflict._id });
      skipped++;
      continue;
    }

    await User.updateOne({ _id: user._id }, { $set: { codeforcesHandle: lowered } });
    console.log("✅ Updated");
    updated++;
  }

  console.log("\n📊 Migration Summary:");
  console.log(`   ✅ Updated : ${updated}`);
  console.log(`   ⏭️  Skipped : ${skipped} (conflicts)`);

  if (conflicts.length > 0) {
    console.log("\n⚠️  Conflicts that need manual resolution:");
    console.log(
      "   Two accounts would map to the same lowercase handle.\n"
    );
    conflicts.forEach(({ original, lowered, existingId }) => {
      console.log(`   Mixed-case "${original}" → "${lowered}"`);
      console.log(`   Conflicting existing doc _id: ${existingId}\n`);
    });
  } else {
    console.log("\n🎉 Migration completed with no conflicts!");
  }

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");
}

main().catch((err) => {
  console.error("\n❌ Unexpected error:", err.message);
  console.error(err.stack);
  process.exit(1);
});
