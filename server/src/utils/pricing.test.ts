import { calculateOrderPricing } from './pricing.util.js';

function runCartPricingTests() {
  console.log('🧪 Starting KhanaNow Cart & Pricing Logic Tests...');

  // Test 1: Empty cart calculation
  const emptyBill = calculateOrderPricing({ itemTotal: 0 });
  console.assert(emptyBill.grandTotal === 0, 'Test 1 Failed: Empty cart grandTotal should be 0');
  console.assert(emptyBill.deliveryFee === 0, 'Test 1 Failed: Empty cart deliveryFee should be 0');
  console.log('✅ Test 1 Passed: Empty cart returns zero totals.');

  // Test 2: Standard Order under ₹500 should include delivery fee (₹35) and platform fee (₹6)
  const orderBelow500 = calculateOrderPricing({
    itemTotal: 300,
    tipAmount: 30,
  });
  // itemTotal = 300, delivery = 35, platform = 6, GST 5% of 300 = 15, tip = 30 => grandTotal = 300 + 35 + 6 + 15 + 30 = 386
  console.assert(orderBelow500.deliveryFee === 35, 'Test 2 Failed: Delivery fee should be 35 for orders < 500');
  console.assert(orderBelow500.taxAmount === 15, 'Test 2 Failed: GST 5% on 300 should be 15');
  console.assert(orderBelow500.grandTotal === 386, `Test 2 Failed: Grand total expected 386, got ${orderBelow500.grandTotal}`);
  console.log('✅ Test 2 Passed: Standard order < ₹500 includes ₹35 delivery & 5% GST.');

  // Test 3: Free delivery threshold for orders >= ₹500
  const orderAbove500 = calculateOrderPricing({
    itemTotal: 600,
    discountAmount: 100, // discount 100
    tipAmount: 20,
  });
  // itemTotal = 600, discount = 100, taxable = 500, GST = 25, delivery = 0 (FREE), platform = 6, tip = 20
  // grandTotal = 600 + 0 + 6 + 25 + 20 - 100 = 551
  console.assert(orderAbove500.isFreeDelivery === true, 'Test 3 Failed: Orders >= 500 should have free delivery');
  console.assert(orderAbove500.deliveryFee === 0, 'Test 3 Failed: Delivery fee should be 0 for orders >= 500');
  console.assert(orderAbove500.taxAmount === 25, 'Test 3 Failed: Tax on discounted total should be 25');
  console.assert(orderAbove500.grandTotal === 551, `Test 3 Failed: Expected 551, got ${orderAbove500.grandTotal}`);
  console.log('✅ Test 3 Passed: Free delivery threshold applied correctly for orders >= ₹500.');

  // Test 4: Integer-safe rounding & maximum discount clamp
  const heavyDiscountOrder = calculateOrderPricing({
    itemTotal: 250,
    discountAmount: 300, // discount exceeds item total
    tipAmount: 0,
  });
  console.assert(heavyDiscountOrder.discountAmount === 250, 'Test 4 Failed: Discount cannot exceed itemTotal');
  console.assert(heavyDiscountOrder.taxAmount === 0, 'Test 4 Failed: Tax on 0 subtotal should be 0');
  console.log('✅ Test 4 Passed: Discount clamp prevents negative subtotals.');

  console.log('🎉 All 4 Cart & Pricing Logic Tests Passed Successfully!');
}

runCartPricingTests();
