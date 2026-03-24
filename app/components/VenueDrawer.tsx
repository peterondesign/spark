"use client";

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { X, MapPin, ChevronDown, ExternalLink } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
} from '@/components/ui/drawer';
import { CITIES } from '../utils/cities';

interface DateIdea {
  id: string;
  title: string;
  category?: string;
  description?: string;
  [key: string]: any;
}

interface Venue {
  name: string;
  type: string;
  description: string;
  location: string;
  link: string;
}

interface VenueDrawerProps {
  dateIdea: DateIdea;
  city: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LocalCachePayload {
  timestamp: number;
  results: Venue[];
}

const LOCAL_CACHE_PREFIX = 'venue-results-v2';
const LOCAL_CACHE_TTL = 24 * 60 * 60 * 1000;

const VenueDrawer = ({
  dateIdea,
  city,
  isOpen,
  onOpenChange,
}: VenueDrawerProps) => {
  const { theme } = useTheme();
  const [selectedCity, setSelectedCity] = useState(city);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const syncDesktopMode = () => setIsDesktop(mediaQuery.matches);

    syncDesktopMode();
    mediaQuery.addEventListener('change', syncDesktopMode);

    return () => mediaQuery.removeEventListener('change', syncDesktopMode);
  }, []);

  useEffect(() => {
    if (city) {
      setSelectedCity(city);
    }
  }, [city, dateIdea.id]);

  // Fetch venues when drawer opens or city changes
  useEffect(() => {
    if (isOpen) {
      fetchVenues();
    }
  }, [isOpen, selectedCity, dateIdea.id]);

  const getLocalCacheKey = () => {
    const ideaKey = dateIdea.id || dateIdea.title.toLowerCase().replace(/\s+/g, '-');
    return `${LOCAL_CACHE_PREFIX}:${ideaKey}:${selectedCity.toLowerCase()}`;
  };

  const readFromLocalCache = (): Venue[] | null => {
    try {
      const raw = localStorage.getItem(getLocalCacheKey());
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as LocalCachePayload;
      if (Date.now() - parsed.timestamp > LOCAL_CACHE_TTL) {
        localStorage.removeItem(getLocalCacheKey());
        return null;
      }

      return parsed.results;
    } catch {
      return null;
    }
  };

  const saveToLocalCache = (results: Venue[]) => {
    try {
      const payload: LocalCachePayload = {
        timestamp: Date.now(),
        results,
      };
      localStorage.setItem(getLocalCacheKey(), JSON.stringify(payload));
    } catch {
      // Ignore localStorage quota or serialization failures.
    }
  };

  const fetchVenues = async () => {
    let progressInterval: number | undefined;

    try {
      setLoading(true);
      setError(null);
      setProgress(6);

      progressInterval = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 92) {
            return prev;
          }
          return prev + Math.max(1, Math.floor((92 - prev) / 6));
        });
      }, 220);

      const localCachedResults = readFromLocalCache();
      if (localCachedResults && localCachedResults.length > 0) {
        setVenues(localCachedResults);
        setProgress(100);
        return;
      }

      const response = await fetch('/api/fetch-venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateIdea: dateIdea.title,
          city: selectedCity,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }

      const data = await response.json();
      const fetchedResults = data.results || [];
      setVenues(fetchedResults);
      saveToLocalCache(fetchedResults);
      setProgress(100);
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch venues');
    } finally {
      if (progressInterval) {
        window.clearInterval(progressInterval);
      }

      window.setTimeout(() => {
        setLoading(false);
      }, 140);

      window.setTimeout(() => {
        setProgress(0);
      }, 320);
    }
  };

  const handleCityChange = (newCity: string) => {
    setSelectedCity(newCity);
    setShowCityDropdown(false);
  };

  const PanelBody = () => (
    <>
      {/* Sticky Header */}
      <div
        className={`sticky top-0 z-10 border-b ${
          theme === 'dark' ? 'border-gray-700 bg-[#333333]' : 'border-gray-200 bg-gray-50'
        } px-6 py-4`}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            {dateIdea.image && (
              <img
                src={dateIdea.image}
                alt={dateIdea.title}
                className="w-12 h-12 rounded-md object-cover shrink-0"
                loading="lazy"
              />
            )}
            <h2
              className={`text-base font-semibold leading-snug line-clamp-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {dateIdea.title}
            </h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
            aria-label="Close venues panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* City Selector */}
        <div className="relative">
          <button
            onClick={() => setShowCityDropdown(!showCityDropdown)}
            className={`w-full px-4 py-2 rounded-lg border flex items-center justify-between ${
              theme === 'dark'
                ? 'bg-[#2a2a2a] border-gray-700 text-white hover:border-gray-600'
                : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{selectedCity}</span>
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showCityDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showCityDropdown && (
            <div
              className={`absolute top-full left-0 right-0 mt-2 rounded-lg border shadow-lg z-20 max-h-48 overflow-y-auto ${
                theme === 'dark'
                  ? 'bg-[#2a2a2a] border-gray-700'
                  : 'bg-white border-gray-300'
              }`}
            >
              {CITIES.map((cityOption: { name: string; code: string }) => (
                <button
                  key={cityOption.code}
                  onClick={() => handleCityChange(cityOption.name)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    selectedCity === cityOption.name
                      ? 'bg-rose-500 text-white'
                      : theme === 'dark'
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}
                >
                  {cityOption.name}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <div className="mt-3">
              <p
                className={`text-sm mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Finding places for this in {selectedCity}...
              </p>
              <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div
                  className="h-2 rounded-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {progress}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-6 py-3">
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className={`pb-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`h-4 w-2/3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse mb-2`} />
                <div className={`h-3 w-full rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse mb-2`} />
                <div className={`h-3 w-1/3 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} animate-pulse`} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            className={`text-center py-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <p>Unable to find venues. Please try again.</p>
          </div>
        ) : venues.length === 0 ? (
          <div
            className={`text-center py-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <p>No venues found for this date idea in {selectedCity}.</p>
          </div>
        ) : (
          <div>
            {venues.map((venue, index) => (
              <div
                key={index}
                className={`py-3 border-b ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold mb-1 line-clamp-1 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {venue.name}
                    </h3>
                    <p
                      className={`text-sm mb-1 line-clamp-1 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {venue.description}
                    </p>
                    <p
                      className={`text-xs uppercase tracking-wide ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                      }`}
                    >
                      {venue.type}
                    </p>
                  </div>
                  <a
                    href={venue.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-full shrink-0 transition-colors flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  if (isDesktop) {
    if (!isOpen) {
      return null;
    }

    return (
      <aside
        className={`${
          theme === 'dark' ? 'bg-[#2a2a2a] border-gray-700' : 'bg-white border-gray-200'
        } fixed top-[73px] right-0 z-50 h-[calc(100vh-73px)] w-[430px] max-w-[42vw] border-l shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          <PanelBody />
        </div>
      </aside>
    );
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DrawerContent
        className={`${
          theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-white'
        } flex flex-col h-[85vh]`}
      >
        <PanelBody />
      </DrawerContent>
    </Drawer>
  );
};

export default VenueDrawer;
