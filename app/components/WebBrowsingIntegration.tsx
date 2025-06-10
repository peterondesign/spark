"use client";

import { useState } from 'react';
import { useWebBrowsingAgent, formatActivityForDisplay } from '../hooks/useWebBrowsingAgent';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Clock, MapPin, DollarSign, Bot, Sparkles } from 'lucide-react';

interface WebBrowsingIntegrationProps {
  activity: string;
  city: string;
  onActivitiesFound?: (activities: any[]) => void;
}

export default function WebBrowsingIntegration({ 
  activity, 
  city, 
  onActivitiesFound 
}: WebBrowsingIntegrationProps) {
  const { searchActivities, loading, error, lastResponse } = useWebBrowsingAgent();
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setHasSearched(true);
    const result = await searchActivities(activity, city);
    if (result && onActivitiesFound) {
      onActivitiesFound(result.activities);
    }
  };

  return (
    <div className="bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-rose-200 dark:border-rose-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              AI Web Browser
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </h3>
            <p className="text-sm text-muted-foreground">
              Find real-time {activity} activities in {city}
            </p>
          </div>
        </div>
        
        {!hasSearched && (
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            {loading ? 'Searching...' : 'Find Live Events'}
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-500"></div>
            <span className="text-sm font-medium">AI agent browsing the web...</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card rounded-lg p-4 border border-border">
                <div className="animate-pulse">
                  <div className="h-32 bg-muted rounded mb-3"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <span>⚠️</span>
            <span className="text-sm font-medium">Search failed: {error}</span>
          </div>
          <button
            onClick={() => setHasSearched(false)}
            className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Results */}
      {lastResponse && lastResponse.activities.length > 0 && (
        <div className="space-y-6">
          {/* Metadata */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Search Results
              </span>
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <div>Found {lastResponse.searchMetadata.resultsFound} activities</div>
              <div>Sources: {lastResponse.searchMetadata.sources.join(', ')}</div>
            </div>
          </div>

          {/* Activities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {lastResponse.activities.slice(0, 4).map((activity) => {
              const formatted = formatActivityForDisplay(activity);
              return (
                <div
                  key={activity.id}
                  className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow group"
                >
                  {/* Image */}
                  <div className="relative h-32">
                    <Image
                      src={activity.image}
                      alt={activity.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.jpg';
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 text-xs bg-black/70 text-white rounded-full">
                        Live Event
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
                      {activity.title}
                    </h4>
                    
                    <div className="space-y-1 mb-3 text-xs text-muted-foreground">
                      {activity.datetime && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{activity.datetime}</span>
                        </div>
                      )}
                      
                      {activity.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{activity.location}</span>
                        </div>
                      )}
                      
                      {activity.price && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span>{activity.price}</span>
                        </div>
                      )}
                    </div>

                    <Link
                      href={activity.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium"
                    >
                      View Event
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* View All Button */}
          {lastResponse.activities.length > 4 && (
            <div className="text-center">
              <Link
                href={`/web-browsing-agent?activity=${encodeURIComponent(activity)}&city=${encodeURIComponent(city)}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
              >
                View All {lastResponse.activities.length} Events
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {lastResponse && lastResponse.activities.length === 0 && (
        <div className="text-center py-6">
          <div className="text-muted-foreground">
            <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No live events found for {activity} in {city}</p>
            <button
              onClick={() => setHasSearched(false)}
              className="mt-2 text-sm text-rose-600 dark:text-rose-400 underline hover:no-underline"
            >
              Try another search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
