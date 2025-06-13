"use client"

import { useState, useEffect } from "react";
import { X, Mail, Phone, ArrowRight, Check, Loader2 } from "lucide-react";

interface AuthenticationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface UserData {
  email: string;
  phone: string;
}

const AuthenticationModal: React.FC<AuthenticationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [userData, setUserData] = useState<UserData>({
    email: "",
    phone: ""
  });
  const [errors, setErrors] = useState<Partial<UserData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  // Reset modal state when it opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setUserData({ email: "", phone: "" });
      setErrors({});
      setIsLoading(false);
      setCheckoutComplete(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const handleInputChange = (field: keyof UserData, value: string) => {
    setUserData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Partial<UserData> = {};

    // At least one field is required
    if (!userData.email.trim() && !userData.phone.trim()) {
      newErrors.email = "Either email or phone number is required";
      newErrors.phone = "Either email or phone number is required";
    } else {
      // Validate email if provided
      if (userData.email.trim() && !validateEmail(userData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      // Validate phone if provided
      if (userData.phone.trim() && !validatePhone(userData.phone)) {
        newErrors.phone = "Please enter a valid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Here you would typically save the user data to your backend
      // For now, we'll just simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep(2);
    } catch (error) {
      console.error("Error saving user data:", error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckoutSuccess = () => {
    // This function is now mainly for demo purposes
    // In production, Stripe will handle the redirect and webhook will confirm payment
    setCheckoutComplete(true);
    setTimeout(() => {
      onSuccess?.();
      onClose();
    }, 2000);
  };

  // Handle successful payment return from Stripe
  useEffect(() => {
    // Check URL parameters for successful payment
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment_success') === 'true') {
      setCheckoutComplete(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    }
  }, [onSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 1 ? "Get Started" : "Complete Your Subscription"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {step === 1 
                ? "Enter your contact information to continue" 
                : "Subscribe for $8/month to get date idea reminders"
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? "bg-rose-600 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                {step > 1 ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className={`text-sm font-medium ${step >= 1 ? "text-rose-600" : "text-gray-600"}`}>
                Contact Info
              </span>
            </div>
            
            <div className={`flex-1 h-0.5 mx-4 ${step >= 2 ? "bg-rose-600" : "bg-gray-200"}`} />
            
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? "bg-rose-600 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                {checkoutComplete ? <Check className="h-4 w-4" /> : "2"}
              </div>
              <span className={`text-sm font-medium ${step >= 2 ? "text-rose-600" : "text-gray-600"}`}>
                Subscribe
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={userData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`bg-gray-100 w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                      errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone Input */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    value={userData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`bg-gray-100 w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors ${
                      errors.phone ? "border-red-500 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Info text */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> At least one contact method (email or phone) is required. 
                  We'll use this to send you personalized date idea reminders.
                </p>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-rose-600 text-white py-3 px-4 rounded-lg hover:bg-rose-700 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Payment</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6">
              {/* User info recap */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Contact Information</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  {userData.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{userData.email}</span>
                    </div>
                  )}
                  {userData.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{userData.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscription details */}
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
                <h3 className="font-medium text-rose-900 mb-2">Subscription Details</h3>
                <div className="space-y-2 text-sm text-rose-800">
                  <div className="flex justify-between">
                    <span>Monthly Subscription</span>
                    <span className="font-medium">$8.00/month</span>
                  </div>
                  <div className="text-xs">
                    • Personalized date idea reminders
                    • Email and/or SMS notifications
                    • Cancel anytime
                  </div>
                </div>
              </div>

              {checkoutComplete ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Welcome aboard!</h3>
                  <p className="text-gray-600">Your subscription is now active. You'll start receiving date idea reminders soon!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Stripe Checkout - Real Stripe Payment Link */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 10h18v2H3v-2zm0 4h18v2H3v-2zm0-8h18v2H3V6z"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Secure Payment</h3>
                      <p className="text-gray-600 text-sm">
                        Complete your $8/month subscription using our secure payment system powered by Stripe.
                      </p>

                      {/* Stripe Checkout Button */}
                      <a
                        href="https://buy.stripe.com/fZufZieg95wF3yFfgi9Zm0d"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2 no-underline"
                      >
                        <span>Complete Payment - $8.00/month</span>
                        <ArrowRight className="h-5 w-5" />
                      </a>
                      
                      <p className="text-xs text-gray-500">
                        🔒 Secured by Stripe • Click to proceed to secure checkout
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setStep(1)}
                    className="w-full text-gray-600 hover:text-gray-800 text-sm font-medium"
                  >
                    ← Back to contact information
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthenticationModal;
