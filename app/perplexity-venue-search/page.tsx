"use client";

import PerplexityVenueSearch from '@/app/components/PerplexityVenueSearch';
import Header from '@/app/components/sections/Header';
import Footer from '@/app/components/Footer';

export default function PerplexityVenueSearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-24 max-w-6xl">
        <PerplexityVenueSearch />
        
        {/* Example Queries */}
        <div className="mt-16 bg-gray-50 dark:bg-gray-900/20 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Try These Example Searches
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">Entertainment</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Arcade in Tokyo</li>
                <li>• Bowling in London</li>
                <li>• Escape room in New York</li>
                <li>• Karaoke in Seoul</li>
              </ul>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">Food & Drink</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Coffee shop in Paris</li>
                <li>• Rooftop bar in Miami</li>
                <li>• Wine tasting in Napa</li>
                <li>• Food truck in Portland</li>
              </ul>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">Culture & Arts</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Museum in Berlin</li>
                <li>• Jazz club in New Orleans</li>
                <li>• Art gallery in Barcelona</li>
                <li>• Comedy club in Chicago</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
