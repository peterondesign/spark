import { NextRequest, NextResponse } from 'next/server';

// Lazy load Stripe only when needed
let stripe: any = null;

const getStripe = async () => {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured in environment variables');
    }
    
    // Dynamic import to avoid build-time issues
    const Stripe = (await import('stripe')).default;
    stripe = new Stripe(secretKey, {
      apiVersion: '2024-06-20' as any, // Use a stable API version
    });
  }
  
  return stripe;
};

export async function POST(req: NextRequest) {
  try {
    // Validate environment variables first
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Payment processing is not configured' },
        { status: 500 }
      );
    }

    const stripeInstance = await getStripe();
    const { payment_intent } = await req.json();

    if (!payment_intent) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripeInstance.paymentIntents.retrieve(payment_intent);

    return NextResponse.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer_email: paymentIntent.receipt_email,
    });
  } catch (err: any) {
    console.error('Error verifying payment:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add GET method for build-time validation
export async function GET() {
  return NextResponse.json({ 
    status: 'Payment verification API available',
    configured: !!process.env.STRIPE_SECRET_KEY 
  });
}