import mongoose from "mongoose";
import { env } from "./env.js";
import { MongoClient } from "mongodb";

export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(env.MONGODB_URI);

    console.log(`MongoDB connected successfully`);
    console.log(`MongoDB Host : ${connectionInstance.connection.host}`);
  } catch (err: any) {
    console.error(`MongoDB connection error : ${err.message}`);
    process.exit(1)
  }
};

/**
 * Native MongoClient — for Atlas Vector Search
 */
let mongoClient : MongoClient | null = null

export const getMongoDBClient = async (): Promise<MongoClient>=>{
    if(!mongoClient) {
        mongoClient = new MongoClient (env.MONGODB_URI);
        await mongoClient.connect()
        console.log(`MongoClient is Connected for Vector Search`);
    }
    return mongoClient
}

/**
 * Graceful Shutdown
 */

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoClient) await mongoClient.close();
  console.log("[DB] MongoDB connections closed");
};

process.on("SIGTERM", disconnectDB);
process.on("SIGINT", disconnectDB);