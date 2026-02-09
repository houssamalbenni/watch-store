import mongoose from 'mongoose';
import config from './index.js';
import logger from './logger.js';

// Reuse connection in serverless environment
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null };
}

const connectDB = async () => {
  try {
    // Return existing connection if available
    if (cached.conn) {
      logger.info('Using cached MongoDB connection');
      return cached.conn;
    }

    // Create new connection with optimized options
    const conn = await mongoose.connect(config.mongodbUri, {
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 45000,
      retryWrites: true,
      w: 'majority',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    cached.conn = conn;
    logger.info('MongoDB connected successfully');
    return conn;
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
