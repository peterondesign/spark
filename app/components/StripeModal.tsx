"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { X, Lock } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';
import StripeCheckoutForm from './StripeCheckoutForm';

interface StripeModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const StripeModal = ({ isOpen, onClose, email: initialEmail }: StripeModalProps) => {
  const { theme } = useTheme();
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (isOpen && email.trim()) {
      // Create PaymentIntent when modal opens and email is provided
      createPaymentIntent();
    }
  }, [isOpen]);

  const validateEmail = (emailValue: string) => {
    if (!emailValue.trim()) {
      setEmailError('Email is required');
      return false;
    }
    
    // Basic validation: must contain @ symbol
    if (!emailValue.includes('@')) {
      setEmailError('Email must contain @ symbol');
      return false;
    }
    
    // More comprehensive email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    
    setEmailError('');
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Real-time validation to update button state
    validateEmail(newEmail);
  };

  const handleEmailBlur = () => {
    if (email.trim()) {
      validateEmail(email);
    }
  };

  // Check if email is valid for enabling the button
  const isEmailValid = () => {
    return email.trim() && email.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const createPaymentIntent = async () => {
    if (!isEmailValid()) {
      validateEmail(email); // Show validation error
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          amount: 800, // €8.00 in cents
          currency: 'eur',
        }),
      });

      const data = await response.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      alert('Error setting up payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const appearance = {
    theme: theme === 'dark' ? 'night' as const : 'stripe' as const,
    variables: {
      colorPrimary: '#f43f5e', // rose-500
      colorBackground: theme === 'dark' ? '#111827' : '#ffffff',
      colorText: theme === 'dark' ? '#ffffff' : '#374151',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md mx-auto rounded-2xl shadow-2xl ${
        theme === 'light' ? 'bg-white' : 'bg-gray-900'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className={`text-xl font-bold ${
              theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}>
              Subscribe for €8/month
            </h2>
            <p className={`text-sm ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Get weekly date idea reminders
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              theme === 'light' 
                ? 'hover:bg-gray-100 text-gray-500' 
                : 'hover:bg-gray-800 text-gray-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stripe Elements */}
        <div className="p-6">
          {/* Email Input */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder="Enter your email address"
              className={`w-full px-3 py-2 rounded-lg border text-sm ${
                theme === 'light'
                  ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-rose-500'
                  : 'border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-rose-500'
              } focus:outline-none focus:ring-2 focus:ring-rose-500/20 ${
                emailError ? 'border-red-500' : ''
              }`}
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>

          {/* Security Notice */}
          <div className={`flex items-center gap-2 p-3 rounded-lg mb-6 ${
            theme === 'light' ? 'bg-gray-50' : 'bg-gray-800'
          }`}>
            <Lock className="w-4 h-4 text-green-500" />
            <p className={`text-xs ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Your payment information is secure and encrypted by Stripe
            </p>
          </div>

          {/* Stripe Payment Form */}
          {isLoading && !clientSecret ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <span className={theme === 'light' ? 'text-gray-600' : 'text-gray-400'}>
                  Setting up payment...
                </span>
              </div>
            </div>
          ) : clientSecret ? (
            <Elements options={options} stripe={stripePromise}>
              <StripeCheckoutForm onSuccess={onClose} email={email} />
            </Elements>
          ) : (
            <div className="text-center py-4">
              <button
                onClick={createPaymentIntent}
                disabled={!isEmailValid() || isLoading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
                  !isEmailValid() || isLoading
                    ? 'bg-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-rose-500 hover:bg-rose-600 hover:shadow-lg'
                }`}
              >
                {isLoading ? 'Setting up...' : 'Continue to Payment'}
              </button>
              {!isEmailValid() && email.trim() && (
                <p className={`text-sm mt-2 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Please enter a valid email address to continue
                </p>
              )}
              {!email.trim() && (
                <p className={`text-sm mt-2 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Please enter your email address to continue
                </p>
              )}
            </div>
          )}

          {/* Terms */}
          <p className={`text-xs text-center mt-6 ${
            theme === 'light' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            By subscribing, you agree to our Terms of Service and Privacy Policy. 
            You can cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StripeModal;