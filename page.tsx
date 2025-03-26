"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HeartIcon, MapPinIcon, StarIcon } from "./app/components/icons";
import SaveButton from "./app/components/SaveButton";
import { supabase } from "@/utils/supabaseClient";
import { getImageUrl } from "@/app/utils/imageService";
import Header from "@/app/components/Header";
import { Calendar } from "@/components/ui/calendar";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
// Renamed the imported type to avoid conflicts
import { favoritesService, DateIdea as FavoriteDateIdea } from "./app/services/favoritesService";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Experience {
  title: string;
  price: string;
  rating: string;
  reviewCount: string;
  imageUrl: string;
  link: string;
}

// Simplified DateIdea interface
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
  idealFor?: string[];
  relatedDateIdeas?: string[];
  longDescription?: string;
  images?: string[];
}

export default function DateIdeaDetails() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  // Change type to FavoriteDateIdea to match the imported type
  const [favorites, setFavorites] = useState<FavoriteDateIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loadingExperiences, setLoadingExperiences] = useState(false);
  const userCity = "New York"; // Example user city
  const dateIdea = { title: "Romantic Dinner", image: "/placeholder.jpg" }; // Example date idea

  // Load user's favorites on component mount
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      try {
        const userFavorites = await favoritesService.getRecentFavorites(5);
        setFavorites(userFavorites);
      } catch (error) {
        console.error("Failed to load favorites:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadFavorites();
  }, []);

  // Handle removing a favorite
  const handleRemoveFavorite = async (id: number) => {
    try {
      await favoritesService.removeFavorite(id);
      setFavorites(favorites.filter(favorite => favorite.id !== id));
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  useEffect(() => {
    const fetchExperiences = async () => {
      if (!userCity || !dateIdea?.title) return;
      
      setLoadingExperiences(true);
      try {
        // Use the direct scraping endpoint instead of a proxy
        const response = await fetch(`/api/scrape?url=${encodeURIComponent(`https://www.getyourguide.com/s/?q=${encodeURIComponent(dateIdea.title)}+${encodeURIComponent(userCity)}&searchSource=3`)}&method=selenium`);
        
        const data = await response.json();
        
        // Process the scraped data into the experiences format
        if (data && data.html) {
          // This would need more advanced parsing logic in a real app
          // For now, returning a simplified version
          const processedExperiences = processScrapedData(data);
          setExperiences(processedExperiences);
        } else {
          setExperiences([]);
        }
      } catch (error) {
        console.error('Error fetching experiences:', error);
        setExperiences([]);
      } finally {
        setLoadingExperiences(false);
      }
    };

    if (userCity && dateIdea) {
      fetchExperiences();
    }
  }, [userCity, dateIdea]);

  // Function to process scraped data into experiences format
  const processScrapedData = (scrapedData: any): Experience[] => {
    // This is a simplified implementation
    // In a real application, you would parse the HTML or content more thoroughly
    
    // For demonstration purposes, returning placeholder data based on the title
    if (scrapedData.title && scrapedData.title.includes("GetYourGuide")) {
      return [
        {
          title: `${dateIdea?.title} Experience in ${userCity}`,
          price: "From $49",
          rating: "4.8",
          reviewCount: "120",
          imageUrl: dateIdea?.image || "/placeholder.jpg",
          link: `https://www.getyourguide.com/s/?q=${encodeURIComponent(dateIdea?.title || "")}+${encodeURIComponent(userCity || "")}&searchSource=3`
        }
      ];
    }
    
    // Return empty array if no data could be parsed
    return [];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center space-x-1">
            <li>
              <Link href="/" className="text-gray-500 hover:text-rose-500">Home</Link>
            </li>
            <li>
              <span className="text-gray-500 mx-1">/</span>
            </li>
            <li className="text-rose-500">{dateIdea.title}</li>
          </ol>
        </nav>

        <div className="flex flex-col items-center p-8 w-full max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Your Date Planner</h1>
          
          {/* Calendar Section */}
          <div className="w-full border rounded-md shadow-sm mb-8">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
            />
          </div>
          
          {/* Selected Date Display */}
          {date && (
            <div className="w-full mb-8 p-4 border rounded-md bg-slate-50">
              <h2 className="text-lg font-medium">
                Selected date: {date?.toLocaleDateString('en-US', { 
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </h2>
            </div>
          )}
          
          {/* Favorites Section */}
          <div className="w-full mb-8">
            <h2 className="text-lg font-medium mb-4">Your Favorite Date Ideas</h2>
            
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
                <div className="h-16 bg-gray-100 animate-pulse rounded"></div>
              </div>
            ) : favorites.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="favorites">
                  <AccordionTrigger className="text-lg font-medium">
                    Recent Favorites ({favorites.length})
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 mt-2">
                      {favorites.map((favorite) => (
                        <Card key={favorite.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex items-center p-4">
                              {favorite.image && (
                                <div className="relative w-16 h-16 mr-4 rounded overflow-hidden">
                                  <Image
                                    src={favorite.image}
                                    alt={favorite.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <CardTitle className="text-base">{favorite.title}</CardTitle>
                                <CardDescription className="line-clamp-1">
                                  {favorite.description}
                                </CardDescription>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleRemoveFavorite(favorite.id)}
                              >
                                <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <p className="text-gray-500">You haven't saved any favorite date ideas yet.</p>
              </div>
            )}
          </div>

          {/* GetYourGuide Experiences Section */}
          {userCity && (
            <div className="w-full mb-8">
              <h2 className="text-lg font-medium mb-4">
                Local Experiences in {userCity}
              </h2>
              
              {loadingExperiences ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-lg p-4 h-32"></div>
                  ))}
                </div>
              ) : experiences.length > 0 ? (
                <div className="space-y-4">
                  {experiences.map((exp, index) => (
                    <a
                      key={index}
                      href={exp.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        {exp.imageUrl && (
                          <div className="relative w-24 h-24 flex-shrink-0">
                            <Image
                              src={exp.imageUrl}
                              alt={exp.title}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-2">{exp.title}</h3>
                          <div className="flex items-center gap-4">
                            <span className="text-green-600 font-semibold">{exp.price}</span>
                            {exp.rating && (
                              <div className="flex items-center">
                                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                                <span className="text-gray-600">{exp.rating}</span>
                                <span className="text-gray-400 text-sm ml-1">({exp.reviewCount})</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No experiences found for this date idea in {userCity}</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}