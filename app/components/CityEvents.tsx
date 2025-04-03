"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import EventsLoadingSkeleton from './EventsLoadingSkeleton';

interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  price?: string;
  rating?: number;
  reviewCount?: number;
  source: string;
}

interface CityEventsProps {
  city: string;
  category: string;
}

export default function CityEvents({ city, category = 'activities' }: CityEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<string[]>([]);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [sourceStats, setSourceStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchEvents = async () => {
      if (!city) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/multiSourceEvents?city=${encodeURIComponent(city)}&category=${encodeURIComponent(category)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch events');
        }

        setEvents(data.events || []);

        if (data.sources) {
          setSources(data.sources);

          const stats: Record<string, number> = {};
          data.events.forEach((event: Event) => {
            stats[event.source] = (stats[event.source] || 0) + 1;
          });
          setSourceStats(stats);

          if (!activeSource && data.sources.length > 0) {
            setActiveSource(null);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
        setEvents([]);
        setSources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [city, category, activeSource]);

  const filteredEvents = activeSource
    ? events.filter(event => event.source === activeSource)
    : events;

  const handleSourceClick = (source: string | null) => {
    setActiveSource(source);
  };

  if (loading) {
    return <EventsLoadingSkeleton city={city} />;
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <h3 className="font-medium text-red-800">
          <span className="mr-2">⚠️</span>
          Activities Unavailable
        </h3>
        <p className="text-red-600 mt-1">{error}</p>
        <p className="text-sm text-red-500 mt-2">
          Try refreshing the page or checking back later.
        </p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-4 border border-gray-300 bg-gray-50 rounded-md">
        <h3 className="font-medium text-gray-800 mb-1">No Activities Found</h3>
        <p className="text-gray-600">
          We couldn't find any {category.toLowerCase()} activities in {city} right now.
          Try changing the category or city.
        </p>
      </div>
    );
  }

  return (
    <div>
      {sources.length > 1 && (
        <div className="mb-6 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            <button
              onClick={() => handleSourceClick(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeSource === null
                  ? 'bg-rose-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Sources ({events.length})
            </button>

            {sources.map(source => (
              <button
                key={source}
                onClick={() => handleSourceClick(source)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSource === source
                    ? 'bg-rose-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {source} ({sourceStats[source] || 0})
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredEvents.map((event) => (
          <Link
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            key={event.id}
            className="flex flex-col md:flex-row overflow-hidden border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="relative w-full md:w-1/3 h-48 md:h-auto">
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image</span>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  {event.source}
                </span>
              </div>
            </div>

            <div className="p-4 flex-1">
              <h3 className="font-bold text-lg mb-1 text-gray-800">{event.title}</h3>

              {event.rating && (
                <div className="flex items-center mb-2">
                  <div className="flex mr-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`h-4 w-4 ${star <= Math.round(event.rating!) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{typeof event.rating === 'number' ? event.rating.toFixed(1) : event.rating}</span>
                  {event.reviewCount && (
                    <span className="text-xs text-gray-500 ml-1">({event.reviewCount})</span>
                  )}
                </div>
              )}

              <p className="text-gray-600 text-sm mb-2">{event.description}</p>

              {event.price && (
                <div className="mt-auto text-green-600 font-semibold">
                  {event.price}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filteredEvents.length > 0 && (
        <div className="mt-6 space-y-2">
          {(activeSource ? [activeSource] : sources).map(source => {
            let viewMoreUrl = '';

            switch(source) {
              case 'GetYourGuide':
                viewMoreUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(`${category} ${city}`)}&searchSource=3`;
                break;
              case 'Viator':
                viewMoreUrl = `https://www.viator.com/search/${encodeURIComponent(city)}?pid=P00073920&mcid=42383&medium=link&q=${encodeURIComponent(category)}`;
                break;
              case 'Airbnb Experiences':
                viewMoreUrl = `https://www.airbnb.com/s/${encodeURIComponent(city)}/experiences?refinement_paths%5B%5D=%2Fexperiences&search_type=section_navigation&query=${encodeURIComponent(category)}`;
                break;
              case 'Eventbrite':
                viewMoreUrl = `https://www.eventbrite.com/d/${encodeURIComponent(city)}--events/?q=${encodeURIComponent(category)}`;
                break;
              default:
                viewMoreUrl = '';
            }

            if (viewMoreUrl) {
              return (
                <div key={source} className="text-center">
                  <a
                    href={viewMoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-rose-500 hover:text-rose-700 font-medium"
                  >
                    View more {category.toLowerCase()} on {source} →
                  </a>
                </div>
              );
            }
            return null;
          })}
        </div>
      )}
    </div>
  );
}
