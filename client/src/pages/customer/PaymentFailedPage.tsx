import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw, ArrowLeft, Headphones } from 'lucide-react';
import { Container } from '../../components/layout/Container';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { fadeUp } from '../../config/animations';

export const PaymentFailedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') || 'Transaction was declined by bank or payment gateway';

  return (
    <Container size="md" className="py-16">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="space-y-6 max-w-lg mx-auto"
      >
        <Card className="p-8 border-destructive/30 glass-panel shadow-2xl text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 text-destructive border border-destructive/30 shadow-xl">
            <AlertTriangle className="h-10 w-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <Badge variant="outline" className="text-xs text-destructive border-destructive/30 font-bold uppercase tracking-wider">
              PAYMENT TRANSACTION FAILED
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-foreground">
              Payment Could Not Be Completed
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No money was charged to your account. If amount was debited, your bank will automatically refund it within 2-3 business days.
            </p>
          </div>

          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-xs text-destructive font-medium text-left">
            <span className="font-bold block mb-0.5">Failure Reason:</span>
            {reason}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/checkout" className="flex-1">
              <Button size="lg" className="w-full font-extrabold gap-2 shadow-lg shadow-primary/30 h-12">
                <RotateCcw className="h-4 w-4" /> Retry Payment
              </Button>
            </Link>
            <Link to="/cart" className="flex-1">
              <Button variant="outline" size="lg" className="w-full font-bold gap-2 h-12 border-border">
                <ArrowLeft className="h-4 w-4" /> Back to Cart
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </Container>
  );
};
