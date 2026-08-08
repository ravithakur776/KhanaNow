import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurantDocument extends Document {
  ownerId?: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  bannerImageUrl: string;
  logoUrl?: string;
  cuisines: string[];
  avgRating: number;
  totalRatings: number;
  costForTwo: number;
  deliveryTimeMinutes: { min: number; max: number };
  distanceKm: number;
  isPureVeg: boolean;
  isOpen: boolean;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  offerBadge?: string;
  fssaiLicenseNumber?: string;
  address: {
    street: string;
    city: string;
    pincode: string;
    location: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
  };
  openingHours?: Array<{ day: string; open: string; close: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const RestaurantSchema = new Schema<IRestaurantDocument>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    bannerImageUrl: { type: String, required: true },
    logoUrl: { type: String },
    cuisines: [{ type: String, required: true }],
    avgRating: { type: Number, default: 4.5, min: 1, max: 5 },
    totalRatings: { type: Number, default: 0 },
    costForTwo: { type: Number, required: true },
    deliveryTimeMinutes: {
      min: { type: Number, default: 20 },
      max: { type: Number, default: 30 },
    },
    distanceKm: { type: Number, default: 2.5 },
    isPureVeg: { type: Boolean, default: false },
    isOpen: { type: Boolean, default: true },
    status: { type: String, enum: ['pending', 'active', 'suspended', 'rejected'], default: 'pending' },
    offerBadge: { type: String },
    fssaiLicenseNumber: { type: String },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [77.2167, 28.6315] },
      },
    },
    openingHours: [
      {
        day: String,
        open: String,
        close: String,
      },
    ],
  },
  { timestamps: true }
);

RestaurantSchema.index({ 'address.location': '2dsphere' });
RestaurantSchema.index({ name: 'text', cuisines: 'text', description: 'text' });
RestaurantSchema.index({ avgRating: -1, costForTwo: 1 });

export const Restaurant = mongoose.model<IRestaurantDocument>('Restaurant', RestaurantSchema);
