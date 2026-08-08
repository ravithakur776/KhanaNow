import React from 'react';
import { AlertTriangle, Trash2, ArrowRight, X } from 'lucide-react';
import { Button } from '../ui/button';

interface RestaurantSwitchModalProps {
  isOpen: boolean;
  currentRestaurantName: string;
  newRestaurantName: string;
  onConfirmReplace: () => void;
  onCancel: () => void;
}

export const RestaurantSwitchModal: React.FC<RestaurantSwitchModalProps> = ({
  isOpen,
  currentRestaurantName,
  newRestaurantName,
  onConfirmReplace,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl glass-panel border border-white/10 bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-5 text-center">
        {/* Warning Icon Badge */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg">
          <AlertTriangle className="h-8 w-8 animate-pulse" />
        </div>

        {/* Headline & Description */}
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-foreground">
            Replace items in your cart?
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed px-2">
            Your cart already contains delicious items from{' '}
            <span className="font-bold text-foreground">"{currentRestaurantName}"</span>. A single order can only be placed from one kitchen at a time.
          </p>
        </div>

        {/* Restaurant Transition Pill */}
        <div className="rounded-2xl border border-border bg-card/60 p-3.5 flex items-center justify-between text-xs font-bold text-muted-foreground">
          <span className="truncate max-w-[140px] text-foreground">{currentRestaurantName}</span>
          <ArrowRight className="h-4 w-4 text-primary shrink-0 mx-2" />
          <span className="truncate max-w-[140px] text-primary">{newRestaurantName}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 pt-2">
          <Button
            onClick={onConfirmReplace}
            size="lg"
            variant="default"
            className="w-full font-extrabold gap-2 shadow-lg shadow-primary/30 h-12"
          >
            <Trash2 className="h-4 w-4" /> Clear Cart & Add New Item
          </Button>

          <Button
            onClick={onCancel}
            variant="outline"
            size="lg"
            className="w-full font-bold h-11 border-border"
          >
            Keep Current Cart
          </Button>
        </div>
      </div>
    </div>
  );
};
