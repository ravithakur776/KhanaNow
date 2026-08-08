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
  RotateCcw,
  UtensilsCrossed,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { PriceDisplay } from '../../components/shared/PriceDisplay';
import { RatingStars, RatingDistribution } from '../../components/reviews/RatingStars';
import { QuantitySelector } from '../../components/shared/QuantitySelector';
import { FoodTag } from '../../components/shared/FoodTag';
import { ReviewCard } from '../../components/reviews/ReviewCard';
import { RestaurantSwitchModal } from '../../components/cart/RestaurantSwitchModal';
import { FoodDetailModal, FoodItemDetail } from '../../components/food/FoodDetailModal';
import { useCartStore } from '../../stores/useCartStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUIStore } from '../../stores/useUIStore';
import { useRestaurantDetail } from '../../services/restaurantService';
import { useRestaurantReviews } from '../../services/reviewService';
import { useToggleFavorite, useCheckFavorite } from '../../services/favoriteService';
import { Skeleton } from '../../components/ui/skeleton';

export const RestaurantDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuthStore();
  const { openAuthModal, openCartDrawer } = useUIStore();
  const {
    items,
    restaurantName: cartRestaurantName,
    addItem,
    updateQuantity,
    getItemCount,
    isSwitchModalOpen,
    pendingItem,
    confirmRestaurantSwitch,
    cancelRestaurantSwitch,
  } = useCartStore();

  const [selectedFoodModal, setSelectedFoodModal] = useState<FoodItemDetail | null>(null);
  const [selectedDietFilter, setSelectedDietFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Fetch real backend data
  const { data: detailData, isLoading, isError, refetch } = useRestaurantDetail(id);
  const { data: reviewsData } = useRestaurantReviews(id);

  // Favorite query & mutation
  const { data: isFavorite } = useCheckFavorite({ restaurantId: id }, Boolean(id));
  const toggleFavoriteMutation = useToggleFavorite();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
        <Skeleton className="h-64 sm:h-80 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-2xl md:col-span-2" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
        <div className="space-y-4 pt-6">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !detailData || !detailData.restaurant) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground">Restaurant Not Found</h2>
        <p className="text-xs text-muted-foreground">
          The requested kitchen profile might be suspended, deactivated, or does not exist.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button onClick={() => refetch()} variant="outline" className="font-bold gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Try Again
          </Button>
          <Link to="/home">
            <Button className="font-extrabold text-xs">Explore Other Kitchens</Button>
          </Link>
        </div>
      </div>
    );
  }

  const restaurant = detailData.restaurant;
  const rawFoods: any[] = detailData.foods || [];

  // Filter foods by dietary selection
  const foods = rawFoods.filter((f) => {
    if (selectedDietFilter === 'all') return true;
    if (selectedDietFilter === 'veg') return f.dietaryType === 'veg' || f.dietaryType === 'vegan';
    if (selectedDietFilter === 'non-veg') return f.dietaryType === 'non_veg' || f.dietaryType === 'egg';
    return true;
  });

  const isClosed = !restaurant.isOpen || restaurant.status !== 'active';

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    toggleFavoriteMutation.mutate({ restaurantId: restaurant._id });
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-8 pb-28">
      {/* Hero Banner Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-border bg-card">
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src={restaurant.bannerImageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80'}
            alt={restaurant.name}
            className={`h-full w-full object-cover ${isClosed ? 'grayscale opacity-60' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          {/* Top Actions on Banner */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleFavoriteToggle}
              aria-label="Save to favorites"
              className="h-10 w-10 rounded-2xl bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/80 transition-all"
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-primary text-primary' : ''}`} />
            </button>
          </div>

          {/* Closed Badge */}
          {isClosed && (
            <div className="absolute top-4 left-4 bg-destructive text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-lg uppercase tracking-wider">
              Currently Closed • Not Accepting Orders
            </div>
          )}

          {/* Restaurant Main Info Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-4xl font-black text-foreground drop-shadow-md">
                  {restaurant.name}
                </h1>
                <Badge variant={restaurant.isPureVeg ? 'veg' : 'bestseller'} className="font-bold">
                  {restaurant.isPureVeg ? 'PURE VEG' : 'VEG & NON-VEG'}
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground font-semibold">
                {restaurant.cuisines?.join(' • ')}
              </p>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  {restaurant.address?.street}, {restaurant.address?.city} ({restaurant.address?.pincode})
                </span>
              </div>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex sm:flex-col items-center sm:items-end gap-2 bg-card/80 backdrop-blur-md p-3.5 rounded-2xl border border-border/80">
              <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-base">
                <Star className="h-5 w-5 fill-amber-400" />
                <span>{restaurant.avgRating || 4.5}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  ({restaurant.totalRatings || 0}+ ratings)
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {restaurant.deliveryTimeMinutes?.min || 20}-{restaurant.deliveryTimeMinutes?.max || 30} mins
                </span>
                <span>₹{restaurant.costForTwo} for two</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Special Offers Strip */}
      {restaurant.offerBadge && (
        <div className="p-4 rounded-2xl border border-primary/30 bg-primary/10 flex items-center gap-3 text-xs text-primary font-bold">
          <Tag className="h-4 w-4 shrink-0" />
          <span>{restaurant.offerBadge}</span>
        </div>
      )}

      {/* Menu Filters & Dish List */}
      <div className="space-y-6">
        {/* Diet Tabs */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">Menu Specialties</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Showing {foods.length} freshly prepared culinary specialties
            </p>
          </div>

          <div className="flex bg-card border border-border p-1 rounded-2xl text-xs font-bold">
            {[
              { id: 'all', label: 'All Dishes' },
              { id: 'veg', label: 'Veg Only 🟢' },
              { id: 'non-veg', label: 'Non-Veg 🔴' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedDietFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  selectedDietFilter === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Food Dishes Grid */}
        {foods.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-3 bg-card/30">
            <UtensilsCrossed className="h-10 w-10 text-muted-foreground mx-auto" />
            <h4 className="font-extrabold text-sm text-foreground">No dishes matching filter</h4>
            <p className="text-xs text-muted-foreground">Try clearing dietary filters to view the full kitchen menu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {foods.map((food) => {
              const cartItem = items.find((i) => i.foodId === food._id);
              const isDishAvailable = food.isAvailable && !isClosed;

              return (
                <Card
                  key={food._id}
                  className={`p-5 border-border/80 glass-panel flex justify-between gap-4 transition-all ${
                    !isDishAvailable ? 'opacity-60' : 'hover:border-primary/40'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <FoodTag type={food.dietaryType === 'non_veg' ? 'non-veg' : food.dietaryType} />
                      {food.isBestseller && (
                        <Badge variant="bestseller" className="text-[9px] font-black py-0 px-1.5">
                          BESTSELLER
                        </Badge>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-foreground truncate">{food.name}</h4>
                    <PriceDisplay amount={food.discountedPrice || food.price} size="sm" />
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {food.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-between gap-2 shrink-0">
                    <div className="h-20 w-20 rounded-2xl overflow-hidden bg-muted relative">
                      <img src={food.imageUrl} alt={food.name} className="h-full w-full object-cover" />
                      {!isDishAvailable && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[9px] font-black text-white text-center p-1 uppercase">
                          Sold Out
                        </div>
                      )}
                    </div>

                    {isDishAvailable && (
                      <div>
                        {cartItem ? (
                          <QuantitySelector
                            size="sm"
                            quantity={cartItem.quantity}
                            onIncrement={() => updateQuantity(cartItem.cartItemId, 1)}
                            onDecrement={() => updateQuantity(cartItem.cartItemId, -1)}
                          />
                        ) : (
                          <Button
                            size="sm"
                            onClick={() =>
                              addItem({
                                foodId: food._id,
                                name: food.name,
                                imageUrl: food.imageUrl,
                                price: food.discountedPrice || food.price,
                                dietaryType: food.dietaryType === 'non_veg' ? 'non-veg' : food.dietaryType,
                                quantity: 1,
                                restaurantId: restaurant._id,
                                restaurantName: restaurant.name,
                              })
                            }
                            className="font-extrabold px-5 text-xs h-8 shadow-md shadow-primary/20"
                          >
                            ADD +
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
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
            reviewsData?.reviews?.map((rev) => <ReviewCard key={rev._id} review={rev} />)
          )}
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card/40 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> FSSAI Verified Kitchen License
          </span>
          <span>Audited for Hygiene & Temperature</span>
        </div>
      </div>

      {/* Multi-Restaurant Switch Protection Modal */}
      <RestaurantSwitchModal
        isOpen={isSwitchModalOpen}
        currentRestaurantName={cartRestaurantName || 'Current Kitchen'}
        newRestaurantName={pendingItem?.restaurantName || 'New Kitchen'}
        onConfirmReplace={confirmRestaurantSwitch}
        onCancel={cancelRestaurantSwitch}
      />
    </div>
  );
};
