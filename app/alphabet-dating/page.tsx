"use client";
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { getImageUrl } from "../utils/imageService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import AlphabetDating from "../components/AlphabetDating";
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

interface AlphabetDatingIdeas {
  [key: string]: DateIdea[];
}

export default function AlphabetDatingPage() {
  const [alphabetDateIdeas, setAlphabetDateIdeas] = useState<AlphabetDatingIdeas>({});
  const [dateIdeaImages, setDateIdeaImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDateIdeas = async () => {
      try {
        // Fetch all date ideas
        const { data, error } = await supabase
          .from('date_ideas')
          .select('*');
          
        if (error) {
          console.error("Supabase Error:", error);
          throw error;
        }

        if (data) {
          // Add our nature date examples to ensure they're included
          const natureScavengerHunt = {
            id: 30001, // Using a high ID to avoid conflicts
            title: "Nature Scavenger Hunt",
            category: "Outdoor",
            rating: 5,
            location: "Park",
            description: "Search for items in nature on a guided hunt.",
            price: "Free",
            duration: "2 hours",
            slug: "nature-scavenger-hunt",
            image: "/bikeriding.webp"
          };

          const naturePhotography = {
            id: 30002, // Using a high ID to avoid conflicts
            title: "Nature Photography Workshop",
            category: "Outdoor",
            rating: 5,
            location: "Park",
            description: "Learn to take stunning nature photos.",
            price: "$30",
            duration: "3 hours",
            slug: "nature-photography-workshop",
            image: "/romanticpaint.jpg"
          };

          // Make sure these show up under N for Nature
          const enhancedData = [...data];
          const hasScavengerHunt = enhancedData.some(idea => idea.slug === "nature-scavenger-hunt");
          const hasPhotography = enhancedData.some(idea => idea.slug === "nature-photography-workshop");

          if (!hasScavengerHunt) {
            enhancedData.push(natureScavengerHunt);
          }
          
          if (!hasPhotography) {
            enhancedData.push(naturePhotography);
          }

          // Organize date ideas by first letter of title
          const alphabetized: AlphabetDatingIdeas = {};
          const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

          // Initialize each letter with an empty array
          alphabet.split('').forEach(letter => {
            alphabetized[letter] = [];
          });

          // Sort date ideas by first letter of title
          enhancedData.forEach((idea: DateIdea) => {
            const firstLetter = idea.title.charAt(0).toUpperCase();
            if (alphabet.includes(firstLetter)) {
              // Add the idea to the corresponding letter's array
              alphabetized[firstLetter].push(idea);
            }
          });

          // For any letters without date ideas, fill with a "Coming Soon" placeholder
          alphabet.split('').forEach(letter => {
            if (alphabetized[letter].length === 0) {
              alphabetized[letter].push({
                id: -1,
                title: `${letter} Date Coming Soon`,
                category: "Placeholder",
                rating: 0,
                location: "",
                description: "We're working on more exciting date ideas for this letter!",
                price: "Varies",
                duration: "Varies",
                slug: `placeholder-${letter.toLowerCase()}`,
                image: "/placeholder.jpg"
              });
            }
            // Instead of slicing to keep only one, we'll now keep all date ideas for each letter
            // But let's randomize them for variety
            else {
              alphabetized[letter] = alphabetized[letter].sort(() => 0.5 - Math.random());
            }
          });

          setAlphabetDateIdeas(alphabetized);

          // Load images for all date ideas
          const allIdeas = Object.values(alphabetized).flat();
          const imagesPromises = allIdeas.map(async (idea) => ({
            [idea.slug]: await getImageUrl(idea.image, `${idea.title} ${idea.category}`, 400, 300),
          }));
          
          const imagesResolved = Object.assign({}, ...(await Promise.all(imagesPromises)));
          setDateIdeaImages(imagesResolved);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching date ideas:', error);
        setLoading(false);
      }
    };

    fetchDateIdeas();
  }, []);

  const clearLetterSelection = (letter: string) => {
    setAlphabetDateIdeas((prevIdeas) => {
      const updatedIdeas = { ...prevIdeas };
      delete updatedIdeas[letter];
      return updatedIdeas;
    });

    // Update localStorage
    const savedSelectedDateIdeas = JSON.parse(localStorage.getItem('alphabetDatingSelected') || '{}');
    delete savedSelectedDateIdeas[letter];
    localStorage.setItem('alphabetDatingSelected', JSON.stringify(savedSelectedDateIdeas));
  };

  return (
    <div className="min-h-screen bg-white">
      <PageTitle title="Alphabet Dating | A to Z Date Ideas" />
      
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-cover bg-center h-[320px]" style={{ backgroundImage: 'url(/placeholder.jpg)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/80 to-amber-600/80"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Alphabet Dating Challenge</h1>
          <p className="text-xl max-w-2xl">Work through the alphabet with 26 unique date ideas, one for each letter!</p>
        </div>
      </section>

      {/* Alphabet Dating Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading alphabet date ideas...</p>
              </div>
            ) : (
              <AlphabetDating 
                dateIdeas={alphabetDateIdeas} 
                dateIdeaImages={dateIdeaImages} 
                onClearLetter={clearLetterSelection} 
              />
            )}
          </div>
        </div>
      </section>

       {/* Other Tools Section */}
       <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Try Our Other Date Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/date-idea-generator" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2 text-blue-600">Date Idea Generator</h3>
              <p className="text-gray-600">Get personalized date ideas based on your preferences.</p>
            </Link>
            <Link href="/spin-the-wheel" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2 text-purple-600">Spin the Wheel</h3>
              <p className="text-gray-600">Let fate choose your next date adventure with our random wheel.</p>
            </Link>
            <Link href="/date-ideas-near-me" className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2 text-pink-600">Date Ideas Near Me</h3>
              <p className="text-gray-600">Discover date ideas based on your location.</p>
            </Link>
          </div>
        </div>
      </section>
  
      
      {/* How It Works Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">How Alphabet Dating Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-rose-100 p-6 rounded-lg shadow-md text-center">
              <div className="bg-rose-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Scratch to Reveal</h3>
              <p className="text-gray-700">Click on a letter card to reveal date ideas starting with that letter.</p>
            </div>
            <div className="bg-amber-100 p-6 rounded-lg shadow-md text-center">
              <div className="bg-amber-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Choose Your Favorite</h3>
              <p className="text-gray-700">Browse multiple options and select the date idea that excites you most.</p>
            </div>
            <div className="bg-orange-100 p-6 rounded-lg shadow-md text-center">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Complete the Challenge</h3>
              <p className="text-gray-700">Work through all 26 letters for an entire year of unique dates!</p>
            </div>
          </div>
        </div>
      </section>

     
      
      <Footer />
    </div>
  );
}