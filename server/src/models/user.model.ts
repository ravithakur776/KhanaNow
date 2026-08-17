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
  firstName: string;
  lastName: string;
  name: string; // Virtual property
  email: string;
  phone: string;
  passwordHash: string;
  role: 'customer' | 'restaurant_owner' | 'admin' | 'delivery_partner';
  status: 'active' | 'suspended' | 'blocked';
  avatarUrl?: string;
  isVerified: boolean;
  verificationOTP?: string;
  verificationOTPExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshTokenHash?: string;
  addresses: IAddress[];
  newsletterOptIn?: boolean;
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
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['customer', 'restaurant_owner', 'admin', 'delivery_partner'],
      default: 'customer',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'blocked'],
      default: 'active',
      index: true,
    },
    avatarUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationOTP: { type: String },
    verificationOTPExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    refreshTokenHash: { type: String },
    newsletterOptIn: { type: Boolean, default: false },
    addresses: [AddressSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for full name
UserSchema.virtual('name').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

// GeoIndex for customer location queries
UserSchema.index({ 'addresses.location': '2dsphere' });

export const User = mongoose.model<IUserDocument>('User', UserSchema);
