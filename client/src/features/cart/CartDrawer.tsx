import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, ArrowRight, Trash2, Tag, Check, Bike } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { useUIStore } from '../../stores/useUIStore';
import { QuantitySelector } from '../../components/shared/QuantitySelector';
import { PriceDisplay } from '../../components/shared/PriceDisplay';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const { isCartDrawerOpen, closeCartDrawer } = useUIStore();
  const {
    items,
    restaurantName,
    updateQuantity,
    removeItem,
    clearCart,
    getBillSummary,
    setTip,
    tipAmount,
    couponCode,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartDrawerOpen) return null;

  const bill = getBillSummary();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();

    if (code === 'KHANA50') {
      applyCoupon('KHANA50', 50); // Flat ₹50 off
      setCouponInput('');
    } else if (code === 'WELCOME100') {
      applyCoupon('WELCOME100', 100); // ₹100 off
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try "KHANA50" or "WELCOME100"');
    }
  };

  const handleProceedToCheckout = () => {
    closeCartDrawer();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex h-full w-full max-w-md flex-col bg-card shadow-2xl border-l border-border animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Your Order Cart</h3>
              {restaurantName && (
                <p className="text-xs font-semibold text-primary truncate max-w-[200px]">
                  {restaurantName}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={closeCartDrawer}
            className="rounded-xl p-2 text-muted-foreground hover:bg-white/10 hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Content / Item List */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 animate-pulse">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h4 className="text-lg font-bold text-foreground mb-1">Your cart is empty</h4>
            <p className="text-sm text-muted-foreground mb-6">
              Good food is always waiting for you. Add dishes from your favorite restaurant to order!
            </p>
            <Button onClick={closeCartDrawer} variant="default" className="font-bold">
              Explore Menu
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Item Rows */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-center justify-between gap-4 p-3 rounded-2xl border border-border/80 bg-background/50"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Veg / Non-Veg Indicator Dot */}
                    <div
                      className={`h-3 w-3 rounded-full shrink-0 ${
                        item.dietaryType === 'veg' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <div className="truncate">
                      <h5 className="text-sm font-bold text-foreground truncate">{item.name}</h5>
                      <PriceDisplay amount={item.price} size="sm" />
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {item.selectedOptions.map((o) => o.optionName).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <QuantitySelector
                    size="sm"
                    quantity={item.quantity}
                    onIncrement={() => updateQuantity(item.cartItemId, 1)}
                    onDecrement={() => updateQuantity(item.cartItemId, -1)}
                  />

                  <button
                    type="button"
                    onClick={() => removeItem(item.cartItemId)}
                    className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Delivery Partner Tip Selector */}
            <div className="rounded-2xl border border-border p-4 bg-background/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Bike className="h-4 w-4 text-primary" /> Delivery Partner Tip
              </div>
              <p className="text-[11px] text-muted-foreground">
                100% of your tip goes directly to your delivery partner.
              </p>
              <div className="flex gap-2 pt-1">
                {[20, 30, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setTip(amount)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      tipAmount === amount
                        ? 'bg-primary text-white shadow-md'
                        : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="space-y-2">
              {couponCode ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs text-emerald-400 font-bold">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Code '{couponCode}' applied! (₹{bill.discountAmount} off)
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <Input
                    placeholder="Enter Coupon (e.g. KHANA50)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="h-10 text-xs uppercase"
                  />
                  <Button type="submit" variant="secondary" size="sm" className="h-10 font-bold px-4">
                    Apply
                  </Button>
                </form>
              )}
              {couponError && <p className="text-xs text-destructive">{couponError}</p>}
            </div>

            {/* Bill Summary Breakdown */}
            <div className="rounded-2xl border border-border/80 p-4 space-y-2.5 bg-card/60 text-xs">
              <h5 className="font-bold text-foreground uppercase tracking-wider text-[11px] mb-1">
                Bill Summary
              </h5>
              <div className="flex justify-between text-muted-foreground">
                <span>Item Total</span>
                <PriceDisplay amount={bill.itemTotal} size="sm" />
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span>
                <span>{bill.deliveryFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `₹${bill.deliveryFee}`}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Platform Fee</span>
                <span>₹{bill.platformFee}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Taxes & GST (5%)</span>
                <span>₹{bill.taxAmount}</span>
              </div>
              {bill.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{bill.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Tip</span>
                <span>₹{bill.tipAmount}</span>
              </div>

              <div className="border-t border-border pt-2 flex justify-between font-extrabold text-sm text-foreground">
                <span>To Pay</span>
                <PriceDisplay amount={bill.grandTotal} size="lg" />
              </div>
            </div>
          </div>
        )}

        {/* Footer Sticky Checkout CTA */}
        {items.length > 0 && (
          <div className="border-t border-border p-6 bg-card">
            <Button
              onClick={handleProceedToCheckout}
              size="lg"
              className="w-full justify-between font-extrabold shadow-lg shadow-primary/30"
            >
              <div className="text-left">
                <span className="block text-[10px] opacity-80 uppercase">Grand Total</span>
                <span className="text-base font-mono">₹{bill.grandTotal}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
