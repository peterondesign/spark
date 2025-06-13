"use client";

import SmartVenueAgent from '@/app/components/SmartVenueAgent';
import Header from '@/app/components/sections/Header';
import Footer from '@/app/components/Footer';

export default function SmartVenueAgentPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-24 max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Smart Venue Agent
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Autonomous Google search agent that finds direct venue links, filters out blogs and listicles, 
            and extracts clean venue data including ratings, hours, and contact information.
          </p>
        </div>
        
        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Smart Google Search</h3>
            <p className="text-muted-foreground">Enhanced query processing and Google search with intelligent result filtering</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Advanced Filtering</h3>
            <p className="text-muted-foreground">Automatically filters out blogs, listicles, and irrelevant results to find direct venue links</p>
          </div>
          
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Data Extraction</h3>
            <p className="text-muted-foreground">Extracts venue details like ratings, hours, phone numbers, and addresses from web pages</p>
          </div>
        </div>
        
        <SmartVenueAgent />
        
        {/* API Documentation */}
        <div className="mt-12 bg-card border border-border rounded-lg p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">API Documentation</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Endpoint</h3>
              <code className="block bg-muted p-3 rounded text-sm">
                POST /api/smart-venue-agent
              </code>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Request Body</h3>
              <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`{
  "query": "Arcade night in Lisbon"
}`}</pre>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Response Example</h3>
              <pre className="bg-muted p-4 rounded text-sm overflow-x-auto max-h-96">
{`{
  "venues": [
    {
      "title": "FunBox Arcade - Retro Gaming Experience",
      "url": "https://funboxarcade.pt/",
      "description": "Classic and modern arcade games in the heart of Lisbon...",
      "location": "Rua do Arsenal 15, 1100-038 Lisboa",
      "phone": "+351 21 123 4567",
      "rating": 4.5,
      "hours": "Mon-Sun: 2PM-12AM",
      "source": "direct_venue",
      "confidence": 0.9,
      "searchRank": 1
    }
  ],
  "searchMetadata": {
    "query": "Arcade night in Lisbon",
    "resultsFound": 3,
    "searchTimestamp": "2025-06-10T08:30:00.000Z",
    "sources": ["smart_google_search", "venue_extraction"],
    "responseType": "live_search"
  },
  "agentMetadata": {
    "agent": "smart-venue-agent",
    "version": "1.0.0",
    "processingTime": 2340,
    "cacheHit": false,
    "searchMethod": "enhanced_google_search",
    "filteringEnabled": true,
    "venueExtractionEnabled": true
  }
}`}</pre>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Setup Requirements</h3>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-4">
                <p className="text-yellow-800 dark:text-yellow-200 mb-2">
                  <strong>Google Search API Setup:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                  <li>Create a Google Cloud Project</li>
                  <li>Enable the Custom Search API</li>
                  <li>Create a Custom Search Engine at <code>cse.google.com</code></li>
                  <li>Add environment variables: <code>GOOGLE_SEARCH_API_KEY</code> and <code>GOOGLE_SEARCH_ENGINE_ID</code></li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
