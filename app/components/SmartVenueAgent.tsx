"use client";

import React, { useState } from 'react';
import { Search, MapPin, Star, Phone, Clock, ExternalLink, Filter, Zap } from 'lucide-react';

interface Venue {
  title: string;
  url: string;
  description: string;
  location: string;
  phone?: string;
  rating?: number;
  hours?: string;
  source: string;
  confidence: number;
  searchRank: number;
  lastUpdated: string;
  id?: string;
  snippet?: string;
}

interface SearchResponse {
  venues: Venue[];
  searchMetadata: {
    query: string;
    resultsFound: number;
    searchTimestamp: string;
    sources: string[];
    responseType: string;
  };
  agentMetadata: {
    agent: string;
    version: string;
    processingTime: number;
    cacheHit: boolean;
    searchMethod: string;
    filteringEnabled: boolean;
    venueExtractionEnabled: boolean;
  };
}

const SmartVenueAgent: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/smart-venue-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Search failed');
      }
      
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-background">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Smart Venue Agent</h1>
            <p className="text-muted-foreground">Autonomous Google search with smart venue filtering</p>
          </div>
        </div>
        
        {/* Search Interface */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., 'Arcade night in Lisbon', 'Rooftop bars in Paris'"
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search
              </>
            )}
          </button>
        </div>
        
        {/* Example Queries */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Try:</span>
          {['Arcade night in Lisbon', 'Rooftop restaurants Paris', 'Jazz clubs NYC'].map((example) => (
            <button
              key={example}
              onClick={() => setQuery(example)}
              className="text-sm px-3 py-1 bg-muted hover:bg-muted/80 rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Search Metadata */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">Search Results</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Filter className="w-4 h-4" />
                  {results.agentMetadata.filteringEnabled ? 'Smart Filtered' : 'Unfiltered'}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  {results.agentMetadata.processingTime}ms
                </span>
                {results.agentMetadata.cacheHit && (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs">
                    Cached
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Query:</span>
                <p className="font-medium text-foreground">{results.searchMetadata.query}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Results:</span>
                <p className="font-medium text-foreground">{results.searchMetadata.resultsFound} venues</p>
              </div>
              <div>
                <span className="text-muted-foreground">Method:</span>
                <p className="font-medium text-foreground">{results.agentMetadata.searchMethod}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Type:</span>
                <p className="font-medium text-foreground">
                  {results.searchMetadata.responseType === 'live_search' ? 'Live Data' : 'Fallback'}
                </p>
              </div>
            </div>
          </div>

          {/* Venue Cards */}
          <div className="grid gap-4">
            {results.venues.map((venue, index) => (
              <div key={venue.id || index} className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{venue.title}</h3>
                      <span className="text-sm text-muted-foreground">#{venue.searchRank}</span>
                      <span className={`text-xs px-2 py-1 rounded-full bg-muted ${getConfidenceColor(venue.confidence)}`}>
                        {getConfidenceLabel(venue.confidence)} confidence
                      </span>
                    </div>
                    
                    {venue.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-foreground">{venue.rating}</span>
                        <span className="text-sm text-muted-foreground">rating</span>
                      </div>
                    )}
                  </div>
                  
                  <a
                    href={venue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Visit
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                
                <p className="text-muted-foreground mb-4 leading-relaxed">{venue.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {venue.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{venue.location}</span>
                    </div>
                  )}
                  
                  {venue.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${venue.phone}`} className="text-blue-600 hover:underline">
                        {venue.phone}
                      </a>
                    </div>
                  )}
                  
                  {venue.hours && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">{venue.hours}</span>
                    </div>
                  )}
                </div>
                
                {venue.snippet && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Search excerpt:</span> {venue.snippet}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {results.venues.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No venues found for your query. Try a different search term.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartVenueAgent;
