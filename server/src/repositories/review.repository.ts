import mongoose from 'mongoose';
import { Review, IReviewDocument, ReviewStatus } from '../models/review.model.js';

export class ReviewRepository {
  async create(data: Partial<IReviewDocument>): Promise<IReviewDocument> {
    const review = new Review(data);
    return review.save();
  }

  async findById(id: string): Promise<IReviewDocument | null> {
    return Review.findById(id)
      .populate('userId', 'firstName lastName avatarUrl')
      .populate('foodId', 'name imageUrl')
      .populate('restaurantId', 'name');
  }

  async findExistingReview(
    userId: string,
    orderId: string,
    restaurantId: string,
    foodId?: string
  ): Promise<IReviewDocument | null> {
    const query: any = {
      userId: new mongoose.Types.ObjectId(userId),
      orderId: new mongoose.Types.ObjectId(orderId),
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      foodId: foodId ? new mongoose.Types.ObjectId(foodId) : null,
    };
    return Review.findOne(query);
  }

  async findRestaurantReviews(
    restaurantId: string,
    page = 1,
    limit = 10,
    ratingFilter?: number
  ) {
    const skip = (page - 1) * limit;
    const query: any = {
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      status: 'published',
    };
    if (ratingFilter && ratingFilter >= 1 && ratingFilter <= 5) {
      query.rating = ratingFilter;
    }

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('userId', 'firstName lastName avatarUrl')
        .populate('foodId', 'name imageUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
    ]);

    return {
      reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getRestaurantRatingSummary(restaurantId: string) {
    const stats = await Review.aggregate([
      {
        $match: {
          restaurantId: new mongoose.Types.ObjectId(restaurantId),
          status: 'published',
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          star5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          star4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          star3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          star2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          star1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    const result = stats[0] || {
      avgRating: 4.5,
      totalRatings: 0,
      star5: 0,
      star4: 0,
      star3: 0,
      star2: 0,
      star1: 0,
    };

    return {
      avgRating: Number((result.avgRating || 4.5).toFixed(1)),
      totalRatings: result.totalRatings || 0,
      distribution: {
        5: result.star5,
        4: result.star4,
        3: result.star3,
        2: result.star2,
        1: result.star1,
      },
    };
  }

  async findFoodReviews(foodId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const query = {
      foodId: new mongoose.Types.ObjectId(foodId),
      status: 'published',
    };

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('userId', 'firstName lastName avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
    ]);

    return {
      reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getFoodRatingSummary(foodId: string) {
    const stats = await Review.aggregate([
      {
        $match: {
          foodId: new mongoose.Types.ObjectId(foodId),
          status: 'published',
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const result = stats[0] || { avgRating: 4.5, totalRatings: 0 };
    return {
      avgRating: Number((result.avgRating || 4.5).toFixed(1)),
      totalRatings: result.totalRatings || 0,
    };
  }

  async update(
    id: string,
    userId: string,
    data: { rating?: number; title?: string; comment?: string; images?: string[] }
  ): Promise<IReviewDocument | null> {
    return Review.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true }
    );
  }

  async softDelete(id: string, userId?: string): Promise<IReviewDocument | null> {
    const query: any = { _id: id };
    if (userId) query.userId = userId;
    return Review.findOneAndUpdate(
      query,
      { $set: { status: 'hidden' } },
      { new: true }
    );
  }

  async updateStatus(
    id: string,
    status: ReviewStatus,
    moderationReason?: string
  ): Promise<IReviewDocument | null> {
    return Review.findByIdAndUpdate(
      id,
      { $set: { status, moderationReason } },
      { new: true }
    );
  }

  async findAdminReviews(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const query: any = {};
    if (status && status !== 'ALL') query.status = status;

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('userId', 'firstName lastName email')
        .populate('restaurantId', 'name')
        .populate('foodId', 'name')
        .populate('orderId', 'orderNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments(query),
    ]);

    return {
      reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const reviewRepository = new ReviewRepository();
