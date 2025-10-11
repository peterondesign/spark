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
    
    // Parse request body with error handling
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    const { email, amount, currency = 'eur' } = requestData;

    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email and amount are required' },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    const numericAmount = parseInt(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: numericAmount, // Amount in cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
      receipt_email: email,
      metadata: {
        email: email,
        subscription_type: 'date_ideas_reminders',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err: any) {
    console.error('Error creating payment intent:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add GET method for build-time validation
export async function GET() {
  return NextResponse.json({ 
    status: 'Payment API available',
    configured: !!process.env.STRIPE_SECRET_KEY 
  });
}