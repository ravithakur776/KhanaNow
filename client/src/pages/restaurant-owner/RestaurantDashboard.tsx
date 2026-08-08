import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Utensils,
  Clock,
  CheckCircle2,
  TrendingUp,
  ShoppingBag,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Star,
  Tag,
  Store,
  ChefHat,
  Power,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  useRestaurantDashboard,
  useRestaurantOrders,
  useRestaurantUpdateOrderStatus,
  useRestaurantMenu,
  useRestaurantCreateFood,
  useRestaurantUpdateFood,
  useRestaurantToggleFoodAvailability,
  useRestaurantDeleteFood,
  useRestaurantUpdateProfile,
  useRestaurantToggleOpenStatus,
  useRestaurantCoupons,
  useRestaurantCreateCoupon,
  useRestaurantReviews,
} from '../../services/restaurantOwnerService';
import { useCategories } from '../../services/restaurantService';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { PriceDisplay } from '../../components/shared/PriceDisplay';
import { FoodTag } from '../../components/shared/FoodTag';
import { Skeleton } from '../../components/ui/skeleton';

type OwnerTab = 'overview' | 'orders' | 'menu' | 'profile' | 'coupons' | 'reviews';

export const RestaurantDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OwnerTab>('overview');

  // Queries
  const { data: dashboard, isLoading: isDashLoading, refetch: refetchDashboard } = useRestaurantDashboard();
  const { data: ordersData, isLoading: isOrdersLoading } = useRestaurantOrders(1, 20);
  const updateOrderStatusMutation = useRestaurantUpdateOrderStatus();
  const toggleOpenStatusMutation = useRestaurantToggleOpenStatus();

  // Menu queries & state
  const [menuSearch, setMenuSearch] = useState('');
  const { data: menuData, isLoading: isMenuLoading } = useRestaurantMenu(1, 50, menuSearch);
  const createFoodMutation = useRestaurantCreateFood();
  const updateFoodMutation = useRestaurantUpdateFood();
  const toggleAvailabilityMutation = useRestaurantToggleFoodAvailability();
  const deleteFoodMutation = useRestaurantDeleteFood();

  // Categories query
  const { data: categoriesData } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Add Dish state
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [foodDesc, setFoodDesc] = useState('');
  const [foodPrice, setFoodPrice] = useState<number>(250);
  const [foodDiet, setFoodDiet] = useState<'veg' | 'non_veg' | 'vegan' | 'egg'>('veg');
  const [foodImg, setFoodImg] = useState('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80');

  // Coupons & Reviews
  const { data: coupons } = useRestaurantCoupons();
  const createCouponMutation = useRestaurantCreateCoupon();
  const [couponCode, setCouponCode] = useState('');
  const [couponVal, setCouponVal] = useState<number>(20);
  const { data: reviewsData } = useRestaurantReviews();

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName) return;

    const catId = selectedCategoryId || (categoriesData?.[0]?._id as string) || '';

    createFoodMutation.mutate(
      {
        name: foodName,
        description: foodDesc || 'Freshly prepared signature specialty.',
        price: Number(foodPrice),
        imageUrl: foodImg,
        categoryId: catId,
        dietaryType: foodDiet,
        spiceLevel: 'medium',
        preparationTimeMinutes: 20,
        isAvailable: true,
      },
      {
        onSuccess: () => {
          setIsAddFoodOpen(false);
          setFoodName('');
          setFoodDesc('');
        },
      }
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 border-r border-border bg-card/40 backdrop-blur-xl p-4 lg:p-6 space-y-6 shrink-0">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-extrabold shadow-md shadow-primary/30">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-foreground truncate max-w-[120px]">
                {dashboard?.restaurantName || 'My Kitchen'}
              </h2>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Kitchen Terminal</p>
            </div>
          </div>

          {dashboard && (
            <button
              onClick={() => toggleOpenStatusMutation.mutate(!dashboard.isOpen)}
              className={`p-1.5 rounded-xl border transition-all ${
                dashboard.isOpen
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-destructive/10 text-destructive border-destructive/30'
              }`}
              title={dashboard.isOpen ? 'Click to Close Restaurant' : 'Click to Open Restaurant'}
            >
              <Power className="h-4 w-4" />
            </button>
          )}
        </div>

        <nav className="space-y-1 text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'orders', label: 'Live Orders Terminal', icon: ShoppingBag },
            { id: 'menu', label: 'Menu Management', icon: Utensils },
            { id: 'coupons', label: 'Kitchen Coupons', icon: Tag },
            { id: 'reviews', label: 'Customer Reviews', icon: Star },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as OwnerTab)}
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
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground capitalize">
                {activeTab === 'overview' ? 'Kitchen Command Center' : activeTab.replace('-', ' ')}
              </h1>
              {dashboard && (
                <Badge variant={dashboard.isOpen ? 'veg' : 'destructive'} className="text-[10px] uppercase font-bold">
                  {dashboard.isOpen ? '● ACCEPTING ORDERS' : '● CLOSED'}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live orders processing & kitchen menu controls
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchDashboard()}
            className="text-xs font-bold gap-1.5 border-border"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Refresh Terminal
          </Button>
        </div>

        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {isDashLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-2xl" />
                ))}
              </div>
            ) : dashboard ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 border-border/80 glass-panel space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Today's Kitchen Revenue
                  </span>
                  <div className="text-2xl font-black text-foreground">
                    ₹{dashboard.todayRevenue?.toLocaleString('en-IN') || 0}
                  </div>
                  <p className="text-[11px] text-emerald-400 font-bold">
                    {dashboard.todayOrders || 0} orders today
                  </p>
                </Card>

                <Card className="p-5 border-border/80 glass-panel space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Active in Kitchen
                  </span>
                  <div className="text-2xl font-black text-foreground">
                    {dashboard.activeOrders || 0}
                  </div>
                  <p className="text-[11px] text-primary font-bold">Preparing / In Transit</p>
                </Card>

                <Card className="p-5 border-border/80 glass-panel space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Completed Deliveries
                  </span>
                  <div className="text-2xl font-black text-foreground">
                    {dashboard.completedOrders || 0}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-bold">
                    Lifetime: {dashboard.totalOrders || 0} orders
                  </p>
                </Card>

                <Card className="p-5 border-border/80 glass-panel space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Kitchen Rating
                  </span>
                  <div className="text-2xl font-black text-foreground flex items-center gap-1">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <span>{dashboard.avgRating || 4.5}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-bold">
                    {dashboard.totalRatings || 0} verified customer reviews
                  </p>
                </Card>
              </div>
            ) : null}

            {/* Top Selling Items */}
            {dashboard?.topFoods && dashboard.topFoods.length > 0 && (
              <Card className="p-6 border-border/80 glass-panel space-y-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-foreground">
                  Best-Selling Kitchen Specialties
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dashboard.topFoods.map((f: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl border border-border bg-card/60 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-xs text-foreground block">{f._id}</span>
                        <span className="text-[11px] text-muted-foreground">{f.totalQuantity} units sold</span>
                      </div>
                      <PriceDisplay amount={f.totalRevenue} size="sm" />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Tab 2: LIVE ORDERS TERMINAL */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-foreground">Active Orders Pipeline</h3>
            {isOrdersLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : ordersData?.orders?.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-2 bg-card/30">
                <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto" />
                <h4 className="font-bold text-sm text-foreground">No active kitchen orders</h4>
                <p className="text-xs text-muted-foreground">New orders from customers will appear here in real-time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {ordersData?.orders?.map((o: any) => (
                  <Card key={o._id} className="p-5 border-border/80 glass-panel space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-border pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-primary">{o.orderNumber}</span>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold">{o.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(o.placedAt || o.createdAt).toLocaleTimeString()} • Customer:{' '}
                          <span className="font-bold text-foreground">{o.contactSnapshot?.name}</span> ({o.contactSnapshot?.phone})
                        </p>
                      </div>
                      <PriceDisplay amount={o.pricing?.grandTotal || 0} size="md" />
                    </div>

                    {/* Items List */}
                    <div className="space-y-1 text-xs">
                      {o.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-muted-foreground">
                          <span>
                            <span className="font-bold text-foreground">{item.quantity}x</span> {item.name}
                          </span>
                          <span>₹{item.itemTotal}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Step Transitions */}
                    <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                      {o.status === 'PLACED' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatusMutation.mutate({ orderNumber: o.orderNumber, status: 'CONFIRMED' })}
                          className="font-extrabold text-xs h-8 bg-emerald-500 text-white"
                        >
                          Accept Order (CONFIRM)
                        </Button>
                      )}
                      {o.status === 'CONFIRMED' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatusMutation.mutate({ orderNumber: o.orderNumber, status: 'PREPARING' })}
                          className="font-extrabold text-xs h-8"
                        >
                          Start Cooking (PREPARING)
                        </Button>
                      )}
                      {o.status === 'PREPARING' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatusMutation.mutate({ orderNumber: o.orderNumber, status: 'READY_FOR_PICKUP' })}
                          className="font-extrabold text-xs h-8 bg-amber-500 text-white"
                        >
                          Mark Ready (PICKUP)
                        </Button>
                      )}
                      {o.status === 'READY_FOR_PICKUP' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatusMutation.mutate({ orderNumber: o.orderNumber, status: 'PICKED_UP' })}
                          className="font-extrabold text-xs h-8 bg-primary text-white"
                        >
                          Handover to Driver (PICKED UP)
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: MENU MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <Input
                placeholder="Search menu dishes..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="max-w-sm h-10 text-xs"
              />
              <Button
                size="sm"
                onClick={() => setIsAddFoodOpen(true)}
                className="font-extrabold text-xs h-10 gap-1 shadow-md shadow-primary/20"
              >
                <Plus className="h-4 w-4" /> Add Dish to Menu
              </Button>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuData?.foods?.map((food: any) => (
                <Card key={food._id} className="p-4 border-border/80 glass-panel space-y-3">
                  <div className="flex gap-3">
                    <img src={food.imageUrl} alt={food.name} className="h-16 w-16 rounded-xl object-cover" />
                    <div className="truncate space-y-0.5 flex-1">
                      <div className="flex items-center gap-1.5">
                        <FoodTag type={food.dietaryType === 'non_veg' ? 'non-veg' : food.dietaryType} />
                        <span className="font-bold text-xs text-foreground truncate">{food.name}</span>
                      </div>
                      <PriceDisplay amount={food.price} size="sm" />
                      <p className="text-[11px] text-muted-foreground truncate">{food.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                    <button
                      onClick={() => toggleAvailabilityMutation.mutate({ id: food._id, isAvailable: !food.isAvailable })}
                      className={`text-[11px] font-bold ${
                        food.isAvailable ? 'text-emerald-400' : 'text-destructive'
                      }`}
                    >
                      {food.isAvailable ? '● Available' : '○ Sold Out'}
                    </button>

                    <button
                      onClick={() => deleteFoodMutation.mutate(food._id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      title="Deactivate Dish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Add Dish Modal */}
            {isAddFoodOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
                <Card className="p-6 max-w-md w-full space-y-4 border-white/10 glass-panel">
                  <h3 className="text-base font-extrabold text-foreground">Add Dish to Kitchen Menu</h3>
                  <form onSubmit={handleAddFood} className="space-y-3 text-xs">
                    <Input
                      label="Dish Name"
                      placeholder="Butter Chicken Special"
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                    />
                    <Input
                      label="Description"
                      placeholder="Rich and creamy tomato gravy with tender chicken."
                      value={foodDesc}
                      onChange={(e) => setFoodDesc(e.target.value)}
                    />
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-muted-foreground">Dish Category</label>
                      <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground"
                      >
                        {categoriesData?.map((cat: any) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Price in ₹"
                        type="number"
                        value={foodPrice}
                        onChange={(e) => setFoodPrice(Number(e.target.value))}
                      />
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-muted-foreground">Dietary Type</label>
                        <select
                          value={foodDiet}
                          onChange={(e: any) => setFoodDiet(e.target.value)}
                          className="w-full h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground"
                        >
                          <option value="veg">Veg</option>
                          <option value="non_veg">Non-Veg</option>
                          <option value="vegan">Vegan</option>
                          <option value="egg">Egg</option>
                        </select>
                      </div>
                    </div>
                    <Input
                      label="Image URL"
                      placeholder="https://..."
                      value={foodImg}
                      onChange={(e) => setFoodImg(e.target.value)}
                    />
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddFoodOpen(false)}
                        className="flex-1 font-bold"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="flex-1 font-extrabold">
                        Save Dish
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: COUPONS */}
        {activeTab === 'coupons' && (
          <Card className="p-6 border-border/80 glass-panel space-y-4">
            <h3 className="font-extrabold text-base text-foreground">Kitchen Exclusive Coupons</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons?.map((cp: any) => (
                <div key={cp._id} className="p-4 rounded-2xl border border-border bg-card/60 flex justify-between items-center">
                  <div>
                    <span className="font-mono font-black text-sm text-primary tracking-wider">{cp.code}</span>
                    <p className="text-xs text-muted-foreground">{cp.description}</p>
                    <p className="text-[10px] text-emerald-400 font-bold mt-1">
                      {cp.discountType === 'percentage' ? `${cp.discountValue}% OFF` : `₹${cp.discountValue} OFF`}
                    </p>
                  </div>
                  <Badge variant={cp.isActive ? 'veg' : 'destructive'} className="text-[10px]">
                    {cp.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Tab 5: REVIEWS */}
        {activeTab === 'reviews' && (
          <Card className="p-6 border-border/80 glass-panel space-y-4">
            <h3 className="font-extrabold text-base text-foreground">Customer Ratings & Feedback</h3>
            <div className="space-y-3">
              {reviewsData?.reviews?.map((rv: any) => (
                <div key={rv._id} className="p-4 rounded-2xl border border-border bg-card/60 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">{rv.userId?.firstName} {rv.userId?.lastName}</span>
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{rv.rating} / 5</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{rv.comment}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};
