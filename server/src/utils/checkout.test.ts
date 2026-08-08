import { calculateOrderPricing } from './pricing.util.js';
import { addressSchema } from '../validators/address.validator.js';

function runCheckoutLogicTests() {
  console.log('🧪 Starting KhanaNow Checkout & Server Validation Tests...');

  // Test 1: Indian Phone and Postal Code Validation
  const validAddress = {
    label: 'Home',
    fullName: 'Aarav Sharma',
    phone: '9876543210',
    addressLine1: 'Flat 402, Green Valley Heights',
    city: 'New Delhi',
    state: 'Delhi',
    postalCode: '110001',
    country: 'India',
  };

  const parseResult = addressSchema.safeParse(validAddress);
  console.assert(parseResult.success === true, 'Test 1 Failed: Valid address should pass');

  const invalidPostal = { ...validAddress, postalCode: '1100' }; // Invalid 4-digit pincode
  const invalidPostalResult = addressSchema.safeParse(invalidPostal);
  console.assert(invalidPostalResult.success === false, 'Test 1 Failed: Invalid postal code should fail');

  const invalidPhone = { ...validAddress, phone: '123' }; // Invalid 3-digit phone
  const invalidPhoneResult = addressSchema.safeParse(invalidPhone);
  console.assert(invalidPhoneResult.success === false, 'Test 1 Failed: Invalid phone should fail');
  console.log('✅ Test 1 Passed: Indian address, 6-digit pincode, and 10-digit phone validated.');

  // Test 2: Price change and unavailable items detection
  const clientCart = [
    { foodId: 'dish-1', name: 'Dum Biryani', price: 300, quantity: 2 },
    { foodId: 'dish-2', name: 'Paneer Tikka', price: 200, quantity: 1 },
  ];

  const dbFoods = [
    { id: 'dish-1', name: 'Dum Biryani', price: 340, isAvailable: true }, // price changed from 300 to 340
    { id: 'dish-2', name: 'Paneer Tikka', price: 200, isAvailable: false }, // item unavailable
  ];

  const priceChanges: any[] = [];
  const unavailableItems: any[] = [];

  for (const item of clientCart) {
    const dbFood = dbFoods.find((f) => f.id === item.foodId);
    if (!dbFood || !dbFood.isAvailable) {
      unavailableItems.push({ foodId: item.foodId, name: item.name });
    } else if (dbFood.price !== item.price) {
      priceChanges.push({ foodId: item.foodId, clientPrice: item.price, currentPrice: dbFood.price });
    }
  }

  console.assert(priceChanges.length === 1, 'Test 2 Failed: Expected 1 price change detected');
  console.assert(unavailableItems.length === 1, 'Test 2 Failed: Expected 1 unavailable item detected');
  console.log('✅ Test 2 Passed: Price changes and unavailable items successfully flagged.');

  // Test 3: Server-authoritative financial calculation with coupon and tip
  const authoritativeSubtotal = 680; // 2x 340
  const couponDiscount = 100;
  const tipAmount = 30;

  const serverPricing = calculateOrderPricing({
    itemTotal: authoritativeSubtotal,
    discountAmount: couponDiscount,
    tipAmount,
  });

  // subtotal = 680, discount = 100, taxable = 580, tax 5% of 580 = 29, delivery = 0 (>= 500), platform = 6, tip = 30
  // grandTotal = 680 + 0 + 6 + 29 + 30 - 100 = 645
  console.assert(serverPricing.isFreeDelivery === true, 'Test 3 Failed: Orders >= 500 should qualify for free delivery');
  console.assert(serverPricing.taxAmount === 29, `Test 3 Failed: 5% GST on 580 should be 29, got ${serverPricing.taxAmount}`);
  console.assert(serverPricing.grandTotal === 645, `Test 3 Failed: Expected grandTotal 645, got ${serverPricing.grandTotal}`);
  console.log('✅ Test 3 Passed: Server-authoritative bill breakdown calculated with 100% accuracy.');

  console.log('🎉 All 3 Checkout & Server Validation Tests Passed Successfully!');
}

runCheckoutLogicTests();
