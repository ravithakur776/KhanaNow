import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: 'sm' | 'md' | 'lg';
  min?: number;
  max?: number;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrement,
  onDecrement,
  size = 'md',
  min = 0,
  max = 99,
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-xl border border-primary/30 bg-primary/10 font-bold text-primary shadow-sm',
        isSm && 'h-8 px-2 text-xs',
        size === 'md' && 'h-10 px-3 text-sm',
        isLg && 'h-12 px-4 text-base'
      )}
    >
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity <= min}
        className="flex items-center justify-center p-1 transition-transform hover:scale-110 active:scale-95 disabled:opacity-30"
        aria-label="Decrease quantity"
      >
        <Minus size={isSm ? 12 : isLg ? 18 : 14} />
      </button>

      <span className="min-w-[2rem] text-center font-extrabold">{quantity}</span>

      <button
        type="button"
        onClick={onIncrement}
        disabled={quantity >= max}
        className="flex items-center justify-center p-1 transition-transform hover:scale-110 active:scale-95 disabled:opacity-30"
        aria-label="Increase quantity"
      >
        <Plus size={isSm ? 12 : isLg ? 18 : 14} />
      </button>
    </div>
  );
};
