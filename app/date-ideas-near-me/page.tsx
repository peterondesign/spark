"use client";
import { useState, useEffect } from 'react';
import { getImageUrl } from "../utils/imageService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import { PAGE_TITLES } from "../utils/titleUtils";
import CityPicker from '../components/CityPicker';
import { StarIcon, ChevronRight } from "lucide-react";

export default function DateIdeasNearMePage() {
  const [selectedCity, setSelectedCity] = useState<string>("LONDON");
  const [selectedCategory, setSelectedCategory] = useState<string>("romantic activities");
  const [cityEvents, setCityEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Initialize with default city
  useEffect(() => {
    const savedCity = localStorage.getItem("selectedCity");
    if (savedCity) {
      setSelectedCity(savedCity);
    }
    // Load initial events
    fetchCityEvents(savedCity || "LONDON");
  }, []);
  
  // Fetch city events from Perplexity API
  const fetchCityEvents = async (city: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/perplexity-city-events?city=${encodeURIComponent(city)}`);
      const data = await response.json();
      
      if (data.success && data.events) {
        setCityEvents(data.events);
      } else {
        setCityEvents([]);
      }
    } catch (error) {
      console.error('Error fetching city events:', error);
      setCityEvents([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle city selection
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    localStorage.setItem("selectedCity", city);
    fetchCityEvents(city);
  };
  
  // Handle category changes
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PageTitle title={PAGE_TITLES.DATE_IDEAS_NEAR_ME || "Date Ideas Near Me"} />
      
      <Header />
      
      {/* Hero Section with Country-City Search */}
      <section className="relative bg-cover bg-center py-20" style={{ backgroundImage: 'url(/placeholder.jpg)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600/90 to-purple-800/90"></div>
        
        <div className="relative container mx-auto px-4 z-10">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Date Ideas Near You</h1>
            <p className="text-xl mb-8">Discover amazing experiences for your next date night</p>
            
            {/* City Selection */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-xl">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-center">
                <CityPicker
                  selectedCity={selectedCity}
                  onCityChange={handleCityChange}
                  loading={loading}
                />
                
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="px-6 py-3 rounded-xl border-2 border-gray-300 bg-white text-gray-900 focus:border-rose-400 focus:ring-2 focus:ring-rose-500 min-w-[200px]"
                >
                  <option value="romantic activities">Romantic Activities</option>
                  <option value="outdoor adventures">Outdoor Adventures</option>
                  <option value="cultural experiences">Cultural Experiences</option>
                  <option value="food and dining">Food & Dining</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="wellness and relaxation">Wellness & Relaxation</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} in {selectedCity}
              <ChevronRight className="w-8 h-8 text-rose-400" />
            </h2>
            
            <p className="text-gray-600 mb-8">
              Discover amazing experiences and activities happening in {selectedCity}. 
              Each activity opens in a new tab where you can learn more details.
            </p>
            
            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* City Events Grid */}
            {!loading && cityEvents.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {cityEvents.map((event, index) => (
                  <div key={`${event.id}-${index}`} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
                    {event.image && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.jpg';
                          }}
                        />
                        {event.featured && (
                          <div className="absolute top-3 left-3 bg-rose-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            Featured
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="p-6">
                      <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-rose-600 transition-colors">
                        {event.title}
                      </h3>
                      
                      {event.date && (
                        <div className="text-sm text-gray-600 mb-2">
                          📅 {event.date}
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="text-sm text-gray-600 mb-3">
                          📍 {event.location}
                        </div>
                      )}
                      
                      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                        {event.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {event.category && (
                            <span className="inline-block bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded-full">
                              {event.category}
                            </span>
                          )}
                        </div>
                        
                        {event.website && (
                          <a
                            href={event.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1"
                          >
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* No Results */}
            {!loading && cityEvents.length === 0 && selectedCity && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                <h3 className="font-semibold text-amber-800 mb-2">No Events Found</h3>
                <p className="text-amber-700">
                  We couldn't find any {selectedCategory} in {selectedCity} right now. 
                  Try selecting a different category or city.
                </p>
              </div>
            )}
            
            <div className="bg-rose-50 rounded-xl shadow-md p-6 mt-8">
              <h3 className="text-xl font-semibold text-rose-800 mb-4">Why Choose Our Date Ideas?</h3>
              <p className="text-gray-700">
                We curate real-time activities and events happening in your city, giving you fresh and 
                current date ideas that are actually available. Each suggestion is researched and verified 
                to ensure you have amazing experiences together!
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Date Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Popular Date Categories</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Romantic Dinner", image: "/placeholder.jpg", query: "romantic dinner" },
              { name: "Adventure Activities", image: "/placeholder.jpg", query: "adventure activities" },
              { name: "Art & Culture", image: "/placeholder.jpg", query: "art culture" },
              { name: "Cooking Classes", image: "/placeholder.jpg", query: "cooking classes" },
              { name: "Outdoor Dates", image: "/placeholder.jpg", query: "outdoor activities" },
              { name: "Spa & Wellness", image: "/placeholder.jpg", query: "spa wellness" },
            ].map((category) => (
              <div 
                key={category.name}
                className="relative overflow-hidden rounded-xl shadow-md cursor-pointer group"
                onClick={() => {
                  setSelectedCategory(category.query);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div className="relative h-48">
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors z-10"></div>
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <h3 className="text-white text-xl font-bold">{category.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Tips for a Great Date */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Tips for a Perfect Date</h2>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Plan Ahead</h3>
                <p className="text-gray-600">
                  Many popular experiences require advance booking, especially on weekends. 
                  Book your activities at least a few days in advance to avoid disappointment.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Check the Weather</h3>
                <p className="text-gray-600">
                  For outdoor activities, always have a backup plan in case of unexpected weather changes. 
                  Indoor alternatives can save your date from being ruined by rain or extreme temperatures.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Mix Things Up</h3>
                <p className="text-gray-600">
                  Consider combining multiple activities for a more memorable experience. 
                  Start with a fun activity, followed by dinner, and perhaps end with a scenic walk or dessert.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-2">Capture the Moment</h3>
                <p className="text-gray-600">
                  Don't forget to take photos to remember your special date, but also make sure 
                  to put the phone away and enjoy the present moment with your partner.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}