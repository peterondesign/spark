"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import SaveButton from "../../components/SaveButton";
import { supabase } from "@/utils/supabaseClient";
import { getImageUrl, getPlaceholderImage, processDateIdeaImages } from "@/app/utils/imageService";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import WebBrowsingIntegration from "../../components/WebBrowsingIntegration";
import FastAIActivityGrid from "../../components/FastAIActivityGrid";
import UltraFastAIGrid from "../../components/UltraFastAIGrid";
import LightspeedAIGrid from "../../components/LightspeedAIGrid";

// Define DateIdea interface
interface DateIdea {
  id: string;
  title: string;
  category: string;
  location?: string;
  description?: string;
  price?: string;
  duration?: string;
  slug: string;
  image: string;
  priceLevel?: number;
  bestForStage?: string;
  tips?: string;
  mood?: string | { pace?: string; vibe?: string };
  timeOfDay?: string;
  idealFor?: string;
  relatedDateIdeas?: string[];
  longDescription?: string;
  images?: string[];
}

export default function DateIdeaDetails() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || '';
  const [dateIdea, setDateIdea] = useState<DateIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [otherDateIdeas, setOtherDateIdeas] = useState<DateIdea[]>([]);
  const [dateIdeaImages, setDateIdeaImages] = useState<Record<string, string>>({});

  // Fetch date idea data
  useEffect(() => {
    const fetchDateIdea = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('date_ideas')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error || !data) {
          console.error("Error fetching date idea:", error);
          setLoading(false);
          return;
        }

        const dateIdeaData: DateIdea = {
          id: data.id,
          title: data.title,
          category: data.category,
          location: data.location,
          description: data.description,
          price: data.price,
          duration: data.duration,
          slug: data.slug,
          image: data.image,
          priceLevel: data.price_level || undefined,
          bestForStage: data.best_for_stage || undefined,
          tips: data.tips || undefined,
          timeOfDay: data.time_of_day || undefined,
          idealFor: data.ideal_for || undefined,
          relatedDateIdeas: data.related_date_ideas || undefined,
          longDescription: data.long_description || undefined,
          images: data.images || [],
        };

        setDateIdea(dateIdeaData);

        // Process images
        const allImages = [data.image];
        if (data.images && Array.isArray(data.images) && data.images.length > 0) {
          allImages.push(...data.images);
        }

        const processedImages = await Promise.all(
          allImages.map(async (img) => {
            return await getImageUrl(img, `${data.title} ${data.category}`, 800, 600);
          })
        );

        setImageUrls(processedImages.filter(Boolean));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching date idea:', error);
        setLoading(false);
      }
    };

    if (slug) {
      fetchDateIdea();
    }
  }, [slug]);

  // Fetch other date ideas
  useEffect(() => {
    const fetchOtherDateIdeas = async () => {
      try {
        const { data, error } = await supabase
          .from('date_ideas')
          .select('*')
          .neq('slug', slug)
          .limit(8);

        if (error) {
          console.error("Error fetching other date ideas:", error);
          return;
        }

        if (data) {
          const otherIdeas: DateIdea[] = data.map(item => ({
            id: item.id,
            title: item.title,
            category: item.category,
            description: item.description,
            slug: item.slug,
            image: item.image
          }));

          setOtherDateIdeas(otherIdeas);

          // Process images for other date ideas
          const imageMap = await processDateIdeaImages(otherIdeas, 400, 300);
          setDateIdeaImages(imageMap);
        }
      } catch (error) {
        console.error('Error fetching other date ideas:', error);
      }
    };

    if (dateIdea) {
      fetchOtherDateIdeas();
    }
  }, [dateIdea, slug]);

  // Get user city from localStorage
  useEffect(() => {
    const savedCity = localStorage.getItem("userCity");
    setUserCity(savedCity);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/2 mx-auto mb-12"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Not found state
  if (!dateIdea) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Date Idea Not Found</h1>
          <p className="text-muted-foreground mb-8">Sorry, we couldn't find the date idea you're looking for.</p>
          <Link
            href="/"
            className="px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
          >
            Browse Date Ideas
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Title Section with City Dropdown */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {dateIdea.title} in
            </h1>
            <div className="relative">
              <button className="flex items-center gap-1 text-3xl md:text-4xl font-bold text-foreground hover:text-rose-500 transition-colors">
                {userCity || 'Your City'}
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Lightspeed AI-Powered Live Activity Grid - Instant + Sub-100ms Real Data */}
        <LightspeedAIGrid
          activity={dateIdea.category || dateIdea.title}
          city={userCity || 'your city'}
          dateIdeaTitle={dateIdea.title}
        />

        {/* About This Date Idea Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8 uppercase tracking-wider">
            About This Date Idea
          </h2>
          
          <div className="bg-card rounded-lg p-8 shadow-sm border border-border">
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {dateIdea.description}
              </p>

              {dateIdea.longDescription && (
                <div 
                  className="prose max-w-none prose-neutral dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: dateIdea.longDescription }} 
                />
              )}

              {/* Date Idea Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                {dateIdea.duration && (
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Duration</h3>
                    <p className="text-muted-foreground">{dateIdea.duration}</p>
                  </div>
                )}
                
                {dateIdea.timeOfDay && (
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Best Time</h3>
                    <p className="text-muted-foreground">{dateIdea.timeOfDay}</p>
                  </div>
                )}
                
                {dateIdea.idealFor && (
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-2">Ideal For</h3>
                    <p className="text-muted-foreground">{dateIdea.idealFor}</p>
                  </div>
                )}
              </div>

              {/* Tips Section */}
              {dateIdea.tips && (
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Insider Tips
                  </h3>
                  <p className="text-blue-700 dark:text-blue-200">{dateIdea.tips}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Live Events Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8 uppercase tracking-wider">
            Live Events Related to This Date Idea
          </h2>
          
          <WebBrowsingIntegration 
            activity={dateIdea.category || dateIdea.title}
            city={userCity || 'your city'}
          />
        </section>

        {/* Explore Other Date Ideas Section */}
        <section>
          <h2 className="text-2xl font-bold text-foreground text-center mb-8 uppercase tracking-wider">
            Explore Other Date Ideas
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherDateIdeas.map((idea) => (
              <Link
                key={idea.id}
                href={`/date-idea/${idea.slug}`}
                className="group bg-card rounded-lg shadow-sm overflow-hidden border border-border hover:shadow-md transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={dateIdeaImages[idea.slug] || getPlaceholderImage(400, 300, idea.title)}
                    alt={idea.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground group-hover:text-rose-500 transition-colors mb-2">
                    {idea.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {idea.description}
                  </p>
                  {idea.category && (
                    <span className="inline-block mt-3 px-2 py-1 text-xs font-medium rounded bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                      {idea.category}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link
              href="/"
              className="inline-flex items-center px-8 py-3 border-2 border-rose-500 text-rose-500 hover:bg-rose-50 dark:border-rose-400 dark:text-rose-400 dark:hover:bg-rose-900/20 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Browse More Date Ideas
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}