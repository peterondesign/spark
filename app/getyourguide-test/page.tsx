"use client";

import { useState } from 'react';
import PriorityVenueList from '@/app/components/PriorityVenueList';
import Header from '@/app/components/sections/Header';
import Footer from '@/app/components/sections/Footer';
import CityPicker from '@/app/components/CityPicker';

export default function GetYourGuideTestPage() {
  const [selectedCity, setSelectedCity] = useState('LISBON');
  const [selectedActivity, setSelectedActivity] = useState('Food Tour');

  const activities = ['Food Tour', 'City Tour', 'Museum Visit', 'Boat Trip', 'Walking Tour', 'Cultural Experience'];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24">
        {/* Test Controls */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-4">
                GetYourGuide Integration Test
              </h1>
              <p className="text-lg text-muted-foreground">
                Test the priority venue list with GetYourGuide recommendations
              </p>
            </div>

            {/* Test Controls */}
            <div className="bg-card rounded-lg p-6 border border-border mb-8">
              <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select City
                  </label>
                  <CityPicker selectedCity={selectedCity} onCityChange={setSelectedCity} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Activity
                  </label>
                  <select
                    value={selectedActivity}
                    onChange={(e) => setSelectedActivity(e.target.value)}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  >
                    {activities.map(activity => (
                      <option key={activity} value={activity}>{activity}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Integration Info */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-orange-800 mb-3">
                🔗 GetYourGuide Integration Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-orange-700 mb-2">Priority Features:</h4>
                  <ul className="space-y-1 text-orange-600">
                    <li>• GetYourGuide results shown first</li>
                    <li>• "RECOMMENDED" badges on all listings</li>
                    <li>• Partner ID (5QQHAHP) in all links</li>
                    <li>• 15-minute edge caching</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-orange-700 mb-2">Technical Details:</h4>
                  <ul className="space-y-1 text-orange-600">
                    <li>• Parallel API fetching</li>
                    <li>• Instant UI loading</li>
                    <li>• Deep link fallbacks</li>
                    <li>• Tailwind CSS styling</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Current Selection */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full">
                <span className="font-medium">Testing:</span>
                <span>{selectedActivity} in {selectedCity}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Priority Venue List */}
        <section className="container mx-auto px-4 pb-8">
          <PriorityVenueList 
            city={selectedCity} 
            activity={selectedActivity}
            className="max-w-6xl mx-auto"
          />
        </section>

        {/* API Documentation */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 text-gray-100 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">📋 API Implementation</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-400">GetYourGuide API Route:</h4>
                  <code className="block bg-gray-800 p-2 rounded text-sm mt-1">
                    GET /api/getyourguide?city={selectedCity}&activity={selectedActivity}&limit=6
                  </code>
                </div>
                <div>
                  <h4 className="font-medium text-blue-400">Example Partner Link:</h4>
                  <code className="block bg-gray-800 p-2 rounded text-sm mt-1 break-all">
                    https://www.getyourguide.com/s/?partner_id=5QQHAHP&lc=lisbon-l126&q={selectedActivity.replace(' ', '%20')}
                  </code>
                </div>
                <div>
                  <h4 className="font-medium text-yellow-400">Response Structure:</h4>
                  <pre className="bg-gray-800 p-2 rounded text-xs mt-1 overflow-x-auto">
{`{
  "success": true,
  "data": [
    {
      "id": "gyg_123",
      "title": "Amazing Food Tour",
      "booking_url": "https://www.getyourguide.com/activity/123?partner_id=5QQHAHP",
      "price": {"amount": 45, "currency": "EUR"},
      "rating": {"score": 4.8, "count": 324},
      "recommended": true,
      "source": "getyourguide"
    }
  ],
  "partner_id": "5QQHAHP",
  "response_time_ms": 150
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}