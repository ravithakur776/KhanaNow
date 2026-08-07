import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  icon?: string;
  imageUrl?: string;
  itemCount?: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    icon: { type: String },
    imageUrl: { type: String },
    itemCount: { type: Number, default: 0 },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Category = mongoose.model<ICategoryDocument>('Category', CategorySchema);
