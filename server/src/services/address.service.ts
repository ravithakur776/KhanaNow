import { addressRepository } from '../repositories/address.repository.js';
import { ApiError } from '../utils/apiError.js';
import { IAddressDocument } from '../models/address.model.js';

export class AddressService {
  async getAddresses(userId: string) {
    return addressRepository.findByUser(userId);
  }

  async getAddressById(id: string, userId: string) {
    const address = await addressRepository.findByIdAndUser(id, userId);
    if (!address) {
      throw new ApiError(404, 'Delivery address not found or access denied', 'ADDRESS_NOT_FOUND');
    }
    return address;
  }

  async createAddress(userId: string, data: Partial<IAddressDocument>) {
    return addressRepository.create(userId, data);
  }

  async updateAddress(id: string, userId: string, data: Partial<IAddressDocument>) {
    const updated = await addressRepository.update(id, userId, data);
    if (!updated) {
      throw new ApiError(404, 'Delivery address not found or access denied', 'ADDRESS_NOT_FOUND');
    }
    return updated;
  }

  async deleteAddress(id: string, userId: string) {
    const deleted = await addressRepository.delete(id, userId);
    if (!deleted) {
      throw new ApiError(404, 'Delivery address not found or access denied', 'ADDRESS_NOT_FOUND');
    }
    return { message: 'Address deleted successfully' };
  }

  async setDefaultAddress(id: string, userId: string) {
    const updated = await addressRepository.setDefault(id, userId);
    if (!updated) {
      throw new ApiError(404, 'Delivery address not found or access denied', 'ADDRESS_NOT_FOUND');
    }
    return updated;
  }
}

export const addressService = new AddressService();
