import mongoose, { Schema, Document, models, model } from "mongoose";
import { TrainingProblem } from "@/types/TrainingProblem";

export interface ITraining extends Document {
  user: Schema.Types.ObjectId;
  startTime: number;
  endTime: number;
  customRatings: {
    P1: number;
    P2: number;
    P3: number;
    P4: number;
  };
  contestTime: number;
  problems: TrainingProblem[];
  performance: number;
}

const TrainingSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  customRatings: {
    P1: { type: Number, required: true },
    P2: { type: Number, required: true },
    P3: { type: Number, required: true },
    P4: { type: Number, required: true },
  },
  contestTime: { type: Number, required: true },
  problems: [
    {
      contestId: Number,
      index: String,
      name: String,
      rating: Number,
      tags: [String],
      url: String,
      solvedTime: Number,
    },
  ],
  performance: { type: Number, required: true },
});

export default models.Training || model<ITraining>("Training", TrainingSchema);
