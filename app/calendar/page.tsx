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
import { favoritesService } from '../services/favoritesService';
import { generateMetadata } from "../../utils/metadataUtils";
import { Toast, ToastProvider } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { Heart, Calendar as CalendarIcon, Clock, Check, Copy } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const metadata = generateMetadata({
  title: 'Date Night Calendar | Plan Your Perfect Dates',
  description: 'Organize and schedule your date ideas with our interactive date night calendar. Plan ahead, share with your partner, and never miss a special moment together.',
  path: '/calendar',
  keywords: [
    'date night planner',
    'couple calendar',
    'date scheduler',
    'relationship planning',
    'date night organizer'
  ],
});

import { DateIdea } from '../services/favoritesService';

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
  const [copiedId, setCopiedId] = useState(false);
  const [schedulingDateIdea, setSchedulingDateIdea] = useState<DateIdea | null>(null);
  const [scheduledDateTime, setScheduledDateTime] = useState<{
    date: string;
    time: string;
  }>({
    date: moment().format('YYYY-MM-DD'),
    time: '18:00',
  });
  const { toast } = useToast();

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
    setCopiedId(true);
    toast({
      title: "Copied!",
      description: "Calendar ID copied to clipboard",
    });
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handlePartnerIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartnerId(e.target.value);
  };

  const handleGoogleCalendarExport = async () => {
    if (typeof window === 'undefined') return; // Ensure this runs only in the browser

    try {
      const { gapi } = await import('gapi-script');
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
        if (!authInstance || !authInstance.isSignedIn.get()) {
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

        toast({
          title: "Success!",
          description: "Events exported to Google Calendar",
        });
      });
    } catch (error) {
      console.error('Error exporting to Google Calendar:', error);
      toast({
        title: "Export Failed",
        description: "Could not export to Google Calendar",
        variant: "destructive",
      });
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

  const isInFavorites = (dateIdea: DateIdea) => {
    return myFavorites.some(idea => idea.id === dateIdea.id);
  };

  const handleAddToFavorites = async (dateIdea: DateIdea) => {
    try {
      await favoritesService.saveFavorite(dateIdea);
      setMyFavorites((prev) => {
        if (!prev.some(idea => idea.id === dateIdea.id)) {
          return [...prev, dateIdea];
        }
        return prev;
      });
      toast({
        title: "Added to Favorites",
        description: `${dateIdea.title} added to your favorites!`,
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({
        title: "Error",
        description: "Could not add to favorites",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFromFavorites = async (dateIdea: DateIdea) => {
    try {
      await favoritesService.removeFavorite(dateIdea.id);
      setMyFavorites((prev) => prev.filter(idea => idea.id !== dateIdea.id));
      toast({
        title: "Removed",
        description: `${dateIdea.title} removed from your favorites`,
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        title: "Error",
        description: "Could not remove from favorites",
        variant: "destructive",
      });
    }
  };

  const handleScheduleDateIdea = (dateIdea: DateIdea) => {
    setSchedulingDateIdea(dateIdea);
  };

  const handleAddToCalendar = () => {
    if (!schedulingDateIdea) return;
    
    const startDateTime = moment(`${scheduledDateTime.date} ${scheduledDateTime.time}`);
    const endDateTime = moment(startDateTime).add(2, 'hours'); // Default 2 hour duration
    
    const newEvent: CalendarEvent = {
      id: `${schedulingDateIdea.id}-${Date.now()}`,
      title: schedulingDateIdea.title,
      start: startDateTime.toDate(),
      end: endDateTime.toDate(),
      dateIdea: schedulingDateIdea,
      allDay: false,
    };
    
    setEvents(prev => [...prev, newEvent]);
    setSchedulingDateIdea(null);
    
    toast({
      title: "Added to Calendar",
      description: `${schedulingDateIdea.title} scheduled for ${startDateTime.format('MMM DD, YYYY [at] h:mm A')}`,
    });
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
    <ToastProvider>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-gray-100"
            />
            {searchResults.length > 0 && (
              <ul className="mt-4 bg-white border border-gray-200 rounded-lg shadow-md">
                {searchResults.map((idea) => {
                  const isFavorite = isInFavorites(idea);
                  
                  return (
                    <li
                      key={idea.id}
                      className="px-4 py-3 hover:bg-gray-50 flex justify-between items-center border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="relative h-10 w-10 flex-shrink-0">
                          <Image
                            src={idea.image || "/placeholder-date.jpg"}
                            alt={idea.title}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <span className="font-medium text-gray-800">{idea.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
                              title="Add to calendar"
                            >
                              <CalendarIcon className="h-4 w-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-4">
                              <div className="text-sm font-medium">Schedule "{idea.title}"</div>
                              <div className="grid gap-2">
                                <label className="text-xs text-gray-500">Date</label>
                                <Input 
                                  type="date"
                                  defaultValue={scheduledDateTime.date}
                                  onChange={(e) => setScheduledDateTime(prev => ({...prev, date: e.target.value}))}
                                />
                              </div>
                              <div className="grid gap-2">
                                <label className="text-xs text-gray-500">Time</label>
                                <Input 
                                  type="time"
                                  defaultValue={scheduledDateTime.time}
                                  onChange={(e) => setScheduledDateTime(prev => ({...prev, time: e.target.value}))}
                                />
                              </div>
                              <Button 
                                className="w-full" 
                                onClick={() => {
                                  handleScheduleDateIdea(idea);
                                  handleAddToCalendar();
                                }}
                              >
                                Add to Calendar
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                        
                        {isFavorite ? (
                          <button
                            onClick={() => handleRemoveFromFavorites(idea)}
                            className="p-2 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-100"
                            title="Remove from favorites"
                          >
                            <Heart className="h-4 w-4 fill-rose-500" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddToFavorites(idea)}
                            className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-rose-50 hover:text-rose-600"
                            title="Add to favorites"
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
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
                    {partnerId ? (
                      <div>Partner's favorites will appear here</div>
                    ) : (
                      <p className="text-sm text-gray-500">Enter your partner's Calendar ID to see their favorites</p>
                    )}
                  </div>

                  {/* Joint Favorites Section */}
                  <div className="space-y-4 pt-6 border-t border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">Joint Favorites</h3>
                    {partnerId ? (
                      <div>Joint favorites will appear here</div>
                    ) : (
                      <p className="text-sm text-gray-500">Joint favorites will appear once you connect with your partner</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Calendar ID Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-6">
                <h3 className="text-lg font-semibold text-gray-900">Calendar ID</h3>
                <p className="text-sm text-gray-500 mb-2">Share this ID with your partner to connect calendars</p>
                <div className="flex items-center gap-2 mt-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={calendarId}
                      readOnly
                      className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 pr-10"
                    />
                    {copiedId && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleCopyId}
                    className={`p-2 ${copiedId ? 'bg-green-500' : 'bg-rose-500'} text-white rounded-lg hover:opacity-90 transition-colors`}
                    title="Copy ID"
                  >
                    {copiedId ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Partner's Calendar ID</h3>
                <p className="text-sm text-gray-500 mb-2">Enter your partner's ID to connect calendars</p>
                <input
                  type="text"
                  value={partnerId}
                  onChange={handlePartnerIdChange}
                  placeholder="Enter partner's Calendar ID"
                  className="w-full px-4 py-2 mt-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                    "Increases relationship satisfaction",
                    "Provides a break from routine",
                    "Enhances creativity in planning",
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
                      src="/bikeriding.webp"
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
    </ToastProvider>
  );
};

export default CalendarPage;
