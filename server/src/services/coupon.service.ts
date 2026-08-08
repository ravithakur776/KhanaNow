import { couponRepository } from '../repositories/coupon.repository.js';
import { ApiError } from '../utils/apiError.js';

export interface ValidateCouponDTO {
  code: string;
  itemTotal: number;
  restaurantId?: string;
  userId?: string;
}

export class CouponService {
  async getActiveCoupons(restaurantId?: string) {
    return couponRepository.findActiveCoupons(restaurantId);
  }

  async validateCoupon(dto: ValidateCouponDTO) {
    if (!dto.code || dto.code.trim().length === 0) {
      throw new ApiError(400, 'Coupon code is required', 'COUPON_REQUIRED');
    }

    const code = dto.code.trim().toUpperCase();
    const coupon = await couponRepository.findByCode(code);

    if (!coupon) {
      throw new ApiError(404, `Coupon '${code}' is invalid or has expired`, 'COUPON_NOT_FOUND');
    }

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new ApiError(400, `Coupon '${code}' has expired`, 'COUPON_EXPIRED');
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new ApiError(400, `Coupon '${code}' usage limit has been reached`, 'COUPON_LIMIT_REACHED');
    }

    if (dto.itemTotal < coupon.minimumOrderValue) {
      throw new ApiError(
        400,
        `Minimum order value for coupon '${code}' is ₹${coupon.minimumOrderValue}. Add items worth ₹${coupon.minimumOrderValue - dto.itemTotal} more.`,
        'MINIMUM_ORDER_UNMET'
      );
    }

    if (coupon.restaurantId && dto.restaurantId) {
      if (coupon.restaurantId.toString() !== dto.restaurantId.toString()) {
        throw new ApiError(
          400,
          `Coupon '${code}' is not valid for this restaurant`,
          'COUPON_RESTAURANT_MISMATCH'
        );
      }
    }

    let calculatedDiscount =
      coupon.discountType === 'percentage'
        ? Math.round((dto.itemTotal * coupon.discountValue) / 100)
        : coupon.discountValue;

    if (coupon.maximumDiscount && calculatedDiscount > coupon.maximumDiscount) {
      calculatedDiscount = coupon.maximumDiscount;
    }

    // Discount cannot exceed item total
    calculatedDiscount = Math.min(calculatedDiscount, dto.itemTotal);

    return {
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumOrderValue: coupon.minimumOrderValue,
        maximumDiscount: coupon.maximumDiscount,
      },
      discountAmount: calculatedDiscount,
      message: `Coupon '${code}' applied successfully! Saved ₹${calculatedDiscount}`,
    };
  }
}

export const couponService = new CouponService();
