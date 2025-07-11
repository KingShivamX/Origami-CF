import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGO_URL;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGO_URL environment variable inside .env"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        return mongoose;
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err);
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
