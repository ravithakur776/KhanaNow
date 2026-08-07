import mongoose, { Schema, Document } from 'mongoose';

export interface IFoodDocument extends Document {
  restaurantId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  discountedPrice?: number;
  dietaryType: 'veg' | 'non-veg' | 'egg';
  spiceLevel?: 'mild' | 'medium' | 'spicy' | 'extra-spicy';
  ingredients?: string[];
  preparationTimeMinutes?: number;
  rating?: number;
  isAvailable: boolean;
  isBestseller: boolean;
  isRecommended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FoodSchema = new Schema<IFoodDocument>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    price: { type: Number, required: true },
    discountedPrice: { type: Number },
    dietaryType: { type: String, enum: ['veg', 'non-veg', 'egg'], default: 'veg' },
    spiceLevel: { type: String, enum: ['mild', 'medium', 'spicy', 'extra-spicy'], default: 'medium' },
    ingredients: [{ type: String }],
    preparationTimeMinutes: { type: Number, default: 15 },
    rating: { type: Number, default: 4.8 },
    isAvailable: { type: Boolean, default: true },
    isBestseller: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
  },
  { timestamps: true }
);

FoodSchema.index({ restaurantId: 1, categoryId: 1 });
FoodSchema.index({ name: 'text', description: 'text' });

export const Food = mongoose.model<IFoodDocument>('Food', FoodSchema);
