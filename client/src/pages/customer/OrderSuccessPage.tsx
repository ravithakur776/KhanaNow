import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  MapPin,
  Truck,
  ArrowRight,
  Receipt,
  Home,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useOrderDetails } from '../../services/orderService';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { PriceDisplay } from '../../components/shared/PriceDisplay';
import { Skeleton } from '../../components/ui/skeleton';
import { fadeUp } from '../../config/animations';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams();
  const { data: order, isLoading } = useOrderDetails(orderId);

  useEffect(() => {
    // Fire festive confetti animation upon order creation
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  const formattedEta = order?.estimatedDeliveryTime
    ? new Date(order.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '25-30 Mins';

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Animated Celebration Icon */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-2xl animate-bounce">
          <CheckCircle2 className="h-14 w-14" />
        </div>

        <div className="space-y-2">
          <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30 font-bold uppercase tracking-wider">
            ✓ ORDER PLACED & PAYMENT CAPTURED
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground">
            Thank you for your order!
          </h1>
          <p className="text-xs text-muted-foreground">
            Order Number: <span className="font-mono font-bold text-foreground">{orderId}</span>
          </p>
        </div>

        {/* Real Order Breakdown Card */}
        {isLoading ? (
          <Card className="p-6 space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </Card>
        ) : order ? (
          <Card className="p-6 text-left space-y-4 border-border/80 glass-panel shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h4 className="font-extrabold text-base text-foreground">{order.restaurantId?.name || 'Kitchen'}</h4>
                <p className="text-xs text-muted-foreground">
                  Estimated Arrival: <span className="text-primary font-bold">{formattedEta} (~25 mins)</span>
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-bold text-emerald-400">
                {order.status}
              </Badge>
            </div>

            {/* Items Snapshot */}
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-muted-foreground">
                  <span className="truncate max-w-[220px]">
                    <span className="font-bold text-foreground">{item.quantity}x</span> {item.name}
                  </span>
                  <PriceDisplay amount={item.itemTotal} size="sm" />
                </div>
              ))}
            </div>

            {/* Delivery Destination Snapshot */}
            <div className="border-t border-border pt-3 flex items-start gap-2.5 text-xs text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="leading-relaxed truncate">{order.addressSnapshot?.formattedAddress}</p>
            </div>

            <div className="border-t border-border pt-3 flex justify-between items-center text-sm font-extrabold text-foreground">
              <span>Grand Total</span>
              <PriceDisplay amount={order.pricing?.grandTotal || 0} size="md" />
            </div>
          </Card>
        ) : null}

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to={`/track-order/${orderId}`} className="flex-1">
            <Button size="lg" className="w-full font-extrabold gap-2 shadow-xl shadow-primary/30 h-12">
              <Truck className="h-4 w-4" /> Track Live Order <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to={`/orders/${orderId}`} className="flex-1">
            <Button variant="outline" size="lg" className="w-full font-bold gap-2 h-12 border-border">
              <Receipt className="h-4 w-4" /> View Full Receipt
            </Button>
          </Link>
        </div>

        <div>
          <Link to="/home" className="text-xs font-bold text-muted-foreground hover:text-foreground">
            Continue browsing restaurants →
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
