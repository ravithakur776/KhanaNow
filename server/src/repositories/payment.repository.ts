import { Payment, IPaymentDocument, PaymentStatus } from '../models/payment.model.js';

export class PaymentRepository {
  async findByIdempotency(userId: string, idempotencyKey: string): Promise<IPaymentDocument | null> {
    return Payment.findOne({ userId, idempotencyKey });
  }

  async findByReference(paymentReference: string, userId?: string): Promise<IPaymentDocument | null> {
    const query: any = { paymentReference };
    if (userId) query.userId = userId;
    return Payment.findOne(query);
  }

  async findByRazorpayOrderId(razorpayOrderId: string): Promise<IPaymentDocument | null> {
    return Payment.findOne({ razorpayOrderId });
  }

  async create(data: Partial<IPaymentDocument>): Promise<IPaymentDocument> {
    const payment = new Payment(data);
    return payment.save();
  }

  async updateStatus(
    paymentId: string,
    status: PaymentStatus,
    extraFields?: Partial<IPaymentDocument>
  ): Promise<IPaymentDocument | null> {
    return Payment.findByIdAndUpdate(
      paymentId,
      {
        $set: {
          status,
          ...(extraFields || {}),
        },
      },
      { new: true }
    );
  }

  async markCaptured(
    paymentId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<IPaymentDocument | null> {
    return Payment.findByIdAndUpdate(
      paymentId,
      {
        $set: {
          status: 'captured',
          razorpayPaymentId,
          razorpaySignature,
        },
      },
      { new: true }
    );
  }

  async markFailed(paymentId: string, reason: string): Promise<IPaymentDocument | null> {
    return Payment.findByIdAndUpdate(
      paymentId,
      {
        $set: {
          status: 'failed',
          failureReason: reason,
        },
      },
      { new: true }
    );
  }

  async markCancelled(paymentReference: string, userId: string): Promise<IPaymentDocument | null> {
    return Payment.findOneAndUpdate(
      { paymentReference, userId, status: { $in: ['created', 'pending'] } },
      { $set: { status: 'cancelled' } },
      { new: true }
    );
  }
}

export const paymentRepository = new PaymentRepository();
