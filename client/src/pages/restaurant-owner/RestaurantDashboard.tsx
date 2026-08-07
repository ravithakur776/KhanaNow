import React, { useState } from 'react';
import { ShoppingBag, Clock, CheckCircle2, AlertCircle, Play, Power } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { PriceDisplay } from '../../components/shared/PriceDisplay';

const INCOMING_ORDERS = [
  {
    id: 'KN-9921',
    customer: 'Rahul Verma',
    items: ['2x Chicken Dum Biryani', '1x Butter Naan'],
    amount: 720,
    time: '2 mins ago',
    status: 'pending',
  },
  {
    id: 'KN-9920',
    customer: 'Priya Sharma',
    items: ['1x Tandoori Malai Chaap'],
    amount: 260,
    time: '8 mins ago',
    status: 'preparing',
  },
];

export const RestaurantDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-8">
      {/* Merchant Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-card border border-border p-6 rounded-3xl">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Royal Biryani House (Merchant Portal)</h1>
          <p className="text-xs text-muted-foreground">Kitchen Terminal • Live incoming order queue</p>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
            isOpen
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
          }`}
        >
          <Power className="h-4 w-4" /> Kitchen Status: {isOpen ? 'OPEN FOR ORDERS' : 'CLOSED'}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6 space-y-2 border-border">
          <span className="text-xs font-bold text-muted-foreground uppercase">Today's Revenue</span>
          <h3 className="text-3xl font-black text-foreground">₹14,850</h3>
          <p className="text-xs text-emerald-400 font-bold">+18% vs yesterday</p>
        </Card>
        <Card className="p-6 space-y-2 border-border">
          <span className="text-xs font-bold text-muted-foreground uppercase">Active Orders</span>
          <h3 className="text-3xl font-black text-primary">4 Orders</h3>
          <p className="text-xs text-muted-foreground">Avg prep time: 14 mins</p>
        </Card>
        <Card className="p-6 space-y-2 border-border">
          <span className="text-xs font-bold text-muted-foreground uppercase">Completed Orders Today</span>
          <h3 className="text-3xl font-black text-foreground">38</h3>
          <p className="text-xs text-emerald-400 font-bold">100% On-time delivery</p>
        </Card>
      </div>

      {/* Live Incoming Orders Queue */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-foreground">Live Order Terminal</h2>

        <div className="space-y-4">
          {INCOMING_ORDERS.map((order) => (
            <Card key={order.id} className="p-6 border-border flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-lg text-primary">{order.id}</span>
                  <Badge variant={order.status === 'pending' ? 'destructive' : 'bestseller'}>
                    {order.status === 'pending' ? 'ACTION REQUIRED' : 'PREPARING'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{order.time}</span>
                </div>
                <p className="text-sm font-bold text-foreground">Customer: {order.customer}</p>
                <div className="text-xs text-muted-foreground font-medium">
                  {order.items.join(' • ')}
                </div>
              </div>

              <div className="flex flex-col sm:items-end justify-between gap-2 shrink-0">
                <PriceDisplay amount={order.amount} size="lg" />
                <div className="flex gap-2">
                  <Button variant="veg" size="sm" className="font-bold">
                    Accept Order
                  </Button>
                  <Button variant="outline" size="sm" className="font-bold">
                    Mark Ready
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
