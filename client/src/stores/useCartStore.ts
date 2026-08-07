import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItemOption {
  groupName: string;
  optionName: string;
  price: number;
}

export interface CartItem {
  cartItemId: string; // Unique hash: foodId + JSON.stringify(options)
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

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  tipAmount: number;
  couponCode: string | null;
  discountAmount: number;
  addItem: (item: Omit<CartItem, 'cartItemId'>) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  setTip: (tip: number) => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  clearCart: () => void;
  getItemCount: () => number;
  getItemTotal: () => number;
  getBillSummary: () => {
    itemTotal: number;
    deliveryFee: number;
    platformFee: number;
    discountAmount: number;
    taxAmount: number;
    tipAmount: number;
    grandTotal: number;
  };
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

      addItem: (newItem) => {
        const state = get();

        // If adding from a different restaurant, confirm or reset cart
        if (state.restaurantId && state.restaurantId !== newItem.restaurantId) {
          if (
            !window.confirm(
              `Your cart contains dishes from "${state.restaurantName}". Replace with dishes from "${newItem.restaurantName}"?`
            )
          ) {
            return;
          }
          set({
            items: [],
            restaurantId: newItem.restaurantId,
            restaurantName: newItem.restaurantName,
          });
        }

        const optionsHash = newItem.selectedOptions
          ? JSON.stringify(newItem.selectedOptions)
          : '';
        const cartItemId = `${newItem.foodId}_${optionsHash}`;

        const currentItems = get().items;
        const existingIndex = currentItems.findIndex(
          (i) => i.cartItemId === cartItemId
        );

        let updatedItems: CartItem[];
        if (existingIndex > -1) {
          updatedItems = [...currentItems];
          updatedItems[existingIndex].quantity += newItem.quantity;
        } else {
          updatedItems = [
            ...currentItems,
            { ...newItem, cartItemId },
          ];
        }

        set({
          items: updatedItems,
          restaurantId: newItem.restaurantId,
          restaurantName: newItem.restaurantName,
        });
      },

      removeItem: (cartItemId) => {
        const updated = get().items.filter((i) => i.cartItemId !== cartItemId);
        set({
          items: updated,
          ...(updated.length === 0 && { restaurantId: null, restaurantName: null }),
        });
      },

      updateQuantity: (cartItemId, delta) => {
        const items = get().items;
        const updated = items
          .map((item) => {
            if (item.cartItemId === cartItemId) {
              const newQty = item.quantity + delta;
              return newQty > 0 ? { ...item, quantity: newQty } : null;
            }
            return item;
          })
          .filter(Boolean) as CartItem[];

        set({
          items: updated,
          ...(updated.length === 0 && { restaurantId: null, restaurantName: null }),
        });
      },

      setTip: (tip) => set({ tipAmount: tip }),

      applyCoupon: (code, discount) => set({ couponCode: code, discountAmount: discount }),

      removeCoupon: () => set({ couponCode: null, discountAmount: 0 }),

      clearCart: () =>
        set({
          items: [],
          restaurantId: null,
          restaurantName: null,
          couponCode: null,
          discountAmount: 0,
        }),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getItemTotal: () =>
        get().items.reduce((sum, item) => {
          const optionsCost =
            item.selectedOptions?.reduce((optSum, opt) => optSum + opt.price, 0) || 0;
          return sum + (item.price + optionsCost) * item.quantity;
        }, 0),

      getBillSummary: () => {
        const itemTotal = get().getItemTotal();
        if (itemTotal === 0) {
          return {
            itemTotal: 0,
            deliveryFee: 0,
            platformFee: 0,
            discountAmount: 0,
            taxAmount: 0,
            tipAmount: 0,
            grandTotal: 0,
          };
        }

        const deliveryFee = itemTotal > 500 ? 0 : 35; // Free delivery above ₹500
        const platformFee = 6;
        const discountAmount = get().discountAmount;
        const taxableAmount = Math.max(0, itemTotal - discountAmount);
        const taxAmount = Math.round(taxableAmount * 0.05); // 5% GST on food
        const tipAmount = get().tipAmount;

        const grandTotal = Math.max(
          0,
          itemTotal + deliveryFee + platformFee + taxAmount + tipAmount - discountAmount
        );

        return {
          itemTotal,
          deliveryFee,
          platformFee,
          discountAmount,
          taxAmount,
          tipAmount,
          grandTotal,
        };
      },
    }),
    {
      name: 'khananow_cart_store',
    }
  )
);
