import mongoose, { Schema, Document } from 'mongoose';

export type PaymentStatus =
  | 'created'
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export interface IPaymentDocument extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  amount: number; // in paise (integer)
  currency: string;
  status: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  idempotencyKey: string;
  paymentReference: string; // e.g. KN-PAY-XXXXXXXX
  failureReason?: string;
  metadata: {
    restaurantName: string;
    subtotal: number;
    discount: number;
    deliveryFee: number;
    platformFee: number;
    taxAmount: number;
    tipAmount: number;
    grandTotalRupees: number;
    itemCount: number;
    addressSummary: string;
    itemsSummary?: Array<{ name: string; quantity: number; price: number }>;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', sparse: true, index: true },
    amount: { type: Number, required: true, min: 100 }, // in paise (min ₹1)
    currency: { type: String, default: 'INR', uppercase: true, trim: true },
    status: {
      type: String,
      enum: [
        'created',
        'pending',
        'authorized',
        'captured',
        'failed',
        'cancelled',
        'refunded',
        'partially_refunded',
      ],
      default: 'created',
      index: true,
    },
    razorpayOrderId: { type: String, sparse: true, index: true },
    razorpayPaymentId: { type: String, sparse: true, index: true },
    razorpaySignature: { type: String },
    idempotencyKey: { type: String, required: true },
    paymentReference: { type: String, required: true, unique: true, index: true },
    failureReason: { type: String },
    metadata: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

PaymentSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });
PaymentSchema.index({ createdAt: -1 });

export const Payment = mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
