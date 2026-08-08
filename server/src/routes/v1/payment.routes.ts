import { Router } from 'express';
import { paymentController } from '../../controllers/payment.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import {
  createPaymentOrderSchema,
  verifyPaymentSchema,
} from '../../validators/payment.validator.js';

const router = Router();

// Webhook endpoint (public with signature header verification)
router.post('/webhook', (req, res, next) => paymentController.webhook(req, res, next));

// Authenticated Customer payment endpoints
router.use(authenticate);

router.post(
  '/create-order',
  validateRequest(createPaymentOrderSchema),
  (req, res, next) => paymentController.createOrder(req, res, next)
);

router.post(
  '/verify',
  validateRequest(verifyPaymentSchema),
  (req, res, next) => paymentController.verifyPayment(req, res, next)
);

router.get('/:paymentReference', (req, res, next) =>
  paymentController.getPaymentStatus(req, res, next)
);

router.post('/:paymentReference/cancel', (req, res, next) =>
  paymentController.cancelPayment(req, res, next)
);

export default router;
