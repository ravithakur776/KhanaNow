import { Router } from 'express';
import { reviewController } from '../../controllers/review.controller.js';
import { authenticate, authorizeRoles } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import {
  createReviewSchema,
  updateReviewSchema,
  moderateReviewSchema,
} from '../../validators/review.validator.js';

const router = Router();

// Public Read Endpoints
router.get('/restaurants/:restaurantId/reviews', (req, res, next) =>
  reviewController.getRestaurantReviews(req, res, next)
);
router.get('/foods/:foodId/reviews', (req, res, next) =>
  reviewController.getFoodReviews(req, res, next)
);
router.get('/reviews/:id', (req, res, next) =>
  reviewController.getReviewById(req, res, next)
);

// Admin Moderation
router.get('/admin/reviews-list', authenticate, authorizeRoles('admin'), (req, res, next) =>
  reviewController.getAdminReviews(req, res, next)
);
router.patch(
  '/admin/reviews/:id/moderate',
  authenticate,
  authorizeRoles('admin'),
  validateRequest(moderateReviewSchema),
  (req, res, next) => reviewController.moderateReview(req, res, next)
);

// Authenticated Customer Actions
router.post('/reviews', authenticate, validateRequest(createReviewSchema), (req, res, next) =>
  reviewController.createReview(req, res, next)
);
router.patch('/reviews/:id', authenticate, validateRequest(updateReviewSchema), (req, res, next) =>
  reviewController.updateReview(req, res, next)
);
router.delete('/reviews/:id', authenticate, (req, res, next) =>
  reviewController.deleteReview(req, res, next)
);

export default router;
