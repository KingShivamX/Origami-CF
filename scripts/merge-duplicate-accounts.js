#!/usr/bin/env node

/**
 * Merge Duplicate Accounts Script
 *
 * For each pair (upperAccount, lowerAccount):
 *   1. Reassign all Training records from upper._id → lower._id
 *   2. Reassign UpsolvedProblem records (skip if exact duplicate by contestId+index)
 *   3. Reassign CustomProblem records (skip if exact duplicate by contestId+index)
 *   4. Delete the uppercase User document
 *
 * The lowercase account keeps its own profile data (pin, rating, etc.).
 * Data belonging only to the uppercase account gets moved under the lowercase one.
 */

const fs = require('fs'), path = require('path');
const lines = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf-8').split(/\r?\n/);
for (const l of lines) {
  const i = l.indexOf('=');
  if (i > -1) process.env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^"|"$/g, '');
}

const mongoose = require('mongoose');

// ── Schema definitions ────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  codeforcesHandle: { type: String, required: true, unique: true },
  pin: String, rating: Number, avatar: String, rank: String,
  maxRating: Number, maxRank: String, organization: String, lastSyncTime: Number,
});
const TrainingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startTime: Number, endTime: Number, customRatings: Object, problems: Array, performance: Number,
});
const UpsolvedSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contestId: Number, index: String, name: String, rating: Number,
  tags: [String], url: String, solvedTime: Number, createdAt: Date,
});
UpsolvedSchema.index({ user: 1, contestId: 1, index: 1 }, { unique: true });

const CustomSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contestId: Number, index: String, name: String, rating: Number,
  tags: [String], url: String, solvedTime: Number, createdAt: Date,
});
CustomSchema.index({ userId: 1, contestId: 1, index: 1 }, { unique: true });

const User          = mongoose.models.User          || mongoose.model('User',           UserSchema);
const Training      = mongoose.models.Training      || mongoose.model('Training',        TrainingSchema);
const UpsolvedProblem = mongoose.models.UpsolvedProblem || mongoose.model('UpsolvedProblem', UpsolvedSchema);
const CustomProblem = mongoose.models.CustomProblem || mongoose.model('CustomProblem',   CustomSchema);

// ── Pairs to merge: [ upperHandle, lowerHandle ] ─────────────────────────────
const PAIRS = [
  ['Pratik16',                 'pratik16'],
  ['RodrigoHernandezCascante', 'rodrigohernandezcascante'],
];

// ── Helpers ───────────────────────────────────────────────────────────────────
async function mergeCollection(Model, userField, upperId, lowerId, label) {
  const upperDocs = await Model.find({ [userField]: upperId }).lean();
  if (upperDocs.length === 0) {
    console.log(`   ${label}: nothing to move`);
    return;
  }

  let moved = 0, skipped = 0;
  for (const doc of upperDocs) {
    // Check if an identical record already exists under the lowercase account
    let existsQuery;
    if (doc.contestId !== undefined && doc.index !== undefined) {
      existsQuery = { [userField]: lowerId, contestId: doc.contestId, index: doc.index };
    }
    if (existsQuery) {
      const exists = await Model.findOne(existsQuery).lean();
      if (exists) { skipped++; continue; }
    }
    await Model.updateOne({ _id: doc._id }, { $set: { [userField]: lowerId } });
    moved++;
  }
  console.log(`   ${label}: moved ${moved}, skipped ${skipped} duplicates`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔧 Origami-CF — Merge Duplicate Accounts\n');
  await mongoose.connect(process.env.MONGO_URL);
  console.log('✅ Connected to MongoDB\n');

  for (const [upper, lower] of PAIRS) {
    console.log(`\n━━━ Merging "${upper}" → "${lower}" ━━━`);

    const upperUser = await User.findOne({ codeforcesHandle: upper }).lean();
    const lowerUser = await User.findOne({ codeforcesHandle: lower }).lean();

    if (!upperUser) { console.log(`   ⚠️  "${upper}" not found, skipping`); continue; }
    if (!lowerUser) { console.log(`   ⚠️  "${lower}" not found, skipping`); continue; }

    console.log(`   Upper _id : ${upperUser._id}`);
    console.log(`   Lower _id : ${lowerUser._id}`);

    await mergeCollection(Training,        'user',   upperUser._id, lowerUser._id, 'Training');
    await mergeCollection(UpsolvedProblem, 'user',   upperUser._id, lowerUser._id, 'UpsolvedProblem');
    await mergeCollection(CustomProblem,   'userId', upperUser._id, lowerUser._id, 'CustomProblem');

    await User.deleteOne({ _id: upperUser._id });
    console.log(`   🗑️  Deleted uppercase account "${upper}"`);
    console.log(`   ✅ Done — all data now lives under "${lower}"`);
  }

  console.log('\n🎉 All merges complete!');
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
