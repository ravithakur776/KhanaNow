import mongoose from 'mongoose';
import { Notification, INotificationDocument, NotificationType } from '../models/notification.model.js';

export interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    orderNumber?: string;
    restaurantId?: string;
    foodId?: string;
    couponCode?: string;
  };
  eventKey?: string;
}

export class NotificationService {
  async createNotification(dto: CreateNotificationDTO): Promise<INotificationDocument | null> {
    try {
      // If eventKey provided, check for duplicate event notification
      if (dto.eventKey) {
        const existing = await Notification.findOne({
          userId: new mongoose.Types.ObjectId(dto.userId),
          eventKey: dto.eventKey,
        });
        if (existing) return existing;
      }

      const notification = new Notification({
        userId: new mongoose.Types.ObjectId(dto.userId),
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data,
        eventKey: dto.eventKey,
        isRead: false,
      });

      return await notification.save();
    } catch (e: any) {
      // Silently catch duplicate key index collisions to guarantee idempotency
      if (e.code === 11000) {
        return Notification.findOne({ userId: dto.userId, eventKey: dto.eventKey });
      }
      throw e;
    }
  }

  async getUserNotifications(
    userId: string,
    page = 1,
    limit = 20,
    isRead?: boolean,
    type?: string
  ) {
    const skip = (page - 1) * limit;
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (typeof isRead === 'boolean') query.isRead = isRead;
    if (type && type !== 'ALL') query.type = type;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId: new mongoose.Types.ObjectId(userId), isRead: false }),
    ]);

    return {
      notifications,
      unreadCount,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      isRead: false,
    });
  }

  async markAsRead(userId: string, notificationId: string): Promise<INotificationDocument | null> {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId: new mongoose.Types.ObjectId(userId) },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const res = await Notification.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return { modifiedCount: res.modifiedCount };
  }

  async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    const res = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: new mongoose.Types.ObjectId(userId),
    });
    return Boolean(res);
  }
}

export const notificationService = new NotificationService();
