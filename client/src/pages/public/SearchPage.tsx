import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, Clock, AlertTriangle, RotateCcw } from 'lucide-react';
import { useRestaurants, useCategories } from '../../services/restaurantService';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCuisine = searchParams.get('cuisine') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCuisine, setSelectedCuisine] = useState(initialCuisine);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);

  // Real backend queries
  const { data: restaurantResponse, isLoading, isError, refetch } = useRestaurants({
    search: query || undefined,
    cuisine: selectedCuisine || undefined,
    isPureVeg: isVegOnly ? true : undefined,
    minRating: minRating || undefined,
  });

  const { data: categoriesData } = useCategories();
  const restaurants: any[] = restaurantResponse?.data || [];
  const totalCount = restaurantResponse?.total || restaurants.length;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 max-w-6xl pb-20">
      {/* Search Input Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-foreground">Find Food & Certified Kitchens</h1>
        <div className="relative">
          <Input
            placeholder="Search by restaurant name, dish, or cuisine (e.g. biryani, pizza)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<Search className="h-5 w-5 text-primary" />}
            className="h-14 text-base rounded-2xl shadow-lg"
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

        {/* Cuisine Filter Selector */}
        {categoriesData && categoriesData.length > 0 && (
          <select
            value={selectedCuisine}
            onChange={(e) => setSelectedCuisine(e.target.value)}
            className="h-9 px-3 rounded-xl border border-border bg-card text-xs font-bold text-foreground"
          >
            <option value="">All Cuisines</option>
            {categoriesData.map((cat: any) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        )}

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
          Showing <span className="text-foreground font-bold">{totalCount}</span> kitchens
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-3xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive mx-auto">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Failed to load search results</h3>
            <Button onClick={() => refetch()} variant="outline" className="font-bold text-xs gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" /> Try Again
            </Button>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-16 space-y-4 rounded-3xl border border-dashed border-border p-8 bg-card/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto text-muted-foreground">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground">No kitchens match your search criteria</h3>
            <p className="text-sm text-muted-foreground">Try adjusting or clearing your filters to explore more cuisines.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((rest: any) => (
              <Card key={rest._id} className="overflow-hidden group cursor-pointer border-border hover:border-primary/40 glass-panel">
                <Link to={`/restaurant/${rest._id}`}>
                  <div className="relative h-44 w-full bg-muted">
                    <img
                      src={rest.bannerImageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80'}
                      alt={rest.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant={rest.isPureVeg ? 'veg' : 'bestseller'} className="font-bold">
                        {rest.isPureVeg ? 'PURE VEG' : 'VEG / NON-VEG'}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                        {rest.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>{rest.avgRating || 4.5}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground truncate">{rest.cuisines?.join(', ')}</p>

                    <div className="flex justify-between text-xs text-muted-foreground font-medium pt-2 border-t border-border/60">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-primary" /> {rest.deliveryTimeMinutes?.min || 20}-{rest.deliveryTimeMinutes?.max || 30} mins
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
