import { Router } from 'express';
import { restaurantOwnerController } from '../../controllers/restaurantOwner.controller.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import {
  createFoodSchema,
  updateFoodSchema,
  updateRestaurantProfileSchema,
  ownerCouponSchema,
} from '../../validators/restaurantOwner.validator.js';
import { updateOrderStatusSchema } from '../../validators/order.validator.js';

const router = Router();

// Protect all owner endpoints with authentication and strict restaurant_owner role check
router.use(authenticate, authorizeRoles('restaurant_owner'));

// Dashboard & Analytics
router.get('/dashboard', (req, res, next) => restaurantOwnerController.getDashboard(req, res, next));
router.get('/analytics', (req, res, next) => restaurantOwnerController.getAnalytics(req, res, next));

// Orders Terminal
router.get('/orders', (req, res, next) => restaurantOwnerController.getOrders(req, res, next));
router.patch('/orders/:orderNumber/status', validateRequest(updateOrderStatusSchema), (req, res, next) =>
  restaurantOwnerController.updateOrderStatus(req, res, next)
);

// Menu Management
router.get('/menu', (req, res, next) => restaurantOwnerController.getMenu(req, res, next));
router.post('/menu', validateRequest(createFoodSchema), (req, res, next) =>
  restaurantOwnerController.createFood(req, res, next)
);
router.patch('/menu/:id', validateRequest(updateFoodSchema), (req, res, next) =>
  restaurantOwnerController.updateFood(req, res, next)
);
router.patch('/menu/:id/availability', (req, res, next) =>
  restaurantOwnerController.toggleFoodAvailability(req, res, next)
);
router.delete('/menu/:id', (req, res, next) => restaurantOwnerController.deleteFood(req, res, next));

// Profile & Status
router.patch('/profile', validateRequest(updateRestaurantProfileSchema), (req, res, next) =>
  restaurantOwnerController.updateProfile(req, res, next)
);
router.patch('/status', (req, res, next) => restaurantOwnerController.toggleOpenStatus(req, res, next));

// Coupons & Reviews
router.get('/coupons', (req, res, next) => restaurantOwnerController.getCoupons(req, res, next));
router.post('/coupons', validateRequest(ownerCouponSchema), (req, res, next) =>
  restaurantOwnerController.createCoupon(req, res, next)
);
router.get('/reviews', (req, res, next) => restaurantOwnerController.getReviews(req, res, next));

export default router;
