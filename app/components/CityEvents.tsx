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
}

interface CityEventsProps {
  city: string;
  category: string;
}

export default function CityEvents({ city, category = 'activities' }: CityEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!city) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/cityEvents?city=${encodeURIComponent(city)}&category=${encodeURIComponent(category)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch events');
        }
        
        setEvents(data.events || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [city, category]);

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
      {events.map((event) => (
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
                From {event.price}
              </div>
            )}
          </div>
        </Link>
      ))}
      
      {events.length > 0 && (
        <div className="mt-4 text-center">
          <a 
            href={`https://www.getyourguide.com/s/?q=${encodeURIComponent(`${category} ${city}`)}&searchSource=3`}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-rose-500 hover:text-rose-700 font-medium"
          >
            View more {category.toLowerCase()} in {city} →
          </a>
        </div>
      )}
    </div>
  );
}
