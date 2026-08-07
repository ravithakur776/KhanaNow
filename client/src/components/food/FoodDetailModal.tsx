import React, { useState } from 'react';
import { X, Star, Clock, Flame, Heart, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { FoodTag } from '../shared/FoodTag';
import { PriceDisplay } from '../shared/PriceDisplay';
import { RatingStars } from '../shared/RatingStars';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { QuantitySelector } from '../shared/QuantitySelector';

export interface FoodItemDetail {
  foodId: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  dietaryType: 'veg' | 'non-veg' | 'egg';
  imageUrl: string;
  rating?: number;
  spiceLevel?: 'mild' | 'medium' | 'spicy' | 'extra-spicy';
  ingredients?: string[];
  preparationTimeMinutes?: number;
  restaurantId: string;
  restaurantName: string;
}

interface FoodDetailModalProps {
  food: FoodItemDetail | null;
  onClose: () => void;
  onAddToCart?: (food: FoodItemDetail, quantity: number) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  food,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  if (!food) return null;

  const spiceEmoji = {
    mild: '🌱 Mild',
    medium: '🌶️ Medium Spice',
    spicy: '🌶️🌶️ Hot & Spicy',
    'extra-spicy': '🔥 Extra Spicy',
  }[food.spiceLevel || 'medium'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl glass-panel border border-white/10 bg-card shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-black/50 p-2 text-white hover:bg-black/80 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Dish Image */}
        <div className="relative h-64 w-full shrink-0">
          <img src={food.imageUrl} alt={food.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-black/30" />

          <div className="absolute top-4 left-4">
            <FoodTag type={food.dietaryType} size="md" />
          </div>

          <button
            type="button"
            onClick={() => setIsFavorited(!isFavorited)}
            className={`absolute bottom-4 right-4 rounded-full p-2.5 glass-panel transition-transform active:scale-95 ${
              isFavorited ? 'text-rose-500 fill-current' : 'text-white'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Dish Info Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-1">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {food.restaurantName}
            </span>
            <h3 className="text-2xl font-extrabold text-foreground">{food.name}</h3>
            <div className="flex items-center gap-3 pt-1">
              <PriceDisplay amount={food.price} discountedAmount={food.discountedPrice} size="xl" />
              {food.rating && <RatingStars rating={food.rating} size="sm" />}
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">{food.description}</p>

          {/* Key Badges (Spice Level, Prep Time) */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Badge variant="outline" className="text-xs font-bold">
              {spiceEmoji}
            </Badge>
            <Badge variant="outline" className="text-xs font-bold text-primary">
              <Clock className="h-3.5 w-3.5 mr-1" /> {food.preparationTimeMinutes || 15} Mins Prep Time
            </Badge>
          </div>

          {/* Ingredients Checklist */}
          {food.ingredients && food.ingredients.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/60">
              <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Key Ingredients
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {food.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-card/80 border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                  >
                    • {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer Add to Cart */}
        <div className="border-t border-border p-5 bg-card/90 flex items-center justify-between gap-4 shrink-0">
          <QuantitySelector
            size="md"
            quantity={quantity}
            onIncrement={() => setQuantity(quantity + 1)}
            onDecrement={() => setQuantity(Math.max(1, quantity - 1))}
          />

          <Button
            onClick={() => {
              if (onAddToCart) onAddToCart(food, quantity);
              onClose();
            }}
            size="lg"
            className="flex-1 font-extrabold shadow-lg shadow-primary/30 h-12"
          >
            Add {quantity} to Order • ₹
            {((food.discountedPrice || food.price) * quantity).toLocaleString('en-IN')}
          </Button>
        </div>
      </div>
    </div>
  );
};
