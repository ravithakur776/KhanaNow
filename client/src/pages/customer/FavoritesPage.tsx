import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Clock, Star, ArrowRight } from 'lucide-react';
import { useFavorites } from '../../services/restaurantService';
import { Container } from '../../components/layout/Container';
import { Grid } from '../../components/layout/Grid';
import { Heading, Text } from '../../components/ui/typography';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { RatingStars } from '../../components/shared/RatingStars';
import { EmptyState } from '../../components/shared/EmptyState';
import { Skeleton } from '../../components/ui/skeleton';

export const FavoritesPage: React.FC = () => {
  const { data: favorites, isLoading } = useFavorites();

  const favoriteList = favorites || [];

  return (
    <Container size="xl" className="py-8 space-y-6">
      <div className="border-b border-border pb-4">
        <Heading level="h1">Your Favorite Places & Dishes</Heading>
        <Text variant="small">Your saved restaurants and bookmarked culinary delights</Text>
      </div>

      {isLoading ? (
        <Grid cols={3} gap="md">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} className="h-60 w-full rounded-3xl" />
          ))}
        </Grid>
      ) : favoriteList.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-10 w-10 text-rose-500" />}
          title="No Favorites Saved Yet"
          description="Click the heart icon on any restaurant or dish to save them here for 1-click access!"
          actionLabel="Explore Top Restaurants"
          onAction={() => (window.location.href = '/search')}
        />
      ) : (
        <Grid cols={3} gap="md">
          {favoriteList.map((fav: any) => {
            const rest = fav.restaurantId;
            if (!rest) return null;

            return (
              <Card key={fav._id} className="overflow-hidden group cursor-pointer border-border hover:border-primary/40">
                <Link to={`/restaurant/${rest._id}`}>
                  <div className="relative h-44 w-full">
                    <img
                      src={rest.bannerImageUrl || 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80'}
                      alt={rest.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 rounded-full bg-card/80 p-2 text-rose-500">
                      <Heart className="h-4 w-4 fill-current" />
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <Heading level="h4" className="truncate group-hover:text-primary transition-colors">
                      {rest.name}
                    </Heading>
                    <RatingStars rating={rest.avgRating || 4.8} size="sm" />
                    <Text variant="small" className="truncate">{rest.cuisines?.join(', ')}</Text>
                  </div>
                </Link>
              </Card>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};
