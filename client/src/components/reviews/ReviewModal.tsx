import React, { useState } from 'react';
import { Star, ShieldCheck, X, CheckCircle2 } from 'lucide-react';
import { RatingStars } from './RatingStars';
import { useCreateReviewMutation } from '../../services/reviewService';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  items?: Array<{ foodId: string; name: string }>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  restaurantId,
  restaurantName,
  items = [],
}) => {
  const [rating, setRating] = useState<number>(5);
  const [selectedFoodId, setSelectedFoodId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const createReviewMutation = useCreateReviewMutation();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment || comment.trim().length < 3) return;

    createReviewMutation.mutate(
      {
        orderId,
        restaurantId,
        foodId: selectedFoodId || undefined,
        rating,
        title: title.trim() || undefined,
        comment: comment.trim(),
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setTimeout(() => {
            setSubmitted(false);
            onClose();
          }, 1800);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <Card className="p-6 max-w-md w-full border-border/80 glass-panel space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-extrabold text-foreground">Thank you for your review!</h3>
            <p className="text-xs text-muted-foreground">
              Your feedback helps {restaurantName} and the foodie community.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-1">
                <ShieldCheck className="h-3.5 w-3.5" /> Verified Purchase Order #{orderNumber}
              </div>
              <h3 className="text-lg font-extrabold text-foreground">Rate your meal from {restaurantName}</h3>
            </div>

            {/* Star Rating Input */}
            <div className="flex flex-col items-center justify-center py-2 space-y-1">
              <RatingStars value={rating} onChange={setRating} size="lg" />
              <span className="text-xs font-bold text-muted-foreground">
                {rating === 5 ? 'Exceptional! 🌟' : rating === 4 ? 'Great food! 👍' : rating === 3 ? 'Average' : 'Could be better'}
              </span>
            </div>

            {/* Optional Specific Dish Selector */}
            {items.length > 0 && (
              <div className="space-y-1 text-xs">
                <label className="font-bold text-muted-foreground">Which dish are you reviewing?</label>
                <select
                  value={selectedFoodId}
                  onChange={(e) => setSelectedFoodId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground"
                >
                  <option value="">Whole Restaurant Order</option>
                  {items.map((i) => (
                    <option key={i.foodId} value={i.foodId}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Input
              label="Review Headline (Optional)"
              placeholder="e.g. Delicious biryani and fast delivery!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-xs"
              maxLength={120}
            />

            <div className="space-y-1 text-xs">
              <label className="font-bold text-muted-foreground">Detailed Feedback</label>
              <textarea
                placeholder="How was the taste, packaging, and temperature of the food?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                minLength={3}
                maxLength={1000}
                rows={3}
                className="w-full p-3 rounded-xl border border-border bg-card text-xs text-foreground resize-none"
              />
            </div>

            {createReviewMutation.isError && (
              <p className="text-xs text-destructive font-semibold">
                {(createReviewMutation.error as any)?.response?.data?.message || 'Failed to submit review.'}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 font-bold text-xs h-10">
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={createReviewMutation.isPending}
                className="flex-1 font-extrabold text-xs h-10 shadow-lg shadow-primary/30"
              >
                Submit Review
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};
