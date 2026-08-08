import { Router } from 'express';
import authRoutes from './auth.routes.js';
import restaurantRoutes from './restaurant.routes.js';
import couponRoutes from './coupon.routes.js';
import favoriteRoutes from './favorite.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/coupons', couponRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/', restaurantRoutes);

export default router;
