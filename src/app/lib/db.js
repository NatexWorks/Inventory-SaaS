import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  // Fail fast if the database connection string is missing
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Reuse a cached connection during hot reloads and serverless invocations
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    // Return the existing connection if it already exists
    if (cached.conn) {
        return cached.conn;
    }
    // Create a single shared connection promise if one does not exist yet
    if (!cached.promise) {
       
        cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
  } 
export default dbConnect;

// Optional helper for manually disconnecting from MongoDB
// export async function dbDisconnect() {
//   if (cached.conn) {
//     await mongoose.disconnect();
//     cached.conn = null;
//     cached.promise = null;
//   }
// }
