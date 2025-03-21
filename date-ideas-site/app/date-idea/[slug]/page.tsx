"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HeartIcon, MapPinIcon, StarIcon } from "../../components/icons";
import SaveButton from "../../components/SaveButton";
import { getImageUrl, updateDateIdeaImages } from "../../utils/imageService";

// Sample data - In a real app, this would be fetched from an API
const dateIdeasData = {
  "sunset-kayaking": {
    title: "Sunset Kayaking Tour",
    category: "Adventure",
    rating: 4.9,
    reviewCount: 128,
    location: "Multiple locations",
    description: "Experience the magic of sunset from the water with this guided kayaking tour for couples. Paddle together through calm waters as the sky transforms with vibrant colors, creating a romantic and peaceful atmosphere. Perfect for both beginners and experienced kayakers, this tour provides all necessary equipment and safety instructions before embarking on this memorable water adventure.",
    longDescription: `
      <p>This magical evening experience begins approximately 1 hour before sunset, allowing you to get comfortable with your kayak before the main event. Your experienced guide will provide a brief orientation and safety instructions before you and your partner set off on the water.</p>
      <p>As you paddle through calm waters, watch as the sky transforms with spectacular colors reflected on the water's surface. The peaceful atmosphere and shared experience create the perfect opportunity for connection and conversation.</p>
      <p>Along the way, your guide will point out local wildlife and share interesting facts about the ecosystem. Many couples spot herons, eagles, and sometimes even dolphins or seals, depending on the location.</p>
      <p>The tour concludes shortly after sunset, giving you the chance to paddle under the early evening sky. Upon return, enjoy complimentary hot chocolate or wine (depending on the location) to complete your romantic evening on the water.</p>
    `,
    price: "From $49 per person",
    priceLevel: "$$",
    duration: "2 hours",
    difficultyLevel: "Moderate",
    bestTimeToVisit: "Summer and early fall",
    reservationRequired: true,
    bestForStage: "Any relationship stage",
    amenities: ["Equipment provided", "Professional guide", "Photo opportunities", "Refreshments"],
    tips: [
      "Wear clothes that can get wet",
      "Bring a waterproof case for your phone",
      "Apply sunscreen even for sunset tours",
      "Arrive 15 minutes early for orientation"
    ],
    idealFor: ["Adventure lovers", "Nature enthusiasts", "Active couples"],
    slug: "sunset-kayaking",
    images: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800&text=Kayaking+2",
      "/placeholder.svg?height=600&width=800&text=Kayaking+3"
    ],
    mapLocation: "https://maps.google.com/?q=Kayak+Rental",
    contactInfo: {
      website: "https://example.com/sunset-kayaking",
      phone: "555-123-4567",
      email: "info@sunsetkayaking.example.com"
    },
    relatedDateIdeas: ["couples-cooking", "wine-tasting", "rooftop-movie"]
  },
  "couples-cooking": {
    title: "Couples Cooking Class",
    category: "Food & Drink",
    rating: 4.8,
    reviewCount: 94,
    location: "Downtown",
    description: "Learn to cook a gourmet meal together with expert chefs in this hands-on cooking class.",
    longDescription: `
      <p>Discover the joy of cooking together in this intimate hands-on class designed specifically for couples. Led by experienced chefs, you'll work as a team to create a delicious multi-course meal from scratch.</p>
      <p>The class begins with a welcome drink and introduction to the menu. Your chef will demonstrate key techniques before guiding you through each step of preparing your gourmet meal. Learn professional cooking tips, knife skills, and plating techniques that you can use at home.</p>
      <p>After cooking, sit down to enjoy the fruits of your labor in a romantic setting, complete with wine pairings selected to complement each course. This is more than just a cooking class—it's a shared experience that creates lasting memories.</p>
      <p>At the end of the class, you'll receive recipe cards to recreate your meal at home, continuing the experience long after the date ends.</p>
    `,
    price: "From $75 per person",
    priceLevel: "$$$",
    duration: "3 hours",
    difficultyLevel: "Easy to Moderate",
    bestTimeToVisit: "Year-round, evening classes available",
    reservationRequired: true,
    bestForStage: "Any relationship stage, especially early dating",
    amenities: ["Ingredients provided", "Complimentary wine", "Take-home recipes", "Professional instruction"],
    tips: [
      "Wear comfortable shoes and clothes you don't mind getting messy",
      "Let them know about dietary restrictions in advance",
      "Arrive hungry - you'll be eating what you cook!",
      "Book at least 1 week in advance for popular classes"
    ],
    idealFor: ["Foodies", "Home cooks", "People who enjoy hands-on activities"],
    slug: "couples-cooking",
    images: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800&text=Cooking+2",
      "/placeholder.svg?height=600&width=800&text=Cooking+3"
    ],
    mapLocation: "https://maps.google.com/?q=Cooking+School+Downtown",
    contactInfo: {
      website: "https://example.com/cooking-class",
      phone: "555-789-1234",
      email: "classes@cookingschool.example.com"
    },
    relatedDateIdeas: ["wine-tasting", "sunset-kayaking", "rooftop-movie"]
  },
  "rooftop-movie": {
    title: "Rooftop Movie Night",
    category: "Entertainment",
    rating: 4.7,
    reviewCount: 112,
    location: "City Center",
    description: "Enjoy classic romantic films under the stars with comfortable seating and gourmet snacks.",
    longDescription: `
      <p>Experience cinema like never before with this elevated outdoor movie screening on one of the city's most scenic rooftops. Snuggle up under the stars as you enjoy carefully curated films on a giant screen with state-of-the-art sound systems.</p>
      <p>Arrive early to secure the best spots and enjoy pre-show entertainment and spectacular city views. Each couple gets a comfortable double lounger or love seat with blankets and pillows to ensure maximum comfort throughout the screening.</p>
      <p>Your ticket includes a gourmet snack box with artisanal popcorn, charcuterie selections, chocolate-covered treats, and other movie snacks elevated to a whole new level. A full bar service is available throughout the evening, featuring themed cocktails inspired by the night's feature film.</p>
      <p>The venue is equipped with heaters for cooler evenings, and the intimate setting creates a magical atmosphere that transforms movie-watching into a premium romantic experience.</p>
    `,
    price: "From $35 per person",
    priceLevel: "$$",
    duration: "3 hours",
    difficultyLevel: "Easy",
    bestTimeToVisit: "Summer and early fall",
    reservationRequired: true,
    bestForStage: "Any relationship stage",
    amenities: ["Comfortable seating", "Blankets provided", "Gourmet snacks", "Full bar service"],
    tips: [
      "Arrive at least 30 minutes early for the best seating",
      "Bring an extra layer as it can get cool after sunset",
      "Check the movie schedule in advance - they rotate classics and new releases",
      "Consider the Premium Ticket for reserved front-row loungers"
    ],
    idealFor: ["Movie buffs", "Romantic souls", "Night owls"],
    slug: "rooftop-movie",
    images: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800&text=Movie+2",
      "/placeholder.svg?height=600&width=800&text=Movie+3"
    ],
    mapLocation: "https://maps.google.com/?q=Rooftop+Cinema",
    contactInfo: {
      website: "https://example.com/rooftop-cinema",
      phone: "555-456-7890",
      email: "tickets@rooftopcinema.example.com"
    },
    relatedDateIdeas: ["couples-cooking", "wine-tasting", "sunset-kayaking"]
  },
  "wine-tasting": {
    title: "Wine Tasting Tour",
    category: "Food & Drink",
    rating: 4.9,
    reviewCount: 156,
    location: "Wine Country",
    description: "Sample premium wines at three boutique wineries with transportation included.",
    longDescription: `
      <p>Embark on a sophisticated journey through wine country with this expertly guided tour visiting three distinctive boutique wineries. Your experience includes comfortable transportation, allowing both of you to fully enjoy the wine tastings without worrying about driving.</p>
      <p>At each winery, you'll be guided through a tasting of 4-6 premium wines by knowledgeable sommeliers who will explain the unique characteristics of each varietal and the winemaking process. Learn about proper tasting techniques, food pairings, and what makes each vineyard special.</p>
      <p>Between tastings, enjoy the spectacular vineyard views and take a behind-the-scenes tour of at least one production facility to see how grapes are transformed into fine wine. Your tour includes a gourmet picnic lunch served in a scenic vineyard setting.</p>
      <p>This tour offers the perfect balance of education and enjoyment, creating opportunities for meaningful conversation and shared discovery in a romantic setting.</p>
    `,
    price: "From $89 per person",
    priceLevel: "$$$",
    duration: "5 hours",
    difficultyLevel: "Easy",
    bestTimeToVisit: "Spring through fall, especially harvest season",
    reservationRequired: true,
    bestForStage: "Any relationship stage, especially anniversaries",
    amenities: ["Transportation included", "Tasting fees covered", "Light food pairings", "Gourmet picnic lunch"],
    tips: [
      "Eat a substantial breakfast before the tour",
      "Stay hydrated between tastings",
      "Don't wear perfume or cologne that can interfere with tasting",
      "Many wineries offer shipping if you find bottles you love"
    ],
    idealFor: ["Wine enthusiasts", "Foodies", "Couples seeking relaxation"],
    slug: "wine-tasting",
    images: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=600&width=800&text=Wine+2",
      "/placeholder.svg?height=600&width=800&text=Wine+3"
    ],
    mapLocation: "https://maps.google.com/?q=Wine+Country+Tours",
    contactInfo: {
      website: "https://example.com/wine-tours",
      phone: "555-987-6543",
      email: "reservations@winetours.example.com"
    },
    relatedDateIdeas: ["couples-cooking", "sunset-kayaking", "rooftop-movie"]
  }
};

export default function DateIdeaDetails() {
  const params = useParams();
  const slug = params.slug as string;
  const [dateIdea, setDateIdea] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedIdeas, setRelatedIdeas] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchDateIdea = async () => {
      setLoading(true);
      setTimeout(async () => {
        const idea = dateIdeasData[slug as keyof typeof dateIdeasData];
        
        // Update the date idea with better images
        const updatedIdea = await updateDateIdeaImages(idea);
        setDateIdea(updatedIdea);
        
        // Get related ideas and update their images too
        if (updatedIdea && updatedIdea.relatedDateIdeas) {
          const related = await Promise.all(updatedIdea.relatedDateIdeas
            .map(async (relatedSlug: string) => {
              const relatedIdea = dateIdeasData[relatedSlug as keyof typeof dateIdeasData];
              return await updateDateIdeaImages(relatedIdea);
            })
            .filter(Boolean));
          setRelatedIdeas(related);
        }
        
        setLoading(false);
      }, 300);
    };

    if (slug) {
      fetchDateIdea();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!dateIdea) {
    return (
      <div className="min-h-screen bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Date Idea Not Found</h1>
          <p className="text-gray-600 mb-8">Sorry, we couldn't find the date idea you're looking for.</p>
          <Link 
            href="/" 
            className="px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
          >
            Browse Date Ideas
          </Link>
        </div>
      </div>
    );
  }

  const renderPriceLevel = (level: string) => {
    const levels = ["$", "$$", "$$$", "$$$$"];
    const priceIndex = levels.indexOf(level);
    
    return (
      <div className="flex items-center">
        {levels.map((_, index) => (
          <span 
            key={index}
            className={`text-lg ${index <= priceIndex ? 'text-green-600 font-bold' : 'text-gray-300'}`}
          >
            $
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <HeartIcon className="h-8 w-8 text-rose-500" />
            <span className="ml-2 text-xl font-bold text-gray-800">Spark</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/discover" className="text-gray-600 hover:text-gray-900">
              Discover
            </Link>
            <Link href="/categories" className="text-gray-600 hover:text-gray-900">
              Categories
            </Link>
            <Link href="/favorites" className="text-gray-600 hover:text-gray-900">
              Favorites
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
          </div>

          <Link
            href="/login"
            className="px-4 py-2 rounded-full border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Images and Main Details */}
          <div className="w-full lg:w-2/3">
            {/* Image Gallery */}
            <div className="mb-8 relative rounded-2xl overflow-hidden">
              <div className="relative h-80 md:h-96 lg:h-[500px]">
                <Image
                  src={dateIdea.images[activeImage]}
                  alt={dateIdea.title}
                  fill
                  className="object-cover"
                />
                <SaveButton
                  itemSlug={dateIdea.slug}
                  item={dateIdea}
                  className="absolute top-4 right-4 z-10"
                />
              </div>
              
              {/* Thumbnail Navigation */}
              {dateIdea.images.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {dateIdea.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`h-16 w-24 relative border-2 rounded overflow-hidden transition-all ${
                        activeImage === idx ? "border-rose-500" : "border-transparent opacity-70"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${dateIdea.title} thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title and Rating */}
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {dateIdea.category}
                    </span>
                    <div className="ml-3 flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 text-sm font-medium text-gray-700">{dateIdea.rating}</span>
                      <span className="ml-1 text-sm text-gray-500">({dateIdea.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{dateIdea.title}</h1>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-800">{dateIdea.price}</div>
                  <div className="text-sm text-gray-500">{dateIdea.duration}</div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center mb-6">
              <MapPinIcon className="h-5 w-5 text-rose-500 mr-2" />
              <span className="text-gray-700">{dateIdea.location}</span>
              <Link 
                href={dateIdea.mapLocation} 
                target="_blank" 
                className="ml-3 text-sm text-rose-500 hover:text-rose-600"
              >
                View on map
              </Link>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">About This Date Idea</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: dateIdea.longDescription }} />
            </div>

            {/* What to expect */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">What to Expect</h2>
              <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Price Level</h3>
                  <div className="flex items-center">
                    {renderPriceLevel(dateIdea.priceLevel)}
                    <span className="ml-2 text-gray-500 text-sm">{dateIdea.price}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Duration</h3>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{dateIdea.duration}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Difficulty</h3>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>{dateIdea.difficultyLevel}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Reservation</h3>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{dateIdea.reservationRequired ? "Required" : "Not required"}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Best Time to Visit</h3>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>{dateIdea.bestTimeToVisit}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Best For</h3>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{dateIdea.bestForStage}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="w-full lg:w-1/3">
            {/* Booking/Contact Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Ready to Try This Date?</h2>
              <Link 
                href={dateIdea.contactInfo.website} 
                target="_blank"
                className="bg-rose-500 text-white w-full py-3 rounded-lg flex items-center justify-center font-medium hover:bg-rose-600 transition-colors mb-4"
              >
                Book Now
              </Link>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                  <div className="mt-1">
                    <div className="flex items-center text-gray-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{dateIdea.contactInfo.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-800 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{dateIdea.contactInfo.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Amenities */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Included Amenities</h2>
              <div className="grid grid-cols-1 gap-2">
                {dateIdea.amenities.map((amenity: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Tips */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Insider Tips</h2>
              <div className="space-y-2">
                {dateIdea.tips.map((tip: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Ideal For */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Ideal For</h2>
              <div className="flex flex-wrap gap-2">
                {dateIdea.idealFor.map((ideal: string, index: number) => (
                  <span 
                    key={index}
                    className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1.5 rounded"
                  >
                    {ideal}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Ideas */}
        {relatedIdeas.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedIdeas.map((idea, index) => (
                <Link href={`/date-idea/${idea.slug}`} key={index} className="group">
                  <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <Image
                        src={idea.images[0]}
                        alt={idea.title}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover"
                      />
                      <SaveButton 
                        itemSlug={idea.slug}
                        item={idea}
                        className="absolute top-3 right-3"
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {idea.category}
                        </span>
                        <div className="ml-auto flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                          <span className="ml-1 text-sm text-gray-600">{idea.rating}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-rose-500 transition-colors">
                        {idea.title}
                      </h3>

                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span>{idea.location}</span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{idea.description}</p>

                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{idea.price}</span>
                        <span className="text-gray-500">{idea.duration}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
