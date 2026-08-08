import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Tag,
  Check,
  Bike,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  Plus,
} from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { useLocationStore } from '../../stores/useLocationStore';
import { useAvailableCoupons, useValidateCouponMutation } from '../../services/couponService';
import { Container } from '../../components/layout/Container';
import { Grid } from '../../components/layout/Grid';
import { HStack, VStack } from '../../components/layout/Stack';
import { Heading, Text } from '../../components/ui/typography';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { PriceDisplay } from '../../components/shared/PriceDisplay';
import { QuantitySelector } from '../../components/shared/QuantitySelector';
import { FoodTag } from '../../components/shared/FoodTag';
import { RestaurantSwitchModal } from '../../components/cart/RestaurantSwitchModal';
import { fadeUp, staggerContainer, scaleIn } from '../../config/animations';

const SUGGESTED_ADDONS = [
  { id: 'addon-1', name: 'Fresh Mint Chutney & Onions', price: 25, dietaryType: 'veg' as const },
  { id: 'addon-2', name: 'Extra Butter Garlic Naan', price: 65, dietaryType: 'veg' as const },
  { id: 'addon-3', name: 'Gulab Jamun (2 Pcs)', price: 80, dietaryType: 'veg' as const },
];

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentLocation } = useLocationStore();
  const {
    items,
    restaurantId,
    restaurantName,
    updateQuantity,
    removeItem,
    clearCart,
    addItem,
    getBillSummary,
    setTip,
    tipAmount,
    couponCode,
    applyCoupon,
    removeCoupon,
    isSwitchModalOpen,
    pendingItem,
    confirmRestaurantSwitch,
    cancelRestaurantSwitch,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [customTipInput, setCustomTipInput] = useState('');
  const [isCustomTip, setIsCustomTip] = useState(false);

  const bill = getBillSummary();
  const { data: availableCoupons } = useAvailableCoupons(restaurantId || undefined);
  const validateCouponMutation = useValidateCouponMutation();

  const handleApplyCoupon = (codeToApply?: string) => {
    setCouponError('');
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    validateCouponMutation.mutate(
      {
        code,
        itemTotal: bill.itemTotal,
        restaurantId: restaurantId || undefined,
      },
      {
        onSuccess: (data) => {
          applyCoupon(data.coupon.code, data.discountAmount);
          setCouponInput('');
          setCouponError('');
        },
        onError: (err: any) => {
          setCouponError(
            err.response?.data?.message || 'Invalid or expired coupon code.'
          );
        },
      }
    );
  };

  const handleCustomTipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customTipInput, 10);
    if (!isNaN(val) && val >= 0) {
      setTip(val);
      setIsCustomTip(false);
    }
  };

  // Empty Cart State
  if (items.length === 0) {
    return (
      <Container size="md" className="py-20 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="space-y-6 max-w-md mx-auto"
        >
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-2xl border border-primary/20">
            <ShoppingBag className="h-14 w-14 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-foreground">Your cart is waiting</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Explore top local kitchens, discover artisanal dishes, and enjoy 18-minute express delivery.
            </p>
          </div>

          <Link to="/search">
            <Button size="lg" className="font-extrabold px-8 shadow-lg shadow-primary/30 h-12">
              Explore Restaurants <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </Link>
        </motion.div>
      </Container>
    );
  }

  return (
    <div className="pb-24 pt-6">
      <Container size="xl" className="space-y-8">
        {/* Navigation Breadcrumb */}
        <HStack justify="between" align="center">
          <Link
            to="/search"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Continue Shopping
          </Link>

          <button
            type="button"
            onClick={clearCart}
            className="inline-flex items-center gap-1 text-xs font-bold text-destructive hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear Cart
          </button>
        </HStack>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items & Kitchen Info (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Restaurant Info Header Card */}
            <Card className="p-6 border-border/80 glass-panel space-y-3">
              <HStack justify="between" align="center">
                <div>
                  <Badge variant="bestseller" className="text-[10px] uppercase font-black mb-1">
                    Ordering From
                  </Badge>
                  <Heading level="h3">{restaurantName}</Heading>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl">
                  <Clock className="h-3.5 w-3.5" /> 20-25 Mins ETA
                </div>
              </HStack>
            </Card>

            {/* Cart Items List */}
            <div className="space-y-4">
              <Heading level="h4">Order Items ({items.reduce((s, i) => s + i.quantity, 0)})</Heading>

              {items.map((item) => (
                <Card
                  key={item.cartItemId}
                  className="p-5 border-border/80 glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-16 w-16 rounded-2xl object-cover border border-border shrink-0"
                    />
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-2">
                        <FoodTag type={item.dietaryType} />
                        <h4 className="font-extrabold text-sm text-foreground truncate">{item.name}</h4>
                      </div>
                      <PriceDisplay amount={item.price} size="sm" />
                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <p className="text-[11px] text-muted-foreground truncate">
                          + {item.selectedOptions.map((o) => o.optionName).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <QuantitySelector
                      size="md"
                      quantity={item.quantity}
                      onIncrement={() => updateQuantity(item.cartItemId, 1)}
                      onDecrement={() => updateQuantity(item.cartItemId, -1)}
                    />

                    <div className="text-right min-w-[70px]">
                      <span className="font-mono font-black text-sm text-foreground">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.cartItemId)}
                      className="rounded-xl p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Suggested Add-Ons */}
            <Card className="p-6 border-border/80 space-y-4 glass-panel">
              <Heading level="h5">Recommended Add-Ons</Heading>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SUGGESTED_ADDONS.map((addon) => (
                  <div
                    key={addon.id}
                    className="p-3.5 rounded-2xl border border-border bg-card/60 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <FoodTag type={addon.dietaryType} />
                      <h6 className="text-xs font-bold text-foreground mt-1 line-clamp-1">
                        {addon.name}
                      </h6>
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        ₹{addon.price}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        addItem({
                          foodId: addon.id,
                          name: addon.name,
                          imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=80',
                          price: addon.price,
                          dietaryType: addon.dietaryType,
                          quantity: 1,
                          restaurantId: restaurantId || 'rest-1',
                          restaurantName: restaurantName || 'Kitchen',
                        })
                      }
                      className="w-full h-8 text-[11px] font-extrabold gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Bill Summary & Checkout (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Delivery Address Card */}
            <Card className="p-5 border-border/80 glass-panel space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span className="flex items-center gap-1.5 text-primary uppercase tracking-wider">
                  <MapPin className="h-4 w-4" /> Delivery Location
                </span>
              </div>
              <p className="text-xs font-bold text-foreground truncate">{currentLocation.address}</p>
            </Card>

            {/* Coupons Section */}
            <Card className="p-6 border-border/80 glass-panel space-y-4">
              <Heading level="h5">Apply Restaurant Coupon</Heading>

              {couponCode ? (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-400 font-bold">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" /> Code '{couponCode}' applied! (₹{bill.discountAmount} savings)
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-muted-foreground hover:text-destructive text-xs underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleApplyCoupon();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    placeholder="Enter Promo Code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="h-11 text-xs uppercase font-bold"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    isLoading={validateCouponMutation.isPending}
                    className="h-11 font-extrabold px-5"
                  >
                    Apply
                  </Button>
                </form>
              )}

              {couponError && <p className="text-xs text-destructive font-medium">{couponError}</p>}

              {/* Available Coupons List */}
              {availableCoupons && availableCoupons.length > 0 && !couponCode && (
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">
                    Available Offers
                  </span>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {availableCoupons.map((coupon) => (
                      <div
                        key={coupon.code}
                        className="p-3 rounded-2xl border border-border bg-card/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-extrabold text-primary">{coupon.code}</span>
                          <p className="text-[10px] text-muted-foreground">{coupon.description}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleApplyCoupon(coupon.code)}
                          className="h-7 text-xs font-bold text-primary hover:text-primary-hover"
                        >
                          Apply
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Delivery Partner Tip Selector */}
            <Card className="p-6 border-border/80 glass-panel space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Bike className="h-4 w-4 text-primary" /> Delivery Partner Tip
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Thank your delivery partner for bringing your food fresh and fast.
              </p>

              <div className="grid grid-cols-5 gap-2 pt-1">
                {[0, 20, 30, 50].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => {
                      setTip(amount);
                      setIsCustomTip(false);
                    }}
                    className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                      tipAmount === amount && !isCustomTip
                        ? 'bg-primary text-white shadow-md'
                        : 'border border-border bg-card/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {amount === 0 ? 'None' : `₹${amount}`}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setIsCustomTip(true)}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                    isCustomTip
                      ? 'bg-primary text-white shadow-md'
                      : 'border border-border bg-card/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Custom
                </button>
              </div>

              {isCustomTip && (
                <form onSubmit={handleCustomTipSubmit} className="flex gap-2 pt-2">
                  <Input
                    placeholder="Enter tip amount in ₹"
                    type="number"
                    value={customTipInput}
                    onChange={(e) => setCustomTipInput(e.target.value)}
                    className="h-9 text-xs"
                  />
                  <Button type="submit" size="sm" className="h-9 font-bold">
                    Set
                  </Button>
                </form>
              )}
            </Card>

            {/* Bill Summary Breakdown Card */}
            <Card className="p-6 border-border/80 glass-panel space-y-3 text-xs">
              <Heading level="h5" className="mb-2">Bill Summary</Heading>

              <div className="flex justify-between text-muted-foreground">
                <span>Item Total</span>
                <PriceDisplay amount={bill.itemTotal} size="sm" />
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span>
                <span>
                  {bill.isFreeDelivery ? (
                    <span className="text-emerald-400 font-bold">FREE (Order &gt; ₹500)</span>
                  ) : (
                    `₹${bill.deliveryFee}`
                  )}
                </span>
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

              {bill.tipAmount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Tip</span>
                  <span>₹{bill.tipAmount}</span>
                </div>
              )}

              <div className="border-t border-border pt-3 flex justify-between font-extrabold text-base text-foreground">
                <span>Grand Total</span>
                <PriceDisplay amount={bill.grandTotal} size="xl" />
              </div>

              {/* Checkout CTA Button */}
              <Button
                onClick={() => navigate('/checkout')}
                size="lg"
                className="w-full mt-4 font-extrabold text-base h-14 shadow-xl shadow-primary/30 justify-between"
              >
                <span>Proceed to Checkout</span>
                <div className="flex items-center gap-2 font-mono">
                  <span>₹{bill.grandTotal}</span>
                  <ArrowRight className="h-5 w-5" />
                </div>
              </Button>

              <p className="text-[10px] text-center text-muted-foreground pt-1">
                🔒 256-Bit Encrypted 1-Click Checkout Guarantee
              </p>
            </Card>
          </div>
        </div>
      </Container>

      {/* Multi-Restaurant Switch Protection Modal */}
      <RestaurantSwitchModal
        isOpen={isSwitchModalOpen}
        currentRestaurantName={restaurantName || 'Current Kitchen'}
        newRestaurantName={pendingItem?.restaurantName || 'New Kitchen'}
        onConfirmReplace={confirmRestaurantSwitch}
        onCancel={cancelRestaurantSwitch}
      />
    </div>
  );
};
