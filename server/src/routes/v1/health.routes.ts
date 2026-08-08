import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isDbHealthy = dbState === 1;
  const statusCode = isDbHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: isDbHealthy ? 'ok' : 'degraded',
    database: dbStatusMap[dbState] || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default router;
