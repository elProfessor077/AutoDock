import { NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';
import { auth } from '@/auth';

export async function POST(request) {
  try {
    const session = await auth();
    const body = await request.json();
    const { planId = 'pro', billingCycle = 'monthly' } = body;

    const order = await createRazorpayOrder({ planId, billingCycle });

    return NextResponse.json({
      success: true,
      user: session?.user ? { name: session.user.name, email: session.user.email } : null,
      order,
    });
  } catch (error) {
    console.error('[Razorpay Order Error]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
