import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { PriceDisplay } from '../../components/shared/PriceDisplay';

const MOCK_PAST_ORDERS = [
  {
    orderId: 'KN-894120',
    restaurantName: 'Royal Biryani House',
    items: ['1x Chicken Dum Biryani', '1x Thums Up 750ml'],
    date: '05 Aug 2026, 08:30 PM',
    amount: 380,
    status: 'Delivered',
  },
  {
    orderId: 'KN-672109',
    restaurantName: 'Artisan Pizza Workshop',
    items: ['1x Truffle Mushroom Pizza', '1x Garlic Breadsticks'],
    date: '01 Aug 2026, 01:15 PM',
    amount: 650,
    status: 'Delivered',
  },
];

export const OrderHistoryPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground">Your Order History</h1>
          <p className="text-xs text-muted-foreground mt-1">Review past orders or reorder in 1-click</p>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_PAST_ORDERS.map((order) => (
          <Card key={order.orderId} className="p-6 border-border space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-lg text-foreground">{order.restaurantName}</h3>
                <p className="text-xs text-muted-foreground">{order.date} • ID: {order.orderId}</p>
              </div>
              <Badge variant="veg" className="w-fit font-bold">
                ✓ {order.status}
              </Badge>
            </div>

            <div className="space-y-1">
              {order.items.map((item, idx) => (
                <p key={idx} className="text-xs font-medium text-muted-foreground">{item}</p>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <PriceDisplay amount={order.amount} size="md" />

              <div className="flex gap-3">
                <Link to={`/track-order/${order.orderId}`}>
                  <Button variant="outline" size="sm" className="font-bold">
                    View Receipt
                  </Button>
                </Link>
                <Button size="sm" className="font-extrabold gap-1.5 shadow-md">
                  <RotateCcw className="h-3.5 w-3.5" /> Reorder 1-Click
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
