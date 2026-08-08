import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Utensils,
  ShoppingBag,
  Bike,
  Home,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

export interface OrderTimelineProps {
  currentStatus: string;
  statusHistory?: Array<{
    status: string;
    changedAt: string;
    note?: string;
  }>;
}

const TIMELINE_STEPS = [
  { status: 'PLACED', label: 'Order Placed', icon: Clock, desc: 'Received & verified by server' },
  { status: 'CONFIRMED', label: 'Order Confirmed', icon: CheckCircle2, desc: 'Kitchen accepted your order' },
  { status: 'PREPARING', label: 'Kitchen Preparing', icon: Utensils, desc: 'Chef is crafting fresh dishes' },
  { status: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: ShoppingBag, desc: 'Packed & awaiting delivery driver' },
  { status: 'PICKED_UP', label: 'Picked Up', icon: Bike, desc: 'Driver collected your order package' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Bike, desc: 'Driver is on the way to your door' },
  { status: 'DELIVERED', label: 'Order Delivered', icon: Home, desc: 'Enjoy your meal!' },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus, statusHistory = [] }) => {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-center space-y-2">
        <XCircle className="h-10 w-10 text-destructive mx-auto animate-pulse" />
        <h4 className="font-extrabold text-base text-foreground">Order Cancelled</h4>
        <p className="text-xs text-muted-foreground">
          This order was cancelled. Any debited amount has been queued for refund to the original payment source.
        </p>
      </div>
    );
  }

  const currentIndex = TIMELINE_STEPS.findIndex((s) => s.status === currentStatus);
  const activeStepIdx = currentIndex === -1 ? 0 : currentIndex;

  const historyMap = new Map(statusHistory.map((h) => [h.status, h.changedAt]));

  return (
    <div className="space-y-6">
      {/* Horizontal Desktop Bar / Vertical Mobile Flow */}
      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {TIMELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < activeStepIdx;
          const isActive = idx === activeStepIdx;
          const isPending = idx > activeStepIdx;

          const timestamp = historyMap.get(step.status);
          const formattedTime = timestamp
            ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';

          return (
            <div key={step.status} className="flex items-center gap-4 md:flex-col md:text-center z-10 flex-1">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isActive ? 1.15 : 1 }}
                className={`flex h-11 w-11 items-center justify-center rounded-full font-bold text-xs transition-all shadow-md ${
                  isActive
                    ? 'bg-primary text-white ring-4 ring-primary/25 shadow-primary/40 scale-110'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-5 w-5 stroke-[2.5]" /> : <Icon className="h-5 w-5" />}
              </motion.div>

              <div className="space-y-0.5">
                <p
                  className={`text-xs font-black tracking-tight ${
                    isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[10px] text-muted-foreground hidden sm:block">{step.desc}</p>
                {formattedTime && <span className="text-[10px] font-mono font-bold text-emerald-400 block">{formattedTime}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
