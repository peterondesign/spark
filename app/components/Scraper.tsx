'use client';

import { useState, useEffect } from 'react';

interface ScraperProps {
  url?: string;
  slug?: string;
  city?: string;
}

interface ActivityResult {
  title: string;
  url: string;
  image?: string;
  price?: string;
  rating?: string;
  description?: string;
}

interface ScrapedContent {
  searchUrl: string;
  results: ActivityResult[];
  title?: string;
  description?: string;
}

export default function Scraper({ url, slug, city }: ScraperProps) {
  const [result, setResult] = useState<ScrapedContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>('direct');
  const [criticalOperation, setCriticalOperation] = useState<boolean>(true);
  const [loadingStage, setLoadingStage] = useState<string>('initializing');

  useEffect(() => {
    async function fetchData() {
      if (!url && (!slug || !city)) return;
      
      setLoading(true);
      setError(null);
      setResult(null);
      setSource('direct');
      setLoadingStage('initializing');
      
      try {
        // Show critical operation banner
        setCriticalOperation(true);
        setLoadingStage('preparing request');
        
        // Validate inputs
        if (url) {
          try {
            new URL(url);
          } catch {
            throw new Error('Invalid URL');
          }
        }
        
        // Set up request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for Python
        
        console.log(`Fetching data for ${url ? `URL: ${url}` : `${slug} in ${city}`}`);
        setLoadingStage('dispatching browser');
        
        // Prepare request body with all available parameters
        const body: any = {};
        if (url) body.url = url;
        if (slug) body.slug = slug;
        if (city) body.city = city;
        
        // Use the API
        setLoadingStage('executing browser automation');
        const response = await fetch('/api/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(body),
          signal: controller.signal,
          cache: 'no-store'
        });
        
        clearTimeout(timeoutId);
        
        console.log(`Response status: ${response.status}`);
        setLoadingStage('processing results');
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          setError(`Failed to fetch data: ${response.status} - ${errorText}`); // Improved error message
          return; // Stop processing on error
        }
        
        // Get the text response first
        const responseText = await response.text();
        
        // Try to parse as JSON
        let data;
        try {
          data = JSON.parse(responseText);
          if (!data.success) { // Simplified success check
            throw new Error(data.error || 'Invalid response format');
          }
          setResult(data.data);
          
          // Check if this came from alternative source
          if (data.source) {
            setSource(data.source);
          }
          
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          setError('Failed to parse server response');
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          setError('Request timed out. The server took too long to respond.');
        } else {
          setError(err instanceof Error ? err.message : 'Something went wrong');
        }
        console.error('Scraping error:', err);
      } finally {
        setLoading(false);
        setLoadingStage('complete');
      }
    }

    fetchData();
  }, [url, slug, city]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-amber-700 font-medium">
                Critical operation in progress. Please do not refresh the page.
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Current stage: {loadingStage} {loadingStage === 'executing browser automation' && '(this may take up to 30 seconds)'}
              </p>
            </div>
          </div>
        </div>
        <div className="animate-pulse p-4 bg-gray-50 rounded-lg">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-40 bg-gray-200 rounded w-full mt-4"></div>
          <div className="mt-4 flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" style={{width: '70%'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="space-y-6 bg-white rounded-lg border border-gray-200 p-6">
      {source === 'alternative' && (
        <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm mb-4">
          Using alternative data source due to access restrictions on the original site
        </div>
      )}
      
      {result.title && (
        <h2 className="text-2xl font-bold text-gray-900">{result.title}</h2>
      )}
      
      {result.description && (
        <div className="prose text-gray-600">
          <p className="text-lg leading-relaxed">{result.description}</p>
        </div>
      )}
      
      {result.results && result.results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {result.results.slice(0, 3).map((item, index) => (
            <div key={index} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {item.image && (
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-48 object-cover" 
                  onError={(e) => {
                    // Handle image loading errors
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 text-gray-900">{item.title}</h3>
                
                {item.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.description}</p>
                )}
                
                <div className="flex justify-between items-center">
                  {item.price && (
                    <span className="text-green-700 font-medium">{item.price}</span>
                  )}
                  {item.rating && (
                    <span className="text-amber-500">★ {item.rating}</span>
                  )}
                </div>
                
                <div className="mt-4">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No results found</p>
        </div>
      )}
      
      <p className="text-xs text-gray-400 mt-6">
        Source: {result.searchUrl}
      </p>
    </div>
  );
}