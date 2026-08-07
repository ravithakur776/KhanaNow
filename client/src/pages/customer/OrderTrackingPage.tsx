import React from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, Phone, Bike, Utensils, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

const TIMELINE_STEPS = [
  { label: 'Order Placed', time: '12:15 PM', completed: true },
  { label: 'Kitchen Preparing', time: '12:18 PM', completed: true, active: true },
  { label: 'Ready for Pickup', time: '12:30 PM', completed: false },
  { label: 'Out for Delivery', time: '12:35 PM', completed: false },
  { label: 'Delivered', time: '12:45 PM', completed: false },
];

export const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Order Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Live Order Tracking</h1>
            <Badge variant="bestseller" className="animate-pulse">
              LIVE
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Order <span className="font-mono font-bold text-foreground">{orderId}</span> • Royal Biryani House
          </p>
        </div>

        <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-2 rounded-2xl text-primary font-bold text-sm">
          <Clock className="h-4 w-4 animate-spin" /> Arriving in ~22 Mins
        </div>
      </div>

      {/* Stepper Timeline Visual */}
      <Card className="p-8 border-border">
        <h3 className="font-bold text-lg text-foreground mb-6">Order Status</h3>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {TIMELINE_STEPS.map((step, idx) => (
            <div key={idx} className="flex items-center gap-4 md:flex-col md:text-center z-10 flex-1">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-bold text-xs transition-all ${
                  step.active
                    ? 'bg-primary text-white ring-4 ring-primary/20 scale-110'
                    : step.completed
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.completed ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
              </div>

              <div>
                <p className={`text-sm font-bold ${step.active ? 'text-primary' : 'text-foreground'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">{step.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Delivery Driver Info Widget */}
      <Card className="p-6 border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xl">
            <Bike className="h-7 w-7" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">Vikram Singh</h4>
            <p className="text-xs text-muted-foreground">Delivery Executive • Honda Activa (DL-01-AB-1234)</p>
          </div>
        </div>

        <Button variant="outline" className="gap-2 font-bold">
          <Phone className="h-4 w-4 text-emerald-400" /> Call Partner
        </Button>
      </Card>
    </div>
  );
};
