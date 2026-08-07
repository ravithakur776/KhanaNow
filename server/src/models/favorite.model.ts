import mongoose, { Schema, Document } from 'mongoose';

export interface IFavoriteDocument extends Document {
  userId: mongoose.Types.ObjectId;
  restaurantId?: mongoose.Types.ObjectId;
  foodId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavoriteDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant' },
    foodId: { type: Schema.Types.ObjectId, ref: 'Food' },
  },
  { timestamps: true }
);

FavoriteSchema.index({ userId: 1, restaurantId: 1 }, { unique: true, sparse: true });
FavoriteSchema.index({ userId: 1, foodId: 1 }, { unique: true, sparse: true });

export const Favorite = mongoose.model<IFavoriteDocument>('Favorite', FavoriteSchema);
