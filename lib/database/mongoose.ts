import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose; //creating a buffer coz of next.js

if (!cached) {
  //checking if a "cached" exist or a connection is already established
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URL) {
    //checking if the .env file has the mongo url
    throw new Error("Missing MONGODB_URL");
  }
  //checking if connect is already established or notv
  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URL, {
      dbName: "Pixelyze",
      bufferCommands: false,
    });

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
