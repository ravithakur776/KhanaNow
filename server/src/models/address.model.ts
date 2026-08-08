import mongoose, { Schema, Document } from 'mongoose';

export interface IAddressDocument extends Document {
  userId: mongoose.Types.ObjectId;
  label: 'Home' | 'Work' | 'Other';
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
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddressDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    landmark: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, default: 'India' },
    latitude: { type: Number },
    longitude: { type: Number },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AddressSchema.index({ userId: 1, isDefault: -1 });

export const Address = mongoose.model<IAddressDocument>('Address', AddressSchema);
