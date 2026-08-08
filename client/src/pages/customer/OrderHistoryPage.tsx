import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Clock,
  Receipt,
  Truck,
  ChevronLeft,
  ChevronRight,
  UtensilsCrossed,
} from 'lucide-react';
import { useUserOrders, useReorderMutation } from '../../services/orderService';
import { useCartStore } from '../../stores/useCartStore';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { PriceDisplay } from '../../components/shared/PriceDisplay';
import { OrderCardSkeleton } from '../../components/orders/OrderSkeletons';
import { fadeUp } from '../../config/animations';

export const OrderHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { addItem, clearCart } = useCartStore();

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: orderData, isLoading } = useUserOrders({
    page: currentPage,
    limit: 10,
    status: activeTab === 'ALL' ? undefined : activeTab,
  });

  const reorderMutation = useReorderMutation();

  const orders = orderData?.orders || [];
  const pagination = orderData?.pagination || { total: 0, totalPages: 1, page: 1 };

  const handleReorder = (orderNumber: string) => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <Badge variant="veg" className="font-bold">✓ DELIVERED</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive" className="font-bold">CANCELLED</Badge>;
      default:
        return <Badge variant="bestseller" className="font-bold animate-pulse">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Your Order History</h1>
          <p className="text-xs text-muted-foreground mt-1">Review past orders, track active deliveries, or reorder in 1-click</p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-card border border-border p-1 rounded-2xl">
          {[
            { id: 'ALL', label: 'All Orders' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'DELIVERED', label: 'Delivered' },
            { id: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-4 bg-card/30">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground mx-auto animate-bounce" />
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-foreground">No orders found</h3>
            <p className="text-xs text-muted-foreground">
              {activeTab === 'ALL'
                ? "You haven't placed any orders yet. Discover delicious dishes from top restaurants!"
                : `No orders with status "${activeTab}" found.`}
            </p>
          </div>
          <Link to="/home">
            <Button size="lg" className="font-extrabold shadow-lg shadow-primary/30">
              Explore Restaurants
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="p-6 border-border/80 glass-panel space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-border pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-foreground">
                    {order.restaurantId?.name || 'Kitchen Order'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.placedAt || order.createdAt).toLocaleString()} • ID:{' '}
                    <span className="font-mono font-bold text-foreground">{order.orderNumber}</span>
                  </p>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Items Summary */}
              <div className="space-y-1 text-xs text-muted-foreground">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate max-w-[280px]">
                      <span className="font-bold text-foreground">{item.quantity}x</span> {item.name}
                    </span>
                    <PriceDisplay amount={item.itemTotal} size="sm" />
                  </div>
                ))}
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Total:</span>
                  <PriceDisplay amount={order.pricing.grandTotal} size="md" />
                </div>

                <div className="flex gap-2">
                  {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                    <Link to={`/track-order/${order.orderNumber}`}>
                      <Button size="sm" className="font-extrabold gap-1.5 shadow-md">
                        <Truck className="h-4 w-4" /> Track Live
                      </Button>
                    </Link>
                  )}

                  <Link to={`/orders/${order.orderNumber}`}>
                    <Button variant="outline" size="sm" className="font-bold gap-1.5 border-border">
                      <Receipt className="h-4 w-4" /> View Details
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReorder(order.orderNumber)}
                    isLoading={reorderMutation.isPending}
                    className="font-bold gap-1.5 border-border"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reorder
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} orders)
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="font-bold gap-1"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="font-bold gap-1"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
