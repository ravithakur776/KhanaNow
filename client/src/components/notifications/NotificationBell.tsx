import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Check, ShoppingBag, CheckCheck, Clock, ShieldCheck } from 'lucide-react';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '../../services/notificationService';
import { useAuthStore } from '../../stores/useAuthStore';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0 } = useUnreadNotificationCount(isAuthenticated);
  const { data: notifData } = useNotifications(1, 5, undefined, undefined);

  const markReadMutation = useMarkNotificationReadMutation();
  const markAllReadMutation = useMarkAllNotificationsReadMutation();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated) return null;

  const notifications = notifData?.notifications || [];

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) {
      markReadMutation.mutate(n._id);
    }
    setIsOpen(false);
    if (n.data?.orderNumber) {
      navigate(`/track-order/${n.data.orderNumber}`);
    } else {
      navigate('/notifications');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications"
        className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-card/80 transition-all"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-white ring-2 ring-background animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card/95 backdrop-blur-2xl shadow-2xl p-4 z-50 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-foreground">Notifications</h4>
              {unreadCount > 0 && (
                <Badge variant="bestseller" className="text-[9px] font-bold">
                  {unreadCount} new
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <CheckCheck className="h-3 w-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-xs">
                You're all caught up! ✨
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    !n.isRead
                      ? 'border-primary/40 bg-primary/5 hover:bg-primary/10'
                      : 'border-border/60 bg-card/40 hover:bg-card'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-extrabold text-foreground">{n.title}</span>
                    {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-0.5 leading-relaxed">{n.message}</p>
                  <span className="text-[9px] text-muted-foreground/60 font-mono mt-1 block">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block text-center text-xs font-bold text-primary hover:underline pt-2 border-t border-border"
          >
            View Notification Center →
          </Link>
        </div>
      )}
    </div>
  );
};
