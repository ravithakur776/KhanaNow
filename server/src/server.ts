import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    const server = app.listen(env.PORT, () => {
      console.log(`🚀 Server running in [${env.NODE_ENV}] mode on http://localhost:${env.PORT}`);
    });

    const gracefulShutdown = (signal: string) => {
      console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('💤 HTTP Server closed.');
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
