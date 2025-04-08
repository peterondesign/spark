"use client";
import React, { useState, useEffect } from 'react';
import * as Cronitor from '@cronitorio/cronitor-rum';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageTitle from '../components/PageTitle';
import Head from 'next/head';
import Image from 'next/image';

interface GiftIdea {
    title: string;
    description: string;
    price: string;
}

const DateNightBoxSubscription = () => {
    const [partnerInfo, setPartnerInfo] = useState('');
    const [occasion, setOccasion] = useState('');
    const [budget, setBudget] = useState('');
    const [interests, setInterests] = useState('');
    const [giftIdeas, setGiftIdeas] = useState<GiftIdea[]>([]);
    const [loading, setLoading] = useState(false);

    // Schema markup for search engines
    const dateNightBoxSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Couples’ Gift Box Subscription",
        "description": "Monthly themed date night boxes delivered to your door with everything you need for a memorable date night at home.",
        "offers": {
            "@type": "AggregateOffer",
            "lowPrice": "79.99",
            "highPrice": "99.99",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
        }
    };

  

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Placeholder for actual API call
        setTimeout(() => {
            setGiftIdeas([
                {
                    title: "Custom Star Map",
                    description: "A personalized star map showing the night sky from the exact time and place of your first date or another special moment.",
                    price: "$50-100"
                },
                {
                    title: "Experience Gift Box",
                    description: "A curated box with tickets to local experiences based on their interests, like cooking classes or outdoor adventures.",
                    price: "$100-200"
                },
                {
                    title: "Personalized Playlist with Vintage Record Player",
                    description: "A vinyl record with your special songs and a vintage-style record player.",
                    price: "$150-300"
                },
            ]);
            setLoading(false);
        }, 2000);
    };

    return (
        <>
            <Head>
                <script type="application/ld+json">
                    {JSON.stringify(dateNightBoxSchema)}
                </script>
            </Head>
            <PageTitle />
            <Header />
            <main className="w-full">
                {/* Hero Section with Parallax-like effect */}
                <section className="relative h-[480px] flex items-center justify-center overflow-hidden bg-black">
                    <div className="absolute inset-0">
                        <Image
                            src="/placeholder.jpg"
                            alt="Gifts entering a box"
                            layout="fill"
                            objectFit="cover"
                            className="transform scale-110 transition-transform duration-1000"
                            priority
                            quality={100}
                        />
                    </div>
                    <div className="absolute inset-0 opacity-80 bg-gradient-to-b from-purple-900 to-black"></div>
                    <div className="relative z-10 text-center text-white px-4">
                        <h1 className="text-6xl md:text-6xl font-bold mb-6 tracking-tight">This is your sign to spoil your person</h1>
                        <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">Get surprise super-personalized gifts just for them</p>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="bg-white text-purple-900 hover:bg-gray-100"
                            onClick={() => {
                                document.querySelector('.py-24.bg-black.text-white')?.scrollIntoView({
                                    behavior: 'smooth'
                                });
                            }}
                        >
                            Get a Box
                        </Button>
                    </div>
                </section>

                {/* Product Showcase */}
                <section className="py-24 bg-black text-white">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-3 gap-12">
                            {/* For Him Box */}
                            <div className="relative group">
                                <div className="aspect-square rounded-3xl overflow-hidden mb-6 transform group-hover:scale-105 transition-transform duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                                    <Image
                                        src="/forhimgift.webp"
                                        alt="Curated box for him"
                                        layout="fill"
                                        objectFit="cover"
                                        className="group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">For Him</h3>
                                <p className="text-gray-400 mb-4">A curated experience crafted for the modern gentleman. One-time purchase.</p>
                                <Button variant="ghost" className="border border-white text-white hover:bg-white hover:text-black"
                                    onClick={() => window.open("https://buy.stripe.com/3csdTh2sf6XgaC43co", "_blank", "noopener,noreferrer")}
                                >
                                    Pay One Time Fee • $49
                                </Button>
                            </div>

                            {/* For Her Box */}
                            <div className="relative group">
                                <div className="aspect-square rounded-3xl overflow-hidden mb-6 transform group-hover:scale-105 transition-transform duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                                    <Image
                                        src="/forhergift.webp"
                                        alt="Curated box for her"
                                        layout="fill"
                                        objectFit="cover"
                                        className="group-hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">For Her</h3>
                                <p className="text-gray-400 mb-4">Thoughtfully selected items to create moments of joy and self-care. One-time purchase.</p>
                                <Button variant="ghost" className="border border-white text-white hover:bg-white hover:text-black"
                                    onClick={() => window.open("https://buy.stripe.com/3csdTh2sf6XgaC43co", "_blank", "noopener,noreferrer")}>
                                    Pay One Time Fee • $49
                                </Button>
                            </div>

                            {/* Monthly Couple Box */}
                            <div className="relative group">
                                <div className="aspect-square rounded-3xl overflow-hidden mb-6 transform group-hover:scale-105 transition-transform duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                                    <Image
                                        src="/couplegiftbox.png"
                                        alt="Monthly couple box"
                                        layout="fill"
                                        objectFit="cover"
                                        className="group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-4 right-4 bg-purple-600 px-3 py-1 rounded-full text-sm">
                                        Most Popular
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold mb-3">Monthly Couple Box</h3>
                                <p className="text-gray-400 mb-4">A new themed experience every month, delivered to your door.</p>
                                <Button
                                    variant="ghost"
                                    className="border border-white text-white hover:bg-white hover:text-black"
                                    onClick={() => window.open("https://buy.stripe.com/28o02r4AngxQ39C8wH", "_blank", "noopener,noreferrer")}
                                >
                                    Subscribe • $79/month
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* The Experience Section */}
                <section className="py-24 bg-gradient-to-b from-black to-purple-900 text-white">
                    <div className="container mx-auto px-4">
                        <h2 className="text-5xl font-bold text-center mb-16">The Experience</h2>
                        <div className="grid md:grid-cols-3 gap-16 max-w-5xl mx-auto">
                            <div className="text-center relative">
                                <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center mx-auto mb-6">
                                    <span className="text-2xl font-bold">1</span>
                                </div>
                                <h3 className="text-xl font-bold mb-4">Choose Your Box</h3>
                                <p className="text-gray-300">Choose a box tailored for him, her, or both of you</p>
                                <div className="absolute top-8 right-0 transform translate-x-1/2 hidden md:block">
                                    <svg className="w-24 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>

                            <div className="text-center relative">
                                <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center mx-auto mb-6">
                                    <span className="text-2xl font-bold">2</span>
                                </div>
                                <h3 className="text-xl font-bold mb-4">Share Your Story</h3>
                                <p className="text-gray-300">Complete a brief personalization form within 7 days</p>
                                <div className="absolute top-8 right-0 transform translate-x-1/2 hidden md:block">
                                    <svg className="w-24 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center mx-auto mb-6">
                                    <span className="text-2xl font-bold">3</span>
                                </div>
                                <h3 className="text-xl font-bold mb-4">Experience Magic</h3>
                                <p className="text-gray-300">Receive your carefully curated box of wonder</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* New Section with Image and Text */}
                <section className="py-16 bg-gray-100">
                    <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
                        {/* Image */}
                        <div className="rounded-lg overflow-hidden shadow-md">
                            <Image
                                src="/couple-happy.webp"
                                alt="Thoughtful Gift"
                                width={500}
                                height={300}
                                layout="responsive"
                                objectFit="cover"
                            />
                        </div>

                        {/* Text Content */}
                        <div>
                            <h2 className="text-3xl font-bold mb-4 text-gray-800">Give the Gift of Connection</h2>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Looking for a unique way to strengthen bonds? Our curated gift boxes offer more than just items; they deliver shared experiences. Each box is designed to spark conversation, laughter, and lasting memories. Perfect for anniversaries, special occasions, birthdays, or just because, give a gift that truly connects.
                            </p>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                Imagine the joy of unwrapping a thoughtfully curated box filled with items designed to create a special date night. From gourmet snacks and engaging activities to cozy ambiance setters, each element is carefully selected to foster intimacy and fun.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                Whether it's a romantic evening for two or a fun-filled night with friends, our gift boxes provide everything you need to create a memorable experience. Say goodbye to the stress of planning and hello to quality time and shared moments. Give the gift of connection today and watch relationships blossom.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Join The Movement Section */}
                <section className="py-24 bg-black text-white text-center">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <h2 className="text-5xl font-bold mb-8">Join The Movement</h2>
                        <p className="text-xl text-gray-300 mb-12">Be part of a community that believes in the power of intentional moments and curated experiences.</p>
                        <Button
                            variant="secondary"
                            size="lg"
                            className="bg-purple-600 text-white hover:bg-purple-700"
                            onClick={() => {
                                document.querySelector('.py-24.bg-black.text-white')?.scrollIntoView({
                                    behavior: 'smooth'
                                });
                            }}
                        >
                            Start Your Journey
                        </Button>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default DateNightBoxSubscription;