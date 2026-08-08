import { Router } from 'express';
import { checkoutController } from '../../controllers/checkout.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { validateCheckoutSchema } from '../../validators/checkout.validator.js';

const router = Router();

router.use(authenticate);

router.post('/validate', validateRequest(validateCheckoutSchema), (req, res, next) =>
  checkoutController.validateCheckout(req, res, next)
);

export default router;
