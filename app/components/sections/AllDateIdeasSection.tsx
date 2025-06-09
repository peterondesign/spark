"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../../utils/supabaseClient';
import Link from 'next/link';

interface DateIdea {
  id: string;
  title: string;
  category: string;
  image?: string;
  slug: string;
}

const AllDateIdeasSection = () => {
  const { theme } = useTheme();
  const [selectedCity, setSelectedCity] = useState<string>("LISBON");
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch date ideas from Supabase
  useEffect(() => {
    const fetchDateIdeas = async () => {
      try {
        const { data, error } = await supabase
          .from('date_ideas')
          .select('*')
          .limit(12);

        if (error) {
          console.error("Error fetching date ideas:", error);
        } else {
          setDateIdeas(data || []);
        }
      } catch (error) {
        console.error("Error fetching date ideas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDateIdeas();
  }, []);

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
  };

  return (
    <section 
      className={`py-16 ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-50'}`}
      id="all-date-ideas"
    >
      <div className="container mx-auto px-6">
        {/* Section Header with City Selector */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold font-heading flex items-center gap-3 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            ALL DATE IDEAS IN{" "}
            <div className={`inline-flex items-center gap-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <select 
                value={selectedCity}
                onChange={handleCityChange}
                className={`bg-transparent border-b-2 border-gray-400 focus:border-gray-600 outline-none text-3xl md:text-4xl font-bold cursor-pointer ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                <option value="LISBON">LISBON</option>
                <option value="NEW YORK">NEW YORK</option>
                <option value="LONDON">LONDON</option>
                <option value="PARIS">PARIS</option>
                <option value="TOKYO">TOKYO</option>
              </select>
              <ChevronDown className="w-8 h-8 md:w-10 md:h-10" />
            </div>
          </h2>
        </div>

        {/* Date Ideas Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className={`animate-pulse rounded-2xl h-64 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {dateIdeas.map((idea) => (
                <Link
                  key={idea.id}
                  href={`/date-idea/${idea.slug}`}
                  className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 ${
                    theme === 'dark' 
                      ? 'bg-[#333333] border border-gray-700' 
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={idea.image || '/placeholder.jpg'}
                      alt={idea.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className={`text-lg font-semibold mb-2 group-hover:text-rose-400 transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {idea.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        theme === 'dark' 
                          ? 'bg-rose-900 text-rose-200' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {idea.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <a
                href="/date-ideas-near-me"
                className="inline-flex items-center gap-2 px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                View All Date Ideas
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default AllDateIdeasSection;
