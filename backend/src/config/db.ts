import mongoose from "mongoose";
import env from "./env";
import logger from "../utils/logger";

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const mongoUri = env.MONGO_URI;

    if (!mongoUri) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    const connection = await mongoose.connect(mongoUri);

    logger.info(`MongoDB connected: ${connection.connection.host} (${connection.connection.name})`);

    return connection;
  } catch (error: any) {
    logger.error(`MongoDB connection failed: ${error.message}`, { error: error.stack });
    process.exit(1);
  }
};

export default connectDB;
