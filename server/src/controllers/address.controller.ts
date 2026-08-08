import { Request, Response, NextFunction } from 'express';
import { addressService } from '../services/address.service.js';
import { sendResponse } from '../utils/apiResponse.js';

export class AddressController {
  async getAddresses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const addresses = await addressService.getAddresses(userId);
      sendResponse(res, 200, 'Addresses retrieved successfully', addresses);
    } catch (error) {
      next(error);
    }
  }

  async getAddressById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const address = await addressService.getAddressById(id, userId);
      sendResponse(res, 200, 'Address details retrieved successfully', address);
    } catch (error) {
      next(error);
    }
  }

  async createAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const address = await addressService.createAddress(userId, req.body);
      sendResponse(res, 201, 'Address created successfully', address);
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const address = await addressService.updateAddress(id, userId, req.body);
      sendResponse(res, 200, 'Address updated successfully', address);
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const result = await addressService.deleteAddress(id, userId);
      sendResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async setDefaultAddress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const id = req.params.id as string;
      const address = await addressService.setDefaultAddress(id, userId);
      sendResponse(res, 200, 'Default address updated successfully', address);
    } catch (error) {
      next(error);
    }
  }
}

export const addressController = new AddressController();
