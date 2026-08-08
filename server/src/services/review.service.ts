import mongoose from 'mongoose';
import { reviewRepository } from '../repositories/review.repository.js';
import { orderRepository } from '../repositories/order.repository.js';
import { Restaurant } from '../models/restaurant.model.js';
import { Food } from '../models/food.model.js';
import { adminRepository } from '../repositories/admin.repository.js';
import { ApiError } from '../utils/apiError.js';

export interface CreateReviewDTO {
  orderId: string;
  restaurantId: string;
  foodId?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

export class ReviewService {
  async createReview(userId: string, data: CreateReviewDTO) {
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new ApiError(400, 'Rating must be an integer between 1 and 5', 'INVALID_RATING');
    }

    if (!data.comment || data.comment.trim().length < 3) {
      throw new ApiError(400, 'Review comment must be at least 3 characters', 'INVALID_COMMENT');
    }

    // 1. Verify Order existence and customer ownership
    const order = await orderRepository.findById(data.orderId);
    if (!order) {
      throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');
    }

    if (order.userId.toString() !== userId) {
      throw new ApiError(403, 'Forbidden: You can only review orders placed by your account', 'FORBIDDEN_REVIEW_ACCESS');
    }

    // 2. Verify Order status is DELIVERED
    if (order.status !== 'DELIVERED') {
      throw new ApiError(400, 'You can only review an order after it has been delivered', 'ORDER_NOT_DELIVERED');
    }

    // 3. Verify Restaurant belongs to this order
    if (order.restaurantId.toString() !== data.restaurantId) {
      throw new ApiError(400, 'Restaurant does not match the purchased order', 'RESTAURANT_ORDER_MISMATCH');
    }

    // 4. Verify Food belongs to this order (if foodId provided)
    if (data.foodId) {
      const itemExists = order.items.some((i) => i.foodId.toString() === data.foodId);
      if (!itemExists) {
        throw new ApiError(400, 'The specified dish was not part of this order', 'FOOD_NOT_IN_ORDER');
      }
    }

    // 5. Prevent duplicate review for the same order and entity
    const existing = await reviewRepository.findExistingReview(
      userId,
      data.orderId,
      data.restaurantId,
      data.foodId
    );
    if (existing) {
      throw new ApiError(409, 'You have already submitted a review for this order item', 'DUPLICATE_REVIEW');
    }

    // 6. Create verified purchase review
    const review = await reviewRepository.create({
      userId: new mongoose.Types.ObjectId(userId),
      orderId: new mongoose.Types.ObjectId(data.orderId),
      restaurantId: new mongoose.Types.ObjectId(data.restaurantId),
      foodId: data.foodId ? new mongoose.Types.ObjectId(data.foodId) : undefined,
      rating: data.rating,
      title: data.title?.trim(),
      comment: data.comment.trim(),
      images: data.images || [],
      isVerifiedPurchase: true, // Authoritative server-derived verified purchase
      status: 'published',
    });

    // 7. Update Restaurant Rating Summary
    const summary = await reviewRepository.getRestaurantRatingSummary(data.restaurantId);
    await Restaurant.findByIdAndUpdate(data.restaurantId, {
      $set: {
        avgRating: summary.avgRating,
        totalRatings: summary.totalRatings,
      },
    });

    return review;
  }

  async getRestaurantReviews(restaurantId: string, page = 1, limit = 10, ratingFilter?: number) {
    const [reviewsData, summary] = await Promise.all([
      reviewRepository.findRestaurantReviews(restaurantId, page, limit, ratingFilter),
      reviewRepository.getRestaurantRatingSummary(restaurantId),
    ]);

    return {
      summary,
      ...reviewsData,
    };
  }

  async getFoodReviews(foodId: string, page = 1, limit = 10) {
    const [reviewsData, summary] = await Promise.all([
      reviewRepository.findFoodReviews(foodId, page, limit),
      reviewRepository.getFoodRatingSummary(foodId),
    ]);

    return {
      summary,
      ...reviewsData,
    };
  }

  async getReviewById(id: string) {
    const review = await reviewRepository.findById(id);
    if (!review) throw new ApiError(404, 'Review not found', 'REVIEW_NOT_FOUND');
    return review;
  }

  async updateReview(
    id: string,
    userId: string,
    data: { rating?: number; title?: string; comment?: string; images?: string[] }
  ) {
    const review = await reviewRepository.findById(id);
    if (!review) throw new ApiError(404, 'Review not found', 'REVIEW_NOT_FOUND');

    if (review.userId._id.toString() !== userId) {
      throw new ApiError(403, 'Forbidden: You can only edit your own review', 'FORBIDDEN_REVIEW_EDIT');
    }

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new ApiError(400, 'Rating must be between 1 and 5', 'INVALID_RATING');
    }

    const updated = await reviewRepository.update(id, userId, {
      rating: data.rating,
      title: data.title?.trim(),
      comment: data.comment?.trim(),
      images: data.images,
    });

    // Re-aggregate restaurant rating if rating changed
    if (data.rating && data.rating !== review.rating) {
      const summary = await reviewRepository.getRestaurantRatingSummary(review.restaurantId._id.toString());
      await Restaurant.findByIdAndUpdate(review.restaurantId._id, {
        $set: { avgRating: summary.avgRating, totalRatings: summary.totalRatings },
      });
    }

    return updated;
  }

  async deleteReview(id: string, userId: string) {
    const review = await reviewRepository.findById(id);
    if (!review) throw new ApiError(404, 'Review not found', 'REVIEW_NOT_FOUND');

    if (review.userId._id.toString() !== userId) {
      throw new ApiError(403, 'Forbidden: You can only delete your own review', 'FORBIDDEN_REVIEW_DELETE');
    }

    await reviewRepository.softDelete(id, userId);

    // Re-aggregate restaurant rating
    const summary = await reviewRepository.getRestaurantRatingSummary(review.restaurantId._id.toString());
    await Restaurant.findByIdAndUpdate(review.restaurantId._id, {
      $set: { avgRating: summary.avgRating, totalRatings: summary.totalRatings },
    });

    return { message: 'Review deleted successfully' };
  }

  async moderateReview(id: string, status: 'published' | 'hidden' | 'flagged', adminUserId: string, reason?: string) {
    const review = await reviewRepository.updateStatus(id, status, reason);
    if (!review) throw new ApiError(404, 'Review not found', 'REVIEW_NOT_FOUND');

    await adminRepository.createAuditLog(
      adminUserId,
      'admin',
      `MODERATED_REVIEW_STATUS_TO_${status.toUpperCase()}`,
      'User', // generic target
      id,
      { status, reason, restaurantId: review.restaurantId }
    );

    return review;
  }

  async getAdminReviews(page = 1, limit = 20, status?: string) {
    return reviewRepository.findAdminReviews(page, limit, status);
  }
}

export const reviewService = new ReviewService();
