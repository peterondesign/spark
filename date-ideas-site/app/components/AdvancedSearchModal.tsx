"use client";

import { useState } from 'react';
import { Listbox } from '@headlessui/react'

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
  idealFor?: string;
  relatedDateIdeas?: string[];
  longDescription?: string;
}

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: any) => void;
}

const categories = [
  "Romantic",
  "Adventure",
  "Food & Drink",
  "Arts & Culture",
]

const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [rating, setRating] = useState<number | null>(null);
  const [location, setLocation] = useState<string>('');
  const [priceLevel, setPriceLevel] = useState<number | null>(null);
  const [bestForStage, setBestForStage] = useState<string>('');
  const [idealFor, setIdealFor] = useState<string>('');

  const handleSearch = () => {
    // Implement your search logic here using the filter values
    console.log('Search Filters:', {
      title,
      category,
      rating,
      location,
      priceLevel,
      bestForStage,
      idealFor,
    });
    onClose(); // Close the modal after initiating the search
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-500/75">
      <div className="relative p-8 bg-white w-full max-w-md mx-auto my-20 rounded-md">
        <h2 className="text-2xl font-bold mb-4">Advanced Search</h2>

        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
            Title:
          </label>
          <input
            type="text"
            id="title"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
            Category:
          </label>
          <Listbox value={category} onChange={setCategory}>
            <div className="relative mt-1">
              <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                <span className="block truncate">{category ? category : 'Select a category'}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  {/* Heroicon chevron-down */}
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </span>
              </Listbox.Button>
              <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {categories.map((cat) => (
                  <Listbox.Option
                    key={cat}
                    className={({ active }: { active: boolean }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                      }`
                    }
                    value={cat}
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {cat}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                            {/* Heroicon check */}
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.129.07l-4.5-4.5a.75.75 0 011.06-1.06l3.976 3.975 7.444-9.794a.75.75 0 011.05-.143z" clipRule="evenodd" />
                            </svg>
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>

        <div className="mb-4">
          <label htmlFor="rating" className="block text-gray-700 text-sm font-bold mb-2">
            Rating:
          </label>
          <input
            type="number"
            id="rating"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={rating !== null ? rating.toString() : ''}
            onChange={(e) => setRating(e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="location" className="block text-gray-700 text-sm font-bold mb-2">
            Location:
          </label>
          <input
            type="text"
            id="location"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="priceLevel" className="block text-gray-700 text-sm font-bold mb-2">
            Price Level:
          </label>
          <input
            type="number"
            id="priceLevel"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={priceLevel !== null ? priceLevel.toString() : ''}
            onChange={(e) => setPriceLevel(e.target.value ? parseFloat(e.target.value) : null)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="bestForStage" className="block text-gray-700 text-sm font-bold mb-2">
            Best For Stage:
          </label>
          <input
            type="text"
            id="bestForStage"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={bestForStage}
            onChange={(e) => setBestForStage(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="idealFor" className="block text-gray-700 text-sm font-bold mb-2">
            Ideal For:
          </label>
          <input
            type="text"
            id="idealFor"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={idealFor}
            onChange={(e) => setIdealFor(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-rose-500 hover:bg-rose-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchModal;
