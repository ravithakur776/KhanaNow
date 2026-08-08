import { Router } from 'express';
import { adminController } from '../../controllers/admin.controller.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import {
  updateUserStatusSchema,
  updateUserRoleSchema,
  updateRestaurantStatusSchema,
  adminCategorySchema,
  adminCouponSchema,
} from '../../validators/admin.validator.js';
import { updateOrderStatusSchema } from '../../validators/order.validator.js';

const router = Router();

// Protect all admin endpoints with authentication and strict admin role enforcement
router.use(authenticate, authorizeRoles('admin'));

// Platform Dashboard & Analytics
router.get('/dashboard', (req, res, next) => adminController.getDashboard(req, res, next));
router.get('/analytics', (req, res, next) => adminController.getAnalytics(req, res, next));
router.get('/audit-logs', (req, res, next) => adminController.getAuditLogs(req, res, next));

// User Management
router.get('/users', (req, res, next) => adminController.getUsers(req, res, next));
router.patch('/users/:id/status', validateRequest(updateUserStatusSchema), (req, res, next) =>
  adminController.updateUserStatus(req, res, next)
);
router.patch('/users/:id/role', validateRequest(updateUserRoleSchema), (req, res, next) =>
  adminController.updateUserRole(req, res, next)
);

// Restaurant Approvals & Management
router.get('/restaurants', (req, res, next) => adminController.getRestaurants(req, res, next));
router.patch('/restaurants/:id/status', validateRequest(updateRestaurantStatusSchema), (req, res, next) =>
  adminController.updateRestaurantStatus(req, res, next)
);

// Order Management & Override
router.get('/orders', (req, res, next) => adminController.getOrders(req, res, next));
router.patch('/orders/:orderNumber/status', validateRequest(updateOrderStatusSchema), (req, res, next) =>
  adminController.updateOrderStatus(req, res, next)
);

// Payments View
router.get('/payments', (req, res, next) => adminController.getPayments(req, res, next));

// Platform Categories
router.get('/categories', (req, res, next) => adminController.getCategories(req, res, next));
router.post('/categories', validateRequest(adminCategorySchema), (req, res, next) =>
  adminController.createCategory(req, res, next)
);
router.patch('/categories/:id', (req, res, next) => adminController.updateCategory(req, res, next));
router.delete('/categories/:id', (req, res, next) => adminController.deleteCategory(req, res, next));

// Platform Coupons
router.get('/coupons', (req, res, next) => adminController.getCoupons(req, res, next));
router.post('/coupons', validateRequest(adminCouponSchema), (req, res, next) =>
  adminController.createCoupon(req, res, next)
);
router.patch('/coupons/:id/toggle', (req, res, next) => adminController.toggleCoupon(req, res, next));

export default router;
