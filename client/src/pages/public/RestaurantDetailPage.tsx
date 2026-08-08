import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  MapPin,
  Tag,
  Plus,
  Minus,
  CheckCircle,
  Info,
  Heart,
  ShieldCheck,
  Award,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { PriceDisplay } from '../../components/shared/PriceDisplay';
import { RatingStars } from '../../components/shared/RatingStars';
import { QuantitySelector } from '../../components/shared/QuantitySelector';
import { FoodTag } from '../../components/shared/FoodTag';
import { RestaurantSwitchModal } from '../../components/cart/RestaurantSwitchModal';
import { FoodDetailModal, FoodItemDetail } from '../../components/food/FoodDetailModal';
import { useCartStore } from '../../stores/useCartStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/useUIStore';
import { useToggleFavorite, useCheckFavorite } from '../../services/favoriteService';
import { useRestaurantReviews } from '../../services/reviewService';
import { ReviewCard } from '../../components/reviews/ReviewCard';
import { RatingDistribution } from '../../components/reviews/RatingStars';

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
  fssaiNumber: '10019011000421',
  offers: ['50% OFF up to ₹100 | Use KHANA50', 'Flat ₹100 OFF on orders above ₹600 | WELCOME100'],
  reviews: [
    {
      id: 'rev-1',
      name: 'Aditya Mehta',
      rating: 5,
      comment: 'Authentic Hyderabadi Dum Biryani! The chicken is super tender and the spices are well balanced.',
      date: '2 days ago',
    },
    {
      id: 'rev-2',
      name: 'Pooja Nair',
      rating: 5,
      comment: 'Delivered in under 20 minutes piping hot. Packaging is premium and spill-proof.',
      date: '1 week ago',
    },
  ],
};

const MENU_CATEGORIES = [
  {
    id: 'cat-1',
    name: 'Bestseller Biryani',
    items: [
      {
        foodId: 'dish-1',
        name: 'Hyderabadi Special Chicken Dum Biryani',
        description: 'Authentic long-grain Basmati rice layered with succulent marinated chicken and aromatic saffron spices.',
        price: 340,
        discountedPrice: 290,
        dietaryType: 'non-veg' as const,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
        isBestseller: true,
        spiceLevel: 'medium' as const,
        ingredients: ['Basmati Rice', 'Farm Fresh Chicken', 'Kashmiri Saffron', 'Fried Onions', 'Ghee'],
      },
      {
        foodId: 'dish-2',
        name: 'Royal Veg Paneer Dum Biryani',
        description: 'Fresh cottage cheese cubes spiced and cooked with saffron basmati rice in a sealed handi.',
        price: 290,
        discountedPrice: 250,
        dietaryType: 'veg' as const,
        imageUrl: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=400&auto=format&fit=crop&q=80',
        isBestseller: true,
        spiceLevel: 'mild' as const,
        ingredients: ['Basmati Rice', 'Malai Paneer', 'Carrots', 'Green Peas', 'Saffron'],
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
        discountedPrice: 340,
        dietaryType: 'non-veg' as const,
        imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&auto=format&fit=crop&q=80',
        isBestseller: false,
        spiceLevel: 'spicy' as const,
        ingredients: ['Chicken Drumsticks', 'Cashew Paste', 'Yogurt', 'Chaat Masala'],
      },
      {
        foodId: 'dish-4',
        name: 'Tandoori Malai Chaap',
        description: 'Soya chaap chunks tossed in garlic cream and char-grilled in traditional clay tandoor.',
        price: 260,
        discountedPrice: 220,
        dietaryType: 'veg' as const,
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
        isBestseller: true,
        spiceLevel: 'medium' as const,
        ingredients: ['Soya Chaap', 'Heavy Cream', 'Garlic', 'Green Cardamom'],
      },
    ],
  },
];

export const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal, openCartDrawer } = useUIStore();
  const {
    items,
    restaurantName,
    addItem,
    updateQuantity,
    getItemCount,
    isSwitchModalOpen,
    pendingItem,
    confirmRestaurantSwitch,
    cancelRestaurantSwitch,
  } = useCartStore();

  const [activeCategory, setActiveCategory] = useState('cat-1');
  const [selectedFoodModal, setSelectedFoodModal] = useState<FoodItemDetail | null>(null);
  const { data: reviewsData } = useRestaurantReviews(id);

  // Favorite toggle query/mutation
  const toggleFavoriteMutation = useToggleFavorite();
  const { data: isFavoritedData } = useCheckFavorite(
    { restaurantId: id || MOCK_RESTAURANT.id },
    isAuthenticated
  );

  const [isLocallyFavorited, setIsLocallyFavorited] = useState<boolean | null>(null);
  const isFavorited = isLocallyFavorited !== null ? isLocallyFavorited : (isFavoritedData || false);

  const handleFavoriteClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    const nextState = !isFavorited;
    setIsLocallyFavorited(nextState);

    toggleFavoriteMutation.mutate(
      { restaurantId: id || MOCK_RESTAURANT.id },
      {
        onError: () => {
          setIsLocallyFavorited(!nextState); // Rollback on error
        },
      }
    );
  };

  const getCartQuantity = (foodId: string) => {
    const item = items.find((i) => i.foodId === foodId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="pb-24">
      {/* Banner & Restaurant Header */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden">
        <img
          src={MOCK_RESTAURANT.bannerImage}
          alt={MOCK_RESTAURANT.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 -mt-24 relative z-10 max-w-5xl space-y-8">
        {/* Profile Card */}
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
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {MOCK_RESTAURANT.cuisines.join(' • ')}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {MOCK_RESTAURANT.address}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Favorite Button */}
              <button
                type="button"
                onClick={handleFavoriteClick}
                className={`p-3 rounded-2xl border border-border bg-card/60 transition-all duration-300 hover:scale-105 active:scale-95 ${
                  isFavorited ? 'text-rose-500 border-rose-500/30' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              {/* Rating & Cost Block */}
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
        <div className="sticky top-20 z-30 bg-background/95 backdrop-blur-md py-4 border-b border-border flex gap-3 overflow-x-auto no-scrollbar">
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
              <h3 className="text-xl font-extrabold text-foreground border-b border-border pb-2">
                {category.name}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.items.map((dish) => {
                  const qty = getCartQuantity(dish.foodId);

                  return (
                    <Card
                      key={dish.foodId}
                      className="p-5 border-border/80 glass-card flex justify-between gap-4 hover:border-primary/40 transition-all shadow-md cursor-pointer"
                      onClick={() =>
                        setSelectedFoodModal({
                          ...dish,
                          restaurantId: MOCK_RESTAURANT.id,
                          restaurantName: MOCK_RESTAURANT.name,
                        })
                      }
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <FoodTag type={dish.dietaryType} />
                          {dish.isBestseller && (
                            <Badge variant="bestseller" className="text-[10px]">
                              BESTSELLER
                            </Badge>
                          )}
                        </div>

                        <h4 className="font-extrabold text-base text-foreground leading-snug">
                          {dish.name}
                        </h4>

                        <PriceDisplay amount={dish.price} discountedAmount={dish.discountedPrice} size="md" />

                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                      </div>

                      {/* Image & Quantity Add Button */}
                      <div
                        className="relative flex flex-col items-center shrink-0 w-28"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src={dish.imageUrl}
                          alt={dish.name}
                          className="h-28 w-28 rounded-2xl object-cover border border-border/80"
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
                                  price: dish.discountedPrice || dish.price,
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
                                  price: dish.discountedPrice || dish.price,
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
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Customer Reviews & FSSAI Policies Section */}
        <div className="space-y-6 pt-6 border-t border-border">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-extrabold text-foreground">Verified Customer Reviews</h3>
            {reviewsData?.summary && (
              <span className="text-xs font-bold text-muted-foreground">
                {reviewsData.summary.totalRatings} Reviews • {reviewsData.summary.avgRating} ★
              </span>
            )}
          </div>

          {reviewsData?.summary && (
            <RatingDistribution
              avgRating={reviewsData.summary.avgRating}
              totalRatings={reviewsData.summary.totalRatings}
              distribution={reviewsData.summary.distribution}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviewsData?.reviews?.length === 0 ? (
              <div className="col-span-2 py-8 text-center text-xs text-muted-foreground">
                No reviews yet. Be the first customer to leave a review after your delivery!
              </div>
            ) : (
              reviewsData?.reviews?.map((rev) => (
                <ReviewCard key={rev._id} review={rev} />
              ))
            )}
          </div>

          <div className="p-4 rounded-2xl border border-border bg-card/40 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> FSSAI Verified Kitchen License
            </span>
            <span>Audited for Hygiene & Temperature</span>
          </div>
        </div>
      </div>

      {/* Floating Bottom Cart Bar on Mobile */}
      {getItemCount() > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
          <Button
            onClick={openCartDrawer}
            size="lg"
            className="w-full justify-between font-extrabold shadow-2xl shadow-primary/40 h-14 rounded-2xl"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <span>{getItemCount()} Items in Cart</span>
            </div>
            <div className="flex items-center gap-1">
              <span>View Order</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </Button>
        </div>
      )}

      {/* Food Detail Modal */}
      {selectedFoodModal && (
        <FoodDetailModal
          food={selectedFoodModal}
          onClose={() => setSelectedFoodModal(null)}
          onAddToCart={(food, qty) =>
            addItem({
              foodId: food.foodId,
              name: food.name,
              imageUrl: food.imageUrl,
              price: food.discountedPrice || food.price,
              dietaryType: food.dietaryType,
              quantity: qty,
              restaurantId: food.restaurantId,
              restaurantName: food.restaurantName,
            })
          }
        />
      )}

      {/* Multi-Restaurant Switch Protection Modal */}
      <RestaurantSwitchModal
        isOpen={isSwitchModalOpen}
        currentRestaurantName={restaurantName || 'Current Kitchen'}
        newRestaurantName={pendingItem?.restaurantName || 'New Kitchen'}
        onConfirmReplace={confirmRestaurantSwitch}
        onCancel={cancelRestaurantSwitch}
      />
    </div>
  );
};
