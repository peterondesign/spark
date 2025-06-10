"use client";

import { useState } from 'react';
import { useWebBrowsingAgent, formatActivityForDisplay } from '../hooks/useWebBrowsingAgent';
import Image from 'next/image';
import Link from 'next/link';
import { Search, ExternalLink, Clock, MapPin, DollarSign, Sparkles, Bot } from 'lucide-react';

export default function WebBrowsingAgentDemo() {
  const { searchActivities, loading, error, lastResponse } = useWebBrowsingAgent();
  const [activity, setActivity] = useState('');
  const [city, setCity] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activity.trim() && city.trim()) {
      await searchActivities(activity.trim(), city.trim());
    }
  };

  const popularSearches = [
    { activity: 'wine tasting', city: 'Napa Valley' },
    { activity: 'cooking class', city: 'New York' },
    { activity: 'hiking', city: 'Denver' },
    { activity: 'art gallery', city: 'Los Angeles' },
    { activity: 'live music', city: 'Austin' },
    { activity: 'food tour', city: 'San Francisco' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="w-8 h-8 text-rose-500" />
            <h1 className="text-4xl font-bold text-foreground">
              Web Browsing Agent
            </h1>
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Elite 0.1% AI agent that browses the web to find real-time activity data with URLs, images, dates, and pricing
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-card rounded-lg p-8 shadow-sm border border-border mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="activity" className="block text-sm font-medium text-foreground mb-2">
                  Activity Type
                </label>
                <input
                  id="activity"
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="e.g., wine tasting, cooking class, hiking"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., San Francisco, New York, Austin"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="text-center">
              <button
                type="submit"
                disabled={loading || !activity.trim() || !city.trim()}
                className="inline-flex items-center px-8 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    AI Agent Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Search Activities
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Popular Searches */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Popular Searches:</h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActivity(search.activity);
                    setCity(search.city);
                  }}
                  className="px-3 py-1 text-sm bg-muted text-muted-foreground rounded-full hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-900/30 dark:hover:text-rose-300 transition-colors"
                >
                  {search.activity} in {search.city}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">⚠️</div>
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Search Error</h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {lastResponse && (
          <div className="space-y-8">
            {/* Search Metadata */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                  Search Results
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-700 dark:text-blue-300">Query:</span>
                  <p className="text-blue-600 dark:text-blue-400">{lastResponse.searchMetadata.query}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-700 dark:text-blue-300">Results Found:</span>
                  <p className="text-blue-600 dark:text-blue-400">{lastResponse.searchMetadata.resultsFound}</p>
                </div>
                <div>
                  <span className="font-medium text-blue-700 dark:text-blue-300">Sources:</span>
                  <p className="text-blue-600 dark:text-blue-400">{lastResponse.searchMetadata.sources.join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lastResponse.activities.map((activity) => {
                const formatted = formatActivityForDisplay(activity);
                return (
                  <div
                    key={activity.id}
                    className="bg-card rounded-lg shadow-sm border border-border overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {/* Activity Image */}
                    <div className="relative h-48">
                      <Image
                        src={activity.image}
                        alt={activity.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.jpg';
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          formatted.confidenceLabel === 'High Confidence' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : formatted.confidenceLabel === 'Medium Confidence'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {formatted.confidenceLabel}
                        </span>
                      </div>
                    </div>

                    {/* Activity Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2">
                        {activity.title}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {formatted.shortDescription}
                      </p>

                      {/* Activity Details */}
                      <div className="space-y-2 mb-4">
                        {activity.datetime && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            {formatted.formattedDateTime}
                          </div>
                        )}
                        
                        {activity.location && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2" />
                            {activity.location}
                          </div>
                        )}
                        
                        {activity.price && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <DollarSign className="w-4 h-4 mr-2" />
                            {formatted.formattedPrice}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Link
                        href={activity.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center w-full justify-center px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                      >
                        View Activity
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Results */}
        {lastResponse && lastResponse.activities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Activities Found</h3>
              <p>Try searching for a different activity or city.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
