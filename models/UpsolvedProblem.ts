import { Schema, model, models, Document } from "mongoose";

export interface IUpsolvedProblem extends Document {
  user: Schema.Types.ObjectId;
  contestId: number;
  index: string;
  name: string;
  rating: number;
  tags: string[];
  url: string;
  solvedTime: number | null;
  createdAt: Date;
}

const UpsolvedProblemSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  contestId: { type: Number, required: true },
  index: { type: String, required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  tags: [{ type: String, required: true }],
  url: { type: String, required: true },
  solvedTime: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Prevent duplicate problems per user
UpsolvedProblemSchema.index(
  { user: 1, contestId: 1, index: 1 },
  { unique: true }
);

export default models.UpsolvedProblem ||
  model<IUpsolvedProblem>("UpsolvedProblem", UpsolvedProblemSchema);
