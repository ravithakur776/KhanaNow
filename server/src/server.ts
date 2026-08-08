import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 KhanaNow Server running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        console.log('💤 HTTP Server closed.');
        try {
          await mongoose.connection.close();
          console.log('📦 MongoDB connection closed gracefully.');
        } catch (dbErr) {
          console.error('Error closing MongoDB connection:', dbErr);
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
