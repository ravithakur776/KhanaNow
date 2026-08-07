import { Request, Response, NextFunction } from 'express';
import { restaurantService } from '../services/restaurant.service.js';
import { sendResponse } from '../utils/apiResponse.js';

export class RestaurantController {
  async getRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, cuisine, isPureVeg, minRating, maxCostForTwo, sortBy, page, limit } = req.query;

      const result = await restaurantService.getRestaurants({
        search: search as string,
        cuisine: cuisine as string,
        isPureVeg: isPureVeg === 'true',
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        maxCostForTwo: maxCostForTwo ? parseFloat(maxCostForTwo as string) : undefined,
        sortBy: sortBy as any,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 12,
      });

      sendResponse(
        res,
        200,
        'Restaurants retrieved successfully',
        result.restaurants,
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }

  async getRestaurantById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await restaurantService.getRestaurantById(id);
      sendResponse(res, 200, 'Restaurant details retrieved successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = (req.query.q || '') as string;
      const result = await restaurantService.search(q);
      sendResponse(res, 200, 'Search completed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await restaurantService.getCategories();
      sendResponse(res, 200, 'Food categories retrieved successfully', categories);
    } catch (error) {
      next(error);
    }
  }

  async getFoods(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, categoryId, isVeg } = req.query;
      const foods = await restaurantService.getFoods({
        search: search as string,
        categoryId: categoryId as string,
        isVeg: isVeg === 'true',
      });
      sendResponse(res, 200, 'Food items retrieved successfully', foods);
    } catch (error) {
      next(error);
    }
  }

  async getFoodById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const food = await restaurantService.getFoodById(id);
      sendResponse(res, 200, 'Food detail retrieved successfully', food);
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurantId = (req.query.restaurantId || '') as string;
      const reviews = await restaurantService.getReviews(restaurantId);
      sendResponse(res, 200, 'Reviews retrieved successfully', reviews);
    } catch (error) {
      next(error);
    }
  }

  async toggleFavorite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { restaurantId } = req.body;
      const isFavorited = await restaurantService.toggleFavorite(userId, restaurantId);
      sendResponse(res, 200, isFavorited ? 'Restaurant added to favorites' : 'Restaurant removed from favorites', {
        isFavorited,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFavorites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const favorites = await restaurantService.getUserFavorites(userId);
      sendResponse(res, 200, 'Favorites retrieved successfully', favorites);
    } catch (error) {
      next(error);
    }
  }
}

export const restaurantController = new RestaurantController();
