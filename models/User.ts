import mongoose, { Schema, Document, models, model } from "mongoose";

// We can't use the existing User type from /types because it's for the client-side
// and we need to include the password hash for the backend model.
export interface IUser extends Document {
  codeforcesHandle: string;
  password?: string;
  rating: number;
  avatar: string;
  rank?: string;
  maxRank?: string;
  maxRating?: number;
  organization?: string;
}

const UserSchema: Schema = new Schema({
  codeforcesHandle: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rating: { type: Number, default: 0 },
  avatar: { type: String, default: "" },
  rank: { type: String, default: "newbie" },
  maxRank: { type: String, default: "newbie" },
  maxRating: { type: Number, default: 0 },
  organization: { type: String, default: "" },
});

export default models.User || model<IUser>("User", UserSchema);
