import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { recommendationController } from '../../controllers/recommendation.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { env } from '../../config/env.js';

const router = Router();

// Optional authentication middleware for Home Recommendations
const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as any;
    (req as any).user = payload;
  } catch (e) {
    // Ignore invalid token and treat as guest
  }
  next();
};

router.get('/home', optionalAuth, (req, res, next) =>
  recommendationController.getHomeRecommendations(req, res, next)
);
router.get('/foods', (req, res, next) =>
  recommendationController.getTrendingFoods(req, res, next)
);
router.get('/similar/:foodId', (req, res, next) =>
  recommendationController.getSimilarFoods(req, res, next)
);
router.get('/frequently-ordered', authenticate, (req, res, next) =>
  recommendationController.getFrequentlyOrdered(req, res, next)
);

export default router;
