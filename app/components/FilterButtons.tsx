import { useState, useEffect } from "react";
import { MapPinIcon, DollarSignIcon } from "./icons";

type PriceRange = 'all' | 'free' | 'under-25' | 'under-50' | 'under-100' | '100-plus';

interface FilterButtonsProps {
  onFilterChange: (filters: { city: string | null; price: PriceRange }) => void;
  currentCity: string | null;
  clearCity: () => void;
}

export default function FilterButtons({ onFilterChange, currentCity, clearCity }: FilterButtonsProps) {
  const [selectedPrice, setSelectedPrice] = useState<PriceRange>('all');
  const [userCity, setUserCity] = useState<string | null>(currentCity);

  useEffect(() => {
    setUserCity(currentCity);
  }, [currentCity]);

  const handlePriceChange = (price: PriceRange) => {
    setSelectedPrice(price);
    onFilterChange({ city: userCity, price });
  };

  const handleCityClear = () => {
    clearCity();
    setUserCity(null);
    onFilterChange({ city: null, price: selectedPrice });
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="space-y-4">
        {/* City Filter */}
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1 text-gray-500" />
            Location
          </h3>
          {userCity ? (
            <div className="flex items-center justify-between bg-purple-50 text-purple-800 px-4 py-2 rounded-full">
              <span className="text-sm font-medium">{userCity}</span>
              <button 
                onClick={handleCityClear}
                className="ml-2 text-purple-600 hover:text-purple-800 text-xs font-medium"
              >
                Clear
              </button>
            </div>
          ) : (
            <div className="text-sm italic text-gray-500 px-4 py-2">
              No location selected
            </div>
          )}
        </div>

        {/* Price Range Filter */}
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
            <DollarSignIcon className="h-4 w-4 mr-1 text-gray-500" />
            Price Range
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[
              { id: 'all', label: 'All Prices' },
              { id: 'free', label: 'Free' },
              { id: 'under-25', label: 'Under $25' },
              { id: 'under-50', label: 'Under $50' },
              { id: 'under-100', label: 'Under $100' },
              { id: '100-plus', label: '$100+' }
            ].map((option) => (
              <div key={option.id} className="relative">
                <input
                  type="radio"
                  id={`price-${option.id}`}
                  name="price-range"
                  className="peer absolute opacity-0 w-full h-full cursor-pointer"
                  checked={selectedPrice === option.id}
                  onChange={() => handlePriceChange(option.id as PriceRange)}
                />
                <label
                  htmlFor={`price-${option.id}`}
                  className="flex justify-center items-center px-3 py-2 text-sm rounded-full border border-gray-200 
                  peer-checked:bg-rose-500 peer-checked:text-white peer-checked:border-rose-500
                  hover:bg-gray-50 transition-colors cursor-pointer w-full"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}