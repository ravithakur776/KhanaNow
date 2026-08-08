import { Address } from '../models/address.model.js';
import { Restaurant } from '../models/restaurant.model.js';
import { Food } from '../models/food.model.js';
import { couponService } from './coupon.service.js';
import { calculateOrderPricing } from '../utils/pricing.util.js';
import { ApiError } from '../utils/apiError.js';

export interface CheckoutValidateDTO {
  userId: string;
  restaurantId: string;
  addressId: string;
  cartItems: Array<{
    foodId: string;
    name?: string;
    price?: number;
    quantity: number;
    selectedOptions?: Array<{ groupName: string; optionName: string; price: number }>;
  }>;
  couponCode?: string;
  tipAmount?: number;
  deliveryInstructions?: string;
  deliveryOption?: 'standard' | 'scheduled';
  idempotencyKey?: string;
}

export class CheckoutService {
  async validateCheckout(dto: CheckoutValidateDTO) {
    if (!dto.cartItems || dto.cartItems.length === 0) {
      throw new ApiError(400, 'Cannot checkout with an empty cart', 'EMPTY_CART');
    }

    // 1. Verify Address Ownership
    const address = await Address.findOne({ _id: dto.addressId, userId: dto.userId });
    if (!address) {
      throw new ApiError(404, 'Selected delivery address not found or access denied', 'ADDRESS_NOT_FOUND');
    }

    // 2. Verify Restaurant
    const restaurant = await Restaurant.findById(dto.restaurantId);
    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found', 'RESTAURANT_NOT_FOUND');
    }

    if (restaurant.status !== 'active') {
      throw new ApiError(400, `Restaurant "${restaurant.name}" is currently suspended or inactive`, 'RESTAURANT_INACTIVE');
    }

    if (!restaurant.isOpen) {
      throw new ApiError(400, `Restaurant "${restaurant.name}" is currently closed and not accepting orders`, 'RESTAURANT_CLOSED');
    }

    // 3. Fetch Food Items from Database
    const foodIds = dto.cartItems.map((item) => item.foodId);
    const dbFoods = await Food.find({ _id: { $in: foodIds } });
    const foodMap = new Map(dbFoods.map((f) => [f._id.toString(), f]));

    const validatedItems: any[] = [];
    const unavailableItems: any[] = [];
    const priceChanges: any[] = [];
    const validationWarnings: string[] = [];

    let authoritativeSubtotal = 0;

    for (const item of dto.cartItems) {
      const dbFood = foodMap.get(item.foodId);

      if (!dbFood) {
        unavailableItems.push({
          foodId: item.foodId,
          name: item.name || 'Unknown Food Item',
          reason: 'Item has been removed from the restaurant menu',
        });
        continue;
      }

      if (dbFood.restaurantId.toString() !== dto.restaurantId) {
        throw new ApiError(
          400,
          `Food item "${dbFood.name}" does not belong to restaurant "${restaurant.name}"`,
          'RESTAURANT_MISMATCH'
        );
      }

      if (!dbFood.isAvailable) {
        unavailableItems.push({
          foodId: item.foodId,
          name: dbFood.name,
          reason: 'Currently sold out or unavailable',
        });
        continue;
      }

      const authoritativePrice = dbFood.discountedPrice || dbFood.price;
      if (item.price && item.price !== authoritativePrice) {
        priceChanges.push({
          foodId: item.foodId,
          name: dbFood.name,
          clientPrice: item.price,
          currentPrice: authoritativePrice,
          difference: authoritativePrice - item.price,
        });
      }

      const optionsCost =
        item.selectedOptions?.reduce((acc, opt) => acc + (opt.price || 0), 0) || 0;
      const itemTotal = (authoritativePrice + optionsCost) * item.quantity;
      authoritativeSubtotal += itemTotal;

      validatedItems.push({
        foodId: dbFood._id.toString(),
        name: dbFood.name,
        imageUrl: dbFood.imageUrl,
        dietaryType: dbFood.dietaryType,
        price: authoritativePrice,
        originalPrice: dbFood.price,
        quantity: item.quantity,
        selectedOptions: item.selectedOptions || [],
        itemTotal,
      });
    }

    if (unavailableItems.length > 0) {
      validationWarnings.push(
        `${unavailableItems.length} item(s) in your cart are currently unavailable.`
      );
    }

    if (priceChanges.length > 0) {
      validationWarnings.push(
        `Prices for ${priceChanges.length} item(s) have been updated from the kitchen.`
      );
    }

    // 4. Minimum Order Check
    const minOrder = 150; // Standard minimum order threshold
    if (authoritativeSubtotal > 0 && authoritativeSubtotal < minOrder) {
      validationWarnings.push(
        `Minimum order value for ${restaurant.name} is ₹${minOrder}. Please add ₹${minOrder - authoritativeSubtotal} more.`
      );
    }

    // 5. Server-Authoritative Coupon Validation
    let validatedCoupon: any = null;
    let couponDiscount = 0;

    if (dto.couponCode && dto.couponCode.trim().length > 0) {
      try {
        const couponResult = await couponService.validateCoupon({
          code: dto.couponCode,
          itemTotal: authoritativeSubtotal,
          restaurantId: dto.restaurantId,
          userId: dto.userId,
        });
        validatedCoupon = couponResult.coupon;
        couponDiscount = couponResult.discountAmount;
      } catch (couponError: any) {
        validationWarnings.push(couponError.message || 'Coupon could not be applied');
      }
    }

    // 6. Compute Server-Authoritative Financial Breakdown
    const pricing = calculateOrderPricing({
      itemTotal: authoritativeSubtotal,
      discountAmount: couponDiscount,
      tipAmount: dto.tipAmount || 0,
    });

    const isReadyForPayment =
      unavailableItems.length === 0 &&
      priceChanges.length === 0 &&
      authoritativeSubtotal >= minOrder &&
      validatedItems.length > 0;

    return {
      valid: isReadyForPayment,
      isReadyForPayment,
      idempotencyKey: dto.idempotencyKey || `KN-IDEM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      restaurant: {
        id: restaurant._id.toString(),
        name: restaurant.name,
        address: `${restaurant.address.street}, ${restaurant.address.city}`,
        isOpen: restaurant.isOpen,
      },
      address: {
        id: address._id.toString(),
        fullName: address.fullName,
        phone: address.phone,
        label: address.label,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        fullFormatted: `${address.addressLine1}, ${address.city} - ${address.postalCode}`,
      },
      items: validatedItems,
      subtotal: pricing.itemTotal,
      discount: pricing.discountAmount,
      deliveryFee: pricing.deliveryFee,
      isFreeDelivery: pricing.isFreeDelivery,
      platformFee: pricing.platformFee,
      taxAmount: pricing.taxAmount,
      tipAmount: pricing.tipAmount,
      grandTotal: pricing.grandTotal,
      savingsTotal: pricing.savingsTotal,
      coupon: validatedCoupon
        ? {
            code: validatedCoupon.code,
            description: validatedCoupon.description,
            discountAmount: couponDiscount,
          }
        : null,
      deliveryOption: dto.deliveryOption || 'standard',
      deliveryInstructions: dto.deliveryInstructions || '',
      validationWarnings,
      priceChanges,
      unavailableItems,
    };
  }
}

export const checkoutService = new CheckoutService();
