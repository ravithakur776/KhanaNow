import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateOrderPricing, PricingBreakdown } from '../utils/pricing';

export interface CartItemOption {
  groupName: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  cartItemId: string; // Unique deterministic hash: foodId + JSON.stringify(options)
  foodId: string;
  name: string;
  imageUrl: string;
  price: number;
  dietaryType: 'veg' | 'non-veg' | 'egg';
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  selectedOptions?: CartItemOption[];
}

export interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  tipAmount: number;
  couponCode: string | null;
  discountAmount: number;
  pendingItem: Omit<CartItem, 'cartItemId'> | null;
  isSwitchModalOpen: boolean;

  // Actions
  addItem: (item: Omit<CartItem, 'cartItemId'>) => void;
  confirmRestaurantSwitch: () => void;
  cancelRestaurantSwitch: () => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  setTip: (tip: number) => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  getItemCount: () => number;
  getItemTotal: () => number;
  getBillSummary: () => PricingBreakdown;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,
      tipAmount: 30, // Default driver tip ₹30
      couponCode: null,
      discountAmount: 0,
      pendingItem: null,
      isSwitchModalOpen: false,

      addItem: (newItem: Omit<CartItem, 'cartItemId'>) => {
        const state = get();

        // If items exist from another restaurant, open modal instead of window.confirm
        if (state.restaurantId && state.items.length > 0 && state.restaurantId !== newItem.restaurantId) {
          set({
            pendingItem: newItem,
            isSwitchModalOpen: true,
          });
          return;
        }

        const optionsHash = newItem.selectedOptions && newItem.selectedOptions.length > 0
          ? JSON.stringify(newItem.selectedOptions)
          : '';
        const cartItemId = `${newItem.foodId}_${optionsHash}`;

        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i: CartItem) => i.cartItemId === cartItemId);

        let updatedItems: CartItem[];
        if (existingIndex > -1) {
          updatedItems = [...currentItems];
          updatedItems[existingIndex].quantity += newItem.quantity;
        } else {
          updatedItems = [...currentItems, { ...newItem, cartItemId }];
        }

        set({
          items: updatedItems,
          restaurantId: newItem.restaurantId,
          restaurantName: newItem.restaurantName,
        });
      },

      confirmRestaurantSwitch: () => {
        const { pendingItem } = get();
        if (!pendingItem) {
          set({ isSwitchModalOpen: false, pendingItem: null });
          return;
        }

        const optionsHash = pendingItem.selectedOptions && pendingItem.selectedOptions.length > 0
          ? JSON.stringify(pendingItem.selectedOptions)
          : '';
        const cartItemId = `${pendingItem.foodId}_${optionsHash}`;

        set({
          items: [{ ...pendingItem, cartItemId }],
          restaurantId: pendingItem.restaurantId,
          restaurantName: pendingItem.restaurantName,
          couponCode: null,
          discountAmount: 0,
          pendingItem: null,
          isSwitchModalOpen: false,
        });
      },

      cancelRestaurantSwitch: () => {
        set({
          pendingItem: null,
          isSwitchModalOpen: false,
        });
      },

      removeItem: (cartItemId: string) => {
        const updated = get().items.filter((i: CartItem) => i.cartItemId !== cartItemId);
        set({
          items: updated,
          ...(updated.length === 0 && {
            restaurantId: null,
            restaurantName: null,
            couponCode: null,
            discountAmount: 0,
          }),
        });
      },

      updateQuantity: (cartItemId: string, delta: number) => {
        const items = get().items;
        const updated = items
          .map((item: CartItem): CartItem | null => {
            if (item.cartItemId === cartItemId) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter((item: CartItem | null): item is CartItem => item !== null);

        set({
          items: updated,
          ...(updated.length === 0 && {
            restaurantId: null,
            restaurantName: null,
            couponCode: null,
            discountAmount: 0,
          }),
        });
      },

      setTip: (tip: number) => set({ tipAmount: Math.max(0, tip) }),

      applyCoupon: (code: string, discount: number) =>
        set({ couponCode: code.toUpperCase(), discountAmount: Math.max(0, discount) }),

      removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),

      clearCart: () =>
        set({
          items: [],
          restaurantId: null,
          restaurantName: null,
          couponCode: null,
          discountAmount: 0,
          pendingItem: null,
          isSwitchModalOpen: false,
        }),

      getItemCount: () => get().items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0),

      getItemTotal: () =>
        get().items.reduce((sum: number, item: CartItem) => {
          const optionsCost =
            item.selectedOptions?.reduce((optSum: number, opt: CartItemOption) => optSum + opt.price, 0) || 0;
          return sum + (item.price + optionsCost) * item.quantity;
        }, 0),

      getBillSummary: () => {
        const state = get();
        const itemTotal = state.getItemTotal();
        return calculateOrderPricing({
          itemTotal,
          discountAmount: state.discountAmount,
          tipAmount: state.tipAmount,
        });
      },
    }),
    {
      name: 'khananow_cart_store',
    }
  )
);
