import { Router } from 'express';
import { favoriteController } from '../../controllers/favorite.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => favoriteController.getFavorites(req, res, next));
router.get('/check', (req, res, next) => favoriteController.checkFavorite(req, res, next));
router.post('/', (req, res, next) => favoriteController.addFavorite(req, res, next));
router.post('/toggle', (req, res, next) => favoriteController.toggleFavorite(req, res, next));
router.delete('/:id', (req, res, next) => favoriteController.removeFavorite(req, res, next));

export default router;
