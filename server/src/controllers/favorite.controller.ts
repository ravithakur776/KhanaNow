import { Request, Response, NextFunction } from 'express';
import { favoriteService } from '../services/favorite.service.js';
import { sendResponse } from '../utils/apiResponse.js';

export class FavoriteController {
  async getFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const favorites = await favoriteService.getFavorites(userId);
      sendResponse(res, 200, 'Favorites retrieved successfully', favorites);
    } catch (error) {
      next(error);
    }
  }

  async checkFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const restaurantId = req.query.restaurantId as string;
      const foodId = req.query.foodId as string;
      const result = await favoriteService.checkFavorite(userId, restaurantId, foodId);
      sendResponse(res, 200, 'Favorite status checked', result);
    } catch (error) {
      next(error);
    }
  }

  async addFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { restaurantId, foodId } = req.body;
      const favorite = await favoriteService.addFavorite(userId, restaurantId, foodId);
      sendResponse(res, 201, 'Added to favorites', favorite);
    } catch (error) {
      next(error);
    }
  }

  async removeFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const targetId = req.params.id as string;
      const result = await favoriteService.removeFavorite(userId, targetId);
      sendResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async toggleFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { restaurantId, foodId } = req.body;
      const result = await favoriteService.toggleFavorite(userId, restaurantId, foodId);
      sendResponse(
        res,
        200,
        result.isFavorited ? 'Added to favorites' : 'Removed from favorites',
        result
      );
    } catch (error) {
      next(error);
    }
  }
}

export const favoriteController = new FavoriteController();
