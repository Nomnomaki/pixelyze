import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Extend the global object to include mongoose
declare global {
  var mongoose: MongooseConnection | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URL) throw new Error("Missing MONGODB_URL");

  cached.promise =
    cached.promise ||
    mongoose
      .connect(MONGODB_URL, {
        dbName: "imaginify",
        bufferCommands: false,
      })
      .then((mongoose) => mongoose);

  cached.conn = await cached.promise;

  return cached.conn;
};
//cached is a global variable, stored in the global object, to maintain a single shared MongoDB connection
//across the Next.js application. This is because in Next.js, each request could create a new instance,
// so caching avoids reconnecting on each request, improving performance.

//Why This Approach?
//Global Caching: In Next.js, where code might be re-executed with every API request, using a global cache for the Mongoose connection prevents creating new connections on every request.
//Error Handling: If the MongoDB URL is missing, the function will throw an error, aiding debugging.
//Efficient Resource Usage: By reusing a single connection instance, it reduces the load on MongoDB and improves response times.
