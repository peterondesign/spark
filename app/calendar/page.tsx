"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer, Event, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import { supabase } from "@/utils/supabaseClient";
import Header from '../components/Header';
import Footer from '../components/Footer';
import FavoritesAccordion from '../components/FavoritesAccordion';
import PageTitle from '../components/PageTitle';
import { PAGE_TITLES } from '../utils/titleUtils';
import Image from 'next/image';
import { useClipboard } from 'use-clipboard-copy';
import { gapi } from 'gapi-script';
import { favoritesService } from '../services/favoritesService';

import { DateIdea } from '../services/favoritesService';

// Using the imported DateIdea type directly instead of creating a local interface

interface CalendarEvent extends Event {
  dateIdea?: DateIdea;
  id: string;
  allDay?: boolean;
}

const CalendarPage: React.FC = () => {
  const localizer = momentLocalizer(moment);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [myFavorites, setMyFavorites] = useState<DateIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const calendarRef = useRef<HTMLDivElement>(null);
  const clipboard = useClipboard();
  const [partnerId, setPartnerId] = useState('');
  const [calendarId, setCalendarId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DateIdea[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        const savedIdeas = localStorage.getItem('savedDateIdeas');
        if (savedIdeas) {
          setMyFavorites(JSON.parse(savedIdeas));
        }
        const savedEvents = localStorage.getItem('calendarEvents');
        if (savedEvents) {
          setEvents(JSON.parse(savedEvents));
        }
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    const deviceId = localStorage.getItem('device_id');
    if (deviceId) {
      setCalendarId(deviceId);
    }
  }, []);

  const handleCopyId = () => {
    clipboard.copy(calendarId);
    alert('Calendar ID copied to clipboard!');
  };

  const handlePartnerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartnerId(e.target.value);
  };

  const handleGoogleCalendarExport = async () => {
    try {
      const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
      const SCOPES = "https://www.googleapis.com/auth/calendar.events";

      gapi.load('client:auth2', async () => {
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
          scope: SCOPES,
        });

        const authInstance = gapi.auth2.getAuthInstance();
        if (!authInstance.isSignedIn.get()) {
          await authInstance.signIn();
        }

        const calendarEvents = events.map(event => {
          if (!event.start || !event.end) {
            console.warn(`Skipping event with missing start or end time: ${event.title}`);
            return null;
          }
          return {
            summary: event.title,
            start: { dateTime: event.start.toISOString() },
            end: { dateTime: event.end.toISOString() },
          };
        }).filter(Boolean); // Filter out null values

        for (const event of calendarEvents) {
          await gapi.client.calendar.events.insert({
            calendarId: 'primary',
            resource: event,
          });
        }

        alert('Events exported to Google Calendar successfully!');
      });
    } catch (error) {
      console.error('Error exporting to Google Calendar:', error);
      alert('Failed to export events to Google Calendar.');
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const results = myFavorites.filter(idea =>
        idea.title.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching date ideas:', error);
    }
  };

  const handleAddToFavorites = async (dateIdea: DateIdea) => {
    try {
      await favoritesService.saveFavorite(dateIdea);
      setMyFavorites((prev) => [...prev, dateIdea]);
      alert(`${dateIdea.title} added to favorites!`);
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const handleRemoveEvent = (e: React.MouseEvent, eventId: string) => {
      e.stopPropagation();
      setEvents(prevEvents => prevEvents.filter(ev => ev.id !== eventId));
    };

    const dateIdea = event.dateIdea;
    if (!dateIdea) return <div className="px-3 py-2 text-gray-700">{event.title}</div>;

    return (
      <div className="relative group calendar-event transform transition-transform duration-200 hover:scale-[1.02]">
        <div className="px-3 py-2 flex items-center gap-3 bg-white rounded-lg shadow-sm">
          <div className="relative h-10 w-10 flex-shrink-0 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <Image
              src={dateIdea.image || "/placeholder-date.jpg"}
              alt={dateIdea.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="truncate text-sm font-medium text-gray-800 block">{event.title}</span>
          </div>
        </div>
        <button
          onClick={(e) => handleRemoveEvent(e, event.id)}
          className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:bg-red-50"
          aria-label="Remove event"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />

      <main className="max-w-[1400px] mx-auto py-16 px-6 lg:px-16">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
            Your Interactive Date Planning Calendar
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
            Welcome to your personal Date Night Calendar - the perfect way to plan, organize, and remember your most special moments together.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <div className="flex items-center text-rose-700">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
              </svg>
              <span>Plan Together</span>
            </div>
            <div className="flex items-center text-rose-700">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
              </svg>
              <span>Create Memories</span>
            </div>
            <div className="flex items-center text-rose-700">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
              </svg>
              <span>Stay Connected</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Date Ideas</h3>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search for date ideas..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          {searchResults.length > 0 && (
            <ul className="mt-4 bg-white border border-gray-200 rounded-lg shadow-md">
              {searchResults.map((idea) => (
                <li
                  key={idea.id}
                  className="px-4 py-2 hover:bg-gray-100 flex justify-between items-center"
                >
                  <span>{idea.title}</span>
                  <button
                    onClick={() => handleAddToFavorites(idea)}
                    className="px-3 py-1 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Panel - Favorites */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">My Favorites</h3>
                  <FavoritesAccordion
                    title=""
                    items={myFavorites}
                    defaultOpen={true}
                    isLoading={isLoading}
                  />
                </div>

                {/* Partner's Favorites Section */}
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Partner's Favorites</h3>
                  {/* Partner favorites component would go here */}
                </div>

                {/* Joint Favorites Section */}
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Joint Favorites</h3>
                  {/* Joint favorites component would go here */}
                </div>
              </div>
            </div>

            {/* Calendar ID Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
              <h3 className="text-lg font-semibold text-gray-900">Calendar ID</h3>
              <div className="flex items-center gap-4 mt-4">
                <input
                  type="text"
                  value={calendarId}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  onClick={handleCopyId}
                  className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                >
                  Copy
                </button>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mt-6">Partner's Calendar ID</h3>
              <input
                type="text"
                value={partnerId}
                onChange={handlePartnerIdChange}
                placeholder="Enter partner's Calendar ID"
                className="w-full px-4 py-2 mt-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Benefits Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Benefits of Regular Date Nights</h3>
              <ul className="space-y-3">
                {[
                  "Strengthens emotional bonds and intimacy",
                  "Creates new shared experiences",
                  "Reduces relationship stress",
                  "Improves communication",
                  "Increases relationship satisfaction"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-rose-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-600">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Calendar Section */}
          <div ref={calendarRef} className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <Calendar
                localizer={localizer}
                events={events}
                defaultView="month"
                startAccessor="start"
                endAccessor="end"
                style={{ height: 700 }}
                className="font-light"
                views={[Views.MONTH, Views.WEEK]}
                components={{
                  event: EventComponent
                }}
                popup
              />
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleGoogleCalendarExport}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Export to Google Calendar
              </button>
            </div>

            {/* How to Use Guide */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">How to Use Your Calendar</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-gray-600">
                    Get started by browsing your favorite date ideas in the panel to the left. Simply drag your chosen date idea to your preferred day on the calendar.
                  </p>
                  <div className="flex flex-col space-y-3">
                    <h4 className="font-medium text-gray-900">Calendar Features:</h4>
                    <ul className="space-y-2">
                      {[
                        "Drag-and-drop date planning interface",
                        "Monthly and weekly calendar views",
                        "Visual previews of each date idea",
                        "Automatic local storage of your planned dates",
                        "Time-specific scheduling options"
                      ].map((feature, index) => (
                        <li key={index} className="flex items-center text-gray-600">
                          <svg className="w-4 h-4 text-rose-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="relative h-48 md:h-full min-h-[200px] rounded-xl overflow-hidden">
                  <Image
                    src="/placeholder.jpg"
                    alt="Couple enjoying a date"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CalendarPage;
