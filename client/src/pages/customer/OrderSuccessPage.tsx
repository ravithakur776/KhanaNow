import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, MapPin, Truck, ArrowRight, Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

export const OrderSuccessPage: React.FC = () => {
  const { orderId } = useParams();

  useEffect(() => {
    // Fire festive confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-8">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mb-4 animate-bounce">
        <CheckCircle2 className="h-14 w-14" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
          Payment Confirmed • Order Placed
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
          Thank you for your order!
        </h1>
        <p className="text-sm text-muted-foreground">
          Order ID: <span className="font-mono font-bold text-foreground">{orderId}</span>
        </p>
      </div>

      <Card className="p-6 text-left space-y-4 border-border bg-card/60">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <Truck className="h-6 w-6 text-primary" />
          <div>
            <h4 className="font-bold text-foreground">Estimated Arrival: 25-30 mins</h4>
            <p className="text-xs text-muted-foreground">The kitchen has received your order and started preparing.</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>Status</span>
          <span className="text-primary font-bold">Kitchen Preparing 🔥</span>
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to={`/track-order/${orderId}`}>
          <Button size="lg" className="w-full sm:w-auto font-extrabold shadow-lg shadow-primary/30">
            Track Live Order <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold">
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
