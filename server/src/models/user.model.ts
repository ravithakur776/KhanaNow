import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress {
  _id?: mongoose.Types.ObjectId;
  label: 'Home' | 'Work' | 'Other';
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  isDefault: boolean;
}

export interface IUserDocument extends Document {
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: 'customer' | 'restaurant_owner' | 'admin' | 'delivery_partner';
  avatarUrl?: string;
  isVerified: boolean;
  refreshTokenHash?: string;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
  streetAddress: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
  },
  isDefault: { type: Boolean, default: false },
});

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'restaurant_owner', 'admin', 'delivery_partner'],
      default: 'customer',
    },
    avatarUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    refreshTokenHash: { type: String },
    addresses: [AddressSchema],
  },
  {
    timestamps: true,
  }
);

// GeoIndex for customer location queries
UserSchema.index({ 'addresses.location': '2dsphere' });

export const User = mongoose.model<IUserDocument>('User', UserSchema);
