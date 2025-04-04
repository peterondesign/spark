"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { getImageUrl } from "../utils/imageService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import SpinWheel from "../components/SpinWheel";
import Link from "next/link";

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
}

// Loading skeleton for SpinWheel
const SpinWheelSkeleton = () => (
  <div className="flex flex-col md:flex-row w-full justify-between items-center md:items-start gap-8">
    {/* Left column skeleton (wheel) */}
    <div className="w-full md:w-1/2 flex flex-col items-center">
      <div className="relative w-[300px] h-[300px] md:w-[350px] md:h-[350px] mb-8 animate-pulse">
        <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
      </div>
      <div className="w-40 h-12 bg-gray-200 rounded-full animate-pulse"></div>
    </div>
    
    {/* Right column skeleton (result card) */}
    <div className="w-full md:w-1/2 flex justify-center">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        <div className="h-48 bg-gray-200 animate-pulse"></div>
        <div className="p-6">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6 animate-pulse"></div>
          <div className="flex justify-between">
            <div className="h-10 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function SpinTheWheelPage() {
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
  const [allDateIdeaImages, setAllDateIdeaImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDateIdeas = async () => {
      try {
        const { data, error } = await supabase
          .from('date_ideas')
          .select('*')
          .limit(12); // Limiting to 12 items for the wheel
          
        if (error) {
          console.error("Supabase Error:", error);
          throw error;
        }
        
        // Shuffle the date ideas to make it more interesting
        const shuffledData = data ? [...data].sort(() => Math.random() - 0.5) : [];
        setDateIdeas(shuffledData);
        
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
      <PageTitle title="Spin the Wheel | Date Idea Randomizer" />
      
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-cover bg-center h-[350px]" style={{ backgroundImage: 'url(/placeholder.jpg)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/80 to-purple-600/80"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Spin the Wheel - Date Idea Randomizer</h1>
          <p className="text-xl max-w-2xl">Can't decide what to do? Let fate choose your next date adventure!</p>
        </div>
      </section>
      
      {/* Spin Wheel Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="max-w-6xl mx-auto">
              <SpinWheelSkeleton />
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              <SpinWheel dateIdeas={dateIdeas} dateIdeaImages={allDateIdeaImages} />
            </div>
          )}
        </div>
      </section>

         {/* Other Tools Section */}
         <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Try Our Other Date Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/date-idea-generator" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2 text-blue-600">Date Idea Generator</h3>
              <p className="text-gray-600">Swipe through curated date ideas to find your perfect match.</p>
            </Link>
            <Link href="/alphabet-dating" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2 text-purple-600">Alphabet Dating</h3>
              <p className="text-gray-600">Work through the alphabet with themed date ideas for each letter.</p>
            </Link>
            <Link href="/date-ideas-near-me" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2 text-pink-600">Date Ideas Near Me</h3>
              <p className="text-gray-600">Discover date ideas based on your location.</p>
            </Link>
          </div>
        </div>
      </section>
      
      
      {/* How It Works Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-100 p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Spin the Wheel</h3>
              <p className="text-gray-700">Click the spin button and watch the wheel decide your fate.</p>
            </div>
            <div className="bg-purple-100 p-6 rounded-lg shadow-md text-center">
              <div className="bg-purple-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Get Your Result</h3>
              <p className="text-gray-700">The wheel will stop on a random date idea just for you.</p>
            </div>
            <div className="bg-pink-100 p-6 rounded-lg shadow-md text-center">
              <div className="bg-pink-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Go On Your Date</h3>
              <p className="text-gray-700">Follow through with the chosen date idea for an exciting adventure!</p>
            </div>
          </div>
        </div>
      </section>
      
   
      <Footer />
    </div>
  );
}