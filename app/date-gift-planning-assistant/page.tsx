"use client";

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Header Component
export const Pricing = () => {
    return (
        <main className="container mx-auto py-8">
            <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
                    <h3 className="text-2xl font-bold mb-4">Date and Gift Planning Assistant</h3>
                    <div className="mb-4">
                        <span className="text-3xl font-bold">$10</span>
                        <span className="text-lg">/month</span>
                        <p className="text-purple-100">First month free trial</p>
                    </div>
                    <ul className="mb-6 space-y-2">
                        <li>✨ Date reminders and Special occasion reminders via WhatsApp/Email</li>
                        <li>🎁 Personalized gift recommendations (Buy something your partner will love in one click)</li>
                    </ul>
                    <a
                        href="https://buy.stripe.com/aEU4iH6Iv3L48tWbIS"
                        target="_blank"
                        className="w-full bg-white text-purple-600 py-2 px-4 rounded-md font-semibold hover:bg-purple-50 transition-colors text-center block"
                    >
                        Start Free Trial
                    </a>
                </div>
            </div>
        </main>
    );
};

const DateGiftPlanningAssistant = () => {
    return (
        <>
            <Header />
            <Pricing />
            <Footer />
        </>
    );
};

export default DateGiftPlanningAssistant;