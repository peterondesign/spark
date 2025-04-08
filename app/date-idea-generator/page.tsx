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
import Image from 'next/image';
import Head from "next/head";
import { generateMetadata } from "../../utils/metadataUtils";
import { Heart, Brain, Shuffle, Tag } from "lucide-react";

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
      <section className="relative bg-cover bg-center h-[270px]" style={{ backgroundImage: 'url(/placeholder.jpg)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/80 to-purple-600/80"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-5xl font-extrabold mb-4">Discover Your Perfect Date</h1>
          <p className="text-xl max-w-2xl">Swipe through curated date ideas and find the perfect experience for you and your partner.</p>
        </div>
      </section>

      {/* Swipe View Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading date ideas...</p>
              </div>
            ) : (
              <TinderSwipeView
                dateIdeas={allDateIdeas}
                dateIdeaImages={allDateIdeaImages}
              />
            )}
          </div>
        </div>
      </section>
      
      {/* Introduction Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-rose-100 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-rose-600 mb-4">Why Date Nights Matter</h3>
              <p className="text-gray-700">Research shows that regular date nights strengthen relationships and create lasting memories.</p>
            </div>
            <div className="bg-purple-100 p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-purple-600 mb-4">How It Works</h3>
              <p className="text-gray-700">Swipe right to save ideas, left to skip. Let our AI learn your preferences for better suggestions.</p>
            </div>
          </div>
        </div>
      </section>
    
      {/* Benefits Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Why Use Our Generator?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-rose-500" />
              <h3 className="text-xl font-semibold mb-2">Perfect for Couples</h3>
              <p className="text-gray-600">Creative ideas for every relationship stage.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Brain className="h-16 w-16 mx-auto mb-4 text-purple-600" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600">Personalized suggestions based on your preferences.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Shuffle className="h-16 w-16 mx-auto mb-4 text-cyan-500" />
              <h3 className="text-xl font-semibold mb-2">Randomizer</h3>
              <p className="text-gray-600">Discover unexpected and delightful experiences.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <Tag className="h-16 w-16 mx-auto mb-4 text-emerald-500" />
              <h3 className="text-xl font-semibold mb-2">Free to Use</h3>
              <p className="text-gray-600">Plan your next date night without any cost.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">What Couples Are Saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <p className="text-gray-700">"This generator saved our date nights! We love the variety of ideas."</p>
              <p className="text-sm text-gray-500 mt-4">- Alex & Jamie</p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <p className="text-gray-700">"The AI suggestions are spot on. Highly recommend!"</p>
              <p className="text-sm text-gray-500 mt-4">- Taylor & Morgan</p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <p className="text-gray-700">"A must-have tool for couples looking to spice things up."</p>
              <p className="text-sm text-gray-500 mt-4">- Chris & Sam</p>
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
          src="/couplegokart.webp"
          alt="Couple on a Date"
          width={500}
          height={300}
          layout="responsive"
          objectFit="cover"
        />
          </div>

          {/* Text Content */}
          <div>
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Rediscover Romance with Every Swipe</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          In the hustle of daily life, it's easy to let romance take a back seat. Our Date Idea Generator is designed to reignite that spark, offering a curated selection of experiences tailored to couples at any stage. Whether you're celebrating a milestone or simply seeking a break from routine, we provide the inspiration you need to create unforgettable moments.
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          Imagine surprising your partner with a spontaneous picnic under the stars, a cozy movie night with gourmet snacks, or an adventurous weekend getaway. Our generator makes it easy to discover activities that align with your interests, budget, and time constraints. Say goodbye to endless scrolling and hello to quality time spent together.
        </p>
        <p className="text-gray-700 leading-relaxed">
          With our AI-powered recommendations, you can explore new hobbies, revisit cherished memories, and strengthen your bond with every date. Let us help you plan the perfect date night, so you can focus on what truly matters: connecting with the one you love. Start swiping and rediscover the joy of romance today!
        </p>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
