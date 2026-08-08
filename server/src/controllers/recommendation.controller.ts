import { Request, Response, NextFunction } from 'express';
import { recommendationService } from '../services/recommendation.service.js';
import { sendResponse } from '../utils/apiResponse.js';

export class RecommendationController {
  async getHomeRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const data = await recommendationService.getHome(userId);
      sendResponse(res, 200, 'Home recommendations retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  }

  async getFrequentlyOrdered(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const items = await recommendationService.getFrequentlyOrdered(userId);
      sendResponse(res, 200, 'Frequently ordered dishes retrieved', items);
    } catch (error) {
      next(error);
    }
  }

  async getSimilarFoods(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const foodId = req.params.foodId as string;
      const items = await recommendationService.getSimilarFoods(foodId);
      sendResponse(res, 200, 'Similar dishes retrieved', items);
    } catch (error) {
      next(error);
    }
  }

  async getTrendingFoods(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await recommendationService.getTrendingFoods();
      sendResponse(res, 200, 'Trending dishes retrieved', items);
    } catch (error) {
      next(error);
    }
  }
}

export const recommendationController = new RecommendationController();
