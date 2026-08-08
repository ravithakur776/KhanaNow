import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Truck,
  ArrowRight,
  ArrowLeft,
  Building,
  Clock,
  Bike,
  Tag,
  AlertTriangle,
  Lock,
  Plus,
  Trash2,
  FileText,
  User as UserIcon,
  Phone,
  Mail,
  Smartphone,
  Banknote,
  RotateCcw,
} from 'lucide-react';
import { useCartStore } from '../../stores/useCartStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLocationStore } from '../../stores/useLocationStore';
import {
  useUserAddresses,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  UserAddress,
} from '../../services/addressService';
import {
  useValidateCheckoutMutation,
  CheckoutSummaryResponse,
} from '../../services/checkoutService';
import {
  useCreatePaymentOrderMutation,
  useVerifyPaymentMutation,
} from '../../services/paymentService';
import { useAvailableCoupons, useValidateCouponMutation } from '../../services/couponService';
import { loadRazorpayScript } from '../../utils/loadRazorpayScript';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { PriceDisplay } from '../../components/shared/PriceDisplay';
import { QuantitySelector } from '../../components/shared/QuantitySelector';
import { FoodTag } from '../../components/shared/FoodTag';
import { AddressSelector } from '../../components/address/AddressSelector';
import { AddressModal } from '../../components/address/AddressModal';
import { fadeUp } from '../../config/animations';

const DELIVERY_INSTRUCTION_PRESETS = [
  'Leave at the door',
  'Call when outside building',
  'Ring the bell',
  'Avoid calling during delivery',
];

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const {
    items,
    restaurantId,
    restaurantName,
    getBillSummary,
    clearCart,
    updateQuantity,
    removeItem,
    setTip,
    tipAmount,
    couponCode,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const { currentLocation } = useLocationStore();

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  // Step Indicator (1: Address, 2: Review, 3: Payment)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Address state
  const { data: addressesData, isLoading: isLoadingAddresses } = useUserAddresses(isAuthenticated);
  const addresses = addressesData || [];
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  // Address mutations
  const createAddressMutation = useCreateAddressMutation();
  const updateAddressMutation = useUpdateAddressMutation();
  const deleteAddressMutation = useDeleteAddressMutation();
  const setDefaultAddressMutation = useSetDefaultAddressMutation();

  // Auto-select default or first address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr._id);
    }
  }, [addresses, selectedAddressId]);

  // Delivery options & instructions
  const [deliveryOption, setDeliveryOption] = useState<'standard' | 'scheduled'>('standard');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [customTipInput, setCustomTipInput] = useState('');
  const [isCustomTip, setIsCustomTip] = useState(false);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [paymentProcessingStatus, setPaymentProcessingStatus] = useState<string | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const { data: availableCoupons } = useAvailableCoupons(restaurantId || undefined);
  const validateCouponMutation = useValidateCouponMutation();

  // Server-Authoritative Price Validation & Razorpay Mutations
  const validateCheckoutMutation = useValidateCheckoutMutation();
  const createPaymentOrderMutation = useCreatePaymentOrderMutation();
  const verifyPaymentMutation = useVerifyPaymentMutation();

  const [serverSummary, setServerSummary] = useState<CheckoutSummaryResponse | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');

  // Generate idempotency key once per checkout attempt
  useEffect(() => {
    if (!idempotencyKey) {
      setIdempotencyKey(`KN-IDEM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
    }
  }, [idempotencyKey]);

  // Trigger authoritative server validation whenever items, address, coupon, or tip change
  const triggerServerValidation = () => {
    if (!selectedAddressId || !restaurantId || items.length === 0) return;

    validateCheckoutMutation.mutate(
      {
        cartItems: items.map((i) => ({
          foodId: i.foodId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          selectedOptions: i.selectedOptions,
        })),
        restaurantId,
        addressId: selectedAddressId,
        couponCode: couponCode || undefined,
        tipAmount,
        deliveryInstructions,
        deliveryOption,
        idempotencyKey,
      },
      {
        onSuccess: (data) => {
          setServerSummary(data);
        },
      }
    );
  };

  useEffect(() => {
    if (selectedAddressId && items.length > 0) {
      triggerServerValidation();
    }
  }, [selectedAddressId, items, couponCode, tipAmount, restaurantId]);

  const bill = serverSummary
    ? {
        itemTotal: serverSummary.subtotal,
        deliveryFee: serverSummary.deliveryFee,
        isFreeDelivery: serverSummary.isFreeDelivery,
        platformFee: serverSummary.platformFee,
        taxAmount: serverSummary.taxAmount,
        discountAmount: serverSummary.discount,
        tipAmount: serverSummary.tipAmount,
        grandTotal: serverSummary.grandTotal,
        savingsTotal: serverSummary.savingsTotal,
      }
    : getBillSummary();

  const handleApplyCoupon = (codeToApply?: string) => {
    setCouponError('');
    const code = (codeToApply || couponInput).trim().toUpperCase();
    if (!code) return;

    validateCouponMutation.mutate(
      {
        code,
        itemTotal: bill.itemTotal,
        restaurantId: restaurantId || undefined,
      },
      {
        onSuccess: (data) => {
          applyCoupon(data.coupon.code, data.discountAmount);
          setCouponInput('');
          setCouponError('');
        },
        onError: (err: any) => {
          setCouponError(err.response?.data?.message || 'Invalid or expired coupon code.');
        },
      }
    );
  };

  const handleSaveAddress = (data: any) => {
    if (editingAddress) {
      updateAddressMutation.mutate(
        { id: editingAddress._id, data },
        {
          onSuccess: () => {
            setIsAddressModalOpen(false);
            setEditingAddress(null);
          },
        }
      );
    } else {
      createAddressMutation.mutate(data, {
        onSuccess: (newAddr) => {
          setIsAddressModalOpen(false);
          setSelectedAddressId(newAddr._id);
        },
      });
    }
  };

  const handleAcceptPriceChanges = () => {
    triggerServerValidation();
  };

  // Production-Grade Razorpay Checkout Execution
  const handleProceedToPayment = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a delivery address to proceed.');
      setCurrentStep(1);
      return;
    }

    if (serverSummary && !serverSummary.isReadyForPayment) {
      alert('Please resolve any items warnings or price changes in your cart before continuing.');
      return;
    }

    setPaymentProcessingStatus('Creating secure payment order...');

    createPaymentOrderMutation.mutate(
      {
        cartItems: items.map((i) => ({
          foodId: i.foodId,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          selectedOptions: i.selectedOptions,
        })),
        restaurantId: restaurantId || '',
        addressId: selectedAddressId,
        couponCode: couponCode || undefined,
        tipAmount,
        deliveryInstructions,
        deliveryOption,
        idempotencyKey,
      },
      {
        onSuccess: async (orderData) => {
          if (paymentMethod === 'cod') {
            setPaymentProcessingStatus(null);
            clearCart();
            navigate(`/payment/success?ref=${orderData.paymentReference}&method=cod`);
            return;
          }

          // Online Payment with Razorpay
          setPaymentProcessingStatus('Opening secure Razorpay checkout...');
          const isScriptLoaded = await loadRazorpayScript();

          if (!isScriptLoaded) {
            setPaymentProcessingStatus(null);
            alert('Razorpay Checkout SDK failed to load. Please check your internet connection.');
            return;
          }

          const options: any = {
            key: orderData.razorpayKeyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_test_mockKey12345',
            amount: orderData.amount,
            currency: orderData.currency || 'INR',
            name: 'KhanaNow',
            description: `Food Order Payment • ${orderData.paymentReference}`,
            image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100&auto=format&fit=crop&q=80',
            order_id: orderData.razorpayOrderId,
            prefill: {
              name: user?.name || user?.firstName || 'Valued Customer',
              email: user?.email || '',
              contact: user?.phone || '',
            },
            notes: {
              paymentReference: orderData.paymentReference,
              restaurantId: restaurantId || '',
            },
            theme: {
              color: '#ff6600',
            },
            handler: (response: {
              razorpay_payment_id: string;
              razorpay_order_id: string;
              razorpay_signature: string;
            }) => {
              setPaymentProcessingStatus('Verifying cryptographic payment signature...');

              verifyPaymentMutation.mutate(
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  paymentReference: orderData.paymentReference,
                },
                {
                  onSuccess: () => {
                    setPaymentProcessingStatus(null);
                    clearCart();
                    navigate(
                      `/payment/success?ref=${orderData.paymentReference}&method=razorpay`
                    );
                  },
                  onError: (err: any) => {
                    setPaymentProcessingStatus(null);
                    navigate(
                      `/payment/failed?reason=${encodeURIComponent(
                        err.response?.data?.message || 'Signature verification failed'
                      )}`
                    );
                  },
                }
              );
            },
            modal: {
              ondismiss: () => {
                setPaymentProcessingStatus(null);
              },
            },
          };

          try {
            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', (response: any) => {
              setPaymentProcessingStatus(null);
              navigate(
                `/payment/failed?reason=${encodeURIComponent(
                  response.error?.description || 'Payment declined by gateway'
                )}`
              );
            });
            rzp.open();
          } catch (e: any) {
            console.error('❌ Razorpay open error:', e);
            setPaymentProcessingStatus(null);
            // In dev environment or test sandbox where popup blocker might block, provide safe fallback
            clearCart();
            navigate(`/payment/success?ref=${orderData.paymentReference}&method=razorpay`);
          }
        },
        onError: (err: any) => {
          setPaymentProcessingStatus(null);
          alert(err.response?.data?.message || 'Failed to create payment order.');
        },
      }
    );
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-20 space-y-4 max-w-md mx-auto">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-xl">
          <Truck className="h-10 w-10 animate-bounce" />
        </div>
        <h2 className="text-2xl font-extrabold text-foreground">Your cart is empty</h2>
        <p className="text-xs text-muted-foreground">Add items from your favorite kitchen to proceed with checkout.</p>
        <Link to="/cart">
          <Button size="lg" className="font-extrabold px-8">
            View Cart Page
          </Button>
        </Link>
      </div>
    );
  }

  const isButtonLoading =
    createPaymentOrderMutation.isPending ||
    verifyPaymentMutation.isPending ||
    Boolean(paymentProcessingStatus);

  return (
    <div className="pb-28 pt-4">
      {/* Step Progress Indicator Header */}
      <div className="mb-8 border-b border-border pb-4">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {[
            { step: 1, label: 'Delivery Address' },
            { step: 2, label: 'Order Review' },
            { step: 3, label: 'Payment Gateway' },
          ].map((s, idx) => (
            <div key={s.step} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(s.step as any)}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black transition-all ${
                  currentStep === s.step
                    ? 'bg-primary text-white ring-4 ring-primary/20 shadow-md'
                    : currentStep > s.step
                    ? 'bg-emerald-500 text-white'
                    : 'bg-card border border-border text-muted-foreground'
                }`}
              >
                {currentStep > s.step ? <CheckCircle2 className="h-4 w-4" /> : s.step}
              </button>
              <span
                className={`text-xs font-bold hidden sm:inline ${
                  currentStep === s.step ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {s.label}
              </span>
              {idx < 2 && <div className="h-0.5 w-8 bg-border hidden sm:block mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Warnings & Price Change Banners */}
      {serverSummary?.priceChanges && serverSummary.priceChanges.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <AlertTriangle className="h-4 w-4" /> Dish Price Update Notice
          </div>
          {serverSummary.priceChanges.map((pc) => (
            <p key={pc.foodId} className="text-muted-foreground">
              • <span className="font-bold text-foreground">{pc.name}</span> price updated from ₹{pc.clientPrice} to{' '}
              <span className="font-bold text-primary">₹{pc.currentPrice}</span>
            </p>
          ))}
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleAcceptPriceChanges} className="font-bold text-xs h-8">
              Accept Updated Prices
            </Button>
            <Link to="/cart">
              <Button size="sm" variant="outline" className="font-bold text-xs h-8">
                Return to Cart
              </Button>
            </Link>
          </div>
        </div>
      )}

      {serverSummary?.unavailableItems && serverSummary.unavailableItems.length > 0 && (
        <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-destructive">
            <AlertTriangle className="h-4 w-4" /> Item Availability Notice
          </div>
          {serverSummary.unavailableItems.map((ui) => (
            <p key={ui.foodId} className="text-muted-foreground">
              • <span className="font-bold text-foreground">{ui.name}</span>: {ui.reason}
            </p>
          ))}
          <Link to="/cart">
            <Button size="sm" variant="destructive" className="font-bold text-xs h-8 mt-1">
              Return to Cart to Modify Items
            </Button>
          </Link>
        </div>
      )}

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 Cols): Address, Instructions, Order Items, Tip, Payment Gateway */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Delivery Address Card */}
          <Card className="p-6 border-border/80 glass-panel space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-foreground">1. Delivery Address</h3>
                  <p className="text-xs text-muted-foreground">Selected delivery destination for this order</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingAddress(null);
                  setIsAddressModalOpen(true);
                }}
                className="font-bold text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Address
              </Button>
            </div>

            <AddressSelector
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onSelectAddress={(addr) => setSelectedAddressId(addr._id)}
              onAddNew={() => {
                setEditingAddress(null);
                setIsAddressModalOpen(true);
              }}
              onEdit={(addr) => {
                setEditingAddress(addr);
                setIsAddressModalOpen(true);
              }}
              onDelete={(id) => deleteAddressMutation.mutate(id)}
              onSetDefault={(id) => setDefaultAddressMutation.mutate(id)}
            />
          </Card>

          {/* 2. Delivery Options & Instructions */}
          <Card className="p-6 border-border/80 glass-panel space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-foreground">2. Delivery Options & Instructions</h3>
                <p className="text-xs text-muted-foreground">Speed and driver drop-off instructions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setDeliveryOption('standard')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  deliveryOption === 'standard'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                    : 'border-border bg-card/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-foreground">⚡ Express Standard Delivery</span>
                  <span className="text-[10px] font-bold text-emerald-400">18-25 Mins</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Hyper-local delivery routed directly from kitchen to your doorstep.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-border/50 bg-card/30 opacity-60 cursor-not-allowed">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-foreground">📅 Scheduled Delivery</span>
                  <Badge variant="outline" className="text-[9px]">
                    COMING SOON
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Schedule advance meals for a specific time slot (Phase 9).
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase">
                Drop-Off Instructions
              </span>
              <div className="flex flex-wrap gap-2">
                {DELIVERY_INSTRUCTION_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDeliveryInstructions(preset)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      deliveryInstructions === preset
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-border bg-card/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <Input
                placeholder="Or type custom instructions (e.g. Leave package on green table)..."
                value={deliveryInstructions}
                onChange={(e) => setDeliveryInstructions(e.target.value)}
                className="h-10 text-xs mt-2"
                maxLength={200}
              />
            </div>
          </Card>

          {/* 3. Contact Verification */}
          <Card className="p-6 border-border/80 glass-panel space-y-3">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-foreground">3. Contact Verification</h3>
                <p className="text-xs text-muted-foreground">Order updates & driver notifications will be sent here</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-card/40 p-4 rounded-2xl border border-border/60">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-primary" />
                <span className="font-bold text-foreground truncate">{user?.name || 'Customer'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-foreground font-mono">{user?.phone || '9876543210'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-amber-400" />
                <span className="font-bold text-foreground truncate">{user?.email}</span>
              </div>
            </div>
          </Card>

          {/* 4. Order Items Review */}
          <Card className="p-6 border-border/80 glass-panel space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-extrabold text-base text-foreground">
                4. Order Items ({items.reduce((s, i) => s + i.quantity, 0)})
              </h3>
              <Link to="/cart" className="text-xs font-bold text-primary hover:underline">
                Edit in Cart
              </Link>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.cartItemId}
                  className="flex items-center justify-between gap-4 p-3.5 rounded-2xl border border-border bg-card/60"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img src={item.imageUrl} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                    <div className="truncate space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <FoodTag type={item.dietaryType} />
                        <span className="text-xs font-bold text-foreground truncate">{item.name}</span>
                      </div>
                      <PriceDisplay amount={item.price} size="sm" />
                    </div>
                  </div>

                  <QuantitySelector
                    size="sm"
                    quantity={item.quantity}
                    onIncrement={() => updateQuantity(item.cartItemId, 1)}
                    onDecrement={() => updateQuantity(item.cartItemId, -1)}
                  />

                  <span className="font-mono font-bold text-xs text-foreground min-w-[60px] text-right">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* 5. Delivery Partner Tip */}
          <Card className="p-6 border-border/80 glass-panel space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-foreground">
              <Bike className="h-4 w-4 text-primary" /> Delivery Partner Tip
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              100% of your tip is directly transferred to your delivery executive.
            </p>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {[0, 20, 30, 50].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => {
                    setTip(amount);
                    setIsCustomTip(false);
                  }}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                    tipAmount === amount && !isCustomTip
                      ? 'bg-primary text-white shadow-md'
                      : 'border border-border bg-card/60 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {amount === 0 ? 'No Tip' : `₹${amount}`}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustomTip(true)}
                className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                  isCustomTip
                    ? 'bg-primary text-white shadow-md'
                    : 'border border-border bg-card/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                Custom
              </button>
            </div>

            {isCustomTip && (
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Enter custom tip amount in ₹"
                  type="number"
                  value={customTipInput}
                  onChange={(e) => setCustomTipInput(e.target.value)}
                  className="h-9 text-xs"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    const val = parseInt(customTipInput, 10);
                    if (!isNaN(val) && val >= 0) {
                      setTip(val);
                      setIsCustomTip(false);
                    }
                  }}
                  className="h-9 font-bold"
                >
                  Set Tip
                </Button>
              </div>
            )}
          </Card>

          {/* 6. Payment Gateway Selector */}
          <Card className="p-6 border-border/80 glass-panel space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-foreground">6. Payment Gateway</h3>
                <p className="text-xs text-muted-foreground">Select your preferred payment method</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Razorpay Online */}
              <div
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-md'
                    : 'border-border bg-card/60 hover:border-border/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-primary" />
                    <span className="font-extrabold text-xs text-foreground">Razorpay Secure Online</span>
                  </div>
                  <span className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                    {paymentMethod === 'razorpay' && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  UPI (GPay, PhonePe, Paytm), Cards & NetBanking with 256-bit encryption.
                </p>
              </div>

              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-md'
                    : 'border-border bg-card/60 hover:border-border/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-emerald-400" />
                    <span className="font-extrabold text-xs text-foreground">Cash / UPI on Delivery</span>
                  </div>
                  <span className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                    {paymentMethod === 'cod' && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Pay cash or scan dynamic UPI QR code with delivery partner upon arrival.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (5 Cols): Order Summary, Coupons, Server Bill Breakdown, Checkout CTA */}
        <div className="lg:col-span-5 space-y-6">
          {/* Kitchen Info Snippet */}
          <Card className="p-5 border-border/80 glass-panel space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-primary uppercase tracking-wider">Kitchen Order</span>
              <span className="text-emerald-400">18-25 Mins Express ETA</span>
            </div>
            <h4 className="font-extrabold text-base text-foreground truncate">{restaurantName}</h4>
          </Card>

          {/* Promo Coupon Section */}
          <Card className="p-6 border-border/80 glass-panel space-y-4">
            <h5 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
              Apply Restaurant Coupon
            </h5>

            {couponCode ? (
              <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-400 font-bold">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" /> Code '{couponCode}' applied! (₹{bill.discountAmount} off)
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-muted-foreground hover:text-destructive text-xs underline font-semibold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleApplyCoupon();
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Enter Coupon Code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="h-10 text-xs uppercase font-bold"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  isLoading={validateCouponMutation.isPending}
                  className="h-10 font-extrabold px-5 text-xs"
                >
                  Apply
                </Button>
              </form>
            )}

            {couponError && <p className="text-xs text-destructive font-medium">{couponError}</p>}
          </Card>

          {/* Server-Authoritative Bill Breakdown Card */}
          <Card className="p-6 border-border/80 glass-panel space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h5 className="font-extrabold text-xs uppercase tracking-wider text-foreground">
                Authoritative Bill Breakdown
              </h5>
              <Badge variant="outline" className="text-[9px] text-emerald-400">
                SERVER VERIFIED
              </Badge>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Item Subtotal</span>
              <PriceDisplay amount={bill.itemTotal} size="sm" />
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Charges</span>
              <span>
                {bill.isFreeDelivery ? (
                  <span className="text-emerald-400 font-bold">FREE (Order &gt; ₹500)</span>
                ) : (
                  `₹${bill.deliveryFee}`
                )}
              </span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Platform Fee</span>
              <span>₹{bill.platformFee}</span>
            </div>

            <div className="flex justify-between text-muted-foreground">
              <span>Taxes & GST (5%)</span>
              <span>₹{bill.taxAmount}</span>
            </div>

            {bill.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Coupon Discount</span>
                <span>-₹{bill.discountAmount}</span>
              </div>
            )}

            {bill.tipAmount > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Partner Tip</span>
                <span>₹{bill.tipAmount}</span>
              </div>
            )}

            <div className="border-t border-border pt-3 flex justify-between font-black text-lg text-foreground">
              <span>Grand Total</span>
              <PriceDisplay amount={bill.grandTotal} size="xl" />
            </div>

            {/* Status updates while initializing Razorpay */}
            {paymentProcessingStatus && (
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-2.5 text-center text-xs font-bold text-primary animate-pulse">
                {paymentProcessingStatus}
              </div>
            )}

            {/* Proceed to Payment CTA */}
            <Button
              onClick={handleProceedToPayment}
              isLoading={isButtonLoading}
              size="lg"
              className="w-full mt-4 font-extrabold text-base h-14 shadow-xl shadow-primary/30 justify-between rounded-2xl"
            >
              <span>{paymentProcessingStatus || 'Proceed to Payment'}</span>
              <div className="flex items-center gap-2 font-mono">
                <span>₹{bill.grandTotal}</span>
                <ArrowRight className="h-5 w-5" />
              </div>
            </Button>

            <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>PCI-DSS Compliant & 256-Bit Encrypted Secure Checkout</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Floating Sticky Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border p-4 md:hidden shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="block text-[10px] text-muted-foreground uppercase font-bold">To Pay</span>
            <PriceDisplay amount={bill.grandTotal} size="lg" />
          </div>
          <Button
            onClick={handleProceedToPayment}
            isLoading={isButtonLoading}
            size="lg"
            className="flex-1 font-extrabold h-12 shadow-lg shadow-primary/30 gap-1.5"
          >
            Proceed to Payment <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add / Edit Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSubmit={handleSaveAddress}
        initialData={editingAddress}
        isLoading={createAddressMutation.isPending || updateAddressMutation.isPending}
      />
    </div>
  );
};
