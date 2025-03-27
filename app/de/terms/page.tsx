"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function Terms() {

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation - Header */}
            <Header />
            
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
                <p className="text-gray-600 mb-2">Effective Date: 24th March 2025</p>
                <p className="text-gray-600 mb-6">Last Updated: 24th March 2025</p>

                <div className="prose max-w-none">
                    <p>
                        Welcome to DateIdeas.cc ("Company," "we," "our," or "us"). These Terms & Conditions ("Agreement") govern your use of:
                    </p>
                    
                    <p className="my-4">
                        Our Affiliate Marketing partnerships, which include links to third-party services such as GetYourGuide.
                    </p>
                    
                    <p className="my-4">
                        Our Date Night Box Subscription service provides curated monthly boxes with everything needed for memorable date nights at home. Subscriptions include themed date activities, treats, and personalized elements delivered via mail.
                    </p>
                    
                    <p className="my-6 font-medium">
                        By using our Website, clicking on affiliate links, or subscribing to our Service, you agree to these Terms. If you do not agree, please do not use our Website or Service.
                    </p>
                    
                    <h2 className="text-2xl font-semibold mt-8 mb-4">1. Affiliate Marketing Program</h2>
                    <h3 className="text-xl font-medium mb-2">1.1 Affiliate Relationship</h3>
                    <p>
                        We participate in affiliate programs that allow us to earn commissions when users book experiences through our links.
                    </p>
                    <p className="my-3">
                        Clicking an affiliate link may result in a purchase on a third-party website, and we do not control pricing, availability, or customer support for those services.
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-2">1.2 Disclosure & Compliance</h3>
                    <p>
                        In compliance with FTC guidelines, assume that links on our Website are affiliate links that may generate revenue for us.
                    </p>
                    <p className="my-3">
                        Third-party platforms may have their own terms and policies—please review them before making a purchase.
                    </p>

                    <h3 className="text-xl font-medium mt-6 mb-2">1.3 Disclaimer</h3>
                    <p>
                        We are not responsible for any issues related to bookings, cancellations, refunds, or disputes with third-party services.
                    </p>
                    <p className="my-3">
                        Users release DateIdeas.cc from any liability for losses or damages from third-party purchases.
                    </p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">2. Date Night Box Subscription</h2>
                    <h3 className="text-xl font-medium mb-2">2.1 Service Overview</h3>
                    <p>Our chatbot service offers:</p>
                    <p className="my-1">Date & Special Occasion Reminders via WhatsApp and Email</p>
                    <p className="my-1">Personalized Gift Suggestions with direct purchase links</p>
                    <p className="my-1">Automated Recommendations based on user-provided preferences</p>

                    <h3 className="text-xl font-medium mt-6 mb-2">2.2 Free Trial & Billing</h3>
                    <p>New users receive a one-month free trial.</p>
                    <p className="my-3">After the trial, billing automatically begins at $10/month via Stripe.</p>
                    <p className="my-3">You may cancel at any time before the next billing cycle. No refunds for partial months.</p>
                    <p className="my-3">By subscribing, you authorize recurring payments unless you cancel.</p>

                    <h3 className="text-xl font-medium mt-6 mb-2">2.3 Onboarding & Form Requirement</h3>
                    <p>You must complete an initial onboarding form for service activation.</p>
                    <p className="my-3">If you fail to submit the form within 7 days of signing up, your subscription may be automatically canceled.</p>

                    <h3 className="text-xl font-medium mt-6 mb-2">2.4 Subscription & Cancellation</h3>
                    <p>You can cancel anytime through Stripe or by contacting support at startboardstudio@gmail.com.</p>
                    <p className="my-3">If you cancel, your service remains active until the end of your current billing cycle.</p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Responsibilities</h2>
                    <p>You must provide accurate and truthful information when using our services.</p>
                    <p className="my-3">We do not guarantee the availability of any recommended gift or experience.</p>
                    <p className="my-3">We are not responsible for third-party issues, including product availability, pricing changes, or delivery failures.</p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Collection & Privacy</h2>
                    <p>We collect data for personalized recommendations and service delivery.</p>
                    <p className="my-3">WhatsApp & Email communications comply with privacy laws.</p>
                

                    <h2 className="text-2xl font-semibold mt-8 mb-4">5. Refunds & Disputes</h2>
                    <p>No refunds are issued once a payment is processed unless legally required.</p>
                    <p className="my-3">Affiliate purchases and third-party bookings are subject to their own refund policies—please check their terms.</p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">6. Limitation of Liability</h2>
                    <p>We do not guarantee specific outcomes from our services or affiliate links.</p>
                    <p className="my-3">DateIdeas.cc is not liable for any losses, damages, or issues arising from third-party purchases or subscription use.</p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">7. Governing Law & Modifications</h2>
                    <p>These Terms are governed by the laws of Portugal.</p>
                    <p className="my-3">We reserve the right to modify, suspend, or terminate services and affiliate programs at any time.</p>
                    <p className="my-3">Changes to this Agreement will be updated on our Website.</p>

                    <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contact Information</h2>
                    <p>For questions, support, or cancellations, contact us at:</p>
                    <p className="my-1">📧 Email: startboardstudio@gmail.com</p>
                </div>
            </div>

            <Footer/>
        </div>
    );
}
