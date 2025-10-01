"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { CheckCircle, XCircle, Home } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'succeeded' | 'failed'>('loading');
  
  const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    if (paymentIntentClientSecret) {
      // Verify payment status with Stripe
      fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent: paymentIntentId,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === 'succeeded') {
            setPaymentStatus('succeeded');
          } else {
            setPaymentStatus('failed');
          }
        })
        .catch(() => {
          setPaymentStatus('failed');
        });
    }
  }, [paymentIntentClientSecret, paymentIntentId]);

  if (paymentStatus === 'loading') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
      }`}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
            Verifying your payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
    }`}>
      <div className={`max-w-md w-full rounded-2xl shadow-lg p-8 text-center ${
        theme === 'light' ? 'bg-white' : 'bg-gray-800'
      }`}>
        {paymentStatus === 'succeeded' ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className={`text-2xl font-bold mb-4 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Payment Successful!
            </h1>
            <p className={`mb-6 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Thank you for subscribing! You'll start receiving weekly date idea reminders via email.
            </p>
            <div className={`p-4 rounded-lg mb-6 ${
              theme === 'light' ? 'bg-green-50 border border-green-200' : 'bg-green-900/20 border border-green-700'
            }`}>
              <p className={`text-sm ${
                theme === 'light' ? 'text-green-700' : 'text-green-400'
              }`}>
                Your subscription is now active. Check your email for a confirmation.
              </p>
            </div>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className={`text-2xl font-bold mb-4 ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Payment Failed
            </h1>
            <p className={`mb-6 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Something went wrong with your payment. Please try again.
            </p>
            <div className={`p-4 rounded-lg mb-6 ${
              theme === 'light' ? 'bg-red-50 border border-red-200' : 'bg-red-900/20 border border-red-700'
            }`}>
              <p className={`text-sm ${
                theme === 'light' ? 'text-red-700' : 'text-red-400'
              }`}>
                No charges were made to your card. You can try subscribing again.
              </p>
            </div>
          </>
        )}

        <Link 
          href="/"
          className="inline-flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-rose-600 transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}