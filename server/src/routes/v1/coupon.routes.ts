import { Router } from 'express';
import { couponController } from '../../controllers/coupon.controller.js';

const router = Router();

router.get('/', (req, res, next) => couponController.getCoupons(req, res, next));
router.post('/validate', (req, res, next) => couponController.validateCoupon(req, res, next));
router.post('/apply', (req, res, next) => couponController.applyCoupon(req, res, next));
router.post('/remove', (req, res, next) => couponController.removeCoupon(req, res, next));

export default router;
