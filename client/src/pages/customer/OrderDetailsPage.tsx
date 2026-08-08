import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Receipt,
  MapPin,
  Clock,
  Truck,
  RotateCcw,
  XCircle,
  ArrowLeft,
  Bike,
  ShieldCheck,
  Tag,
  Phone,
  User as UserIcon,
} from 'lucide-react';
import {
  useOrderDetails,
  useCancelOrderMutation,
  useReorderMutation,
} from '../../services/orderService';
import { useCartStore } from '../../stores/useCartStore';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { PriceDisplay } from '../../components/shared/PriceDisplay';
import { FoodTag } from '../../components/shared/FoodTag';
import { OrderTimeline } from '../../components/orders/OrderTimeline';
import { OrderDetailsSkeleton } from '../../components/orders/OrderSkeletons';
import { fadeUp } from '../../config/animations';

export const OrderDetailsPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const { addItem, clearCart } = useCartStore();

  const { data: order, isLoading, isError } = useOrderDetails(orderNumber);
  const cancelOrderMutation = useCancelOrderMutation();
  const reorderMutation = useReorderMutation();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of delivery plans');

  if (isLoading) {
    return <OrderDetailsSkeleton />;
  }

  if (isError || !order) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <XCircle className="h-12 w-12 text-destructive mx-auto animate-bounce" />
        <h3 className="text-2xl font-extrabold text-foreground">Order Not Found</h3>
        <p className="text-xs text-muted-foreground">The requested order number could not be retrieved.</p>
        <Link to="/orders">
          <Button className="font-bold">View Order History</Button>
        </Link>
      </div>
    );
  }

  const isEligibleForCancel = ['PLACED', 'CONFIRMED'].includes(order.status);

  const handleCancelOrder = () => {
    if (!orderNumber) return;
    cancelOrderMutation.mutate(
      { orderNumber, cancelReason },
      {
        onSuccess: () => {
          setIsCancelModalOpen(false);
        },
      }
    );
  };

  const handleReorder = () => {
    if (!orderNumber) return;
    reorderMutation.mutate(orderNumber, {
      onSuccess: (data) => {
        clearCart();
        data.cartItems.forEach((item: any) => {
          addItem({
            foodId: item.foodId,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            imageUrl: item.imageUrl || '',
            dietaryType: item.dietaryType === 'non_veg' ? 'non-veg' : item.dietaryType,
            restaurantId: data.restaurantId,
            restaurantName: data.restaurantName,
            selectedOptions: item.selectedOptions,
          });
        });
        navigate('/cart');
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link to="/orders" className="p-1 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              Order Receipt
            </h1>
            <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider text-primary">
              {order.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Order <span className="font-mono font-bold text-foreground">{order.orderNumber}</span> • Placed on{' '}
            {new Date(order.placedAt).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2">
          {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
            <Link to={`/track-order/${order.orderNumber}`}>
              <Button size="sm" className="font-extrabold gap-1.5 shadow-md">
                <Truck className="h-4 w-4" /> Track Order
              </Button>
            </Link>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleReorder}
            isLoading={reorderMutation.isPending}
            className="font-bold gap-1.5"
          >
            <RotateCcw className="h-4 w-4" /> Reorder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column (2 Cols): Items & Timeline */}
        <div className="md:col-span-2 space-y-6">
          {/* Timeline Status */}
          <Card className="p-6 border-border/80 glass-panel space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-foreground">
              Order Lifecycle
            </h3>
            <OrderTimeline currentStatus={order.status} statusHistory={order.statusHistory} />
          </Card>

          {/* Items Breakdown Snapshot */}
          <Card className="p-6 border-border/80 glass-panel space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-extrabold text-base text-foreground">
                Items Ordered ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
              </h3>
              <span className="text-xs font-bold text-primary">{order.restaurantId?.name || 'Kitchen'}</span>
            </div>

            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-4 p-3.5 rounded-2xl border border-border bg-card/60"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-xl object-cover" />
                    )}
                    <div className="truncate space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <FoodTag type={item.dietaryType === 'non_veg' ? 'non-veg' : (item.dietaryType as any)} />
                        <span className="text-xs font-bold text-foreground truncate">{item.name}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {item.quantity} x ₹{item.unitPrice}
                      </p>
                    </div>
                  </div>
                  <PriceDisplay amount={item.itemTotal} size="sm" />
                </div>
              ))}
            </div>
          </Card>

          {/* Cancellation Option (When Eligible) */}
          {isEligibleForCancel && (
            <Card className="p-5 border-border/80 bg-card/40 flex items-center justify-between gap-4">
              <div>
                <h5 className="font-bold text-xs text-foreground">Need to cancel this order?</h5>
                <p className="text-[11px] text-muted-foreground">
                  Orders can be cancelled before the kitchen begins cooking.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsCancelModalOpen(true)}
                className="font-extrabold text-xs h-9"
              >
                Cancel Order
              </Button>
            </Card>
          )}
        </div>

        {/* Right Column (1 Col): Bill & Delivery Address */}
        <div className="space-y-6">
          {/* Bill Summary Snapshot */}
          <Card className="p-6 border-border/80 glass-panel space-y-3.5 text-xs">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-foreground border-b border-border pb-2">
              Payment Breakdown
            </h4>

            <div className="flex justify-between text-muted-foreground">
              <span>Item Subtotal</span>
              <PriceDisplay amount={order.pricing.subtotal} size="sm" />
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Fee</span>
              <span>{order.pricing.deliveryFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `₹${order.pricing.deliveryFee}`}</span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Platform Fee</span>
              <span>₹{order.pricing.platformFee}</span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>GST & Taxes (5%)</span>
              <span>₹{order.pricing.taxAmount}</span>
            </div>

            {order.pricing.discount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Coupon Discount</span>
                <span>-₹{order.pricing.discount}</span>
              </div>
            )}

            {order.tip > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Driver Tip</span>
                <span>₹{order.tip}</span>
              </div>
            )}

            <div className="border-t border-border pt-3 flex justify-between font-black text-base text-foreground">
              <span>Total Paid</span>
              <PriceDisplay amount={order.pricing.grandTotal} size="lg" />
            </div>

            <div className="pt-2 text-[10px] text-muted-foreground border-t border-border/40">
              <span className="font-bold">Payment Reference: </span>
              <span className="font-mono">{order.paymentReference}</span>
            </div>
          </Card>

          {/* Delivery Destination Snapshot */}
          <Card className="p-6 border-border/80 glass-panel space-y-3 text-xs">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-foreground border-b border-border pb-2">
              Delivery Address
            </h4>

            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="font-bold text-foreground">{order.addressSnapshot.fullName}</h5>
                <p className="text-muted-foreground leading-relaxed">
                  {order.addressSnapshot.formattedAddress}
                </p>
                <p className="text-[11px] font-mono text-muted-foreground">
                  Phone: {order.addressSnapshot.phone}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl glass-panel border border-white/10 bg-card p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-foreground">Cancel Order</h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to cancel order <span className="font-mono font-bold text-foreground">{order.orderNumber}</span>?
            </p>

            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground"
            >
              <option value="Change of delivery plans">Change of delivery plans</option>
              <option value="Ordered by mistake">Ordered by mistake</option>
              <option value="Delivery time is too long">Delivery time is too long</option>
              <option value="Other reason">Other reason</option>
            </select>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 font-bold"
                onClick={() => setIsCancelModalOpen(false)}
              >
                Keep Order
              </Button>
              <Button
                variant="destructive"
                className="flex-1 font-extrabold"
                isLoading={cancelOrderMutation.isPending}
                onClick={handleCancelOrder}
              >
                Confirm Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
