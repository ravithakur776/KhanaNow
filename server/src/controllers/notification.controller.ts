import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notification.service.js';
import { sendResponse } from '../utils/apiResponse.js';

export class NotificationController {
  async getUserNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { page, limit, isRead, type } = req.query as any;

      const data = await notificationService.getUserNotifications(
        userId,
        page ? parseInt(page, 10) : 1,
        limit ? parseInt(limit, 10) : 20,
        typeof isRead !== 'undefined' ? isRead === 'true' : undefined,
        type
      );

      sendResponse(res, 200, 'User notifications retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const count = await notificationService.getUnreadCount(userId);
      sendResponse(res, 200, 'Unread count retrieved', { unreadCount: count });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const notificationId = req.params.id as string;
      const notification = await notificationService.markAsRead(userId, notificationId);
      sendResponse(res, 200, 'Notification marked as read', notification);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await notificationService.markAllAsRead(userId);
      sendResponse(res, 200, 'All notifications marked as read', result);
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const notificationId = req.params.id as string;
      await notificationService.deleteNotification(userId, notificationId);
      sendResponse(res, 200, 'Notification deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
