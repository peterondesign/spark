"use client";

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';

interface GetYourGuideProps {
  dateIdea: any;
  userCity?: string | null;
}

const GetYourGuideActivities = ({ dateIdea, userCity }: GetYourGuideProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  // Form the search query based on date idea and location
  const getSearchQuery = () => {
    let query = dateIdea.title || '';
    if (dateIdea.category) {
      query += ` ${dateIdea.category}`;
    }
    if (userCity) {
      query += ` in ${userCity}`;
    }
    return query;
  };

  useEffect(() => {
    if (!scriptLoaded) return;
    
    const query = getSearchQuery();
    
    // Check if the container is available
    if (widgetContainerRef.current) {
      // Clear previous widget
      widgetContainerRef.current.innerHTML = '';
      
      try {
        // Call the GetYourGuide widget API
        // @ts-ignore - GetYourGuide global object
        if (window.gyg && window.gyg.widgets) {
          // @ts-ignore - GetYourGuide global object
          window.gyg.widgets.activities.initialize({
            widgetId: "7609995B-F4F0-F684-7F9B-9AAEA729591C",
            widgetType: "activities",
            itemCount: 6,
            layout: "grid",
            columns: 3,
            theme: "light",
            partner: null,
            useExternalCss: false,
            displayMode: "search",
            showAllActivities: false,
            searchString: query,
            container: widgetContainerRef.current
          });
          
          setIsLoading(false);
        } else {
          console.error("GetYourGuide widget API is not available");
        }
      } catch (error) {
        console.error("Error initializing GetYourGuide widget", error);
        setIsLoading(false);
      }
    }
  }, [dateIdea, userCity, scriptLoaded]);

  return (
    <div className="getyourguide-widget-container">
      <Script 
        src="https://widget.getyourguide.com/dist/js/widget.js"
        strategy="lazyOnload"
        onLoad={() => {
          setScriptLoaded(true);
        }}
        onError={(e) => {
          console.error("Failed to load GetYourGuide widget script", e);
          setIsLoading(false);
        }}
      />
      
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
        </div>
      )}
      
      <div 
        ref={widgetContainerRef}
        className="w-full min-h-[300px]"
        id="gyg-widget-container"
      ></div>
      
      {/* Fallback for direct link */}
      <div className="text-center mt-6">
        <a 
          href={`https://www.getyourguide.com/s?q=${encodeURIComponent(getSearchQuery())}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-rose-500 text-white font-medium rounded-lg hover:bg-rose-600 transition-colors"
        >
          View all activities on GetYourGuide
        </a>
      </div>
    </div>
  );
};

export default GetYourGuideActivities;