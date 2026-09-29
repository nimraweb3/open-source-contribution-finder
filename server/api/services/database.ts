import mongoose from "mongoose";

let pending: Promise<typeof mongoose> | undefined;
export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  if (!pending) {
    pending = mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
    }).catch(error => { pending = undefined; throw error; });
  }
  return pending;
}
