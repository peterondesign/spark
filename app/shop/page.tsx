"use client";
import React, { useState, useEffect, useRef } from 'react';
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

const productData = [
    {
        title: 'Conversation Starters',
        description: 'A deck of creative prompts to spark meaningful conversations and deeper connections.',
        price: '$19.99 USD',
        buyUrl: 'https://buy.stripe.com/test-convo',
        images: ['/starters.webp', '/starters2.webp'],
        preview: 'Preview a few sample cards below.'
    },
    {
        title: '250 Date Ideas',
        description: 'A curated collection of 250 unique date ideas for couples, friends, and more.',
        price: '$24.99 USD',
        buyUrl: 'https://buy.stripe.com/test-dateideas',
        images: ['/ideas.webp', '/ideas2.webp', '/ideas4.webp'],
        preview: 'See a few date ideas below.'
    }
];

function AutoplayCarousel({ images }: { images: string[] }) {
    const [index, setIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 2000);
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [images.length]);

    return (
        <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
            <Image
                src={images[index]}
                alt="Product preview"
                width={400}
                height={400}
                className="object-cover w-full h-full transition-all duration-700"
            />
        </div>
    );
}

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

export default function ShopPage() {
    return (
        <>
            <Head>
                <script type="application/ld+json">
                    {JSON.stringify(dateNightBoxSchema)}
                </script>
            </Head>
            <PageTitle />
            <Header />
            <main className="min-h-screen bg-white">
                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl font-bold mb-10 text-gray-900">Store</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {productData.map((product, idx) => (
                                <div
                                    key={product.title}
                                    className="bg-white rounded-3xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col items-center group border border-gray-100"
                                >
                                    <AutoplayCarousel images={product.images} />
                                    <div className="w-full mt-6">
                                        <h2 className="text-xl font-bold mb-2 text-gray-900">{product.title}</h2>
                                        <p className="text-gray-600 mb-3 text-sm">{product.description}</p>
                                        <div className="font-semibold text-lg mb-4">{product.price}</div>
                                        <a
                                            href={product.buyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full text-center bg-black text-white rounded-full py-3 font-bold text-base hover:bg-gray-900 transition-colors mb-2"
                                        >
                                            Buy Now
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}