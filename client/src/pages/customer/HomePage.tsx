import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Sparkles,
  Zap,
  Flame,
  Clock,
  Star,
  Tag,
  ArrowRight,
  Heart,
  ChevronRight,
  Filter,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useCartStore } from '../../stores/useCartStore';
import { useLocationStore } from '../../stores/useLocationStore';
import { useUIStore } from '../../stores/useUIStore';
import { useRestaurants, useCategories } from '../../services/restaurantService';
import { useToggleFavorite } from '../../services/favoriteService';
import { useHomeRecommendations } from '../../services/recommendationService';
import { Display, Heading, Text } from '../../components/ui/typography';
import { Container } from '../../components/layout/Container';
import { HStack, VStack } from '../../components/layout/Stack';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { PriceDisplay } from '../../components/shared/PriceDisplay';
import { CategoryPill } from '../../components/shared/CategoryPill';
import { FoodTag } from '../../components/shared/FoodTag';
import { Skeleton } from '../../components/ui/skeleton';
import { FoodDetailModal, FoodItemDetail } from '../../components/food/FoodDetailModal';

const PROMO_OFFERS = [
  { id: '1', title: '50% OFF UP TO ₹100', subtitle: 'Use Code KHANA50 on first order', bg: 'from-primary to-amber-600' },
  { id: '2', title: 'FREE EXPRESS DELIVERY', subtitle: 'On orders above ₹499 today', bg: 'from-emerald-600 to-teal-800' },
  { id: '3', title: 'FLAT ₹150 OFF ON BIRYANI', subtitle: 'Weekend Special Feast Offer', bg: 'from-purple-600 to-indigo-800' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { currentLocation } = useLocationStore();
  const { openLocationDrawer, openAuthModal } = useUIStore();
  const { addItem } = useCartStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFoodModal, setSelectedFoodModal] = useState<FoodItemDetail | null>(null);

  const toggleFavoriteMutation = useToggleFavorite();
  const [favMap, setFavMap] = useState<Record<string, boolean>>({});

  const { data: recData, isLoading: isLoadingRecs } = useHomeRecommendations();
  const { data: restaurantResponse, isLoading: isLoadingRestaurants } = useRestaurants({
    search: searchQuery,
    cuisine: selectedCategory,
  });

  const { data: categoriesData } = useCategories();
  const restaurants = restaurantResponse?.data || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent, restId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    const nextState = !favMap[restId];
    setFavMap((prev) => ({ ...prev, [restId]: nextState }));

    toggleFavoriteMutation.mutate(
      { restaurantId: restId },
      {
        onError: () => {
          setFavMap((prev) => ({ ...prev, [restId]: !nextState }));
        },
      }
    );
  };

  const handleQuickAdd = (food: any) => {
    addItem({
      foodId: food._id,
      name: food.name,
      price: food.price,
      quantity: 1,
      imageUrl: food.imageUrl,
      dietaryType: food.dietaryType === 'non_veg' ? 'non-veg' : food.dietaryType,
      restaurantId: food.restaurantId?._id || food.restaurantId,
      restaurantName: food.restaurantId?.name || 'Kitchen',
    });
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Top Header & Personalized Greeting */}
      <div className="bg-card/40 border-b border-border py-8">
        <Container size="xl">
          <VStack gap="md">
            <HStack justify="between" align="center" className="w-full">
              <div>
                <Text variant="caption" weight="bold" className="text-primary uppercase tracking-widest">
                  {isAuthenticated
                    ? `Welcome back, ${user?.firstName || user?.name || 'Foodie'}! 👋`
                    : 'Deliver to your doorstep 🚀'}
                </Text>
                <Heading level="h2">
                  {isAuthenticated ? 'What are you craving for lunch?' : 'Order Food Smarter & Faster'}
                </Heading>
              </div>

              {/* Location Picker Pill */}
              <button
                type="button"
                onClick={openLocationDrawer}
                className="hidden sm:flex items-center gap-2 rounded-2xl border border-border bg-card p-3 text-xs font-semibold hover:border-primary/50 transition-all"
              >
                <MapPin className="h-4 w-4 text-primary animate-bounce" />
                <div className="text-left">
                  <span className="block text-[10px] text-muted-foreground uppercase">Deliver to</span>
                  <span className="block font-bold text-foreground truncate max-w-[140px]">
                    {currentLocation.address}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-1" />
              </button>
            </HStack>

            {/* Global Search Input */}
            <form onSubmit={handleSearchSubmit} className="w-full pt-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for biryani, pizza, burgers, or restaurants..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 rounded-2xl border border-border bg-card/80 pl-12 pr-28 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-lg"
                />
                <Search className="absolute left-4 top-4 h-6 w-6 text-primary" />
                <Button type="submit" size="sm" className="absolute right-2 top-2 h-10 font-bold px-5">
                  Search
                </Button>
              </div>
            </form>
          </VStack>
        </Container>
      </div>

      <Container size="xl" className="space-y-12">
        {/* Promotional Offers Banner Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROMO_OFFERS.map((offer) => (
            <div
              key={offer.id}
              className={`rounded-3xl bg-gradient-to-r ${offer.bg} p-6 text-white shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden group`}
            >
              <div className="space-y-1 relative z-10">
                <Badge variant="secondary" className="bg-white/20 text-white font-extrabold border-none">
                  LIMITED TIME
                </Badge>
                <h3 className="font-extrabold text-xl leading-snug">{offer.title}</h3>
                <p className="text-xs text-white/80">{offer.subtitle}</p>
              </div>

              <Button variant="glass" size="sm" className="w-fit font-bold text-white border-white/20">
                Claim Offer <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          ))}
        </div>

        {/* Dynamic Recommendations Engine Sections */}
        {recData?.sections?.map((section) => (
          <div key={section.id} className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Heading level="h3">{section.title}</Heading>
                <Text variant="small">{section.subtitle}</Text>
              </div>
              {section.id === 'order_again' && (
                <Link to="/orders" className="text-xs font-bold text-primary hover:underline">
                  View Past Orders →
                </Link>
              )}
            </div>

            {section.type === 'foods' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {section.items.map((food: any) => (
                  <Card
                    key={food._id}
                    className="p-4 border-border/80 glass-panel space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-muted">
                        <img src={food.imageUrl} alt={food.name} className="h-full w-full object-cover" />
                        <div className="absolute top-2 left-2">
                          <FoodTag type={food.dietaryType === 'non_veg' ? 'non-veg' : food.dietaryType} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-extrabold text-sm text-foreground truncate">{food.name}</h4>
                          <PriceDisplay amount={food.price} size="sm" />
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {food.restaurantId?.name || 'Kitchen Specialty'}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleQuickAdd(food)}
                      className="w-full font-bold text-xs h-9 shadow-md shadow-primary/20 gap-1.5"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.items.map((rest: any) => (
                  <Link key={rest._id} to={`/restaurant/${rest._id}`}>
                    <Card className="p-4 border-border/80 glass-panel space-y-3 hover:border-primary/50 transition-all">
                      <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-muted">
                        <img src={rest.bannerImageUrl} alt={rest.name} className="h-full w-full object-cover" />
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={(e) => handleToggleFavorite(e, rest._id)}
                            className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white"
                          >
                            <Heart className={`h-4 w-4 ${favMap[rest._id] ? 'fill-primary text-primary' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-extrabold text-base text-foreground truncate">{rest.name}</h4>
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                            <Star className="h-3.5 w-3.5 fill-amber-400" />
                            <span>{rest.avgRating || 4.5}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{rest.cuisines?.join(', ')}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Categories Pills */}
        <div className="space-y-4">
          <HStack justify="between" align="center">
            <Heading level="h3">Popular Categories</Heading>
            <Link to="/search" className="text-xs font-bold text-primary hover:underline">
              View All
            </Link>
          </HStack>

          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
            <CategoryPill
              label="All Cuisines"
              isActive={selectedCategory === ''}
              onClick={() => setSelectedCategory('')}
            />
            {categoriesData?.map((cat: any) => (
              <CategoryPill
                key={cat._id}
                label={cat.name}
                icon={cat.icon}
                isActive={selectedCategory === cat.name}
                onClick={() => setSelectedCategory(cat.name)}
              />
            ))}
          </div>
        </div>

        {/* Featured Restaurants Listing Section */}
        <div className="space-y-6">
          <HStack justify="between" align="center">
            <div>
              <Heading level="h3">Featured Restaurants</Heading>
              <Text variant="small">Top rated kitchens offering express delivery</Text>
            </div>
          </HStack>

          {isLoadingRestaurants ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 rounded-3xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((rest: any) => (
                <Link key={rest._id} to={`/restaurant/${rest._id}`}>
                  <Card className="p-4 border-border/80 glass-panel space-y-3 hover:border-primary/50 transition-all">
                    <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-muted">
                      <img src={rest.bannerImageUrl} alt={rest.name} className="h-full w-full object-cover" />
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={(e) => handleToggleFavorite(e, rest._id)}
                          className="h-8 w-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white"
                        >
                          <Heart className={`h-4 w-4 ${favMap[rest._id] ? 'fill-primary text-primary' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-base text-foreground truncate">{rest.name}</h4>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          <span>{rest.avgRating || 4.5}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{rest.cuisines?.join(', ')}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};
