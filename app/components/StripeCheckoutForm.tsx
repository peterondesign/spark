"use client";

import { useState } from 'react';
import { useTheme } from 'next-themes';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

interface StripeCheckoutFormProps {
  onSuccess: () => void;
  email: string;
}

const StripeCheckoutForm = ({ onSuccess, email }: StripeCheckoutFormProps) => {
  const { theme } = useTheme();
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);
    setMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/payment-success`,
        receipt_email: email,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An unexpected error occurred.");
      } else {
        setMessage("An unexpected error occurred.");
      }
    } else {
      // Payment succeeded
      onSuccess();
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs" as const,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        id="payment-element" 
        options={paymentElementOptions}
      />
      
      {message && (
        <div className={`text-sm p-3 rounded-lg ${
          message.includes('succeeded') 
            ? theme === 'light' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-green-900/20 text-green-400 border border-green-700'
            : theme === 'light'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-red-900/20 text-red-400 border border-red-700'
        }`}>
          {message}
        </div>
      )}

      <button
        disabled={isLoading || !stripe || !elements}
        type="submit"
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
          isLoading || !stripe || !elements
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-rose-500 hover:bg-rose-600 hover:shadow-lg'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </div>
        ) : (
          'Subscribe for €8/month'
        )}
      </button>
    </form>
  );
};

export default StripeCheckoutForm;