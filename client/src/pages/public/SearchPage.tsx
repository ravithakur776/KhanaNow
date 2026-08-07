import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Star, Clock, Sparkles } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { RatingStars } from '../../components/shared/RatingStars';

const ALL_RESTAURANTS = [
  {
    id: 'rest-1',
    name: 'Royal Biryani House',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
    cuisines: ['Biryani', 'North Indian', 'Mughlai'],
    rating: 4.8,
    eta: '25 min',
    costForTwo: 450,
    isPureVeg: false,
  },
  {
    id: 'rest-2',
    name: 'Artisan Pizza Workshop',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    cuisines: ['Pizza', 'Italian', 'Pasta'],
    rating: 4.7,
    eta: '20 min',
    costForTwo: 600,
    isPureVeg: false,
  },
  {
    id: 'rest-3',
    name: 'Green Leaf Pure Veg',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    cuisines: ['South Indian', 'Thali'],
    rating: 4.9,
    eta: '15 min',
    costForTwo: 300,
    isPureVeg: true,
  },
  {
    id: 'rest-4',
    name: 'The Smash Burger Co.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
    cuisines: ['Burgers', 'American'],
    rating: 4.6,
    eta: '20 min',
    costForTwo: 500,
    isPureVeg: false,
  },
  {
    id: 'rest-5',
    name: 'Dragon Bowl Asian Kitchen',
    image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&auto=format&fit=crop&q=80',
    cuisines: ['Chinese', 'Asian', 'Noodles'],
    rating: 4.5,
    eta: '30 min',
    costForTwo: 400,
    isPureVeg: false,
  },
];

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCuisine = searchParams.get('cuisine') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCuisine, setSelectedCuisine] = useState(initialCuisine);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);

  const filteredRestaurants = ALL_RESTAURANTS.filter((r) => {
    if (query && !r.name.toLowerCase().includes(query.toLowerCase()) && !r.cuisines.some((c) => c.toLowerCase().includes(query.toLowerCase()))) {
      return false;
    }
    if (selectedCuisine && !r.cuisines.includes(selectedCuisine)) {
      return false;
    }
    if (isVegOnly && !r.isPureVeg) {
      return false;
    }
    if (minRating && r.rating < minRating) {
      return false;
    }
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
      {/* Search Input Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-foreground">Find Food & Restaurants</h1>
        <div className="relative">
          <Input
            placeholder="Search by restaurant name, dish, or cuisine..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<Search className="h-5 w-5 text-primary" />}
            className="h-14 text-base rounded-2xl"
          />
        </div>
      </div>

      {/* Multi-faceted Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border pb-6">
        <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" /> Filters:
        </span>

        {/* Pure Veg Toggle Pill */}
        <button
          type="button"
          onClick={() => setIsVegOnly(!isVegOnly)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isVegOnly
              ? 'bg-emerald-600 text-white shadow-md'
              : 'border border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          {isVegOnly ? '✓ Pure Veg' : 'Pure Veg'}
        </button>

        {/* Rating > 4.5 Pill */}
        <button
          type="button"
          onClick={() => setMinRating(minRating === 4.5 ? null : 4.5)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
            minRating === 4.5
              ? 'bg-amber-500 text-white shadow-md'
              : 'border border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          <Star className="h-3.5 w-3.5 fill-current" /> Rating 4.5+
        </button>

        {/* Reset Filters */}
        {(selectedCuisine || isVegOnly || minRating || query) && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setSelectedCuisine('');
              setIsVegOnly(false);
              setMinRating(null);
            }}
            className="text-xs font-bold text-destructive hover:underline ml-auto"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Results Count & Grid */}
      <div className="space-y-6">
        <p className="text-sm font-semibold text-muted-foreground">
          Showing <span className="text-foreground font-bold">{filteredRestaurants.length}</span> restaurants
        </p>

        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto text-muted-foreground">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No restaurants match your search</h3>
            <p className="text-sm text-muted-foreground">Try clearing some filters or searching for another dish.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((rest) => (
              <Card key={rest.id} className="overflow-hidden group cursor-pointer border-border hover:border-primary/40">
                <Link to={`/restaurant/${rest.id}`}>
                  <div className="relative h-44 w-full">
                    <img
                      src={rest.image}
                      alt={rest.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant={rest.isPureVeg ? 'veg' : 'nonveg'} className="font-bold">
                        {rest.isPureVeg ? 'PURE VEG' : 'VEG / NON-VEG'}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {rest.name}
                      </h3>
                      <RatingStars rating={rest.rating} size="sm" />
                    </div>

                    <p className="text-xs text-muted-foreground">{rest.cuisines.join(', ')}</p>

                    <div className="flex justify-between text-xs text-muted-foreground font-medium pt-2 border-t border-border/60">
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
        )}
      </div>
    </div>
  );
};
