import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_PREPARING'
  | 'ORDER_READY'
  | 'ORDER_OUT_FOR_DELIVERY'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'RESTAURANT_APPROVED'
  | 'RESTAURANT_SUSPENDED'
  | 'PROMOTION'
  | 'COUPON'
  | 'REVIEW_REMINDER'
  | 'SYSTEM';

export interface INotificationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    orderNumber?: string;
    restaurantId?: string;
    foodId?: string;
    couponCode?: string;
  };
  eventKey?: string; // Idempotency reference e.g. ORDER_CONFIRMED:KN-20260808-8F4K2
  isRead: boolean;
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: {
      orderNumber: { type: String },
      restaurantId: { type: String },
      foodId: { type: String },
      couponCode: { type: String },
    },
    eventKey: { type: String, sparse: true, index: true },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, eventKey: 1 }, { unique: true, sparse: true });

export const Notification = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
