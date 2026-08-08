import { Router } from 'express';
import authRoutes from './auth.routes.js';
import restaurantRoutes from './restaurant.routes.js';
import couponRoutes from './coupon.routes.js';
import favoriteRoutes from './favorite.routes.js';
import addressRoutes from './address.routes.js';
import checkoutRoutes from './checkout.routes.js';
import paymentRoutes from './payment.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/addresses', addressRoutes);
router.use('/coupons', couponRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/payments', paymentRoutes);
router.use('/', restaurantRoutes);

export default router;
