import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, ShieldCheck, CheckCircle2, Truck, ArrowRight, Building } from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLocationStore } from '../../stores/useLocationStore';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { PriceDisplay } from '../../components/shared/PriceDisplay';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, restaurantName, getBillSummary, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { currentLocation } = useLocationStore();

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);

  const bill = getBillSummary();

  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Button onClick={() => navigate('/')}>Browse Restaurants</Button>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      clearCart();
      const mockOrderId = `KN-${Math.floor(100000 + Math.random() * 900000)}`;
      navigate(`/order-success/${mockOrderId}`);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Step 1 & Step 2: Address and Payment Method */}
      <div className="lg:col-span-2 space-y-6">
        {/* Delivery Address Card */}
        <Card className="p-6 space-y-4 border-border">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Delivery Address</h3>
              <p className="text-xs text-muted-foreground">Select or enter your delivery destination</p>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-primary tracking-wider">
                Current Location ({currentLocation.label || 'Home'})
              </span>
              <span className="text-xs font-bold text-emerald-400">✓ Deliver Here</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{currentLocation.address}</p>
            <p className="text-xs text-muted-foreground">{currentLocation.city} - {currentLocation.pincode}</p>
          </div>
        </Card>

        {/* Payment Method Card */}
        <Card className="p-6 space-y-4 border-border">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Payment Method</h3>
              <p className="text-xs text-muted-foreground">Choose your preferred payment gateway</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Razorpay Option */}
            <div
              onClick={() => setPaymentMethod('razorpay')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'razorpay'
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border bg-card/60 hover:border-border/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-foreground">Online Pay (Razorpay)</span>
                <span className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                  {paymentMethod === 'razorpay' && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">UPI, Credit/Debit Cards, Net Banking, Wallets</p>
            </div>

            {/* Cash on Delivery Option */}
            <div
              onClick={() => setPaymentMethod('cod')}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                paymentMethod === 'cod'
                  ? 'border-primary bg-primary/10 shadow-md'
                  : 'border-border bg-card/60 hover:border-border/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-foreground">Pay on Delivery</span>
                <span className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                  {paymentMethod === 'cod' && <span className="h-2 w-2 rounded-full bg-primary" />}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Pay via cash or UPI to driver on arrival</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Order Summary Sidebar */}
      <div className="space-y-6">
        <Card className="p-6 space-y-4 border-border">
          <h3 className="font-bold text-lg text-foreground border-b border-border pb-3">
            Order Breakdown
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.cartItemId} className="flex justify-between text-xs font-semibold">
                <span className="text-foreground truncate max-w-[180px]">
                  {item.quantity}x {item.name}
                </span>
                <PriceDisplay amount={item.price * item.quantity} size="sm" />
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Item Subtotal</span>
              <PriceDisplay amount={bill.itemTotal} size="sm" />
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Charges</span>
              <span>{bill.deliveryFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `₹${bill.deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Taxes & Fees</span>
              <span>₹{bill.taxAmount + bill.platformFee}</span>
            </div>
            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Discount Applied</span>
                <span>-₹{bill.discountAmount}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between text-base font-extrabold text-foreground">
              <span>Total Payable</span>
              <PriceDisplay amount={bill.grandTotal} size="lg" />
            </div>
          </div>

          <Button
            onClick={handlePlaceOrder}
            isLoading={isProcessing}
            size="lg"
            className="w-full font-extrabold text-base shadow-lg shadow-primary/30 h-13"
          >
            Place Order • ₹{bill.grandTotal}
          </Button>
        </Card>
      </div>
    </div>
  );
};
