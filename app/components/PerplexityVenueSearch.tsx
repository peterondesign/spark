"use client";

import React, { useState } from 'react';
import { Search, MapPin, Star, Phone, Clock, ExternalLink, Zap, Heart } from 'lucide-react';

interface Venue {
  name: string;
  address: string;
  description: string;
  website?: string;
  phone?: string;
  rating?: number;
  priceRange?: string;
  hours?: string;
  category: string;
  confidence: number;
}

interface SearchResponse {
  venues: Venue[];
  searchMetadata: {
    query: string;
    city: string;
    dateIdea: string;
    resultsFound: number;
    searchTimestamp: string;
    responseType: 'live_search' | 'cached';
  };
  agentMetadata: {
    agent: string;
    version: string;
    processingTime: number;
    cacheHit: boolean;
    searchMethod: string;
  };
}

interface PerplexityVenueSearchProps {
  dateIdea?: string;
  city?: string;
  className?: string;
  autoSearch?: boolean;
}

const PerplexityVenueSearch: React.FC<PerplexityVenueSearchProps> = ({ 
  dateIdea: initialDateIdea = '',
  city: initialCity = '',
  className = '',
  autoSearch = false
}) => {
  const [dateIdea, setDateIdea] = useState(initialDateIdea);
  const [city, setCity] = useState(initialCity);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-search effect
  React.useEffect(() => {
    if (autoSearch && dateIdea.trim() && city.trim() && !loading && !results) {
      handleSearch();
    }
  }, [autoSearch, dateIdea, city]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async () => {
    if (!dateIdea.trim() || !city.trim()) {
      setError('Please enter both a date idea and city');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/perplexity-venue-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateIdea: dateIdea.trim(),
          city: city.trim()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to search for venues. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Header - Compact when auto-search is enabled */}
      {!autoSearch && (
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Perplexity Venue Search
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find real venues for your date ideas using AI-powered search. Enter a date activity and city to discover authentic local spots.
          </p>
        </div>
      )}

      {/* Search Form - Hidden when auto-search */}
      {!autoSearch && (
        <div className="bg-card border border-border rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Date Idea
              </label>
              <input
                type="text"
                value={dateIdea}
                onChange={(e) => setDateIdea(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., arcade, museum, restaurant, coffee shop..."
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., New York, London, Tokyo..."
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !dateIdea.trim() || !city.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Find Venues
              </>
            )}
          </button>
        </div>
      )}

      {/* Loading indicator for auto-search */}
      {autoSearch && loading && !results && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Finding venues for {dateIdea} in {city}...</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div>
          {/* Search Metadata */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-blue-700 dark:text-blue-300">
                <strong>{results.searchMetadata.resultsFound}</strong> venues found
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                {results.agentMetadata.processingTime}ms
              </span>
              {results.agentMetadata.cacheHit && (
                <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                  Cached ⚡
                </span>
              )}
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded">
                {results.agentMetadata.searchMethod}
              </span>
            </div>
          </div>

          {/* Venues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.venues.map((venue, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Venue Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">
                      {venue.name}
                    </h3>
                    
                    {venue.rating && (
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {renderStars(venue.rating)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {venue.rating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(venue.confidence)}`}>
                    {getConfidenceLabel(venue.confidence)}
                  </span>
                </div>

                {/* Venue Details */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{venue.address}</p>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {venue.description}
                  </p>

                  <div className="grid grid-cols-1 gap-2">
                    {venue.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{venue.phone}</span>
                      </div>
                    )}

                    {venue.hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{venue.hours}</span>
                      </div>
                    )}

                    {venue.priceRange && (
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">{venue.priceRange}</span>
                      </div>
                    )}
                  </div>

                  {venue.website && (
                    <a
                      href={venue.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm font-medium mt-3"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Website
                    </a>
                  )}
                </div>

                {/* Category Badge */}
                <div className="mt-4 pt-4 border-t border-border">
                  <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 text-xs font-medium rounded-full">
                    {venue.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {results.venues.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No venues found for "{results.searchMetadata.dateIdea}" in {results.searchMetadata.city}.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try a different date idea or city.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Features */}
      {!results && !autoSearch && (
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">AI-Powered Search</h3>
            <p className="text-muted-foreground">
              Uses Perplexity AI to find real, current venues with accurate information and reviews.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Local Venues</h3>
            <p className="text-muted-foreground">
              Discovers authentic local spots with addresses, phone numbers, and operating hours.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Date Perfect</h3>
            <p className="text-muted-foreground">
              Tailored specifically for date activities with ratings and price information.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerplexityVenueSearch;
