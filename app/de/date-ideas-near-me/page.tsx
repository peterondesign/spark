"use client";

import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getLocationDateIdeas } from "@/lib/sanity";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface LocationDateIdea {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  location: string;
  locationSlug: {
    current: string;
  };
  excerpt: string;
  mainImage: string;
  keywords: string[];
  searchVolume: number;
}

// Hardcoded fallback data in case the Sanity API is unavailable
const fallbackLocations: LocationDateIdea[] = [
  {
    _id: 'london-fallback',
    title: 'Date Ideas in London',
    slug: { current: 'london' },
    location: 'London',
    locationSlug: { current: 'london' },
    excerpt: 'Discover the most romantic and fun date ideas in London, from classic outings to unique experiences.',
    mainImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    keywords: ['london date ideas', 'date ideas near me'],
    searchVolume: 18100
  }
];

export default function DateIdeasNearMe() {
  const [locationDateIdeas, setLocationDateIdeas] = useState<LocationDateIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    const fetchLocationDateIdeas = async () => {
      try {
        console.log("Fetching all location date ideas");
        const ideas = await getLocationDateIdeas();
        
        if (!ideas || ideas.length === 0) {
          console.log("No location date ideas found, using fallback data");
          setLocationDateIdeas(fallbackLocations);
          setUsedFallback(true);
        } else {
          console.log(`Found ${ideas.length} location date ideas`);
          setLocationDateIdeas(ideas);
        }
      } catch (error) {
        console.error("Error fetching location date ideas:", error);
        setError("Failed to fetch date idea locations");
        // Use fallback data when API fails
        setLocationDateIdeas(fallbackLocations);
        setUsedFallback(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocationDateIdeas();
  }, []);

  return (
    <>
      <Header />
      <main className="container mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold text-center mb-12">
          Date Ideas Near Me
        </h1>
        
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
            <h2 className="text-3xl font-bold mb-4">Find Local Date Ideas</h2>
            <p className="text-lg mb-6">
              Discover the best date spots and activities in your city or explore romantic options
              in places you plan to visit. Our curated lists feature a mix of classic and unique date ideas
              for every budget and preference.
            </p>
          </div>
        </div>
        
        {usedFallback && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-yellow-800">
              Note: We're currently experiencing issues connecting to our database. 
              We're showing you our most popular locations while we fix this.
            </p>
          </div>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
            ))}
          </div>
        ) : error && !usedFallback ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <h3 className="text-xl font-semibold mb-4">Error: {error}</h3>
            <p className="text-gray-600 mb-6">
              We encountered a problem loading date idea locations. Please try again later.
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locationDateIdeas.map((location) => (
              <Card key={location._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-gray-200">
                  {location.mainImage && (
                    <img
                      src={location.mainImage}
                      alt={location.title}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{location.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{location.excerpt}</p>
                  
                  {/* Make sure we always use locationSlug.current for the URL */}
                  <Link href={`/date-ideas-near-me/${location.locationSlug?.current || location.slug?.current}`}>
                    <Button className="w-full">Explore Date Ideas</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {!loading && !error && locationDateIdeas.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-4">No locations found</h3>
            <p className="text-gray-600 mb-6">
              We're currently expanding our database with date ideas from various cities.
              Check back soon for more exciting date spots!
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}