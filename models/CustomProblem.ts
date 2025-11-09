import mongoose from "mongoose";

const customProblemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  contestId: {
    type: Number,
    required: true,
  },
  index: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  tags: {
    type: [String],
    default: [],
  },
  url: {
    type: String,
    required: true,
  },
  solvedTime: {
    type: Number,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure unique problems per user
customProblemSchema.index({ userId: 1, contestId: 1, index: 1 }, { unique: true });

const CustomProblem = mongoose.models.CustomProblem || mongoose.model("CustomProblem", customProblemSchema);

export default CustomProblem;
