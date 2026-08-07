import { Router } from 'express';
import authRoutes from './auth.routes.js';
import restaurantRoutes from './restaurant.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', restaurantRoutes);

export default router;
