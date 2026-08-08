import { restaurantOwnerRepository } from '../repositories/restaurantOwner.repository.js';
import { Restaurant } from '../models/restaurant.model.js';
import { orderService } from './order.service.js';
import { OrderStatus } from '../models/order.model.js';
import { ApiError } from '../utils/apiError.js';

export class RestaurantOwnerService {
  private async getVerifiedRestaurant(ownerId: string) {
    const restaurant = await restaurantOwnerRepository.findRestaurantByOwner(ownerId);
    if (!restaurant) {
      throw new ApiError(404, 'No restaurant profile found associated with your account', 'RESTAURANT_NOT_FOUND');
    }
    return restaurant;
  }

  async getDashboard(ownerId: string) {
    const restaurant = await this.getVerifiedRestaurant(ownerId);
    const metrics = await restaurantOwnerRepository.getDashboardMetrics(restaurant._id.toString());
    return {
      restaurantId: restaurant._id,
      ...metrics,
    };
  }

  async getAnalytics(ownerId: string, fromStr?: string, toStr?: string) {
    const restaurant = await this.getVerifiedRestaurant(ownerId);
    const to = toStr ? new Date(toStr) : new Date();
    const from = fromStr ? new Date(fromStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return restaurantOwnerRepository.getAnalytics(restaurant._id.toString(), from, to);
  }

  async getOrders(ownerId: string, page = 1, limit = 20, status?: string) {
    const restaurant = await this.getVerifiedRestaurant(ownerId);
    return restaurantOwnerRepository.findOrders(restaurant._id.toString(), page, limit, status);
  }

  async updateOrderStatus(ownerId: string, orderNumber: string, status: OrderStatus, note?: string) {
    const restaurant = await this.getVerifiedRestaurant(ownerId);
    return orderService.restaurantUpdateOrderStatus(orderNumber, status, note, 'restaurant');
  }

  async getMenu(ownerId: string, page = 1, limit = 50, search?: string, categoryId?: string) {
    const restaurant = await this.getVerifiedRestaurant(ownerId);
    return restaurantOwnerRepository.findMenu(restaurant._id.toString(), page, limit, search, categoryId);
  }

  async createFood(ownerId: string, data: any) {
    const restaurant = await this.getVerifiedRestaurant(ownerId);

    if (data.price < 0) {
      throw new ApiError(400, 'Price cannot be negative', 'INVALID_PRICE');
    }

    if (data.discountedPrice && data.discountedPrice > data.price) {
      throw new ApiError(400, 'Discounted price cannot exceed regular price', 'INVALID_DISCOUNTED_PRICE');
    }

    return restaurantOwnerRepository.createFood(restaurant._id.toString(), data);
  }

  async updateFood(ownerId: string, foodId: string, data: any) {
    const restaurant = await this.getVerifiedRestaurant(ownerId);

    if (data.price && data.price < 0) {
      throw new ApiError(400, 'Price cannot be negative', 'INVALID_PRICE');
    }

    if (data.discountedPrice && data.price && data.discountedPrice > data.price) {
      throw new ApiError(400, 'Discounted price cannot exceed regular price', 'INVALID_DISCOUNTED_PRICE');
    }

    const updated = await restaurantOwnerRepository.updateFood(restaurant._id.toString(), foodId, data);
    if (!updated) throw new ApiError(404, 'Food item not found or access denied', 'FOOD_NOT_FOUND');
    return updated;
  }

  async toggleFoodAvailability(ownerId: string, foodId: string, isAvailable: boolean) {
    const restaurant = await this.getVerifiedRestaurant(ownerId);
    const updated = await restaurantOwnerRepository.toggleFoodAvailability(restaurant._id.toString(), foodId, isAvailable);
    if (!updated) throw new ApiError(404, 'Food item not found or access denied', 'FOOD_NOT_FOUND');
    return updated;
  }

  async deleteFood(ownerId: string, foodId: string) {
    const restaurant = await this.getVerifiedRestaurant(ownerId);
    const success = await restaurantOwnerRepository.softDeleteFood(restaurant._id.toString(), foodId);
    if (!success) throw new ApiError(404, 'Food item not found or access denied', 'FOOD_NOT_FOUND');
    return { message: 'Food item deactivated successfully' };
  }

  async updateProfile(ownerId: string, data: any) {
    const restaurant = await this.getVerifiedRestaurant(ownerId);

    // Prevent modifying administrative fields
    delete data.ownerId;
    delete data.status;
    delete data.avgRating;
    delete data.totalRatings;

    const updated = await Restaurant.findByIdAndUpdate(restaurant._id, { $set: data }, { new: true });
    return updated;
  }

  async toggleOpenStatus(ownerId: string, isOpen: boolean) {
    const restaurant = await this.getVerifiedRestaurant(ownerId);

    if (restaurant.status === 'suspended' || restaurant.status === 'rejected') {
      throw new ApiError(403, 'Suspended or unapproved restaurants cannot be opened', 'RESTAURANT_SUSPENDED');
    }

    const updated = await Restaurant.findByIdAndUpdate(restaurant._id, { $set: { isOpen } }, { new: true });
    return updated;
  }

  async getCoupons(ownerId: string) {
    const restaurant = await this.getVerifiedRestaurant(ownerId);
    return restaurantOwnerRepository.findCoupons(restaurant._id.toString());
  }

  async createCoupon(ownerId: string, data: any) {
    const restaurant = await this.getVerifiedRestaurant(ownerId);
    return restaurantOwnerRepository.createCoupon(restaurant._id.toString(), data);
  }

  async getReviews(ownerId: string, page = 1, limit = 20) {
    const restaurant = await this.getVerifiedRestaurant(ownerId);
    return restaurantOwnerRepository.findReviews(restaurant._id.toString(), page, limit);
  }
}

export const restaurantOwnerService = new RestaurantOwnerService();
