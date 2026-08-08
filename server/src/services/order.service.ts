import mongoose from 'mongoose';
import { orderRepository, OrderQueryOptions } from '../repositories/order.repository.js';
import { paymentRepository } from '../repositories/payment.repository.js';
import { checkoutService, CheckoutValidateDTO } from './checkout.service.js';
import { User } from '../models/user.model.js';
import { Food } from '../models/food.model.js';
import { Restaurant } from '../models/restaurant.model.js';
import { OrderStatus, IOrderStatusHistoryEntry } from '../models/order.model.js';
import { ApiError } from '../utils/apiError.js';

export interface CreateOrderFromPaymentDTO {
  paymentReference: string;
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

    // 1. Locate Verified Payment
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

    // 4. Re-run Authoritative Checkout Verification
    const metadata = payment.metadata || {};
    const restaurant = await Restaurant.findById(payment.restaurantId);
    if (!restaurant) {
      throw new ApiError(404, 'Restaurant not found', 'RESTAURANT_NOT_FOUND');
    }

    // 5. Generate Human-Friendly Order Number (e.g. KN-20260808-8F4K2)
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `KN-${todayStr}-${randomSuffix}`;

    // 6. Server-Calculated Estimated Delivery Time (Standard: 28 mins)
    const estimatedDeliveryTime = new Date(Date.now() + 28 * 60 * 1000);

    // 7. Initial Status History
    const statusHistory: IOrderStatusHistoryEntry[] = [
      {
        status: 'PLACED',
        changedAt: new Date(),
        actorType: 'customer',
        note: 'Order successfully placed after server payment verification',
      },
    ];

    // 8. Assemble Immutable Snapshots
    const itemsSnapshot = (metadata.itemsSummary || []).map((i: any) => ({
      foodId: i.foodId || 'food_item',
      name: i.name,
      quantity: i.quantity,
      unitPrice: i.price,
      unitPricePaise: Math.round(i.price * 100),
      selectedOptions: i.selectedOptions || [],
      optionsTotal: 0,
      itemTotal: i.price * i.quantity,
      dietaryType: i.dietaryType || 'veg',
    }));

    const pricingSnapshot = {
      subtotal: metadata.subtotal || payment.amount / 100,
      discount: metadata.discount || 0,
      deliveryFee: metadata.deliveryFee || 0,
      platformFee: metadata.platformFee || 6,
      taxAmount: metadata.taxAmount || 0,
      tipAmount: metadata.tipAmount || 0,
      grandTotal: metadata.grandTotalRupees || payment.amount / 100,
      grandTotalPaise: payment.amount,
      savingsTotal: (metadata.discount || 0) + (metadata.deliveryFee === 0 ? 35 : 0),
      currency: payment.currency || 'INR',
    };

    const addressSnapshot = {
      fullName: user.name || `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      addressLine1: metadata.addressSummary || 'Customer Delivery Address',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India',
      formattedAddress: metadata.addressSummary || 'Customer Delivery Address',
    };

    const contactSnapshot = {
      name: user.name || `${user.firstName} ${user.lastName}`,
      phone: user.phone,
      email: user.email,
    };

    // 9. Persist Order in Database
    const order = await orderRepository.create({
      orderNumber,
      userId: userId as any,
      restaurantId: payment.restaurantId,
      paymentId: payment._id as any,
      paymentReference: payment.paymentReference,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      addressSnapshot,
      contactSnapshot,
      items: itemsSnapshot,
      pricing: pricingSnapshot,
      coupon: (metadata as any).coupon || null,
      tip: metadata.tipAmount || 0,
      deliveryInstructions: dto.deliveryInstructions || '',
      deliveryOption: dto.deliveryOption || 'standard',
      status: 'PLACED',
      statusHistory,
      estimatedDeliveryTime,
      placedAt: new Date(),
      idempotencyKey: dto.idempotencyKey || payment.idempotencyKey,
    });

    // 10. Link Payment to Order Document
    await paymentRepository.updateStatus(payment._id.toString(), payment.status, {
      orderId: order._id as any,
    });

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
    actorType: 'restaurant' | 'delivery_partner' | 'admin' = 'restaurant'
  ) {
    const order = await orderRepository.findByOrderNumber(orderNumber);
    if (!order) {
      throw new ApiError(404, `Order "${orderNumber}" not found`, 'ORDER_NOT_FOUND');
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
    if (newStatus === 'READY_FOR_PICKUP') extraUpdates.readyAt = new Date();
    if (newStatus === 'PICKED_UP') extraUpdates.pickedUpAt = new Date();
    if (newStatus === 'DELIVERED') extraUpdates.deliveredAt = new Date();

    return orderRepository.updateStatus(order._id.toString(), newStatus, historyEntry, extraUpdates);
  }
}

export const orderService = new OrderService();
