"use client";
import { useState, useEffect } from 'react';
import { getImageUrl } from "../../utils/imageService";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import PageTitle from "../../components/PageTitle";
import { PAGE_TITLES } from "../../utils/titleUtils";
import CountryCitySelector from '../../components/CountryCitySelector';
import { CityItem } from '../../../utils/cityService';
import { StarIcon, ChevronRight } from "lucide-react";

export default function DateIdeasNearMePage() {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCityInfo, setSelectedCityInfo] = useState<CityItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("romantic activities");
  const [userCity, setUserCity] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>("US"); // Default to US
  const [locationDetected, setLocationDetected] = useState<boolean>(false);
  
  // Set default city to LA if IP detection fails
  const setDefaultCity = () => {
    setUserCity("Los Angeles");
    setUserCountry("US");
    setSelectedCity("Los Angeles");
  };
  
  // Initialize and detect user location
  useEffect(() => {
    // Detect user location
    const detectLocation = async () => {
      try {
        const savedCity = localStorage.getItem("userCity");
        const savedCountry = localStorage.getItem("userCountry") || "US";
        
        if (savedCity) {
          setUserCity(savedCity);
          setUserCountry(savedCountry);
          setSelectedCity(savedCity);
          setLocationDetected(true);
          return;
        }
        
        const response = await fetch('/api/location');
        const data = await response.json();
        
        if (data.city) {
          setUserCity(data.city);
          setUserCountry(data.countryCode || "US");
          setSelectedCity(data.city);
          setLocationDetected(true);
          localStorage.setItem("userCity", data.city);
          if (data.countryCode) {
            localStorage.setItem("userCountry", data.countryCode);
          }
        } else {
          setDefaultCity();
        }
      } catch (error) {
        console.error('Error detecting location:', error);
        setDefaultCity();
      }
    };
    
    detectLocation();
  }, []);
  
  // Handle city selection
  const handleCitySelect = (city: CityItem) => {
    setSelectedCity(city.name);
    setSelectedCityInfo(city);
    // Store the user's selection
    localStorage.setItem("userCity", city.name);
    localStorage.setItem("userCountry", city.countryCode);
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
            
            {/* Country-City Selection */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-xl">
              <CountryCitySelector
                onCitySelect={handleCitySelect}
                selectedCity={selectedCity}
                defaultCity={userCity || undefined}
                label="City"
                className="mb-4"
              />
              
              {/* Category Selection */}
              <div className="mb-6 mt-5">
                <label className="block text-white text-left text-sm font-semibold mb-2">Category</label>
                <select 
                  value={selectedCategory} 
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-700"
                >
                  <option value="romantic activities">Romantic Activities</option>
                  <option value="couples experiences">Couples Experiences</option>
                  <option value="fun date ideas">Fun Date Ideas</option>
                  <option value="unique experiences">Unique Experiences</option>
                  <option value="outdoor adventures">Outdoor Adventures</option>
                  <option value="indoor activities">Indoor Activities</option>
                  <option value="food tours">Food & Drink</option>
                  <option value="cultural experiences">Cultural Experiences</option>
                  <option value="nightlife">Nightlife</option>
                </select>
              </div>
              
              {locationDetected && userCity && (
                <div className="text-sm text-green-200 mb-4">
                  📍 We detected you're in {userCity}. Showing date ideas near you!
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Results Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
              {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} in {selectedCity || "Your City"}
              <ChevronRight className="w-8 h-8 text-rose-400" />
            </h2>
            
            <p className="text-gray-600 mb-8">
              We've gathered the best experiences from multiple sources so you can find the perfect date idea.
              Each activity opens in a new tab on the provider's website where you can learn more and book directly.
            </p>
            
            {selectedCity && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">Date Ideas from Multiple Sources</h3>
                </div>
                
                <div className="bg-rose-50 rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-semibold text-rose-800 mb-4">Why We Show Multiple Sources</h3>
                  <p className="text-gray-700">
                    We believe in giving you options! By bringing together experiences from multiple websites,
                    you can compare prices, read different reviews, and find unique date ideas that might not be 
                    available on just one platform. Try filtering by source to see what each site offers!
                  </p>
                </div>
              </div>
            )}
            
            {!selectedCity && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <h3 className="font-semibold text-amber-800 mb-2">Please Select a City</h3>
                <p className="text-amber-700">
                  Enter your city in the search box above to see date ideas near you.
                </p>
              </div>
            )}
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