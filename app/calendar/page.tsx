"use client"

import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { generateMetadata } from "../../utils/metadataUtils";
import { Toast, ToastProvider } from "@/components/ui/toast";
import { supabase } from "@/utils/supabaseClient";
import Header from '../components/Header';
import Footer from '../components/Footer';


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


const localizer = momentLocalizer(moment);

export default function DateIdeasCalendar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [myFavorites, setMyFavorites] = useState<{ id: number; title?: string; description?: string; image?: string; category?: string; }[]>([]);
  const [partnerFavorites, setPartnerFavorites] = useState<{ id: number; title?: string; description?: string; image?: string; category?: string; }[]>([]);
  const [jointFavorites, setJointFavorites] = useState<{ id: number; title?: string; description?: string; image?: string; category?: string; }[]>([]);
  const [calendarView, setCalendarView] = useState('month');
  const [isMyOpen, setIsMyOpen] = useState(true);
  const [isPartnerOpen, setIsPartnerOpen] = useState(true);
  const [isJointOpen, setIsJointOpen] = useState(true);

  interface CalendarEvent {
    id: number;
    title: any;
    start: moment.MomentInput;
    end: Date;
    idea: { title: any };
  }

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  // Current date for navigation
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  // History for undo/redo
  const [pastEvents, setPastEvents] = useState<CalendarEvent[][]>([]);
  const [futureEvents, setFutureEvents] = useState<CalendarEvent[][]>([]);
  // Modal for managing scheduled dates
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to push current events into history
  const pushHistory = (newEvents: CalendarEvent[]) => {
    setPastEvents(prev => [...prev, events]);
    setFutureEvents([]);
  };

  const [partnerId, setPartnerId] = useState('');
  const [calendarId] = useState('0292df00-86dd-4f00-b2f9-54c31bd4');

  // Sample date ideas
  const dateIdeas = [
    {
      id: 1,
      title: 'Sunset Kayaking Tour',
      description: 'Paddle through calm waters and watch the sunset together',
      image: '/images/sunset-kayak.jpg',
      category: 'Adventure'
    },
    {
      id: 2,
      title: 'Cooking Class',
      description: 'Learn to make a new cuisine together',
      image: '/images/cooking-class.jpg',
      category: 'Food'
    },
    {
      id: 3,
      title: 'Stargazing Picnic',
      description: 'Bring blankets, snacks and stargaze in a quiet spot',
      image: '/images/stargazing.jpg',
      category: 'Outdoor'
    },
    {
      id: 4,
      title: 'Pottery Workshop',
      description: 'Get creative and make something together to keep',
      image: '/images/pottery.jpg',
      category: 'Creative'
    },
    {
      id: 5,
      title: 'Beach Day',
      description: 'Swim, sunbathe and build sandcastles together',
      image: '/images/beach.jpg',
      category: 'Outdoor'
    }
  ];

  // Filter date ideas based on search query
  const filteredDateIdeas = dateIdeas.filter(idea =>
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle favorite status
  const toggleFavorite = (idea: { id: any; title?: string; description?: string; image?: string; category?: string; }) => {
    if (myFavorites.some(fav => fav.id === idea.id)) {
      setMyFavorites(myFavorites.filter(fav => fav.id !== idea.id));
    } else {
      setMyFavorites([...myFavorites, idea]);
    }
  };

  // Update joint favorites when my favorites or partner favorites change
  useEffect(() => {
    const newJointFavorites = myFavorites.filter(myFav =>
      partnerFavorites.some(partnerFav => partnerFav.id === myFav.id)
    );
    setJointFavorites(newJointFavorites);
  }, [myFavorites, partnerFavorites]);

  // Function to schedule a date
  const scheduleDate = (idea: { title: any; }, date: moment.MomentInput) => {
    const newEvent: CalendarEvent = {
      id: Date.now(),
      title: idea.title,
      start: date,
      end: moment(date).add(2, 'hours').toDate(),
      idea: idea
    };
    const updated = [...events, newEvent];
    pushHistory(updated);
    setEvents(updated);
  };

  // Undo/Redo operations
  const undo = () => {
    if (pastEvents.length === 0) return;
    const prev = pastEvents[pastEvents.length - 1];
    setPastEvents(prevList => prevList.slice(0, -1));
    setFutureEvents(fut => [events, ...fut]);
    setEvents(prev);
  };
  const redo = () => {
    if (futureEvents.length === 0) return;
    const [next, ...rest] = futureEvents;
    setFutureEvents(rest);
    setPastEvents(prev => [...prev, events]);
    setEvents(next);
  };

  // Update or remove event from modal
  const updateEventDate = (id: number, dateStr: string) => {
    const date = new Date(dateStr);
    const updated = events.map(ev =>
      ev.id === id
        ? { ...ev, start: date, end: moment(date).add(moment(ev.end).diff(moment(ev.start), 'hours'), 'hours').toDate() }
        : ev
    );
    pushHistory(updated);
    setEvents(updated);
  };
  const removeEvent = (id: number) => {
    const updated = events.filter(ev => ev.id !== id);
    pushHistory(updated);
    setEvents(updated);
  };

  // Mock function to sync with partner's calendar
  const syncWithPartner = () => {
    if (!partnerId) return;

    // In a real app, this would make an API call
    // For demo purposes, let's pretend we got some data back
    setPartnerFavorites([dateIdeas[1], dateIdeas[3]]);
    alert('Successfully synced with partner!');
  };

  // Export to Google Calendar
  const exportToGoogleCalendar = () => {
    alert('Calendar exported to Google Calendar');
    // This would typically use the Google Calendar API
  };

  // Copy calendar ID to clipboard
  const copyCalendarId = () => {
    navigator.clipboard.writeText(calendarId);
    alert('Calendar ID copied to clipboard!');
  };

  // Date arrays for views and helpers
  const today = new Date();
  const monthStart = moment(currentDate).startOf('month').startOf('week');
  const monthCells: Date[] = Array.from({ length: 35 }).map((_, idx) => moment(monthStart).add(idx, 'days').toDate());
  const weekStart = moment(currentDate).startOf('week');
  const weekCells: Date[] = Array.from({ length: 7 }).map((_, idx) => moment(weekStart).add(idx, 'days').toDate());
  const headerLabel = calendarView === 'month'
    ? moment(currentDate).format('MMMM YYYY')
    : `Week of ${moment(weekStart).format('MMM D, YYYY')}`;
  const isSameDay = (a: moment.MomentInput, b: Date) => {
    const da = moment(a).toDate();
    return da.getFullYear() === b.getFullYear() && da.getMonth() === b.getMonth() && da.getDate() === b.getDate();
  };
  const isToday = (date: Date) => isSameDay(date, today);

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastProvider>
        <div className="min-h-screen bg-[#fafafa]">
          <Header />
          <Head>
            <title>Date Ideas Calendar</title>
            <meta name="description" content="Interactive date planning calendar for couples" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <main className="container mx-auto px-4 py-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-rose-600">Date Ideas Calendar</h1>
              <p className="text-xl text-gray-700">Your Interactive Date Planning Calendar</p>
              <p className="text-gray-500 mt-2">
                Welcome to your personal Date Night Calendar - the perfect way to plan, organize, and remember your
                most special moments together.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8 max-w-md mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                  placeholder="Search Date Ideas"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Browse Date Ideas */}
            <div className="mb-10">
              <h2 className="text-xl font-medium text-gray-900 mb-4">Browse Date Ideas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredDateIdeas.map(idea => (
                  <div
                    key={idea.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify(idea))}
                    className="bg-white rounded-lg shadow overflow-hidden"
                  >
                    <div className="h-40 relative">
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        {/* Replace with actual Image component when you have images */}
                        <div className="text-gray-400">Image: {idea.title}</div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900">{idea.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{idea.description}</p>
                      <div className="mt-2">
                        <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-600 mr-2">
                          {idea.category}
                        </span>
                      </div>
                      <div className="mt-4 flex justify-between">
                        <button
                          onClick={() => toggleFavorite(idea)}
                          className={`flex items-center px-3 py-1 rounded-md text-sm ${myFavorites.some(fav => fav.id === idea.id)
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          My Fav
                        </button>
                        <button className="flex items-center px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-600">
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Partner Fav
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left column - Favorites sections */}
              <div className="md:col-span-1">
                {/* My Favorites */}
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">My Favorites ({myFavorites.length})</h2>
                    <button onClick={() => setIsMyOpen(!isMyOpen)} className="text-gray-400 hover:text-gray-600">
                      <svg className={`h-5 w-5 transform ${isMyOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {isMyOpen && (
                    <div className="p-4">
                      {myFavorites.length === 0 ? (
                        <p className="text-gray-500 text-sm">No favorites yet. Click the heart icon to add!</p>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {myFavorites.map(fav => (
                            <li
                              key={fav.id}
                              className="py-3 flex"
                              draggable
                              onDragStart={e => e.dataTransfer.setData('application/json', JSON.stringify(fav))}
                            >
                              <div className="h-12 w-12 bg-gray-200 rounded-md mr-4"></div>
                              <div className="flex-1">
                                <h3 className="text-sm font-medium">{fav.title}</h3>
                                <p className="text-xs text-rose-500">{fav.category}</p>
                              </div>
                              <div className="flex space-x-2">
                                <button className="text-gray-400 hover:text-gray-600">
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                  </svg>
                                </button>
                                <button className="text-gray-400 hover:text-gray-600">
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {/* Partner's Favorites */}
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Partner's Favorites ({partnerFavorites.length})</h2>
                    <button className="text-gray-400 hover:text-gray-600" onClick={() => setIsPartnerOpen(!isPartnerOpen)}>
                      <svg className={`h-5 w-5 transform ${isPartnerOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {isPartnerOpen && (
                    <div className="p-4">
                      <p className="text-gray-500 text-sm mb-3">Enter your partner's Calendar ID to see their favorites</p>
                      {partnerFavorites.length > 0 && (
                        <ul className="divide-y divide-gray-200">
                          {partnerFavorites.map(fav => (
                            <li
                              key={fav.id}
                              className="py-3 flex"
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify(fav))}
                            >
                              <div className="h-12 w-12 bg-gray-200 rounded-md mr-4"></div>
                              <div className="flex-1">
                                <h3 className="text-sm font-medium">{fav.title}</h3>
                                <p className="text-xs text-rose-500">{fav.category}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {/* Joint Favorites */}
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Joint Favorites ({jointFavorites.length})</h2>
                    <button className="text-gray-400 hover:text-gray-600" onClick={() => setIsJointOpen(!isJointOpen)}>
                      <svg className={`h-5 w-5 transform ${isJointOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  {isJointOpen && (
                    <div className="p-4">
                      {jointFavorites.length === 0 ? (
                        <p className="text-gray-500 text-sm">When you and your partner both favorite the same date idea, it will appear here.</p>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {jointFavorites.map(fav => (
                            <li
                              key={fav.id}
                              className="py-3 flex"
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify(fav))}
                            >
                              <div className="h-12 w-12 bg-gray-200 rounded-md mr-4"></div>
                              <div className="flex-1">
                                <h3 className="text-sm font-medium">{fav.title}</h3>
                                <p className="text-xs text-rose-500">{fav.category}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                {/* Calendar ID */}
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Calendar ID</h2>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-500 text-sm mb-3">Share this ID with your partner to connect calendars</p>
                    <div className="flex mb-4">
                      <input
                        type="text"
                        className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm text-sm"
                        value={calendarId}
                        readOnly
                      />
                      <button
                        onClick={copyCalendarId}
                        className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>

                {/* Partner's Calendar */}
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Partner's Calendar</h2>
                  </div>
                  <div className="p-4">
                    <div className="flex mb-4">
                      <input
                        type="text"
                        className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm text-sm"
                        placeholder="Enter partner's calendar ID"
                        value={partnerId}
                        onChange={(e) => setPartnerId(e.target.value)}
                      />
                      <button
                        onClick={syncWithPartner}
                        className="inline-flex items-center px-4 py-2 border border-l-0 border-transparent rounded-r-md bg-rose-500 text-sm font-medium text-white hover:bg-rose-600"
                      >
                        Sync
                      </button>
                    </div>

                    <button
                      onClick={exportToGoogleCalendar}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Export to Google Calendar
                    </button>
                  </div>
                </div>
              </div>

              {/* Right column - Calendar */}
              <div className="md:col-span-2">
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium text-gray-900">
                      {headerLabel}
                    </h2>
                    <div className="flex items-center space-x-2">
                      {/* Navigation buttons */}
                      <button
                        onClick={() => {
                          setCurrentDate(prev =>
                            new Date(calendarView === 'month'
                              ? moment(prev).subtract(1, 'months').toDate()
                              : moment(prev).subtract(1, 'weeks').toDate()
                            )
                          );
                        }}
                        className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                      >Prev</button>
                      <button
                        onClick={() => setCurrentDate(new Date())}
                        className="px-2 py-1 bg-gray-200 rounded"
                      >Today</button>
                      <button
                        onClick={() => {
                          setCurrentDate(prev =>
                            new Date(calendarView === 'month'
                              ? moment(prev).add(1, 'months').toDate()
                              : moment(prev).add(1, 'weeks').toDate()
                            )
                          );
                        }}
                        className="px-2 py-1 bg-gray-200 rounded"
                      >Next</button>
                      <button
                        onClick={undo}
                        disabled={pastEvents.length === 0}
                        className="px-3 py-1 rounded text-sm bg-gray-200 text-gray-700 disabled:opacity-50"
                      >Undo</button>
                      <button
                        onClick={redo}
                        disabled={futureEvents.length === 0}
                        className="px-3 py-1 rounded text-sm bg-gray-200 text-gray-700 disabled:opacity-50"
                      >Redo</button>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-3 py-1 rounded text-sm bg-gray-200 text-gray-700"
                      >Manage Dates</button>
                      <button
                        onClick={() => setCalendarView('week')}
                        className={`px-3 py-1 rounded text-sm ${calendarView === 'week' ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-700'
                          }`}
                      >Week</button>
                      <button
                        onClick={() => setCalendarView('month')}
                        className={`px-3 py-1 rounded text-sm ${calendarView === 'month' ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-700'
                          }`}
                      >Month</button>
                    </div>
                  </div>
                  {/* Modal for managing scheduled events */}
                  {isModalOpen && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                      <div className="bg-white rounded-lg w-3/4 max-w-xl p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">Manage Scheduled Dates</h3>
                          <button onClick={() => setIsModalOpen(false)} className="text-gray-500 text-xl leading-none">×</button>
                        </div>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {events.length === 0 ? (
                            <p className="text-gray-500">No scheduled dates.</p>
                          ) : events.map(ev => (
                            <div key={ev.id} className="flex items-center space-x-2">
                              <div className="flex-1 text-sm font-medium">{ev.title}</div>
                              <input
                                type="datetime-local"
                                value={new Date(ev.start as Date).toISOString().substr(0, 16)}
                                onChange={e => updateEventDate(ev.id, e.target.value)}
                                className="border px-2 py-1 text-sm"
                              />
                              <button
                                onClick={() => removeEvent(ev.id)}
                                className="text-red-600 text-sm"
                              >Delete</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Calendar grid */}
                  <div className="border border-gray-200 rounded">
                    {/* Week/Month header */}
                    <div className="grid grid-cols-7 border-b border-gray-200">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="px-2 py-3 text-center text-sm font-medium text-gray-500">
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Dynamic grid: month has 35 cells, week has 7 */}
                    <div className={
                      `grid grid-cols-7 ${calendarView === 'month' ? 'grid-rows-5' : ''} gap-px`
                    }>
                      {(calendarView === 'month' ? monthCells : weekCells).map((date, idx) => (
                        <div
                          key={idx}
                          className={
                            `h-24 p-1 border-t border-l border-gray-200 bg-white ${isToday(date) ? 'bg-yellow-100' : ''}`
                          }
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => {
                            const idea = JSON.parse(e.dataTransfer.getData('application/json'));
                            scheduleDate(idea, date);
                          }}
                        >
                          <div className="flex justify-end items-center text-right text-xs text-gray-500 mb-1">
                            <span>{date.getDate()}</span>
                            {isToday(date) && <span className="ml-1 text-red-500">♥</span>}
                          </div>
                          {/* Render events */}
                          {events.filter(ev => isSameDay(ev.start, date)).map(ev => (
                            <div key={ev.id} className="bg-rose-100 text-rose-600 px-2 py-1 rounded text-xs mb-1">
                              {ev.title}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </div>
  );
}