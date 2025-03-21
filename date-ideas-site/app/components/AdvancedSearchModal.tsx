"use client";

import { useState } from 'react';
import { Listbox } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';

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
  "All Categories",
  "Romantic",
  "Adventure",
  "Food & Drink",
  "Arts & Culture",
  "Outdoors",
  "Entertainment",
  "Relaxation",
  "Educational"
];

const priceLevels = [
  { id: 'all', name: 'All Price Ranges', value: null },
  { id: 'affordable', name: 'Affordable', value: 1 },
  { id: 'moderate', name: 'Moderate', value: 2 },
  { id: 'high', name: 'High', value: 3 },
  { id: 'luxury', name: 'Luxury', value: 4 }
];

const relationshipStages = [
  { id: 'all', name: 'All Stages', value: 'all' },
  { id: 'new', name: 'New Relationships', value: 'new' },
  { id: 'established', name: 'Established Relationships', value: 'established' },
  { id: 'married', name: 'Married Couples', value: 'married' },
  { id: 'long-term', name: 'Long-term Partners', value: 'long-term' }
];

const idealForOptions = [
  'Couples',
  'First Date',
  'Anniversary',
  'Birthday',
  'Special Occasion',
  'Weekend Trip',
  'Spontaneous',
  'Budget-friendly',
  'Double Date',
  'Group Date'
];

const ratingOptions = [
  { id: 'any', name: 'Any Rating', value: 0 },
  { id: '3plus', name: '3+ Stars', value: 3 },
  { id: '4plus', name: '4+ Stars', value: 4 },
  { id: '4.5plus', name: '4.5+ Stars', value: 4.5 }
];

const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({ isOpen, onClose, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [category, setCategory] = useState<string>('All Categories');
  const [rating, setRating] = useState<number>(0);
  const [location, setLocation] = useState<string>('');
  const [priceLevel, setPriceLevel] = useState<number | null>(null);
  const [bestForStage, setBestForStage] = useState<string>('all');
  const [selectedIdealFor, setSelectedIdealFor] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare and pass the filters to the onSearch callback
    onSearch({
      searchTerm,
      category: category === 'All Categories' ? 'all' : category,
      rating,
      location,
      priceLevel,
      bestForStage,
      idealFor: selectedIdealFor.length > 0 ? selectedIdealFor : undefined
    });
  };

  const toggleIdealForOption = (option: string) => {
    setSelectedIdealFor(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500/75" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* This element centers the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              aria-label="Close"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-2xl font-bold text-gray-900 mb-6" id="modal-title">
                Advanced Search (Testing)
              </h3>
              
              <form onSubmit={handleSubmit}>
              
                {/* Categories Dropdown */}
                <div className="mb-6">
                  <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
                    Category:
                  </label>
                  <Listbox value={category} onChange={setCategory}>
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 sm:text-sm">
                        <span className="block truncate">{category}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {categories.map((cat) => (
                          <Listbox.Option
                            key={cat}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-rose-100 text-rose-900' : 'text-gray-900'
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
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-rose-600">
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
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
                
                {/* Rating Range */}
                <div className="mb-6">
                  <label htmlFor="rating" className="block text-gray-700 text-sm font-bold mb-2">
                    Rating:
                  </label>
                  <Listbox value={rating} onChange={setRating}>
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 sm:text-sm">
                        <span className="block truncate">
                          {rating === 0 ? 'Any Rating' : 
                           rating === 3 ? '3+ Stars' : 
                           rating === 4 ? '4+ Stars' : 
                           rating === 4.5 ? '4.5+ Stars' : `${rating}+ Stars`}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {ratingOptions.map((option) => (
                          <Listbox.Option
                            key={option.id}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-rose-100 text-rose-900' : 'text-gray-900'
                              }`
                            }
                            value={option.value}
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {option.name}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-rose-600">
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
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

                {/* Price Level */}
                <div className="mb-6">
                  <label htmlFor="priceLevel" className="block text-gray-700 text-sm font-bold mb-2">
                    Price Level:
                  </label>
                  <Listbox value={priceLevel} onChange={setPriceLevel}>
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 sm:text-sm">
                        <span className="block truncate">
                          {priceLevel === null ? 'All Price Ranges' : 
                           priceLevel === 1 ? 'Affordable' : 
                           priceLevel === 2 ? 'Moderate' : 
                           priceLevel === 3 ? 'High' : 'Luxury'}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {priceLevels.map((option) => (
                          <Listbox.Option
                            key={option.id}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-rose-100 text-rose-900' : 'text-gray-900'
                              }`
                            }
                            value={option.value}
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {option.name}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-rose-600">
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
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

                {/* Best For Stage */}
                <div className="mb-6">
                  <label htmlFor="bestForStage" className="block text-gray-700 text-sm font-bold mb-2">
                    Relationship Stage:
                  </label>
                  <Listbox value={bestForStage} onChange={setBestForStage}>
                    <div className="relative mt-1">
                      <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 sm:text-sm">
                        <span className="block truncate">
                          {relationshipStages.find(stage => stage.value === bestForStage)?.name || 'All Stages'}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </span>
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                        {relationshipStages.map((option) => (
                          <Listbox.Option
                            key={option.id}
                            className={({ active }) =>
                              `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                active ? 'bg-rose-100 text-rose-900' : 'text-gray-900'
                              }`
                            }
                            value={option.value}
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                  {option.name}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-rose-600">
                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
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

                {/* Ideal For Checkboxes */}
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Ideal For:
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {idealForOptions.map(option => (
                      <div key={option} className="flex items-start">
                        <div className="flex items-center h-6">
                          <input
                            id={`ideal-for-${option}`}
                            name={`ideal-for-${option}`}
                            type="checkbox"
                            checked={selectedIdealFor.includes(option)}
                            onChange={() => toggleIdealForOption(option)}
                            className="focus:ring-rose-500 h-4 w-4 text-rose-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-2 text-sm">
                          <label htmlFor={`ideal-for-${option}`} className="font-medium text-gray-700">
                            {option}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-rose-500 border border-transparent rounded-md shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchModal;