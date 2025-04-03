"use client";
import { useState, useEffect } from 'react';
import { getImageUrl } from "../utils/imageService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import CityEvents from "../components/CityEvents";
import { PAGE_TITLES } from "../utils/titleUtils";
import { City } from "country-state-city";
import { Autocomplete, AutocompleteItem } from "@heroui/react";
import { MapPinIcon, StarIcon } from "lucide-react";

// CityItem interface for the autocomplete
interface CityItem {
  name: string;
  countryCode: string;
  isPopular: boolean;
  id: string;
}

// Popular cities list
const POPULAR_CITIES = [
  "New York", "London", "Paris", "Tokyo", "Sydney", 
  "Los Angeles", "Berlin", "Rome", "Dubai", "Singapore",
  "Barcelona", "Toronto", "Amsterdam", "Hong Kong", "San Francisco"
];

export default function DateIdeasNearMePage() {
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("romantic activities");
  const [userCity, setUserCity] = useState<string | null>(null);
  const [locationDetected, setLocationDetected] = useState<boolean>(false);
  const [popularCities, setPopularCities] = useState<CityItem[]>([]);
  
  // For the city autocomplete
  const [cityList, setCityList] = useState<{
    items: CityItem[];
    filterText: string;
    isLoading: boolean;
  }>({
    items: [],
    filterText: '',
    isLoading: false
  });

  // Set default city to LA if IP detection fails
  const setDefaultCity = () => {
    const laCity = {
      name: "Los Angeles",
      countryCode: "US",
      isPopular: true,
      id: "Los Angeles-US"
    };
    setSelectedCity(laCity.name);
    setUserCity(laCity.name);
  };

  // Initialize cities and detect user location
  useEffect(() => {
    // Initialize with popular cities
    const cities = City.getAllCities().filter(city => 
      POPULAR_CITIES.includes(city.name)
    ).map(city => ({
      name: city.name,
      countryCode: city.countryCode,
      isPopular: true,
      id: `${city.name}-${city.countryCode}`
    }));
    
    setPopularCities(cities);
    setCityList({
      items: cities,
      filterText: '',
      isLoading: false
    });

    // Detect user location
    const detectLocation = async () => {
      try {
        const savedCity = localStorage.getItem("userCity");
        if (savedCity) {
          setUserCity(savedCity);
          setSelectedCity(savedCity);
          setLocationDetected(true);
          return;
        }

        const response = await fetch('/api/location');
        const data = await response.json();
        
        if (data.city) {
          setUserCity(data.city);
          setSelectedCity(data.city);
          setLocationDetected(true);
          localStorage.setItem("userCity", data.city);
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

  // Handle city search
  const handleCitySearch = async (query: string) => {
    setCityList(prev => ({ ...prev, filterText: query, isLoading: true }));
    
    if (query.trim() === "") {
      setCityList({
        items: popularCities,
        filterText: query,
        isLoading: false
      });
      return;
    }

    // Filter cities based on the search query
    const cities = City.getAllCities().filter(city => 
      city.name.toLowerCase().includes(query.toLowerCase())
    );
    
    // Create a unique identifier for each city
    const filteredCities = cities.map(city => ({
      name: city.name,
      countryCode: city.countryCode,
      isPopular: POPULAR_CITIES.includes(city.name),
      id: `${city.name}-${city.countryCode}`
    }));

    // Remove duplicates
    const uniqueCities = filteredCities.filter((city, index, self) =>
      index === self.findIndex(c => c.name === city.name)
    );

    // Sort by popularity then name
    const sortedCities = uniqueCities.sort((a, b) => {
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return a.name.localeCompare(b.name);
    }).slice(0, 20); // Limit to 20 results

    setCityList({
      items: sortedCities,
      filterText: query,
      isLoading: false
    });
  };

  // Handle city selection
  const handleCitySelect = (city: CityItem) => {
    setSelectedCity(city.name);
  };

  // Handle category changes
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageTitle title={PAGE_TITLES.DATE_IDEAS_NEAR_ME || "Date Ideas Near Me"} />
      
      <Header />
      
      {/* Hero Section with City Search */}
      <section className="relative bg-cover bg-center py-20" style={{ backgroundImage: 'url(/placeholder.jpg)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600/90 to-purple-800/90"></div>
        
        <div className="relative container mx-auto px-4 z-10">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Date Ideas Near You</h1>
            <p className="text-xl mb-8">Discover amazing experiences for your next date night</p>
            
            {/* City Selection */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-xl">
              <div className="mb-4">
                <label className="block text-white text-left text-sm font-semibold mb-2">City</label>
                <Autocomplete<CityItem>
                  className="w-full"
                  inputValue={cityList.filterText}
                  isLoading={cityList.isLoading}
                  items={cityList.items}
                  placeholder="Search for a city..."
                  variant="bordered"
                  onInputChange={handleCitySearch}
                  selectedKey={selectedCity ? selectedCity : undefined}
                  onSelectionChange={key => {
                    const selected = cityList.items.find(item => item.id === key);
                    if (selected) {
                      handleCitySelect(selected);
                    }
                  }}
                  startContent={<MapPinIcon className="h-5 w-5 text-gray-500" />}
                  listboxProps={{
                    itemClasses: {
                      base: "data-[hover=true]:bg-rose-100 transition-colors",
                    },
                  }}
                  classNames={{
                    base: "max-w-full",
                  }}
                  inputProps={{
                    className: "text-black",
                  }}
                  popoverProps={{
                    classNames: {
                      content: "bg-white rounded-xl shadow-lg p-1 border border-gray-200"
                    }
                  }}
                >
                  {(item) => (
                    <AutocompleteItem
                      key={item.id}
                      className={`capitalize ${item.isPopular ? 'font-medium' : ''}`}
                      startContent={item.isPopular ? <StarIcon className="h-4 w-4 text-amber-400 mr-1" /> : null}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{item.name}, {item.countryCode}</span>
                        {item.isPopular && (
                          <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full">Popular</span>
                        )}
                      </div>
                    </AutocompleteItem>
                  )}
                </Autocomplete>
              </div>
              
              {/* Category Selection */}
              <div className="mb-6">
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
              
              {locationDetected && (
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
            <h2 className="text-3xl font-bold mb-6">
              {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} in {selectedCity || "Your City"}
            </h2>
            
            <p className="text-gray-600 mb-8">
              We've gathered the best experiences from multiple sources so you can find the perfect date idea.
              Each activity opens in a new tab on the provider's website where you can learn more and book directly.
            </p>
            
            {selectedCity && (
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4">Date Ideas from Multiple Sources</h3>
                  <CityEvents city={selectedCity} category={selectedCategory} />
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