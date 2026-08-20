import crypto from 'crypto';

export const PLANS = {
  developer: {
    id: 'developer',
    name: 'Developer Free',
    badge: 'Free Tier',
    priceMonthly: 0,
    priceYearly: 0,
    priceMonthlyPaise: 0,
    priceYearlyPaise: 0,
    currency: 'INR',
    features: [
      '3 Blueprint Generations / month',
      'Standard Dockerfile Compiler',
      'Basic Ecosystem Templates',
      'Community Support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro Builder',
    badge: 'Most Popular',
    priceMonthly: 999,
    priceYearly: 9590,
    priceMonthlyPaise: 99900,
    priceYearlyPaise: 959000,
    currency: 'INR',
    features: [
      'Unlimited AI Blueprint Refinement Chat',
      'Docker Compose & .env Auto-Stitching',
      'Multi-Stage Build Size Optimizer',
      'Digital Twin & Vulnerability Scanner',
      'Unlimited ZIP Exports & Downloads',
      'Priority AI Speed',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Studio',
    badge: 'Full Power',
    priceMonthly: 2999,
    priceYearly: 28790,
    priceMonthlyPaise: 299900,
    priceYearlyPaise: 2879000,
    currency: 'INR',
    features: [
      'Everything in Pro Builder',
      'Secret Shield Builder (API & Secret Masking)',
      'CI/CD Pipeline Generator (GitHub Actions & AWS)',
      'Certified Security Audit Report Export',
      'White-Label Client Export Option',
      'Dedicated 24/7 Priority Support',
    ],
  },
  credit_pack: {
    id: 'credit_pack',
    name: 'Blueprint Credit Pack',
    badge: 'Pay As You Go',
    priceMonthly: 299,
    priceYearly: 299,
    priceMonthlyPaise: 29900,
    priceYearlyPaise: 29900,
    currency: 'INR',
    isOneTime: true,
    credits: 15,
    features: [
      '15 Instant AI Blueprint Generations',
      'Valid for 1 Year from Purchase',
      'Includes Multi-Stage & Compose Support',
      'No Monthly Recurring Commitment',
    ],
  },
};

/**
 * Creates a Razorpay Order via REST API or Developer Test Fallback
 */
export async function createRazorpayOrder({ planId, billingCycle = 'monthly' }) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  const plan = PLANS[planId];
  if (!plan) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }

  let amountPaise = billingCycle === 'yearly' ? plan.priceYearlyPaise : plan.priceMonthlyPaise;
  if (plan.isOneTime) {
    amountPaise = plan.priceMonthlyPaise;
  }

  // Developer Test Mode if environment keys are not configured
  const isTestMode = !keyId || keyId === 'your_razorpay_key_id_here' || keyId === 'dummy';

  if (isTestMode) {
    const mockOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      orderId: mockOrderId,
      amount: amountPaise,
      currency: plan.currency || 'INR',
      keyId: 'rzp_test_AutoDockDevMode2026',
      isTestMode: true,
      planName: plan.name,
      billingCycle,
    };
  }

  // Live Razorpay API order creation
  const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: plan.currency || 'INR',
      receipt: `receipt_autodock_${Date.now()}`,
      notes: {
        planId,
        billingCycle,
        app: 'AutoDock',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Razorpay API Error (${response.status}): ${errorText}`);
  }

  const orderData = await response.json();
  return {
    orderId: orderData.id,
    amount: orderData.amount,
    currency: orderData.currency,
    keyId,
    isTestMode: false,
    planName: plan.name,
    billingCycle,
  };
}

/**
 * Verifies Razorpay payment signature
 */
export function verifyRazorpaySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // Test mode fallback validation
  if (!keySecret || (razorpay_order_id && razorpay_order_id.startsWith('order_test_'))) {
    return { isValid: true, isTestMode: true };
  }

  const text = `${razorpay_order_id}|${razorpay_payment_id}`;
  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(text)
    .digest('hex');

  const isValid = generatedSignature === razorpay_signature;
  return { isValid, isTestMode: false };
}
