import { useState, useCallback } from 'react';

interface ActivityResult {
  id: string;
  url: string;
  image: string;
  title: string;
  datetime?: string;
  description?: string;
  category?: string;
  location?: string;
  price?: string;
  searchRank: number;
  confidence: number;
  lastUpdated: string;
}

interface WebBrowsingResponse {
  activities: ActivityResult[];
  searchMetadata: {
    query: string;
    resultsFound: number;
    searchTimestamp: string;
    sources: string[];
    error?: boolean;
  };
  agentMetadata: {
    model: string;
    agentVersion: string;
    processingTime: number;
    city: string;
    activityType: string;
  };
}

interface UseWebBrowsingAgentReturn {
  searchActivities: (activity: string, city: string) => Promise<WebBrowsingResponse | null>;
  loading: boolean;
  error: string | null;
  lastResponse: WebBrowsingResponse | null;
}

export const useWebBrowsingAgent = (): UseWebBrowsingAgentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<WebBrowsingResponse | null>(null);

  const searchActivities = useCallback(async (
    activity: string, 
    city: string
  ): Promise<WebBrowsingResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🤖 Web Browsing Agent: Searching for "${activity}" in ${city}`);

      const response = await fetch('/api/web-browsing-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity,
          city,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data: WebBrowsingResponse = await response.json();
      
      if (data.searchMetadata.error) {
        throw new Error(data.searchMetadata.error ? 'Search failed' : 'Unknown error');
      }

      setLastResponse(data);
      console.log(`✅ Web Browsing Agent: Found ${data.activities.length} activities`);
      
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Web Browsing Agent Error:', errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    searchActivities,
    loading,
    error,
    lastResponse,
  };
};

// Helper function to format activity data for display
export const formatActivityForDisplay = (activity: ActivityResult) => {
  return {
    ...activity,
    formattedPrice: activity.price || 'Price not available',
    formattedDateTime: activity.datetime || 'Date/time TBD',
    shortDescription: activity.description 
      ? activity.description.length > 150 
        ? activity.description.substring(0, 150) + '...'
        : activity.description
      : 'No description available',
    confidenceLabel: activity.confidence >= 0.9 
      ? 'High Confidence' 
      : activity.confidence >= 0.7 
        ? 'Medium Confidence' 
        : 'Low Confidence',
    isRecent: activity.lastUpdated 
      ? new Date(activity.lastUpdated).getTime() > Date.now() - 24 * 60 * 60 * 1000
      : false,
  };
};
