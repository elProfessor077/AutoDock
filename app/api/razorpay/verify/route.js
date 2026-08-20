import { NextResponse } from 'next/server';
import { verifyRazorpaySignature, PLANS } from '@/lib/razorpay';
import { auth } from '@/auth';

export async function POST(request) {
  try {
    const session = await auth();
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId = 'pro', billingCycle = 'monthly' } = body;

    const verification = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!verification.isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature verification failed' },
        { status: 400 }
      );
    }

    const plan = PLANS[planId] || PLANS.pro;

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${plan.name}`,
      paymentDetails: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id || `pay_simulated_${Date.now()}`,
        planId,
        planName: plan.name,
        billingCycle,
        userEmail: session?.user?.email || 'developer@AutoDock.local',
        verifiedAt: new Date().toISOString(),
        isTestMode: verification.isTestMode,
      },
    });
  } catch (error) {
    console.error('[Razorpay Verify Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Signature verification failed' },
      { status: 500 }
    );
  }
}
