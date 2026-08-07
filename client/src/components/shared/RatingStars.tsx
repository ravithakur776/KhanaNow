import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  count?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showNumber = true,
  count,
}) => {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;

  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center text-amber-400">
        {Array.from({ length: maxRating }).map((_, index) => {
          const fillPercentage = Math.max(0, Math.min(1, rating - index));
          return (
            <div key={index} className="relative">
              <Star size={iconSize} className="text-muted-foreground/40" />
              {fillPercentage > 0 && (
                <div
                  className="absolute top-0 left-0 overflow-hidden text-amber-400"
                  style={{ width: `${fillPercentage * 100}%` }}
                >
                  <Star size={iconSize} fill="currentColor" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-xs font-bold text-amber-400">
          {rating.toFixed(1)} {count !== undefined && `(${count})`}
        </span>
      )}
    </div>
  );
};
