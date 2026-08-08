import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED';

export interface IOrderItemSnapshot {
  foodId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  dietaryType: 'veg' | 'non_veg' | 'vegan' | 'egg';
  quantity: number;
  unitPrice: number; // in Rupees
  unitPricePaise: number; // in Paise
  selectedOptions?: Array<{
    groupName: string;
    optionName: string;
    price: number;
  }>;
  optionsTotal: number;
  itemTotal: number;
}

export interface IOrderPricingSnapshot {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  platformFee: number;
  taxAmount: number;
  tipAmount: number;
  grandTotal: number;
  grandTotalPaise: number;
  savingsTotal: number;
  currency: string;
}

export interface IOrderAddressSnapshot {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  formattedAddress: string;
}

export interface IOrderContactSnapshot {
  name: string;
  phone: string;
  email: string;
}

export interface IOrderStatusHistoryEntry {
  status: OrderStatus;
  changedAt: Date;
  changedBy?: mongoose.Types.ObjectId;
  actorType: 'customer' | 'restaurant' | 'delivery_partner' | 'admin' | 'system';
  note?: string;
}

export interface IDeliveryPartnerSnapshot {
  name: string;
  phone: string;
  avatar?: string;
  vehicleType: string;
  vehicleNumber: string;
  rating: number;
  assignedAt: Date;
}

export interface IOrderDocument extends Document {
  orderNumber: string; // e.g. KN-20260808-8F4K2
  userId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  paymentId: mongoose.Types.ObjectId;
  paymentReference: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  addressSnapshot: IOrderAddressSnapshot;
  contactSnapshot: IOrderContactSnapshot;
  items: IOrderItemSnapshot[];
  pricing: IOrderPricingSnapshot;
  coupon?: {
    code: string;
    description?: string;
    discountAmount: number;
  } | null;
  tip: number;
  deliveryInstructions?: string;
  deliveryOption: 'standard' | 'scheduled';
  status: OrderStatus;
  statusHistory: IOrderStatusHistoryEntry[];
  estimatedDeliveryTime: Date;
  placedAt: Date;
  acceptedAt?: Date;
  preparingAt?: Date;
  readyAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  deliveryPartner?: IDeliveryPartnerSnapshot | null;
  idempotencyKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true, unique: true, index: true },
    paymentReference: { type: String, required: true, index: true },
    razorpayOrderId: { type: String, sparse: true },
    razorpayPaymentId: { type: String, sparse: true },
    addressSnapshot: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      landmark: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
      latitude: { type: Number },
      longitude: { type: Number },
      formattedAddress: { type: String, required: true },
    },
    contactSnapshot: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
    },
    items: [
      {
        foodId: { type: String, required: true },
        name: { type: String, required: true },
        description: { type: String },
        imageUrl: { type: String },
        dietaryType: { type: String, enum: ['veg', 'non_veg', 'vegan', 'egg'], default: 'veg' },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        unitPricePaise: { type: Number, required: true },
        selectedOptions: [
          {
            groupName: { type: String },
            optionName: { type: String },
            price: { type: Number, default: 0 },
          },
        ],
        optionsTotal: { type: Number, default: 0 },
        itemTotal: { type: Number, required: true },
      },
    ],
    pricing: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      deliveryFee: { type: Number, default: 0 },
      platformFee: { type: Number, default: 6 },
      taxAmount: { type: Number, required: true },
      tipAmount: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
      grandTotalPaise: { type: Number, required: true },
      savingsTotal: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    coupon: {
      type: Schema.Types.Mixed,
      default: null,
    },
    tip: { type: Number, default: 0 },
    deliveryInstructions: { type: String },
    deliveryOption: { type: String, enum: ['standard', 'scheduled'], default: 'standard' },
    status: {
      type: String,
      enum: [
        'PLACED',
        'CONFIRMED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'PICKED_UP',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'FAILED',
      ],
      default: 'PLACED',
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        actorType: {
          type: String,
          enum: ['customer', 'restaurant', 'delivery_partner', 'admin', 'system'],
          default: 'system',
        },
        note: { type: String },
      },
    ],
    estimatedDeliveryTime: { type: Date, required: true },
    placedAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
    preparingAt: { type: Date },
    readyAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
    deliveryPartner: {
      type: Schema.Types.Mixed,
      default: null,
    },
    idempotencyKey: { type: String, required: true },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ restaurantId: 1, status: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrderDocument>('Order', OrderSchema);
