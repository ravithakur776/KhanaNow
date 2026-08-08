import React from 'react';
import { Star } from 'lucide-react';

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

export const RatingStars: React.FC<RatingInputProps> = ({
  value,
  onChange,
  size = 'md',
  readOnly = false,
}) => {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Star Rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange(star)}
            aria-label={`${star} Star${star > 1 ? 's' : ''}`}
            className={`transition-transform ${
              readOnly ? 'cursor-default' : 'hover:scale-125 focus:outline-none focus:ring-2 focus:ring-primary rounded-md p-0.5'
            }`}
          >
            <Star
              className={`${iconSize} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  : 'text-muted-foreground/30'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export const RatingDistribution: React.FC<{
  avgRating: number;
  totalRatings: number;
  distribution?: Record<number, number>;
}> = ({ avgRating, totalRatings, distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center p-5 rounded-2xl border border-border bg-card/40">
      <div className="sm:col-span-4 text-center sm:border-r border-border sm:pr-6 space-y-1">
        <div className="text-4xl font-black text-foreground flex items-center justify-center gap-1.5">
          <span>{avgRating.toFixed(1)}</span>
          <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
        </div>
        <p className="text-xs text-muted-foreground font-bold">
          Based on {totalRatings} verified reviews
        </p>
      </div>

      <div className="sm:col-span-8 space-y-1.5 text-xs">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = distribution[stars] || 0;
          const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
          return (
            <div key={stars} className="flex items-center gap-2">
              <span className="w-6 font-bold text-foreground text-right">{stars}★</span>
              <div className="flex-1 h-2 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-[11px] text-muted-foreground text-right font-mono">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
