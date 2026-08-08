import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service.js';
import { sendResponse } from '../utils/apiResponse.js';

export class ReviewController {
  async createReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const review = await reviewService.createReview(userId, req.body);
      sendResponse(res, 201, 'Verified customer review submitted successfully', review);
    } catch (error) {
      next(error);
    }
  }

  async getRestaurantReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurantId = req.params.restaurantId as string;
      const { page, limit, rating } = req.query as any;

      const data = await reviewService.getRestaurantReviews(
        restaurantId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10,
        rating ? parseInt(rating, 10) : undefined
      );

      sendResponse(res, 200, 'Restaurant reviews retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getFoodReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const foodId = req.params.foodId as string;
      const { page, limit } = req.query as any;

      const data = await reviewService.getFoodReviews(
        foodId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 10
      );

      sendResponse(res, 200, 'Food dish reviews retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getReviewById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await reviewService.getReviewById(req.params.id as string);
      sendResponse(res, 200, 'Review retrieved successfully', review);
    } catch (error) {
      next(error);
    }
  }

  async updateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const review = await reviewService.updateReview(req.params.id as string, userId, req.body);
      sendResponse(res, 200, 'Review updated successfully', review);
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await reviewService.deleteReview(req.params.id as string, userId);
      sendResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async moderateReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const adminUserId = req.user!.userId;
      const { status, reason } = req.body;
      const review = await reviewService.moderateReview(req.params.id as string, status, adminUserId, reason);
      sendResponse(res, 200, `Review status updated to ${status}`, review);
    } catch (error) {
      next(error);
    }
  }

  async getAdminReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, status } = req.query as any;
      const data = await reviewService.getAdminReviews(
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
        status
      );
      sendResponse(res, 200, 'Admin reviews directory retrieved', data);
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
