import { Router } from 'express';
import { restaurantController } from '../../controllers/restaurant.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public discovery endpoints
router.get('/restaurants/search', (req, res, next) => restaurantController.search(req, res, next));
router.get('/restaurants', (req, res, next) => restaurantController.getRestaurants(req, res, next));
router.get('/restaurants/:id', (req, res, next) => restaurantController.getRestaurantById(req, res, next));

router.get('/categories', (req, res, next) => restaurantController.getCategories(req, res, next));
router.get('/foods', (req, res, next) => restaurantController.getFoods(req, res, next));
router.get('/foods/:id', (req, res, next) => restaurantController.getFoodById(req, res, next));
router.get('/reviews', (req, res, next) => restaurantController.getReviews(req, res, next));

// Authenticated user endpoints
router.post('/favorites/toggle', authenticate, (req, res, next) =>
  restaurantController.toggleFavorite(req, res, next)
);
router.get('/favorites', authenticate, (req, res, next) =>
  restaurantController.getFavorites(req, res, next)
);

export default router;
