import { Order, IOrderDocument, OrderStatus, IOrderStatusHistoryEntry } from '../models/order.model.js';

export interface OrderQueryOptions {
  page?: number;
  limit?: number;
  status?: string;
  sort?: string;
}

export class OrderRepository {
  async create(data: Partial<IOrderDocument>): Promise<IOrderDocument> {
    const order = new Order(data);
    return order.save();
  }

  async findByOrderNumber(orderNumber: string, userId?: string): Promise<IOrderDocument | null> {
    const query: any = { orderNumber };
    if (userId) query.userId = userId;
    return Order.findOne(query).populate('restaurantId', 'name address phone logoUrl');
  }

  async findById(orderId: string): Promise<IOrderDocument | null> {
    return Order.findById(orderId).populate('restaurantId', 'name address phone logoUrl');
  }

  async findByPaymentId(paymentId: string): Promise<IOrderDocument | null> {
    return Order.findOne({ paymentId });
  }

  async findByPaymentReference(paymentReference: string): Promise<IOrderDocument | null> {
    return Order.findOne({ paymentReference });
  }

  async findByUserId(userId: string, options: OrderQueryOptions = {}): Promise<IOrderDocument[]> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const query: any = { userId };
    if (options.status && options.status !== 'ALL') {
      if (options.status === 'ACTIVE') {
        query.status = { $in: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY'] };
      } else {
        query.status = options.status.toUpperCase();
      }
    }

    return Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('restaurantId', 'name address phone logoUrl');
  }

  async countByUserId(userId: string, options: OrderQueryOptions = {}): Promise<number> {
    const query: any = { userId };
    if (options.status && options.status !== 'ALL') {
      if (options.status === 'ACTIVE') {
        query.status = { $in: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY'] };
      } else {
        query.status = options.status.toUpperCase();
      }
    }
    return Order.countDocuments(query);
  }

  async findByRestaurantId(restaurantId: string, options: OrderQueryOptions = {}): Promise<IOrderDocument[]> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const query: any = { restaurantId };
    if (options.status && options.status !== 'ALL') {
      query.status = options.status.toUpperCase();
    }

    return Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  async countByRestaurantId(restaurantId: string, options: OrderQueryOptions = {}): Promise<number> {
    const query: any = { restaurantId };
    if (options.status && options.status !== 'ALL') {
      query.status = options.status.toUpperCase();
    }
    return Order.countDocuments(query);
  }

  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    historyEntry: IOrderStatusHistoryEntry,
    extraUpdates: Partial<IOrderDocument> = {}
  ): Promise<IOrderDocument | null> {
    return Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: newStatus,
          ...extraUpdates,
        },
        $push: {
          statusHistory: historyEntry,
        },
      },
      { new: true }
    );
  }

  async cancelOrder(
    orderNumber: string,
    userId: string,
    cancelReason: string
  ): Promise<IOrderDocument | null> {
    const historyEntry: IOrderStatusHistoryEntry = {
      status: 'CANCELLED',
      changedAt: new Date(),
      actorType: 'customer',
      note: `Cancelled by customer: ${cancelReason}`,
    };

    return Order.findOneAndUpdate(
      {
        orderNumber,
        userId,
        status: { $in: ['PLACED', 'CONFIRMED'] },
      },
      {
        $set: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason,
        },
        $push: {
          statusHistory: historyEntry,
        },
      },
      { new: true }
    );
  }
}

export const orderRepository = new OrderRepository();
