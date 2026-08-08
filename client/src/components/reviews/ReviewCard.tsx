import React from 'react';
import { ShieldCheck, User } from 'lucide-react';
import { RatingStars } from './RatingStars';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { ReviewItem } from '../../services/reviewService';

export const ReviewCard: React.FC<{ review: ReviewItem }> = ({ review }) => {
  return (
    <Card className="p-5 border-border/80 glass-panel space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {review.userId?.avatarUrl ? (
              <img src={review.userId.avatarUrl} alt="User" className="h-full w-full rounded-full object-cover" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-foreground">
                {review.userId?.firstName} {review.userId?.lastName}
              </span>
              {review.isVerifiedPurchase && (
                <Badge variant="veg" className="text-[9px] font-bold gap-1 py-0 px-1.5">
                  <ShieldCheck className="h-3 w-3" /> Verified Purchase
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <RatingStars value={review.rating} readOnly size="sm" onChange={() => {}} />
      </div>

      {review.title && (
        <h5 className="font-extrabold text-xs text-foreground">{review.title}</h5>
      )}

      <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>

      {review.foodId && (
        <div className="flex items-center gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
          <span className="font-bold text-foreground">Reviewed dish:</span>
          <span>{review.foodId.name}</span>
        </div>
      )}
    </Card>
  );
};
