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
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLocationStore } from '../../stores/useLocationStore';
import { useUIStore } from '../../stores/useUIStore';
import { useRestaurants, useCategories } from '../../services/restaurantService';
import { Display, Heading, Text } from '../../components/ui/typography';
import { Container } from '../../components/layout/Container';
import { Section } from '../../components/layout/Section';
import { Grid } from '../../components/layout/Grid';
import { HStack, VStack } from '../../components/layout/Stack';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { RatingStars } from '../../components/shared/RatingStars';
import { PriceDisplay } from '../../components/shared/PriceDisplay';
import { CategoryPill } from '../../components/shared/CategoryPill';
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
  const { openLocationDrawer } = useUIStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedFoodModal, setSelectedFoodModal] = useState<FoodItemDetail | null>(null);

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

  return (
    <div className="space-y-12 pb-20">
      {/* Top Header & Personalized Greeting */}
      <div className="bg-card/40 border-b border-border py-8">
        <Container size="xl">
          <VStack gap="md">
            <HStack justify="between" align="center" className="w-full">
              <div>
                <Text variant="caption" weight="bold" className="text-primary uppercase tracking-widest">
                  {isAuthenticated ? `Welcome back, ${user?.firstName}! 👋` : 'Deliver to your doorstep 🚀'}
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

        {/* Restaurant Listing Section */}
        <div className="space-y-6">
          <HStack justify="between" align="center">
            <div>
              <Heading level="h3">Featured Restaurants</Heading>
              <Text variant="small">Top rated kitchens offering express delivery</Text>
            </div>
            <Link to="/search">
              <Button variant="outline" size="sm" className="font-bold">
                View All Filters <Filter className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </HStack>

          {isLoadingRestaurants ? (
            <Grid cols={4} gap="md">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="space-y-3">
                  <Skeleton className="h-44 w-full rounded-2xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </Grid>
          ) : (
            <Grid cols={4} gap="md">
              {restaurants.map((rest: any) => (
                <Card key={rest._id || rest.id} className="overflow-hidden group cursor-pointer border-border hover:border-primary/40">
                  <Link to={`/restaurant/${rest._id || rest.id}`}>
                    <div className="relative h-44 w-full overflow-hidden bg-card">
                      <img
                        src={rest.bannerImageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80'}
                        alt={rest.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant={rest.isPureVeg ? 'veg' : 'nonveg'} className="font-bold">
                          {rest.isPureVeg ? '100% PURE VEG' : 'VEG & NON-VEG'}
                        </Badge>
                      </div>
                      {rest.offerBadge && (
                        <div className="absolute bottom-3 left-3 bg-primary text-white text-xs font-black px-2.5 py-1 rounded-lg">
                          {rest.offerBadge}
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-3">
                      <HStack justify="between" align="start">
                        <Heading level="h4" className="truncate group-hover:text-primary transition-colors">
                          {rest.name}
                        </Heading>
                        <RatingStars rating={rest.avgRating || 4.8} size="sm" />
                      </HStack>

                      <Text variant="small" className="truncate">
                        {rest.cuisines?.join(', ') || 'Multi-Cuisine'}
                      </Text>

                      <HStack justify="between" align="center" className="border-t border-border/60 pt-3 text-xs text-muted-foreground font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-primary" /> {rest.deliveryTimeMinutes?.min || 20}-{rest.deliveryTimeMinutes?.max || 30} mins
                        </span>
                        <span>₹{rest.costForTwo} for two</span>
                      </HStack>
                    </div>
                  </Link>
                </Card>
              ))}
            </Grid>
          )}
        </div>
      </Container>

      {/* Food Detail Modal Trigger */}
      {selectedFoodModal && (
        <FoodDetailModal
          food={selectedFoodModal}
          onClose={() => setSelectedFoodModal(null)}
        />
      )}
    </div>
  );
};
