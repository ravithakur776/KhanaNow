import { Router } from 'express';
import { orderController } from '../../controllers/order.controller.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import {
  createOrderSchema,
  cancelOrderSchema,
  updateOrderStatusSchema,
  queryOrdersSchema,
} from '../../validators/order.validator.js';

const router = Router();

router.use(authenticate);

// Customer Order endpoints
router.post('/', validateRequest(createOrderSchema), (req, res, next) =>
  orderController.createOrder(req, res, next)
);

router.get('/', (req, res, next) =>
  orderController.getMyOrders(req, res, next)
);

router.get('/:orderNumber', (req, res, next) =>
  orderController.getOrderDetails(req, res, next)
);

router.get('/:orderNumber/tracking', (req, res, next) =>
  orderController.getOrderTracking(req, res, next)
);

router.post('/:orderNumber/cancel', validateRequest(cancelOrderSchema), (req, res, next) =>
  orderController.cancelOrder(req, res, next)
);

router.post('/:orderNumber/reorder', (req, res, next) =>
  orderController.reorder(req, res, next)
);

// Restaurant Owner / Admin Order Status Management
router.patch(
  '/restaurant/:orderNumber/status',
  authorizeRoles('restaurant_owner', 'admin'),
  validateRequest(updateOrderStatusSchema),
  (req, res, next) => orderController.restaurantUpdateStatus(req, res, next)
);

export default router;
