import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewDocument extends Document {
  restaurantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    images: [{ type: String }],
  },
  { timestamps: true }
);

ReviewSchema.index({ restaurantId: 1, createdAt: -1 });

export const Review = mongoose.model<IReviewDocument>('Review', ReviewSchema);
