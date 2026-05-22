import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "./logger.js";

let mongod: any = null;

export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);
  const uri = env.MONGODB_URI;

  try {
    logger.info("Connecting to MongoDB...", { uri });
    await mongoose.connect(uri, {
      autoIndex: env.NODE_ENV !== "production",
      serverSelectionTimeoutMS: 2000
    });
    logger.info("MongoDB connected successfully to external instance");
  } catch (error) {
    if (env.NODE_ENV === "production") {
      logger.error("Failed to connect to production database", { error });
      throw error;
    }
    
    logger.warn("Could not connect to external MongoDB. Starting in-memory MongoDB server...", {
      error: error instanceof Error ? error.message : "Unknown error"
    });
    
    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      mongod = await MongoMemoryServer.create();
      const mongoUri = mongod.getUri();
      logger.info(`In-memory MongoDB started`, { uri: mongoUri });
      await mongoose.connect(mongoUri, {
        autoIndex: true
      });
      logger.info("MongoDB connected successfully to in-memory instance");
    } catch (memError) {
      logger.error("Failed to start or connect to in-memory MongoDB", { error: memError });
      throw memError;
    }
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
    logger.info("In-memory MongoDB stopped");
  }
  logger.info("MongoDB disconnected");
}

export function isDatabaseReady(): boolean {
  return mongoose.connection.readyState === 1;
}


