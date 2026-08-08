import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Trash2,
  ShoppingBag,
  Tag,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  useNotifications,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} from '../../services/notificationService';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { fadeUp } from '../../config/animations';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const { data: notifData, isLoading } = useNotifications(
    currentPage,
    15,
    activeFilter === 'UNREAD' ? false : undefined
  );

  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();
  const deleteMutation = useDeleteNotificationMutation();

  const notifications = notifData?.notifications || [];
  const pagination = notifData?.pagination || { page: 1, totalPages: 1, total: 0 };
  const unreadCount = notifData?.unreadCount || 0;

  const handleAction = (n: any) => {
    if (!n.isRead) {
      markReadMutation.mutate(n._id);
    }
    if (n.data?.orderNumber) {
      navigate(`/track-order/${n.data.orderNumber}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Notification Center</h1>
            {unreadCount > 0 && (
              <Badge variant="bestseller" className="font-extrabold">
                {unreadCount} UNREAD
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Live order updates, delivery milestones, and promotions</p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              isLoading={markAllReadMutation.isPending}
              className="text-xs font-bold gap-1.5 border-border"
            >
              <CheckCheck className="h-3.5 w-3.5" /> Mark All Read
            </Button>
          )}

          <div className="flex bg-card border border-border p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                setActiveFilter('ALL');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeFilter === 'ALL' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setActiveFilter('UNREAD');
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-all ${
                activeFilter === 'UNREAD' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Unread
            </button>
          </div>
        </div>
      </motion.div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-3 bg-card/30">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto animate-bounce" />
          <h3 className="text-lg font-extrabold text-foreground">You're all caught up!</h3>
          <p className="text-xs text-muted-foreground">
            {activeFilter === 'UNREAD'
              ? 'No unread notifications right now.'
              : 'Updates about your delicious meals will arrive here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n._id}
              onClick={() => handleAction(n)}
              className={`p-5 border-border/80 glass-panel cursor-pointer transition-all hover:border-primary/50 space-y-1 relative ${
                !n.isRead ? 'border-primary/40 bg-primary/5' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  <h4 className="font-extrabold text-sm text-foreground">{n.title}</h4>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(n.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(n._id);
                    }}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed pl-4">{n.message}</p>

              {n.data?.orderNumber && (
                <div className="pl-4 pt-1">
                  <span className="text-[11px] font-bold text-primary hover:underline">
                    Track Order #{n.data.orderNumber} →
                  </span>
                </div>
              )}
            </Card>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="font-bold gap-1 text-xs"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage >= pagination.totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="font-bold gap-1 text-xs"
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
