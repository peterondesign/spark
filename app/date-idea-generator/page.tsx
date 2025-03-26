"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { getImageUrl } from "../utils/imageService";
import TinderSwipeView from "../components/TinderSwipeView";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import { PAGE_TITLES } from "../utils/titleUtils";
import Link from "next/link";
import Head from "next/head";

// Define DateIdea type
interface DateIdea {
  id: number;
  title: string;
  category: string;
  rating: number;
  location: string;
  description: string;
  price: string;
  duration: string;
  slug: string;
  image: string;
  priceLevel?: number;
  bestForStage?: string;
  tips?: string | null;
  idealFor?: string;
  relatedDateIdeas?: string[];
  longDescription?: string;
}

// Structured data for better SEO
const generateStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Date Idea Generator - Random Date Night Ideas for Couples",
    "description": "Free random date idea generator for couples. Find perfect date night ideas with our AI date generator and couple date randomizer tool.",
    "applicationCategory": "LifestyleApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };
};

export default function DateIdeaGenerator() {
  const [allDateIdeas, setAllDateIdeas] = useState<DateIdea[]>([]);
  const [allDateIdeaImages, setAllDateIdeaImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDateIdeas = async () => {
      try {
        const { data, error } = await supabase
          .from('date_ideas')
          .select('*');

        if (error) {
          console.error("Supabase Error:", error);
          throw error;
        }

        // Shuffle the date ideas to make it more interesting
        const shuffledData = data ? [...data].sort(() => Math.random() - 0.5) : [];
        setAllDateIdeas(shuffledData);

        // Load images for all date ideas
        if (data) {
          const imagesPromises = data.map(async (idea: { slug: string; image: string | { url?: string; }; title: string; category: string; }) => ({
            [idea.slug]: await getImageUrl(idea.image, `${idea.title} ${idea.category}`, 400, 300),
          }));
          
          const imagesResolved = Object.assign({}, ...(await Promise.all(imagesPromises)));
          setAllDateIdeaImages(imagesResolved);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching date ideas:', error);
        setLoading(false);
      }
    };

    fetchDateIdeas();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <PageTitle title={PAGE_TITLES.GENERATOR} />
      
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rose-500 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Random Date Idea Generator for Couples</h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Our AI-powered date night generator helps couples find the perfect date. Swipe right on date ideas you love, left on ones you don't!
          </p>
          <Link 
            href="/" 
            className="inline-block bg-white text-rose-500 hover:bg-gray-100 px-6 py-3 rounded-full font-medium transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </section>

      {/* Swipe View Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading date ideas...</p>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Couple Date Generator & Date Night Randomizer</h2>
                  <p className="text-gray-600">Swipe right on ideas you like, left on those you don't. Our AI date generator helps you discover perfect date night ideas tailored to your preferences.</p>
                </div>
                <TinderSwipeView
                  dateIdeas={allDateIdeas}
                  dateIdeaImages={allDateIdeaImages}
                />
              </>
            )}
          </div>
        </div>
      </section>

      {/* Additional SEO Content */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">Why Use Our Random Date Idea Generator?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Perfect for Couples</h3>
              <p>Our couple date generator helps you break out of your routine with creative date night ideas that match your interests and relationship stage.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">AI-Powered Suggestions</h3>
              <p>Unlike other date night generators, our AI date generator learns from your preferences to provide increasingly personalized date ideas.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Date Night Randomizer</h3>
              <p>Can't decide what to do? Let our date night randomizer surprise you with unexpected but delightful date experiences.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Free and Easy to Use</h3>
              <p>Our random date generator for couples is completely free and designed to make planning your next date night simple and fun.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
