import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Search,
  Sparkles,
  Zap,
  ShieldCheck,
  MapPin,
  Clock,
  Flame,
  ArrowRight,
  Bookmark,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { RatingStars } from '../../components/shared/RatingStars';
import { PriceDisplay } from '../../components/shared/PriceDisplay';

const CUISINES = [
  { id: '1', name: 'Biryani', icon: '🍲', count: '120+ Places' },
  { id: '2', name: 'Pizza', icon: '🍕', count: '85+ Places' },
  { id: '3', name: 'Burgers', icon: '🍔', count: '95+ Places' },
  { id: '4', name: 'North Indian', icon: '🍛', count: '150+ Places' },
  { id: '5', name: 'Chinese', icon: '🥢', count: '110+ Places' },
  { id: '6', name: 'Desserts', icon: '🍰', count: '65+ Places' },
  { id: '7', name: 'South Indian', icon: '🥟', count: '90+ Places' },
  { id: '8', name: 'Healthy Salads', icon: '🥗', count: '45+ Places' },
];

const TOP_RESTAURANTS = [
  {
    id: 'rest-1',
    name: 'Royal Biryani House',
    slug: 'royal-biryani-house',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    cuisines: ['Hyderabadi Biryani', 'North Indian', 'Mughlai'],
    rating: 4.8,
    ratingsCount: 1420,
    eta: '25-30 min',
    costForTwo: 450,
    isPureVeg: false,
    offer: '50% OFF up to ₹100',
    bestsellerDish: 'Chicken Dum Biryani Special',
  },
  {
    id: 'rest-2',
    name: 'Artisan Pizza Workshop',
    slug: 'artisan-pizza-workshop',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    cuisines: ['Wood-fired Pizza', 'Italian', 'Pasta'],
    rating: 4.7,
    ratingsCount: 890,
    eta: '20-25 min',
    costForTwo: 600,
    isPureVeg: false,
    offer: 'FLAT ₹125 OFF',
    bestsellerDish: 'Truffle Mushroom Sourdough Pizza',
  },
  {
    id: 'rest-3',
    name: 'Green Leaf Pure Veg',
    slug: 'green-leaf-pure-veg',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    cuisines: ['South Indian', 'Thali', 'Street Food'],
    rating: 4.9,
    ratingsCount: 2310,
    eta: '15-20 min',
    costForTwo: 300,
    isPureVeg: true,
    offer: 'Free Delivery',
    bestsellerDish: 'Ghee Roast Masala Dosa',
  },
  {
    id: 'rest-4',
    name: 'The Smash Burger Co.',
    slug: 'the-smash-burger-co',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    cuisines: ['American Burgers', 'Fries', 'Shakes'],
    rating: 4.6,
    ratingsCount: 670,
    eta: '20-30 min',
    costForTwo: 500,
    isPureVeg: false,
    offer: '20% OFF',
    bestsellerDish: 'Double Truffle Smash Burger',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/20 blur-[140px] pointer-events-none rounded-full" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center">
          <Badge variant="default" className="mb-6 py-1.5 px-4 text-xs tracking-wider uppercase font-bold shadow-lg">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" /> Powered by AI Delivery Intelligence
          </Badge>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Food Delivered <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-amber-400 to-amber-500">Smarter. Faster. Better.</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
            Discover top-rated local restaurants, enjoy 30-minute express deliveries, and order with 1-click precision.
          </p>

          {/* Hero Search Box */}
          <form onSubmit={handleSearchSubmit} className="mt-10 max-w-2xl mx-auto">
            <div className="glass-panel p-2 rounded-3xl shadow-2xl flex flex-col sm:flex-row gap-2 border-white/10">
              <div className="flex-1 flex items-center px-4 gap-3 bg-card/60 rounded-2xl h-14">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <input
                  type="text"
                  placeholder="Enter dish, cuisine, or restaurant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 font-extrabold px-8 rounded-2xl shadow-lg shadow-primary/30">
                <Search className="h-5 w-5 mr-2" /> Find Food
              </Button>
            </div>
          </form>

          {/* Key Value Props */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-bold text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> 30-Min Delivery Guarantee
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> FSSAI Certified Kitchens
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-400" /> Zero Surge Charges
            </div>
          </div>
        </div>
      </section>

      {/* Cuisines Carousel Section */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Explore By Cuisine</h2>
            <p className="text-sm text-muted-foreground mt-1">Satisfy your cravings with popular categories</p>
          </div>
          <Link to="/search">
            <Button variant="ghost" className="font-bold text-primary hover:text-primary-hover">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {CUISINES.map((c) => (
            <Link
              key={c.id}
              to={`/search?cuisine=${encodeURIComponent(c.name)}`}
              className="glass-card rounded-2xl p-4 text-center hover:border-primary/50 hover:scale-105 transition-all duration-300 group"
            >
              <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{c.icon}</div>
              <h4 className="text-sm font-bold text-foreground truncate">{c.name}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">{c.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Recommendation Banner */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-card via-card/80 to-primary/20 border border-white/10 p-8 sm:p-12 shadow-2xl">
          <div className="max-w-xl relative z-10 space-y-4">
            <Badge variant="bestseller" className="px-3 py-1">
              <Sparkles className="h-3.5 w-3.5 mr-1" /> AI Food Butler
            </Badge>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-foreground leading-tight">
              Not sure what to eat today? Let AI decide.
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our intelligent engine analyzes your taste preferences, local weather, and time of day to curate your perfect meal recommendation.
            </p>
            <Link to="/search">
              <Button size="lg" className="font-extrabold shadow-lg shadow-primary/30 mt-2">
                Surprise Me <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Top Restaurants Grid Section */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Top Restaurants Near You</h2>
            <p className="text-sm text-muted-foreground mt-1">Handpicked culinary masters in your city</p>
          </div>
          <Link to="/search">
            <Button variant="outline" className="font-bold">
              Explore All Restaurants
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TOP_RESTAURANTS.map((rest) => (
            <Card key={rest.id} className="overflow-hidden group cursor-pointer border-border hover:border-primary/40">
              <Link to={`/restaurant/${rest.id}`}>
                {/* Image Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-card">
                  <img
                    src={rest.image}
                    alt={rest.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Veg / Non-Veg Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant={rest.isPureVeg ? 'veg' : 'nonveg'} className="font-bold shadow-md">
                      {rest.isPureVeg ? '100% PURE VEG' : 'NON-VEG & VEG'}
                    </Badge>
                  </div>

                  {/* Offer Pill */}
                  <div className="absolute bottom-3 left-3 bg-primary text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-md">
                    {rest.offer}
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                      {rest.name}
                    </h3>
                    <RatingStars rating={rest.rating} size="sm" showNumber={true} />
                  </div>

                  <p className="text-xs text-muted-foreground truncate">{rest.cuisines.join(', ')}</p>

                  <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" /> {rest.eta}
                    </span>
                    <span>₹{rest.costForTwo} for two</span>
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
