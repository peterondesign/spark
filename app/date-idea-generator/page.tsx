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
      
      {/* Introduction Section with rich content */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose max-w-none">
            <h2 className="text-3xl font-bold text-center mb-6">Discover Your Perfect Date with Our Smart Date Idea Randomizer</h2>
            
            <p className="text-gray-700 mb-6">
              Welcome to our innovative Date Idea Generator - the ultimate solution for couples looking to break free from routine and 
              discover exciting new ways to connect. Whether you're in a new relationship or have been together for decades, keeping your 
              date nights fresh and engaging is essential for maintaining a strong, vibrant connection with your partner.
            </p>
            
            <p className="text-gray-700 mb-6">
              Our date night randomizer uses advanced algorithms to suggest diverse experiences tailored to different relationship stages, 
              interests, and preferences. By analyzing thousands of successful date ideas and relationship research, we've created a tool 
              that delivers not just random suggestions, but thoughtfully curated experiences designed to strengthen your bond.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
              <div className="bg-rose-50 p-5 rounded-lg">
                <h3 className="font-medium text-rose-800 mb-3">The Science Behind Date Nights</h3>
                <p className="text-gray-700 mb-4">
                  Research from The National Marriage Project found that couples who dedicated time for regular date nights were 3.5 times 
                  more likely to report being "very happy" in their relationships compared to those who didn't prioritize couple time.
                </p>
                <p className="text-gray-700">
                  Additional studies show that sharing new experiences together activates your brain's reward system similarly to early 
                  relationship stages, recreating those feelings of excitement and connection that may diminish over time.
                </p>
              </div>
              
              <div className="bg-purple-50 p-5 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-3">How to Make the Most of Our Generator</h3>
                <ul className="list-disc pl-5 text-gray-700 space-y-2">
                  <li>Approach each suggestion with an open mind - sometimes the most unexpected dates create the best memories</li>
                  <li>Use the swipe feature to train the AI on your preferences for better future suggestions</li>
                  <li>Save your favorite ideas to revisit later by swiping right</li>
                  <li>Take turns with your partner selecting from the generated ideas</li>
                  <li>Challenge yourselves to try at least one completely new date experience each month</li>
                </ul>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              The key to a thriving relationship isn't found in grand gestures or expensive outings, but in the consistent, quality time 
              couples spend together. Our date generator aims to make this easier by removing the mental burden of constantly coming up with 
              new ideas, allowing you to focus on what truly matters - connecting with your partner and creating lasting memories together.
            </p>
            
            <p className="text-gray-700 mb-6">
              Try our date randomizer now by swiping through the suggestions below. Each swipe helps our system learn your preferences, 
              making future date suggestions even more tailored to your unique relationship. Your next favorite date night experience 
              could be just a swipe away!
            </p>
          </div>
        </div>
      </section>
    
      
      {/* Additional SEO Content and Benefits */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">Why Use Our Random Date Idea Generator?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h3 className="text-xl font-semibold mb-3">Perfect for Couples</h3>
              <p className="text-gray-700">Our couple date generator helps you break out of your routine with creative date night ideas that match your interests and relationship stage. From first dates to longtime partners, we have suggestions for every relationship milestone.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h3 className="text-xl font-semibold mb-3">AI-Powered Suggestions</h3>
              <p className="text-gray-700">Unlike other date night generators, our AI date generator learns from your preferences to provide increasingly personalized date ideas. The more you use it, the better it understands what kinds of experiences you and your partner enjoy together.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h3 className="text-xl font-semibold mb-3">Date Night Randomizer</h3>
              <p className="text-gray-700">Can't decide what to do? Let our date night randomizer surprise you with unexpected but delightful date experiences. Introducing novelty into your relationship has been proven by relationship experts to strengthen bonds and increase relationship satisfaction.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h3 className="text-xl font-semibold mb-3">Free and Easy to Use</h3>
              <p className="text-gray-700">Our random date generator for couples is completely free and designed to make planning your next date night simple and fun. No more decision fatigue or falling back on the same old routines - just fresh ideas at your fingertips whenever you need inspiration.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials/Use Cases Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-8">How Couples Use Our Date Idea Generator</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-800 mb-2">Weekly Date Planning</h3>
              <p className="text-gray-600 text-sm">Many couples use our generator every weekend to discover new activities and maintain a regular date night tradition, helping them prioritize quality time together.</p>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-800 mb-2">Special Occasion Planning</h3>
              <p className="text-gray-600 text-sm">For anniversaries, birthdays, and special celebrations, our generator provides unique ideas that go beyond the standard dinner-and-a-movie to create truly memorable experiences.</p>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-800 mb-2">Relationship Refreshers</h3>
              <p className="text-gray-600 text-sm">When couples feel stuck in a routine, our randomizer helps them discover new shared interests and activities that reignite the spark in their relationship.</p>
            </div>
          </div>
          
          <p className="text-center text-gray-700 max-w-2xl mx-auto">
            Ready to transform your date nights? Start swiping above to discover date ideas perfectly suited to your relationship, 
            or visit our <Link href="/" className="text-rose-600 hover:text-rose-700 font-medium">date ideas collection</Link> for even more inspiration. 
            Don't forget to save your favorites and add them to your <Link href="/calendar" className="text-rose-600 hover:text-rose-700 font-medium">date calendar</Link> for future planning!
          </p>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
