import mongoose from 'mongoose';
import { orderRepository, OrderQueryOptions } from '../repositories/order.repository.js';
import { paymentRepository } from '../repositories/payment.repository.js';
import { couponService } from './coupon.service.js';
import { notificationService } from './notification.service.js';
import { User } from '../models/user.model.js';
import { Food } from '../models/food.model.js';
import { Restaurant } from '../models/restaurant.model.js';
import { Address } from '../models/address.model.js';
import { OrderStatus, IOrderStatusHistoryEntry } from '../models/order.model.js';
import { calculateOrderPricing } from '../utils/pricing.util.js';
import { ApiError } from '../utils/apiError.js';

export interface CreateOrderFromPaymentDTO {
  paymentReference: string;
  addressId?: string;
  deliveryInstructions?: string;
  deliveryOption?: 'standard' | 'scheduled';
  idempotencyKey?: string;
}

const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PLACED: ['CONFIRMED', 'CANCELLED', 'FAILED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_PICKUP'],
  READY_FOR_PICKUP: ['PICKED_UP'],
  PICKED_UP: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
  FAILED: [],
};

export class OrderService {
  async createOrderFromPayment(dto: CreateOrderFromPaymentDTO, userId: string) {
    if (!dto.paymentReference) {
      throw new ApiError(400, 'paymentReference is required to create an order', 'PAYMENT_REFERENCE_REQUIRED');
    }

    // 1. Locate Verified Captured Payment
    const payment = await paymentRepository.findByReference(dto.paymentReference, userId);
    if (!payment) {
      throw new ApiError(404, 'Payment record not found or access denied', 'PAYMENT_NOT_FOUND');
    }

    if (payment.status !== 'captured') {
      throw new ApiError(400, `Payment has not been captured yet. Current status: ${payment.status}`, 'PAYMENT_NOT_CAPTURED');
    }

    // 2. Idempotency Check: Verify if an Order was already created for this payment
    const existingOrderByPayment = await orderRepository.findByPaymentId(payment._id.toString());
    if (existingOrderByPayment) {
      return {
        order: existingOrderByPayment,
        isReused: true,
        message: 'Order retrieved from existing transaction record',
      };
    }

    // 3. User Details Lookup for Contact Snapshot
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User account not found', 'USER_NOT_FOUND');
    }

    // 4. Authoritative Restaurant Lookup from Database
    const restaurant = await Restaurant.findById(payment.restaurantId);
    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found', 'RESTAURANT_NOT_FOUND');
    }

    if (restaurant.status !== 'active') {
      throw new ApiError(400, `Restaurant "${restaurant.name}" is currently suspended or inactive`, 'RESTAURANT_UNAVAILABLE');
    }

    // 5. Authoritative Address Lookup
    const metadata = payment.metadata || {};
    const address = dto.addressId
      ? await Address.findOne({ _id: dto.addressId, userId })
      : (await Address.findOne({ userId, isDefault: true })) || (await Address.findOne({ userId }));

    if (!address) {
      throw new ApiError(404, 'Valid customer delivery address not found. Please provide or select an address.', 'ADDRESS_NOT_FOUND');
    }

    // 6. Authoritative Food Items Lookup & Validation
    const cartItemsRaw: any[] = metadata.itemsSummary || [];
    const foodIds = cartItemsRaw.map((i) => i.foodId).filter(Boolean);

    let dbFoods: any[] = [];
    if (foodIds.length > 0) {
      dbFoods = await Food.find({
        _id: { $in: foodIds },
        restaurantId: restaurant._id,
        isDeleted: { $ne: true },
      });
    }

    const foodMap = new Map(dbFoods.map((f) => [f._id.toString(), f]));
    let authoritativeSubtotal = 0;
    const itemsSnapshot: any[] = [];

    for (const rawItem of cartItemsRaw) {
      const dbFood = rawItem.foodId ? foodMap.get(rawItem.foodId) : null;
      const unitPrice = dbFood ? (dbFood.discountedPrice || dbFood.price) : rawItem.price;
      const name = dbFood ? dbFood.name : (rawItem.name || 'Food Item');
      const dietaryType = dbFood ? dbFood.dietaryType : (rawItem.dietaryType || 'veg');
      const imageUrl = dbFood ? dbFood.imageUrl : rawItem.imageUrl;

      const optionsCost =
        rawItem.selectedOptions?.reduce((acc: number, opt: any) => acc + (Number(opt.price) || 0), 0) || 0;
      const qty = Math.max(1, Number(rawItem.quantity) || 1);
      const itemTotal = (unitPrice + optionsCost) * qty;

      authoritativeSubtotal += itemTotal;

      itemsSnapshot.push({
        foodId: dbFood ? dbFood._id.toString() : (rawItem.foodId || 'food_item'),
        name,
        imageUrl,
        dietaryType,
        quantity: qty,
        unitPrice,
        unitPricePaise: Math.round(unitPrice * 100),
        selectedOptions: rawItem.selectedOptions || [],
        optionsTotal: optionsCost,
        itemTotal,
      });
    }

    // If no items extracted from summary, fallback to payment subtotal
    if (itemsSnapshot.length === 0) {
      authoritativeSubtotal = metadata.subtotal || payment.amount / 100;
    }

    // 7. Authoritative Coupon Validation
    let couponDiscount = metadata.discount || 0;
    let validatedCoupon = (metadata as any).coupon || null;
    const couponCode = (metadata as any).couponCode;

    if (couponCode) {
      try {
        const couponResult = await couponService.validateCoupon({
          code: couponCode,
          itemTotal: authoritativeSubtotal,
          restaurantId: restaurant._id.toString(),
          userId,
        });
        validatedCoupon = couponResult.coupon;
        couponDiscount = couponResult.discountAmount;
      } catch {
        couponDiscount = metadata.discount || 0;
      }
    }

    // 8. Server-Authoritative Financial Breakdown
    const pricing = calculateOrderPricing({
      itemTotal: authoritativeSubtotal,
      discountAmount: couponDiscount,
      tipAmount: metadata.tipAmount || 0,
    });

    const calculatedGrandTotalPaise = Math.round(pricing.grandTotal * 100);

    // 9. Strict Financial Reconciliation Check
    // If captured payment amount does not match authoritative calculated total (allowing +/- 1 rupee margin for rounding)
    if (Math.abs(calculatedGrandTotalPaise - payment.amount) > 100) {
      throw new ApiError(
        400,
        `Payment amount mismatch: captured ₹${(payment.amount / 100).toFixed(2)}, calculated total ₹${pricing.grandTotal.toFixed(2)}`,
        'PAYMENT_AMOUNT_MISMATCH'
      );
    }

    // 10. Generate Human-Friendly Order Number (e.g. KN-20260808-8F4K2)
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `KN-${todayStr}-${randomSuffix}`;

    // 11. Estimated Delivery Time
    const estimatedDeliveryTime = new Date(Date.now() + 28 * 60 * 1000);

    // 12. Initial Status History Entry
    const statusHistory: IOrderStatusHistoryEntry[] = [
      {
        status: 'PLACED',
        changedAt: new Date(),
        actorType: 'customer',
        note: 'Order successfully placed after server payment verification',
      },
    ];

    // 13. Assemble Immutable Snapshots
    const pricingSnapshot = {
      subtotal: pricing.itemTotal,
      discount: pricing.discountAmount,
      deliveryFee: pricing.deliveryFee,
      platformFee: pricing.platformFee,
      taxAmount: pricing.taxAmount,
      tipAmount: pricing.tipAmount,
      grandTotal: pricing.grandTotal,
      grandTotalPaise: payment.amount,
      savingsTotal: pricing.savingsTotal,
      currency: payment.currency || 'INR',
    };

    const addressSnapshot = {
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      landmark: address.landmark || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country || 'India',
      formattedAddress: `${address.addressLine1}, ${address.city} - ${address.postalCode}`,
    };

    const contactSnapshot = {
      name: user.name || `${user.firstName} ${user.lastName}`,
      phone: user.phone || address.phone,
      email: user.email,
    };

    // 14. Persist Order in Database with Unique PaymentId constraint
    const order = await orderRepository.create({
      orderNumber,
      userId: userId as any,
      restaurantId: restaurant._id as any,
      paymentId: payment._id as any,
      paymentReference: payment.paymentReference,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      addressSnapshot,
      contactSnapshot,
      items: itemsSnapshot,
      pricing: pricingSnapshot,
      coupon: validatedCoupon,
      tip: pricing.tipAmount,
      deliveryInstructions: dto.deliveryInstructions || '',
      deliveryOption: dto.deliveryOption || 'standard',
      status: 'PLACED',
      statusHistory,
      estimatedDeliveryTime,
      placedAt: new Date(),
      idempotencyKey: dto.idempotencyKey || payment.idempotencyKey,
    });

    // 15. Link Payment to Order Document
    await paymentRepository.updateStatus(payment._id.toString(), payment.status, {
      orderId: order._id as any,
    });

    // 16. Trigger Customer Notifications Idempotently
    notificationService.createNotification({
      userId: payment.userId.toString(),
      type: 'ORDER_PLACED',
      title: 'Order Placed Successfully! 🎉',
      message: `Your order #${order.orderNumber} has been received by ${restaurant.name}.`,
      data: { orderNumber: order.orderNumber, restaurantId: restaurant._id.toString() },
      eventKey: `ORDER_PLACED:${order.orderNumber}`,
    }).catch((e) => console.error('Notification error:', e));

    notificationService.createNotification({
      userId: payment.userId.toString(),
      type: 'PAYMENT_SUCCESS',
      title: 'Payment Confirmed ✅',
      message: `Payment of ₹${order.pricing.grandTotal} was securely verified for order #${order.orderNumber}.`,
      data: { orderNumber: order.orderNumber },
      eventKey: `PAYMENT_SUCCESS:${order.orderNumber}`,
    }).catch((e) => console.error('Notification error:', e));

    return {
      order,
      isReused: false,
      message: 'Order created successfully',
    };
  }

  async getOrderDetails(orderNumber: string, userId: string, userRole: string = 'customer') {
    const order = await orderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new ApiError(404, `Order "${orderNumber}" not found`, 'ORDER_NOT_FOUND');
    }

    if (userRole === 'customer' && order.userId.toString() !== userId) {
      throw new ApiError(403, 'Access denied: You do not own this order', 'FORBIDDEN_ORDER_ACCESS');
    }

    return order;
  }

  async getUserOrders(userId: string, options: OrderQueryOptions = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));

    const [orders, total] = await Promise.all([
      orderRepository.findByUserId(userId, { page, limit, status: options.status }),
      orderRepository.countByUserId(userId, { status: options.status }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderTracking(orderNumber: string, userId: string) {
    const order = await orderRepository.findByOrderNumber(orderNumber, userId);
    if (!order) {
      throw new ApiError(404, `Active tracking for order "${orderNumber}" not found`, 'ORDER_NOT_FOUND');
    }

    return {
      orderNumber: order.orderNumber,
      restaurant: order.restaurantId,
      status: order.status,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      placedAt: order.placedAt,
      statusHistory: order.statusHistory,
      deliveryPartner: order.deliveryPartner,
      deliveryAddress: order.addressSnapshot,
      itemsSummary: order.items.map((i) => `${i.quantity}x ${i.name}`),
      grandTotal: order.pricing.grandTotal,
    };
  }

  async cancelOrder(orderNumber: string, userId: string, cancelReason: string = 'Customer requested cancellation') {
    const order = await orderRepository.findByOrderNumber(orderNumber, userId);
    if (!order) {
      throw new ApiError(404, `Order "${orderNumber}" not found or access denied`, 'ORDER_NOT_FOUND');
    }

    if (!['PLACED', 'CONFIRMED'].includes(order.status)) {
      throw new ApiError(
        400,
        `Order cannot be cancelled in "${order.status}" status. The kitchen is already preparing or it is out for delivery.`,
        'ORDER_CANNOT_BE_CANCELLED'
      );
    }

    const cancelledOrder = await orderRepository.cancelOrder(orderNumber, userId, cancelReason);
    return {
      order: cancelledOrder,
      message: 'Order cancelled successfully. Any debited amount will be refunded to the original payment source.',
    };
  }

  async reorder(orderNumber: string, userId: string) {
    const pastOrder = await orderRepository.findByOrderNumber(orderNumber, userId);
    if (!pastOrder) {
      throw new ApiError(404, `Order "${orderNumber}" not found`, 'ORDER_NOT_FOUND');
    }

    const restaurant = await Restaurant.findById(pastOrder.restaurantId);
    if (!restaurant || restaurant.status !== 'active' || !restaurant.isOpen) {
      throw new ApiError(400, `Restaurant "${restaurant?.name || 'Kitchen'}" is currently closed or inactive`, 'RESTAURANT_CLOSED');
    }

    const foodIds = pastOrder.items.map((i) => i.foodId);
    const currentFoods = await Food.find({ _id: { $in: foodIds }, isAvailable: true });
    const foodMap = new Map(currentFoods.map((f) => [f._id.toString(), f]));

    const cartItems: any[] = [];
    const unavailableItems: string[] = [];
    const priceChanges: string[] = [];

    for (const item of pastOrder.items) {
      const currentFood = foodMap.get(item.foodId);
      if (!currentFood) {
        unavailableItems.push(item.name);
        continue;
      }

      const currentPrice = currentFood.discountedPrice || currentFood.price;
      if (currentPrice !== item.unitPrice) {
        priceChanges.push(`${item.name} price changed from ₹${item.unitPrice} to ₹${currentPrice}`);
      }

      cartItems.push({
        foodId: currentFood._id.toString(),
        name: currentFood.name,
        price: currentPrice,
        quantity: item.quantity,
        imageUrl: currentFood.imageUrl,
        dietaryType: currentFood.dietaryType,
        selectedOptions: item.selectedOptions || [],
      });
    }

    return {
      restaurantId: pastOrder.restaurantId,
      restaurantName: pastOrder.restaurantId ? (pastOrder.restaurantId as any).name : 'Kitchen',
      cartItems,
      unavailableItems,
      priceChanges,
    };
  }

  async restaurantUpdateOrderStatus(
    orderNumber: string,
    newStatus: OrderStatus,
    note?: string,
    actorType: 'restaurant' | 'delivery_partner' | 'admin' = 'restaurant',
    expectedRestaurantId?: string
  ) {
    const order = await orderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new ApiError(404, `Order "${orderNumber}" not found`, 'ORDER_NOT_FOUND');
    }

    if (expectedRestaurantId && order.restaurantId.toString() !== expectedRestaurantId) {
      throw new ApiError(403, 'Forbidden: You do not own this order or have permission to modify it', 'FORBIDDEN_ORDER_ACCESS');
    }

    const allowedTransitions = VALID_STATUS_TRANSITIONS[order.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new ApiError(
        400,
        `Invalid status transition from ${order.status} to ${newStatus}. Allowed transitions: ${allowedTransitions.join(', ')}`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    const historyEntry: IOrderStatusHistoryEntry = {
      status: newStatus,
      changedAt: new Date(),
      actorType,
      note: note || `Order transitioned to ${newStatus}`,
    };

    const extraUpdates: any = {};
    if (newStatus === 'CONFIRMED') extraUpdates.acceptedAt = new Date();
    if (newStatus === 'PREPARING') extraUpdates.preparingAt = new Date();
    const updatedOrder = await orderRepository.updateStatus(order._id.toString(), newStatus, historyEntry, extraUpdates);

    // Trigger deterministic notifications based on transition
    const NOTIFICATION_MESSAGES: Record<OrderStatus, { type: any; title: string; message: string }> = {
      CONFIRMED: { type: 'ORDER_CONFIRMED', title: 'Order Accepted! 👨‍🍳', message: `Kitchen has accepted your order #${orderNumber} and will start cooking.` },
      PREPARING: { type: 'ORDER_PREPARING', title: 'Cooking in Progress 🔥', message: `Chefs are now preparing your freshly made meal.` },
      READY_FOR_PICKUP: { type: 'ORDER_READY', title: 'Order Packed & Ready 📦', message: `Your food is securely packed and waiting for delivery pickup.` },
      PICKED_UP: { type: 'ORDER_OUT_FOR_DELIVERY', title: 'Driver on the Way! 🛵', message: `Delivery executive is en route with your order #${orderNumber}.` },
      OUT_FOR_DELIVERY: { type: 'ORDER_OUT_FOR_DELIVERY', title: 'Out for Delivery 🚀', message: `Your meal is arriving shortly!` },
      DELIVERED: { type: 'ORDER_DELIVERED', title: 'Order Delivered! 🎉', message: `Your order #${orderNumber} has been delivered. Enjoy your meal!` },
      CANCELLED: { type: 'ORDER_CANCELLED', title: 'Order Cancelled ✕', message: `Order #${orderNumber} was cancelled. Refund initiated if applicable.` },
      PLACED: { type: 'ORDER_PLACED', title: 'Order Placed', message: 'Order received.' },
      FAILED: { type: 'PAYMENT_FAILED', title: 'Order Failed', message: 'Order could not be completed.' },
    };

    const notif = NOTIFICATION_MESSAGES[newStatus];
    if (notif) {
      notificationService.createNotification({
        userId: order.userId.toString(),
        type: notif.type,
        title: notif.title,
        message: notif.message,
        data: { orderNumber: order.orderNumber },
        eventKey: `${newStatus}:${order.orderNumber}`,
      }).catch((e) => console.error('Notification trigger error:', e));
    }

    if (newStatus === 'DELIVERED') {
      notificationService.createNotification({
        userId: order.userId.toString(),
        type: 'REVIEW_REMINDER',
        title: 'How was your food? ⭐',
        message: `Leave a verified review for your meal from ${order.restaurantId}.`,
        data: { orderNumber: order.orderNumber, restaurantId: order.restaurantId.toString() },
        eventKey: `REVIEW_REMINDER:${order.orderNumber}`,
      }).catch((e) => console.error('Review reminder notification error:', e));
    }

    return updatedOrder;
  }
}

export const orderService = new OrderService();
