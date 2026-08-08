import mongoose, { Schema, Document } from 'mongoose';

export type ReviewStatus = 'published' | 'hidden' | 'flagged' | 'pending';

export interface IReviewDocument extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  foodId?: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  moderationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    foodId: { type: Schema.Types.ObjectId, ref: 'Food', index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 120, trim: true },
    comment: { type: String, required: true, maxlength: 1000, trim: true },
    images: [{ type: String }],
    isVerifiedPurchase: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['published', 'hidden', 'flagged', 'pending'],
      default: 'published',
      index: true,
    },
    moderationReason: { type: String },
  },
  { timestamps: true }
);

// Prevent duplicate review per user for the exact same order and restaurant/food
ReviewSchema.index(
  { userId: 1, orderId: 1, restaurantId: 1, foodId: 1 },
  { unique: true }
);
ReviewSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ foodId: 1, status: 1, createdAt: -1 });

export const Review = mongoose.model<IReviewDocument>('Review', ReviewSchema);
