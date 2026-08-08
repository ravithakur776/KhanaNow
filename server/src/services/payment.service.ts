import { paymentRepository } from '../repositories/payment.repository.js';
import { razorpayService } from './razorpay.service.js';
import { checkoutService, CheckoutValidateDTO } from './checkout.service.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

export interface CreatePaymentDTO extends Omit<CheckoutValidateDTO, 'userId'> {
  idempotencyKey: string;
}

export interface VerifyPaymentDTO {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  paymentReference: string;
}

export class PaymentService {
  async createPaymentOrder(dto: CreatePaymentDTO, userId: string) {
    if (!dto.idempotencyKey || dto.idempotencyKey.trim().length < 8) {
      throw new ApiError(400, 'Valid Idempotency-Key of at least 8 characters is required', 'INVALID_IDEMPOTENCY_KEY');
    }

    const idempotencyKey = dto.idempotencyKey.trim();

    // 1. Idempotency Check: Look for existing payment for this user & key
    const existingPayment = await paymentRepository.findByIdempotency(userId, idempotencyKey);
    if (existingPayment) {
      if (['created', 'pending'].includes(existingPayment.status)) {
        return {
          razorpayOrderId: existingPayment.razorpayOrderId,
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          razorpayKeyId: env.RAZORPAY_KEY_ID,
          paymentReference: existingPayment.paymentReference,
          status: existingPayment.status,
          isReused: true,
          metadata: existingPayment.metadata,
        };
      } else if (existingPayment.status === 'captured') {
        throw new ApiError(400, 'This transaction has already been completed and paid for.', 'PAYMENT_ALREADY_CAPTURED');
      }
    }

    // 2. Full Server-Authoritative Checkout Validation
    const checkoutSummary = await checkoutService.validateCheckout({
      ...dto,
      userId,
    });

    if (!checkoutSummary.isReadyForPayment) {
      throw new ApiError(
        400,
        checkoutSummary.validationWarnings[0] || 'Cart validation failed. Please check your items and address.',
        'CHECKOUT_VALIDATION_FAILED',
        [checkoutSummary]
      );
    }

    // 3. Integer-Safe Rupee to Paise Conversion
    // e.g. ₹561.00 -> 56100 paise
    const amountInPaise = Math.round(checkoutSummary.grandTotal * 100);
    if (amountInPaise < 100) {
      throw new ApiError(400, 'Minimum payment amount is ₹1.00', 'MINIMUM_PAYMENT_FAILED');
    }

    // 4. Generate Unique Payment Reference
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const paymentReference = `KN-PAY-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;

    // 5. Create Razorpay Gateway Order
    const razorpayOrder = await razorpayService.createOrder({
      amountInPaise,
      receipt: paymentReference,
      notes: {
        userId,
        restaurantId: dto.restaurantId,
        paymentReference,
      },
    });

    // 6. Persist Local Payment Document
    const payment = await paymentRepository.create({
      userId: userId as any,
      restaurantId: dto.restaurantId as any,
      amount: amountInPaise,
      currency: 'INR',
      status: 'created',
      razorpayOrderId: razorpayOrder.id,
      idempotencyKey,
      paymentReference,
      metadata: {
        restaurantName: checkoutSummary.restaurant.name,
        subtotal: checkoutSummary.subtotal,
        discount: checkoutSummary.discount,
        deliveryFee: checkoutSummary.deliveryFee,
        platformFee: checkoutSummary.platformFee,
        taxAmount: checkoutSummary.taxAmount,
        tipAmount: checkoutSummary.tipAmount,
        grandTotalRupees: checkoutSummary.grandTotal,
        itemCount: checkoutSummary.items.length,
        addressSummary: checkoutSummary.address.fullFormatted,
        itemsSummary: checkoutSummary.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
      },
    });

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      razorpayKeyId: env.RAZORPAY_KEY_ID,
      paymentReference: payment.paymentReference,
      status: payment.status,
      checkoutSummary,
    };
  }

  async verifyPayment(dto: VerifyPaymentDTO, userId: string) {
    if (!dto.razorpay_order_id || !dto.razorpay_payment_id || !dto.razorpay_signature) {
      throw new ApiError(400, 'Missing required payment verification credentials', 'PAYMENT_CREDENTIALS_MISSING');
    }

    // 1. Locate Local Payment Record
    const payment = await paymentRepository.findByReference(dto.paymentReference, userId);
    if (!payment) {
      throw new ApiError(404, 'Payment record not found or access denied', 'PAYMENT_NOT_FOUND');
    }

    // 2. Check Order ID Matching
    if (payment.razorpayOrderId && payment.razorpayOrderId !== dto.razorpay_order_id) {
      throw new ApiError(400, 'Razorpay order ID mismatch with local payment record', 'ORDER_ID_MISMATCH');
    }

    // 3. Signature Verification using Secret
    const isSignatureValid = razorpayService.verifyPaymentSignature(
      dto.razorpay_order_id,
      dto.razorpay_payment_id,
      dto.razorpay_signature
    );

    if (!isSignatureValid) {
      await paymentRepository.markFailed(payment._id.toString(), 'Invalid cryptographic signature from gateway');
      throw new ApiError(400, 'Payment verification failed: Invalid cryptographic signature', 'INVALID_SIGNATURE');
    }

    // 4. Update Status to Captured
    const updatedPayment = await paymentRepository.markCaptured(
      payment._id.toString(),
      dto.razorpay_payment_id,
      dto.razorpay_signature
    );

    return {
      success: true,
      paymentReference: payment.paymentReference,
      status: updatedPayment?.status || 'captured',
      amount: payment.amount,
      amountRupees: payment.amount / 100,
      currency: payment.currency,
      restaurantName: payment.metadata?.restaurantName,
      razorpayPaymentId: dto.razorpay_payment_id,
      message: 'Payment verified and captured successfully!',
    };
  }

  async getPaymentStatus(paymentReference: string, userId: string) {
    const payment = await paymentRepository.findByReference(paymentReference, userId);
    if (!payment) {
      throw new ApiError(404, 'Payment record not found or access denied', 'PAYMENT_NOT_FOUND');
    }

    return {
      paymentReference: payment.paymentReference,
      status: payment.status,
      amountPaise: payment.amount,
      amountRupees: payment.amount / 100,
      currency: payment.currency,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      metadata: payment.metadata,
      createdAt: payment.createdAt,
    };
  }

  async cancelPayment(paymentReference: string, userId: string) {
    const cancelled = await paymentRepository.markCancelled(paymentReference, userId);
    if (!cancelled) {
      return { message: 'Payment already completed or cannot be cancelled' };
    }
    return { message: 'Payment cancelled successfully' };
  }
}

export const paymentService = new PaymentService();
