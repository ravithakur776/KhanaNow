import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Clock, MapPin, Tag, Plus, Minus, CheckCircle, Info } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { PriceDisplay } from '../../components/shared/PriceDisplay';
import { RatingStars } from '../../components/shared/RatingStars';
import { QuantitySelector } from '../../components/shared/QuantitySelector';
import { useCartStore } from '../../stores/useCartStore';
import { useUIStore } from '../../stores/useUIStore';

const MOCK_RESTAURANT = {
  id: 'rest-1',
  name: 'Royal Biryani House',
  cuisines: ['Hyderabadi Biryani', 'North Indian', 'Mughlai Kebabs'],
  rating: 4.8,
  ratingsCount: 1420,
  eta: '25-30 min',
  costForTwo: 450,
  address: 'Block M, Connaught Place, New Delhi',
  bannerImage: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&auto=format&fit=crop&q=80',
  isPureVeg: false,
  offers: ['50% OFF up to ₹100 | Use KHANA50', 'Flat ₹100 OFF on orders above ₹600 | WELCOME100'],
};

const MENU_CATEGORIES = [
  {
    id: 'cat-1',
    name: 'Bestseller Biryani',
    items: [
      {
        foodId: 'dish-1',
        name: 'Hyderabadi Special Chicken Dum Biryani',
        description: 'Authentic long-grain Basmati rice layered with succulent marinated chicken and aromatic spices.',
        price: 340,
        dietaryType: 'non-veg' as const,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
        isBestseller: true,
      },
      {
        foodId: 'dish-2',
        name: 'Royal Veg Paneer Dum Biryani',
        description: 'Fresh cottage cheese cubes spiced and cooked with saffron basmati rice.',
        price: 290,
        dietaryType: 'veg' as const,
        imageUrl: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=400&auto=format&fit=crop&q=80',
        isBestseller: true,
      },
    ],
  },
  {
    id: 'cat-2',
    name: 'Starters & Kebabs',
    items: [
      {
        foodId: 'dish-3',
        name: 'Murgh Tangdi Kebab (4 Pcs)',
        description: 'Chicken drumsticks marinated in rich cashew cream yogurt paste and char-grilled.',
        price: 380,
        dietaryType: 'non-veg' as const,
        imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&auto=format&fit=crop&q=80',
        isBestseller: false,
      },
      {
        foodId: 'dish-4',
        name: 'Tandoori Malai Chaap',
        description: 'Soya chaap chunks tossed in garlic cream and char-grilled in tandoor.',
        price: 260,
        dietaryType: 'veg' as const,
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
        isBestseller: true,
      },
    ],
  },
];

export const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams();
  const { items, addItem, updateQuantity, getItemCount } = useCartStore();
  const { openCartDrawer } = useUIStore();
  const [activeCategory, setActiveCategory] = useState('cat-1');

  const getCartQuantity = (foodId: string) => {
    const item = items.find((i) => i.foodId === foodId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="pb-20">
      {/* Banner & Restaurant Header */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden">
        <img
          src={MOCK_RESTAURANT.bannerImage}
          alt={MOCK_RESTAURANT.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 -mt-24 relative z-10 max-w-5xl">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground">
                  {MOCK_RESTAURANT.name}
                </h1>
                <Badge variant={MOCK_RESTAURANT.isPureVeg ? 'veg' : 'nonveg'} className="font-bold">
                  {MOCK_RESTAURANT.isPureVeg ? 'PURE VEG' : 'VEG & NON-VEG'}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {MOCK_RESTAURANT.cuisines.join(' • ')}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {MOCK_RESTAURANT.address}
              </p>
            </div>

            <div className="flex items-center gap-3 border border-border p-3 rounded-2xl bg-card/60">
              <div className="text-center px-2">
                <RatingStars rating={MOCK_RESTAURANT.rating} size="lg" showNumber={true} />
                <span className="block text-[10px] text-muted-foreground mt-0.5">
                  {MOCK_RESTAURANT.ratingsCount}+ ratings
                </span>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center px-2">
                <span className="flex items-center text-xs font-bold text-foreground justify-center">
                  <Clock className="h-3.5 w-3.5 text-primary mr-1" /> {MOCK_RESTAURANT.eta}
                </span>
                <span className="block text-[10px] text-muted-foreground mt-0.5">
                  ₹{MOCK_RESTAURANT.costForTwo} for two
                </span>
              </div>
            </div>
          </div>

          {/* Offers Carousel */}
          <div className="flex gap-3 overflow-x-auto pt-2 pb-1 no-scrollbar">
            {MOCK_RESTAURANT.offers.map((offer, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary shrink-0"
              >
                <Tag className="h-3.5 w-3.5" /> {offer}
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Menu Category Navigation */}
        <div className="sticky top-20 z-30 bg-background/95 backdrop-blur-md py-4 border-b border-border my-8 flex gap-3 overflow-x-auto">
          {MENU_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'border border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.name} ({cat.items.length})
            </button>
          ))}
        </div>

        {/* Menu Items List */}
        <div className="space-y-12">
          {MENU_CATEGORIES.map((category) => (
            <div key={category.id} id={category.id} className="space-y-6">
              <h3 className="text-xl font-bold text-foreground border-b border-border pb-2">
                {category.name}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.items.map((dish) => {
                  const qty = getCartQuantity(dish.foodId);

                  return (
                    <div
                      key={dish.foodId}
                      className="flex justify-between gap-4 p-5 rounded-3xl border border-border bg-card/60 hover:border-primary/40 transition-all shadow-md"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-3 w-3 rounded-full shrink-0 ${
                              dish.dietaryType === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          {dish.isBestseller && (
                            <Badge variant="bestseller" className="text-[10px]">
                              BESTSELLER
                            </Badge>
                          )}
                        </div>

                        <h4 className="font-bold text-base text-foreground leading-snug">
                          {dish.name}
                        </h4>

                        <PriceDisplay amount={dish.price} size="md" />

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                      </div>

                      {/* Image & Quantity Add Button */}
                      <div className="relative flex flex-col items-center shrink-0 w-28">
                        <img
                          src={dish.imageUrl}
                          alt={dish.name}
                          className="h-28 w-28 rounded-2xl object-cover"
                        />

                        <div className="absolute -bottom-3">
                          {qty > 0 ? (
                            <QuantitySelector
                              size="sm"
                              quantity={qty}
                              onIncrement={() =>
                                addItem({
                                  foodId: dish.foodId,
                                  name: dish.name,
                                  imageUrl: dish.imageUrl,
                                  price: dish.price,
                                  dietaryType: dish.dietaryType,
                                  quantity: 1,
                                  restaurantId: MOCK_RESTAURANT.id,
                                  restaurantName: MOCK_RESTAURANT.name,
                                })
                              }
                              onDecrement={() => {
                                const cartItem = items.find((i) => i.foodId === dish.foodId);
                                if (cartItem) updateQuantity(cartItem.cartItemId, -1);
                              }}
                            />
                          ) : (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() =>
                                addItem({
                                  foodId: dish.foodId,
                                  name: dish.name,
                                  imageUrl: dish.imageUrl,
                                  price: dish.price,
                                  dietaryType: dish.dietaryType,
                                  quantity: 1,
                                  restaurantId: MOCK_RESTAURANT.id,
                                  restaurantName: MOCK_RESTAURANT.name,
                                })
                              }
                              className="font-extrabold px-6 shadow-md"
                            >
                              ADD +
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
