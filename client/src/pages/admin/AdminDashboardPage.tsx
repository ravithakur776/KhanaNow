import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  Tag,
  CreditCard,
  Layers,
  FileText,
  TrendingUp,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  RefreshCw,
  Clock,
  Eye,
  Filter,
} from 'lucide-react';
import {
  useAdminDashboard,
  useAdminAnalytics,
  useAdminUsers,
  useAdminUpdateUserStatus,
  useAdminUpdateUserRole,
  useAdminRestaurants,
  useAdminUpdateRestaurantStatus,
  useAdminOrders,
  useAdminUpdateOrderStatus,
  useAdminPayments,
  useAdminAuditLogs,
  useAdminCategories,
  useAdminCreateCategory,
  useAdminCoupons,
  useAdminCreateCoupon,
  useAdminToggleCoupon,
} from '../../services/adminService';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { PriceDisplay } from '../../components/shared/PriceDisplay';
import { Skeleton } from '../../components/ui/skeleton';
import { fadeUp } from '../../config/animations';

type AdminTab =
  | 'overview'
  | 'users'
  | 'restaurants'
  | 'orders'
  | 'categories'
  | 'coupons'
  | 'payments'
  | 'audit';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | 'all'>('30d');

  // Queries
  const { data: metrics, isLoading: isMetricsLoading, refetch: refetchMetrics } = useAdminDashboard();
  const { data: analytics } = useAdminAnalytics();

  // User Management state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const { data: usersData, isLoading: isUsersLoading } = useAdminUsers({
    search: userSearch,
    role: userRoleFilter === 'ALL' ? undefined : userRoleFilter,
  });
  const updateUserStatusMutation = useAdminUpdateUserStatus();
  const updateUserRoleMutation = useAdminUpdateUserRole();

  // Restaurant Management state
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const [restaurantStatusFilter, setRestaurantStatusFilter] = useState('ALL');
  const { data: restaurantsData, isLoading: isRestaurantsLoading } = useAdminRestaurants({
    search: restaurantSearch,
    status: restaurantStatusFilter === 'ALL' ? undefined : restaurantStatusFilter,
  });
  const updateRestaurantStatusMutation = useAdminUpdateRestaurantStatus();

  // Orders state
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const { data: ordersData, isLoading: isOrdersLoading } = useAdminOrders({
    orderNumber: orderSearch,
    status: orderStatusFilter === 'ALL' ? undefined : orderStatusFilter,
  });
  const updateOrderStatusMutation = useAdminUpdateOrderStatus();

  // Payments & Audits
  const { data: paymentsData, isLoading: isPaymentsLoading } = useAdminPayments();
  const { data: auditData, isLoading: isAuditLoading } = useAdminAuditLogs();

  // Categories & Coupons
  const { data: categories } = useAdminCategories();
  const createCategoryMutation = useAdminCreateCategory();
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');

  const { data: coupons } = useAdminCoupons();
  const toggleCouponMutation = useAdminToggleCoupon();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 border-r border-border bg-card/40 backdrop-blur-xl p-4 lg:p-6 space-y-6 shrink-0">
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-extrabold shadow-md shadow-primary/30">
            K
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-foreground">KhanaNow Admin</h2>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Platform Master</p>
          </div>
        </div>

        <nav className="space-y-1 text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'users', label: 'Users Directory', icon: Users },
            { id: 'restaurants', label: 'Restaurants', icon: Store },
            { id: 'orders', label: 'Live Orders', icon: ShoppingBag },
            { id: 'categories', label: 'Categories', icon: Layers },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'audit', label: 'Audit Logs', icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-muted-foreground hover:bg-card hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl overflow-x-hidden">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground capitalize">
              {activeTab === 'overview' ? 'Platform Command Center' : activeTab.replace('-', ' ')}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Authoritative database statistics & multi-role administration
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchMetrics()}
              className="text-xs font-bold gap-1.5 border-border"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Sync Data
            </Button>
          </div>
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            {isMetricsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-2xl" />
                ))}
              </div>
            ) : metrics ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 border-border/80 glass-panel space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Gross Platform Revenue
                  </span>
                  <div className="text-2xl font-black text-foreground">
                    ₹{metrics.grossOrderValue?.toLocaleString('en-IN') || 0}
                  </div>
                  <p className="text-[11px] text-emerald-400 font-bold">
                    ₹{metrics.revenueToday?.toLocaleString('en-IN') || 0} today
                  </p>
                </Card>

                <Card className="p-5 border-border/80 glass-panel space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Total Platform Orders
                  </span>
                  <div className="text-2xl font-black text-foreground">
                    {metrics.totalOrders?.toLocaleString('en-IN') || 0}
                  </div>
                  <p className="text-[11px] text-primary font-bold">
                    {metrics.ordersToday || 0} placed today
                  </p>
                </Card>

                <Card className="p-5 border-border/80 glass-panel space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Active Kitchens
                  </span>
                  <div className="text-2xl font-black text-foreground">
                    {metrics.activeRestaurants || 0}
                  </div>
                  <p className="text-[11px] text-amber-400 font-bold">
                    {metrics.pendingRestaurants || 0} pending review
                  </p>
                </Card>

                <Card className="p-5 border-border/80 glass-panel space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Platform Fees Collected
                  </span>
                  <div className="text-2xl font-black text-foreground">
                    ₹{metrics.platformFees?.toLocaleString('en-IN') || 0}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-bold">
                    Avg Order: ₹{metrics.averageOrderValue || 0}
                  </p>
                </Card>
              </div>
            ) : null}

            {/* Financial Breakdown Table */}
            {metrics && (
              <Card className="p-6 border-border/80 glass-panel space-y-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-foreground">
                  Platform Financial Breakdown
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
                    <span className="text-muted-foreground font-bold">Total Delivery Fees</span>
                    <p className="text-base font-black text-foreground">₹{metrics.deliveryFees || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
                    <span className="text-muted-foreground font-bold">Taxes & GST (5%)</span>
                    <p className="text-base font-black text-foreground">₹{metrics.taxesCollected || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
                    <span className="text-muted-foreground font-bold">Discounts Absorbed</span>
                    <p className="text-base font-black text-emerald-400">₹{metrics.discountsGiven || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-card/60 space-y-1">
                    <span className="text-muted-foreground font-bold">Cancellation Rate</span>
                    <p className="text-base font-black text-destructive">{metrics.cancellationRate || '0.0%'}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tab 2: USERS DIRECTORY */}
        {activeTab === 'users' && (
          <Card className="p-6 border-border/80 glass-panel space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <Input
                placeholder="Search user by name, email, phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="max-w-sm h-10 text-xs"
              />
              <div className="flex gap-2">
                {(['ALL', 'customer', 'restaurant_owner', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      userRoleFilter === r
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {usersData?.users?.map((u: any) => (
                    <tr key={u._id} className="hover:bg-card/40 transition-colors">
                      <td className="py-3 font-bold text-foreground">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="py-3 text-muted-foreground font-mono">
                        {u.email} <br />
                        <span className="text-[10px]">{u.phone}</span>
                      </td>
                      <td className="py-3">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={u.status === 'suspended' ? 'destructive' : 'veg'}
                          className="text-[10px] uppercase font-bold"
                        >
                          {u.status || 'active'}
                        </Badge>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        {u.status === 'active' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserStatusMutation.mutate({ id: u._id, status: 'suspended' })}
                            className="text-[10px] h-7 font-bold text-destructive hover:bg-destructive/10"
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateUserStatusMutation.mutate({ id: u._id, status: 'active' })}
                            className="text-[10px] h-7 font-bold text-emerald-400 hover:bg-emerald-500/10"
                          >
                            Activate
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab 3: RESTAURANTS */}
        {activeTab === 'restaurants' && (
          <Card className="p-6 border-border/80 glass-panel space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <Input
                placeholder="Search restaurant by name, cuisine..."
                value={restaurantSearch}
                onChange={(e) => setRestaurantSearch(e.target.value)}
                className="max-w-sm h-10 text-xs"
              />
              <div className="flex gap-2">
                {(['ALL', 'pending', 'active', 'suspended'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setRestaurantStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      restaurantStatusFilter === st
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Restaurant</th>
                    <th className="pb-3">Owner Contact</th>
                    <th className="pb-3">Location</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {restaurantsData?.restaurants?.map((r: any) => (
                    <tr key={r._id} className="hover:bg-card/40 transition-colors">
                      <td className="py-3 font-bold text-foreground">
                        {r.name}
                        <span className="block text-[10px] text-muted-foreground font-normal">
                          {r.cuisines?.join(', ')}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground font-mono text-[11px]">
                        {r.ownerId?.firstName} {r.ownerId?.lastName} <br />
                        {r.ownerId?.email}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {r.address?.city} ({r.address?.pincode})
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={r.status === 'active' ? 'veg' : r.status === 'pending' ? 'bestseller' : 'destructive'}
                          className="text-[10px] uppercase font-bold"
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right space-x-2">
                        {r.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => updateRestaurantStatusMutation.mutate({ id: r._id, status: 'active' })}
                            className="text-[10px] h-7 font-bold bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            Approve
                          </Button>
                        )}
                        {r.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateRestaurantStatusMutation.mutate({ id: r._id, status: 'suspended', reason: 'Admin review' })}
                            className="text-[10px] h-7 font-bold text-destructive hover:bg-destructive/10"
                          >
                            Suspend
                          </Button>
                        )}
                        {r.status === 'suspended' && (
                          <Button
                            size="sm"
                            onClick={() => updateRestaurantStatusMutation.mutate({ id: r._id, status: 'active' })}
                            className="text-[10px] h-7 font-bold bg-emerald-500 text-white"
                          >
                            Reactivate
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab 4: LIVE ORDERS */}
        {activeTab === 'orders' && (
          <Card className="p-6 border-border/80 glass-panel space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <Input
                placeholder="Search order number..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="max-w-sm h-10 text-xs"
              />
              <div className="flex flex-wrap gap-2">
                {(['ALL', 'PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                      orderStatusFilter === st
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">Kitchen</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ordersData?.orders?.map((o: any) => (
                    <tr key={o._id} className="hover:bg-card/40 transition-colors">
                      <td className="py-3 font-mono font-bold text-foreground">
                        {o.orderNumber}
                      </td>
                      <td className="py-3 text-muted-foreground font-bold">
                        {o.restaurantId?.name || 'Kitchen'}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {o.userId?.firstName} {o.userId?.lastName}
                      </td>
                      <td className="py-3 font-bold text-foreground">
                        ₹{o.pricing?.grandTotal || 0}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={o.status === 'DELIVERED' ? 'veg' : o.status === 'CANCELLED' ? 'destructive' : 'bestseller'}
                          className="text-[10px] uppercase font-bold"
                        >
                          {o.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab 5: CATEGORIES */}
        {activeTab === 'categories' && (
          <Card className="p-6 border-border/80 glass-panel space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-extrabold text-base text-foreground">Food Categories Directory</h3>
                <p className="text-xs text-muted-foreground">Manage platform cuisines and category tags</p>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Category Name"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  className="h-9 text-xs"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (newCatName) {
                      createCategoryMutation.mutate({ name: newCatName, slug: newCatSlug });
                      setNewCatName('');
                      setNewCatSlug('');
                    }
                  }}
                  className="font-extrabold text-xs h-9"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Category
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {categories?.map((cat: any) => (
                <div key={cat._id} className="p-3.5 rounded-2xl border border-border bg-card/60 flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">{cat.name}</span>
                  <Badge variant="outline" className="text-[10px]">{cat.slug}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 6: COUPONS */}
        {activeTab === 'coupons' && (
          <Card className="p-6 border-border/80 glass-panel space-y-4">
            <h3 className="font-extrabold text-base text-foreground">Platform Coupons Directory</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons?.map((cp: any) => (
                <div key={cp._id} className="p-4 rounded-2xl border border-border bg-card/60 flex justify-between items-center">
                  <div>
                    <span className="font-mono font-black text-sm text-primary tracking-wider">{cp.code}</span>
                    <p className="text-xs text-muted-foreground">{cp.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {cp.discountType === 'percentage' ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} OFF`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={cp.isActive ? 'outline' : 'default'}
                    onClick={() => toggleCouponMutation.mutate({ id: cp._id, isActive: !cp.isActive })}
                    className="text-xs font-bold"
                  >
                    {cp.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 7: PAYMENTS */}
        {activeTab === 'payments' && (
          <Card className="p-6 border-border/80 glass-panel space-y-4">
            <h3 className="font-extrabold text-base text-foreground">Safe Financial Payments Audit</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Reference</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paymentsData?.payments?.map((p: any) => (
                    <tr key={p._id} className="hover:bg-card/40 transition-colors">
                      <td className="py-3 font-mono font-bold text-foreground">{p.paymentReference}</td>
                      <td className="py-3 text-muted-foreground">{p.userId?.firstName} {p.userId?.lastName}</td>
                      <td className="py-3 font-bold text-foreground">₹{(p.amount / 100).toFixed(2)}</td>
                      <td className="py-3">
                        <Badge variant="veg" className="text-[10px] uppercase font-bold">{p.status}</Badge>
                      </td>
                      <td className="py-3 text-muted-foreground text-[10px]">{new Date(p.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tab 8: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <Card className="p-6 border-border/80 glass-panel space-y-4">
            <h3 className="font-extrabold text-base text-foreground">Sensitive Platform Audit Trail</h3>
            <div className="space-y-2">
              {auditData?.logs?.map((log: any) => (
                <div key={log._id} className="p-3 rounded-2xl border border-border bg-card/60 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-mono font-bold text-primary">{log.action}</span>
                    <p className="text-[11px] text-muted-foreground">
                      Actor: <span className="font-bold text-foreground">{log.actorId?.email || 'Admin'}</span> • Entity: {log.entityType} ({log.entityId})
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};
