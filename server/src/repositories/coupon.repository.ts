import { Coupon, ICouponDocument } from '../models/coupon.model.js';

export class CouponRepository {
  async findByCode(code: string): Promise<ICouponDocument | null> {
    return Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  }

  async findActiveCoupons(restaurantId?: string): Promise<ICouponDocument[]> {
    const now = new Date();
    const query: any = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    if (restaurantId) {
      query.$or = [{ restaurantId }, { restaurantId: { $exists: false } }, { restaurantId: null }];
    }

    return Coupon.find(query).sort({ discountValue: -1 }).limit(20);
  }

  async incrementUsage(couponId: string): Promise<void> {
    await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
  }

  async create(data: Partial<ICouponDocument>): Promise<ICouponDocument> {
    const coupon = new Coupon(data);
    return coupon.save();
  }
}

export const couponRepository = new CouponRepository();
