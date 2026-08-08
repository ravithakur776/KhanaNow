/**
 * Safely loads the official Razorpay Checkout JavaScript SDK into the DOM.
 * Prevents multiple injections and handles network failures gracefully.
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById('razorpay-checkout-sdk');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.id = 'razorpay-checkout-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.error('❌ Failed to load Razorpay Checkout SDK');
      resolve(false);
    };

    document.body.appendChild(script);
  });
};
