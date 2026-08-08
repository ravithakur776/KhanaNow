import { Router } from 'express';
import { addressController } from '../../controllers/address.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { addressSchema, updateAddressSchema } from '../../validators/address.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => addressController.getAddresses(req, res, next));
router.get('/:id', (req, res, next) => addressController.getAddressById(req, res, next));
router.post('/', validateRequest(addressSchema), (req, res, next) =>
  addressController.createAddress(req, res, next)
);
router.patch('/:id', validateRequest(updateAddressSchema), (req, res, next) =>
  addressController.updateAddress(req, res, next)
);
router.delete('/:id', (req, res, next) => addressController.deleteAddress(req, res, next));
router.patch('/:id/default', (req, res, next) => addressController.setDefaultAddress(req, res, next));

export default router;
