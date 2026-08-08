import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Bike,
  Utensils,
  ShieldCheck,
  RotateCcw,
  ArrowLeft,
  Receipt,
  Headphones,
} from 'lucide-react';
import { useOrderTracking } from '../../services/orderService';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { PriceDisplay } from '../../components/shared/PriceDisplay';
import { OrderTimeline } from '../../components/orders/OrderTimeline';
import { OrderTrackingSkeleton } from '../../components/orders/OrderSkeletons';
import { fadeUp } from '../../config/animations';

export const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: tracking, isLoading, isError } = useOrderTracking(orderId);

  if (isLoading) {
    return <OrderTrackingSkeleton />;
  }

  if (isError || !tracking) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h3 className="text-2xl font-extrabold text-foreground">Tracking Not Available</h3>
        <p className="text-xs text-muted-foreground">The tracking information for this order is not active or not found.</p>
        <Link to="/orders">
          <Button className="font-bold">View Past Orders</Button>
        </Link>
      </div>
    );
  }

  const formattedEta = tracking.estimatedDeliveryTime
    ? new Date(tracking.estimatedDeliveryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '25-30 Mins';

  const isCompleted = tracking.status === 'DELIVERED';
  const isCancelled = tracking.status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Order Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link to="/orders" className="p-1 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Live Order Tracking</h1>
            <Badge
              variant={isCancelled ? 'destructive' : isCompleted ? 'veg' : 'bestseller'}
              className="animate-pulse font-extrabold"
            >
              {isCancelled ? 'CANCELLED' : isCompleted ? 'DELIVERED' : 'LIVE'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Order <span className="font-mono font-bold text-foreground">{tracking.orderNumber}</span> • {tracking.restaurant?.name || 'Kitchen'}
          </p>
        </div>

        {!isCompleted && !isCancelled && (
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-2xl text-primary font-bold text-sm shadow-md">
            <Clock className="h-4 w-4 animate-spin" /> Arriving by {formattedEta}
          </div>
        )}
      </motion.div>

      {/* Stepper Timeline Visual */}
      <Card className="p-8 border-border/80 glass-panel space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-extrabold text-base text-foreground">Order Progress</h3>
          <span className="text-xs font-bold text-emerald-400">
            {isCompleted ? '✓ Delivered to Doorstep' : isCancelled ? '✕ Order Cancelled' : '⚡ 18-25 Mins Express'}
          </span>
        </div>

        <OrderTimeline currentStatus={tracking.status} statusHistory={tracking.statusHistory} />
      </Card>

      {/* Delivery Driver Info Widget */}
      <Card className="p-6 border-border/80 glass-panel flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary font-bold text-xl shadow-md">
            <Bike className="h-7 w-7" />
          </div>
          <div>
            <h4 className="font-extrabold text-foreground">
              {tracking.deliveryPartner?.name || 'Delivery Partner'}
            </h4>
            <p className="text-xs text-muted-foreground">
              {tracking.deliveryPartner
                ? `${tracking.deliveryPartner.vehicleType} • ${tracking.deliveryPartner.vehicleNumber}`
                : 'Delivery partner will be assigned as soon as the kitchen packs your meal.'}
            </p>
          </div>
        </div>

        {tracking.deliveryPartner?.phone ? (
          <a href={`tel:${tracking.deliveryPartner.phone}`}>
            <Button variant="outline" className="gap-2 font-bold h-11 border-border">
              <Phone className="h-4 w-4 text-emerald-400" /> Call Partner
            </Button>
          </a>
        ) : (
          <Link to={`/orders/${tracking.orderNumber}`}>
            <Button variant="outline" className="gap-2 font-bold h-11 border-border">
              <Receipt className="h-4 w-4" /> View Full Receipt
            </Button>
          </Link>
        )}
      </Card>

      {/* Delivery Address & Summary Widget */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <Card className="p-5 border-border/80 glass-panel space-y-2">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <MapPin className="h-4 w-4 text-primary" /> Delivery Destination
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {tracking.deliveryAddress?.formattedAddress}
          </p>
        </Card>

        <Card className="p-5 border-border/80 glass-panel space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="font-bold text-foreground block">Items In Delivery</span>
            <p className="text-muted-foreground line-clamp-2">
              {tracking.itemsSummary?.join(', ')}
            </p>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-border/40">
            <span className="text-muted-foreground">Grand Total:</span>
            <PriceDisplay amount={tracking.grandTotal} size="sm" />
          </div>
        </Card>
      </div>
    </div>
  );
};
