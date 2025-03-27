"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getLocationDateIdea } from "@/lib/sanity";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SaveButton from "@/app/components/SaveButton";
import { urlFor } from "@/lib/sanity";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface DateIdea {
  name: string;
  description: string;
  address?: string;
  price?: string;
  image?: any;
}

interface LocationDateIdeaData {
  _id: string;
  title: string;
  location: string;
  excerpt: string;
  mainImage: string;
  body: any[];
  dateIdeas: DateIdea[];
  keywords: string[];
  searchVolume: number;
}

export default function LocationPage() {
  const params = useParams();
  const [locationData, setLocationData] = useState<LocationDateIdeaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const locationSlug = Array.isArray(params.locationSlug) 
          ? params.locationSlug[0] 
          : params.locationSlug || '';
        console.log("Fetching data for location slug:", locationSlug);
        const data = await getLocationDateIdea(locationSlug);
        
        if (!data) {
          console.error("No data returned for location:", params.locationSlug);
          setError("Location not found");
        } else {
          console.log("Location data received:", data.title);
          setLocationData(data);
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
        setError("Failed to load location data");
      } finally {
        setLoading(false);
      }
    };

    if (params.locationSlug) {
      fetchLocationData();
    }
  }, [params.locationSlug]);

  // Function to render the rich text content
  const renderBody = (body: any[]) => {
    return body.map((block: any, index: number) => {
      if (block._type === 'block') {
        return <p key={index} className="mb-4">{block.children?.map((child: any) => child.text).join('')}</p>;
      } else if (block._type === 'image') {
        return (
          <div key={index} className="my-6">
            <img
              src={urlFor(block.asset._ref)}
              alt={block.alt || 'Date idea image'}
              className="rounded-lg w-full"
            />
            {block.caption && <p className="text-center text-sm text-gray-600 mt-2">{block.caption}</p>}
          </div>
        );
      }
      return null;
    });
  };

  // Handle title for SEO
  const pageTitle = locationData 
    ? `${locationData.title} | Date Ideas Near Me` 
    : 'Date Ideas Near Me';

  return (
    <>
      <Header />
      <main className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-12">
          {loading ? "Loading..." : locationData?.title || "Location Not Found"}
        </h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Error: {error}</h2>
            <p className="text-gray-600 mb-8">
              We couldn't find date ideas for this location. Please check the URL or explore other cities.
            </p>
            <Link href="/date-ideas-near-me">
              <Button>Explore Other Locations</Button>
            </Link>
          </div>
        ) : locationData ? (
          <>
            <h1 className="text-4xl font-bold text-center mb-4">
              {locationData.title}
            </h1>
            
            {locationData.keywords && (
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {locationData.keywords.map((keyword, index) => (
                  <span key={index} className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                    {keyword}
                  </span>
                ))}
              </div>
            )}
            
            <div className="max-w-4xl mx-auto mb-12">
              {locationData.mainImage && (
                <div className="mb-8 rounded-xl overflow-hidden">
                  <img
                    src={locationData.mainImage}
                    alt={locationData.title}
                    className="w-full h-auto max-h-[500px] object-cover"
                  />
                </div>
              )}
              
              <div className="prose lg:prose-xl max-w-none">
                <p className="text-xl leading-relaxed mb-8">{locationData.excerpt}</p>
                
                {locationData.body && renderBody(locationData.body)}
              </div>
            </div>
            
            <section className="my-16">
              <h2 className="text-3xl font-bold text-center mb-12">Top Date Ideas in {locationData.location}</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {locationData.dateIdeas && locationData.dateIdeas.map((idea, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {idea.image && (
                      <div className="h-48 bg-gray-200">
                        <img
                          src={urlFor(idea.image)}
                          alt={idea.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <h3 className="text-xl font-bold mb-2">{idea.name}</h3>
                        <SaveButton itemSlug={`${locationData._id}-${index}`} item={idea} onToggle={() => {}} />
                      </div>
                      
                      {idea.price && (
                        <div className="text-sm text-gray-600 mb-2">
                          Price Range: {idea.price}
                        </div>
                      )}
                      
                      {idea.address && (
                        <div className="text-sm text-gray-600 mb-3">
                          {idea.address}
                        </div>
                      )}
                      
                      <p className="text-gray-700 mb-4">{idea.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
            
            <div className="text-center mt-12">
              <h3 className="text-2xl font-semibold mb-4">Planning a Date in {locationData.location}?</h3>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Use our AI-powered date planner to create a personalized itinerary based on your preferences, 
                budget, and interests.
              </p>
              <Link href="/date-idea-generator">
                <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600">
                  Create Custom Date Plan
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold mb-4">Location Not Found</h2>
            <p className="text-gray-600 mb-8">
              We couldn't find date ideas for this location. Please check the URL or explore other cities.
            </p>
            <Link href="/date-ideas-near-me">
              <Button>Explore Other Locations</Button>
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}