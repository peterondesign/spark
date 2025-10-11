"use client";

import { useState, useEffect } from "react";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from "../../utils/supabaseClient";
import { getImageUrl } from "../utils/imageService";
import TinderSwipeView from "../components/TinderSwipeView";

// Import sections
import Header from '../components/sections/Header';
import Footer from '../components/sections/Footer';

// Import theme provider  
import { ThemeProvider } from '@/components/theme-provider';
import { useTheme } from 'next-themes';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

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

export default function DateIdeaGenerator() {
  const { theme } = useTheme();
  const [allDateIdeas, setAllDateIdeas] = useState<DateIdea[]>([]);
  const [allDateIdeaImages, setAllDateIdeaImages] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up smooth scrolling
    gsap.config({
      force3D: true,
    });

    // Refresh ScrollTrigger on load
    ScrollTrigger.refresh();

    // Clean up on unmount
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  useEffect(() => {
    const fetchDateIdeas = async () => {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('date_ideas')
          .select('*');

        if (error) {
          console.error('Error fetching date ideas:', error);
          setLoading(false);
          return;
        }

        const randomizedIdeas = data ? [...data].sort(() => Math.random() - 0.5) : [];
        setAllDateIdeas(randomizedIdeas);

        // Fetch images for the date ideas
        if (randomizedIdeas && randomizedIdeas.length > 0) {
          const imagePromises = randomizedIdeas.map(async (idea) => {
            const imageUrl = await getImageUrl(
              idea.image,
              `${idea.title} ${idea.category} date idea`,
              400,
              300
            );
            return { [idea.slug]: imageUrl };
          });

          const imageResults = await Promise.all(imagePromises);
          const imageMap = Object.assign({}, ...imageResults);
          setAllDateIdeaImages(imageMap);
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
    <main className={`overflow-x-hidden min-h-screen ${theme === 'light' ? 'bg-white' : 'bg-[#212121]'}`}>
      <Header />
      
      {/* Main Swipe Section */}
      <section className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Date Idea Generator
            </h1>
            <p className="text-xl text-muted-foreground">
              Swipe through curated date ideas and find the perfect experience for you and your partner
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading date ideas...</p>
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
      
      <Footer />
    </main>
  );
};
