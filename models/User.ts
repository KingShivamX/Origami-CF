import { Schema, model, models, Document } from "mongoose";

export interface IUser extends Document {
  codeforcesHandle: string;
  pin: string;
  rating: number;
  avatar: string;
  rank: string;
  maxRating: number;
  maxRank: string;
  organization: string;
  lastSyncTime: number;
}

const UserSchema: Schema = new Schema({
  codeforcesHandle: { type: String, required: true, unique: true },
  pin: { type: String, required: true },
  rating: { type: Number, default: 1500 },
  avatar: { type: String, required: true },
  rank: { type: String, required: true, default: "Specialist" },
  maxRating: { type: Number, default: 1500 },
  maxRank: { type: String, default: "Specialist" },
  organization: { type: String },
  lastSyncTime: { type: Number, default: 0 },
});

export default models.User || model<IUser>("User", UserSchema);
