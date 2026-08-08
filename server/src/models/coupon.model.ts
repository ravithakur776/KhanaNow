import mongoose, { Schema, Document } from 'mongoose';

export interface ICouponDocument extends Document {
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minimumOrderValue: number;
  maximumDiscount?: number;
  startDate: Date;
  endDate: Date;
  usageLimit: number;
  perUserLimit: number;
  usedCount: number;
  isActive: boolean;
  restaurantId?: mongoose.Types.ObjectId;
  applicableFoodIds?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICouponDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ['percentage', 'flat'], default: 'flat' },
    discountValue: { type: Number, required: true, min: 1 },
    minimumOrderValue: { type: Number, default: 0 },
    maximumDiscount: { type: Number },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 1000 },
    perUserLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
    applicableFoodIds: [{ type: Schema.Types.ObjectId, ref: 'Food' }],
  },
  { timestamps: true }
);

CouponSchema.index({ code: 1, isActive: 1 });
CouponSchema.index({ endDate: 1 });

export const Coupon = mongoose.model<ICouponDocument>('Coupon', CouponSchema);
