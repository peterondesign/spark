# Web Browsing Agent API

## Overview

The Web Browsing Agent is an elite 0.1% AI-powered system that simulates real-time web browsing to find current activity and event data. It uses OpenAI's GPT-4 model to generate realistic, structured data about local activities with URLs, images, dates, and pricing.

## Features

- 🤖 **AI-Powered**: Uses GPT-4 for intelligent data generation
- 🌐 **Real-time Simulation**: Mimics browsing popular platforms like Eventbrite, Facebook Events, Meetup
- 📸 **High-Quality Images**: Provides Unsplash URLs for professional imagery
- 📅 **Current Dating**: Generates activities with realistic dates and times
- 💰 **Market Pricing**: Includes realistic pricing based on city and activity type
- 🎯 **Structured Output**: Returns consistent JSON format for easy integration

## API Endpoints

### POST /api/web-browsing-agent

Searches for activities in a specific city.

**Request Body:**
```json
{
  "activity": "wine tasting",
  "city": "Napa Valley"
}
```

**Response:**
```json
{
  "activities": [
    {
      "id": "1749493576886-0",
      "url": "https://napavalleywineries.com/events/summer-taste-2025",
      "image": "https://images.unsplash.com/photo-1556909115-3c8c6e48e3a9?w=800&q=80",
      "title": "Summer Taste Celebration - Calistoga Vineyards",
      "datetime": "Saturday June 14, 2:00 PM",
      "description": "Join us for an exclusive summer wine tasting event...",
      "category": "wine tasting",
      "location": "Calistoga Vineyards, North Napa Valley",
      "price": "$55 per person",
      "searchRank": 1,
      "confidence": 0.7570032380743731,
      "lastUpdated": "2025-06-09T18:26:16.886Z"
    }
  ],
  "searchMetadata": {
    "query": "wine tasting in Napa Valley",
    "resultsFound": 5,
    "searchTimestamp": "2025-06-09T18:25:43.174Z",
    "sources": ["eventbrite", "facebook", "meetup", "yelp", "local venues"]
  },
  "agentMetadata": {
    "model": "gpt-4-turbo-preview",
    "agentVersion": "0.1%",
    "processingTime": 1749493576886,
    "city": "Napa Valley",
    "activityType": "wine tasting"
  }
}
```

### GET /api/test-openai

Tests the OpenAI API connection.

**Response:**
```json
{
  "status": "success",
  "message": "OpenAI API is working correctly",
  "hasApiKey": true,
  "model": "gpt-3.5-turbo",
  "response": "Hello! The API is working correctly.",
  "timestamp": "2025-06-09T18:26:16.886Z"
}
```

## React Hook Usage

```typescript
import { useWebBrowsingAgent } from '../hooks/useWebBrowsingAgent';

function MyComponent() {
  const { searchActivities, loading, error, lastResponse } = useWebBrowsingAgent();

  const handleSearch = async () => {
    const result = await searchActivities('cooking class', 'New York');
    if (result) {
      console.log('Found activities:', result.activities);
    }
  };

  return (
    <div>
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Find Activities'}
      </button>
      {error && <p>Error: {error}</p>}
      {lastResponse && (
        <div>
          {lastResponse.activities.map(activity => (
            <div key={activity.id}>
              <h3>{activity.title}</h3>
              <p>{activity.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Component Integration

```tsx
import WebBrowsingIntegration from '../components/WebBrowsingIntegration';

function DateIdeaPage() {
  return (
    <div>
      <h1>Wine Tasting in Napa</h1>
      <WebBrowsingIntegration 
        activity="wine tasting"
        city="Napa Valley"
        onActivitiesFound={(activities) => console.log(activities)}
      />
    </div>
  );
}
```

## Environment Setup

Add your OpenAI API key to `.env.local`:

```bash
OPENAI_API_KEY=sk-proj-your-api-key-here
```

## Testing

Run the test script to verify functionality:

```bash
node test-web-browsing-agent.js
```

Or test individual endpoints:

```bash
# Test web browsing agent
curl -X POST http://localhost:3001/api/web-browsing-agent \
  -H "Content-Type: application/json" \
  -d '{"activity": "hiking", "city": "Denver"}'

# Test OpenAI connection  
curl http://localhost:3001/api/test-openai
```

## Supported Activity Types

The agent works with any activity type, including:

- 🍷 Wine tasting
- 🥘 Cooking classes  
- 🥾 Hiking
- 🎨 Art galleries
- 🎵 Live music
- 🍕 Food tours
- 🎭 Theater shows
- 🏛️ Museums
- And many more...

## Data Quality

- **URLs**: Realistic event platform URLs (eventbrite.com, facebook.com/events, meetup.com)
- **Images**: High-quality Unsplash photos relevant to the activity
- **Dates**: Current and upcoming dates with specific times
- **Locations**: Specific venues and neighborhoods
- **Pricing**: Market-appropriate pricing for each city
- **Descriptions**: Compelling 2-3 sentence descriptions with practical details

## Rate Limiting

The API uses OpenAI's rate limits. For production use, consider implementing:

- Request caching
- Rate limiting middleware
- Error retry logic
- Response caching for popular queries
