import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Home,
  Receipt,
  Clock,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { usePaymentStatus } from '../../services/paymentService';
import { Container } from '../../components/layout/Container';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { PriceDisplay } from '../../components/shared/PriceDisplay';
import { Skeleton } from '../../components/ui/skeleton';
import { fadeUp } from '../../config/animations';

export const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const paymentRef = searchParams.get('ref') || '';
  const method = searchParams.get('method') || 'razorpay';

  const { data: payment, isLoading, isError } = usePaymentStatus(paymentRef);

  return (
    <Container size="md" className="py-16">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-lg mx-auto"
      >
        {/* Main Success Card */}
        <Card className="p-8 border-white/10 glass-panel shadow-2xl text-center space-y-6">
          {/* Animated Success Badge */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-xl">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <Badge variant="outline" className="text-xs text-emerald-400 border-emerald-500/30 font-bold uppercase tracking-wider">
              {method === 'cod' ? 'PAYMENT ON DELIVERY CONFIRMED' : 'RAZORPAY 256-BIT ENCRYPTED & VERIFIED'}
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Payment Confirmed!
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your transaction has been securely verified by the server. Your kitchen is now preparing your delicious meal.
            </p>
          </div>

          {/* Payment & Transaction Receipt Details */}
          {isLoading ? (
            <div className="space-y-2 py-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
          ) : payment ? (
            <div className="rounded-2xl border border-border bg-card/60 p-4 text-xs space-y-2.5 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-border/60">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                  Payment Reference
                </span>
                <span className="font-mono font-bold text-foreground">{payment.paymentReference}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Kitchen Name</span>
                <span className="font-bold text-foreground">{payment.metadata?.restaurantName || 'Kitchen'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount Paid</span>
                <PriceDisplay amount={payment.amountRupees || 0} size="md" />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Status</span>
                <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">
                  ✓ {payment.status}
                </span>
              </div>

              {payment.razorpayPaymentId && (
                <div className="flex justify-between items-center pt-1 border-t border-border/40 text-[10px]">
                  <span className="text-muted-foreground">Razorpay Payment ID</span>
                  <span className="font-mono text-muted-foreground truncate max-w-[160px]">
                    {payment.razorpayPaymentId}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-card/40 p-4 text-xs">
              <span className="font-bold text-foreground">Reference: </span>
              <span className="font-mono text-primary font-bold">{paymentRef || 'KN-PAY-PROCESSED'}</span>
            </div>
          )}

          {/* Phase 9 Hand-Off Banner */}
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 flex items-center gap-3 text-left">
            <Clock className="h-6 w-6 text-primary shrink-0 animate-pulse" />
            <div>
              <h5 className="font-extrabold text-xs text-foreground">Preparing Order Pipeline</h5>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Payment verified cleanly. Order creation and real-time delivery GPS tracking are scheduled for Phase 9.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/home" className="flex-1">
              <Button variant="default" size="lg" className="w-full font-extrabold gap-2 shadow-lg shadow-primary/30 h-12">
                <Home className="h-4 w-4" /> Go to Home
              </Button>
            </Link>
            <Link to="/orders" className="flex-1">
              <Button variant="outline" size="lg" className="w-full font-bold gap-2 h-12 border-border">
                <Receipt className="h-4 w-4" /> View Orders
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </Container>
  );
};
