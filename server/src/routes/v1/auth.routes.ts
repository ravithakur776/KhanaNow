import { Router } from 'express';
import { authController } from '../../controllers/auth.controller.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOTPSchema,
  resendVerificationSchema,
} from '../../validators/auth.validator.js';

const router = Router();

router.post('/register', validateRequest(registerSchema), (req, res, next) =>
  authController.register(req, res, next)
);

router.post('/login', validateRequest(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
);

router.post('/verify-email', validateRequest(verifyOTPSchema), (req, res, next) =>
  authController.verifyEmail(req, res, next)
);

router.post('/resend-verification', validateRequest(resendVerificationSchema), (req, res, next) =>
  authController.resendVerification(req, res, next)
);

router.post('/forgot-password', validateRequest(forgotPasswordSchema), (req, res, next) =>
  authController.forgotPassword(req, res, next)
);

router.post('/reset-password', validateRequest(resetPasswordSchema), (req, res, next) =>
  authController.resetPassword(req, res, next)
);

router.post('/refresh-token', (req, res, next) =>
  authController.refreshToken(req, res, next)
);

router.post('/logout', authenticate, (req, res, next) =>
  authController.logout(req, res, next)
);

router.get('/me', authenticate, (req, res, next) =>
  authController.getMe(req, res, next)
);

export default router;
