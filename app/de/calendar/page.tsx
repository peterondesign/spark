"use client"

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import type { DateIdea } from '@/app/services/favoritesService';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { generateMetadata } from "../../../utils/metadataUtils";
import { supabase } from "@/utils/supabaseClient";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { processDateIdeaImages, getPlaceholderImage } from '../../utils/imageService';
import toast, { Toaster } from 'react-hot-toast';
import { favoritesService } from '@/app/services/favoritesService';

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
  const [myFavorites, setMyFavorites] = useState<DateIdea[]>([]);
  const [partnerFavorites, setPartnerFavorites] = useState<DateIdea[]>([]);
  const [jointFavorites, setJointFavorites] = useState<DateIdea[]>([]);
  const [calendarView, setCalendarView] = useState('month');
  const [isMyOpen, setIsMyOpen] = useState(true);
  const [isPartnerOpen, setIsPartnerOpen] = useState(true);
  const [isJointOpen, setIsJointOpen] = useState(true);
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [modalSelectedIdea, setModalSelectedIdea] = useState<number | ''>('');
  const [modalDateLine, setModalDateLine] = useState('');
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverDateKey, setDragOverDateKey] = useState<string | null>(null);
  const [mobileVisibleCount, setMobileVisibleCount] = useState(5);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  interface CalendarEvent {
    id: number;
    title: any;
    start: moment.MomentInput;
    end: Date;
    idea: DateIdea;
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
  // Search query for filtering date ideas
  const [searchQuery, setSearchQuery] = useState('');
  const [calendarId] = useState('0292df00-86dd-4f00-b2f9-54c31bd4');
  // Ref for carousel scrolling
  const carouselRef = useRef<HTMLDivElement>(null);
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDateIdeas = async () => {
      try {
        const { data, error } = await supabase
          .from('date_ideas')
          .select('*');

        if (error) {
          console.error("Supabase Error:", error);
          throw error;
        }

        if (data) {
          setDateIdeas(data);
          // load images via Pexels
          const map = await processDateIdeaImages(data);
          setImageMap(map);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching date ideas:', error);
        setLoading(false);
      }
    };

    fetchDateIdeas();
  }, []);

  useEffect(() => {
    // Sync favorites
    favoritesService.syncFavorites().catch(err => console.warn(err));
    // Load my favorites
    favoritesService.getRecentFavorites()
      .then(data => setMyFavorites(data))
      .catch(console.error);
    // Load saved ideas from localStorage
    const loadSavedIdeas = () => {
      const saved = localStorage.getItem("savedDateIdeas");
      if (saved) {
        setMyFavorites(JSON.parse(saved));
      }
    };
    loadSavedIdeas();
  }, []);

  // Filter date ideas based on search query
  const filteredDateIdeas = dateIdeas.filter(idea =>
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle favorite persists to localStorage and Supabase
  const toggleFavorite = async (idea: DateIdea) => {
    if (myFavorites.some(fav => fav.id === idea.id)) {
      await favoritesService.removeFavorite(idea.id);
      setMyFavorites(myFavorites.filter(fav => fav.id !== idea.id));
    } else {
      await favoritesService.saveFavorite(idea);
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
  const scheduleDate = (idea: DateIdea, date: moment.MomentInput) => {
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
    toast.success('Event removed');
  };

  // Sync partner favorites via Supabase only
  const syncWithPartner = async () => {
    if (!partnerId) return;
    try {
      const data = await favoritesService.getRecentFavorites(partnerId);
      setPartnerFavorites(data);
      toast.success('Successfully synced with partner!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to load partner favorites');
    }
  };

  // Export to Google Calendar
  const exportToGoogleCalendar = () => {
    toast.success('Calendar exported to Google Calendar');
    // This would typically use the Google Calendar API
  };

  // Copy calendar ID to clipboard
  const copyCalendarId = () => {
    navigator.clipboard.writeText(calendarId);
    toast.success('Calendar ID copied to clipboard!');
  };

  const handleAddModalEvent = () => {
    if (!modalSelectedIdea || !modalDateLine) return;
    const idea = myFavorites.find(f => f.id === modalSelectedIdea);
    if (idea) {
      const date = new Date(modalDateLine);
      scheduleDate(idea, date);
      toast.success(`${idea.title} scheduled on ${date.toLocaleDateString()}`);
      setModalSelectedIdea('');
      setModalDateLine('');
    }
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
      <Toaster />
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
                className="block w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                placeholder="Search Date Ideas"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Browse Date Ideas */}
          <div className="mb-10">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Browse Date Ideas</h2>
            <div className="relative">
              {/* Skeleton state while loading */}
              {loading ? (
                <div className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow overflow-hidden w-64 sm:min-w-[250px] animate-pulse">
                      <div className="h-40 bg-gray-200" />
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                        <div className="h-3 bg-gray-200 rounded w-full mb-1" />
                        <div className="h-6 bg-gray-200 rounded w-1/4 mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Mobile: vertical list */}
                  <div className="flex flex-col space-y-4 sm:hidden">
                    {filteredDateIdeas.slice(0, mobileVisibleCount).map((idea) => (
                      <div
                        key={idea.id}
                        draggable
                        onDragStart={(e) => {
                          setDraggingId(idea.id);
                          e.dataTransfer.setData('application/json', JSON.stringify(idea));
                        }}
                        onDragEnd={() => setDraggingId(null)}
                        className={
                          `bg-white rounded-lg overflow-hidden w-64 sm:min-w-[250px] transition-all
                           cursor-grab ${draggingId === idea.id ? 'cursor-grabbing opacity-75 shadow-lg scale-105' : 'shadow-sm'}`
                        }
                      >
                        {/* use imageService for images */}
                        <div className="h-40 relative">
                          <Image
                            src={imageMap[idea.id] || getPlaceholderImage(400, 300, idea.title)}
                            alt={idea.title}
                            fill
                            className="object-cover"
                          />
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
                              onClick={() =>
                                toggleFavorite({
                                  ...idea,
                                  rating: 0,
                                  location: "",
                                  price: "",
                                  duration: "",
                                  slug: idea.slug,
                                })
                              }
                              className={`flex items-center px-3 py-1 rounded-md text-sm ${myFavorites.some((fav) => fav.id === idea.id)
                                  ? "bg-rose-100 text-rose-600"
                                  : "bg-gray-100 text-gray-600"
                                }`}
                            >
                              <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              My Fav
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredDateIdeas.length > mobileVisibleCount && (
                      <button
                        onClick={() => setMobileVisibleCount(prev => prev + 5)}
                        className="sm:hidden mt-4 px-4 py-2 bg-rose-500 text-white rounded mx-auto"
                      >
                        Load More
                      </button>
                    )}
                  </div>
                  {/* Desktop: horizontal carousel */}
                  <div className="hidden sm:flex relative">
                    <button
                      onClick={() => carouselRef.current?.scrollBy({ left: -300, behavior: "smooth" })}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md"
                    >
                      <svg className="h-6 w-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M7.707 4.293a1 1 0 010 1.414L4.414 9H16a1 1 0 110 2H4.414l3.293 3.293a1 1 0 01-1.414 1.414l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <div
                      ref={carouselRef}
                      className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth"
                    >
                      {filteredDateIdeas.map((idea) => (
                        <div
                          key={idea.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggingId(idea.id);
                            e.dataTransfer.setData('application/json', JSON.stringify(idea));
                          }}
                          onDragEnd={() => setDraggingId(null)}
                          className={
                            `bg-white rounded-lg overflow-hidden w-64 sm:min-w-[250px] transition-all
                             cursor-grab ${draggingId === idea.id ? 'cursor-grabbing opacity-75 shadow-lg scale-105' : 'shadow-sm'}`
                          }
                        >
                          {/* use imageService for images */}
                          <div className="h-40 relative">
                            <Image
                              src={imageMap[idea.id] || getPlaceholderImage(400, 300, idea.title)}
                              alt={idea.title}
                              fill
                              className="object-cover"
                            />
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
                                onClick={() =>
                                  toggleFavorite({
                                    ...idea,
                                    rating: 0,
                                    location: "",
                                    price: "",
                                    duration: "",
                                    slug: idea.slug,
                                  })
                                }
                                className={`flex items-center px-3 py-1 rounded-md text-sm ${myFavorites.some((fav) => fav.id === idea.id)
                                    ? "bg-rose-100 text-rose-600"
                                    : "bg-gray-100 text-gray-600"
                                  }`}
                              >
                                <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                My Fav
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => carouselRef.current?.scrollBy({ left: 300, behavior: "smooth" })}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md"
                    >
                      <svg className="h-6 w-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M12.293 15.707a1 1 0 010-1.414L15.586 11H4a1 1 0 110-2h11.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </>
              )}
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
                        {myFavorites.map(fav => {
                          const relatedDates = events.filter(ev => ev.idea.id === fav.id);
                          return (
                            <li
                              key={fav.id}
                              className="py-3 flex items-center justify-between"
                              draggable
                              onDragStart={e => e.dataTransfer.setData('application/json', JSON.stringify(fav))}
                            >
                              <div className="flex items-center">
                                <div className="h-12 w-12 relative rounded-md overflow-hidden mr-4">
                                  <Image
                                    src={imageMap[fav.id] || getPlaceholderImage(100, 100, fav.title)}
                                    alt={fav.title}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium">{fav.title}</h3>
                                  <p className="text-xs text-rose-500">{fav.category}</p>
                                  {relatedDates.length > 0 && (
                                    <p
                                      className="text-xs text-gray-500"
                                      title={relatedDates.map(ev => new Date(ev.start as Date).toLocaleDateString()).join(', ')}
                                    >
                                      +{relatedDates.length}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button onClick={() => toggleFavorite(fav)} className="text-rose-500">
                                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                  </svg>
                                </button>
                                <button onClick={() => setIsModalOpen(true)} className="text-gray-400 hover:text-gray-600">
                                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z" />
                                  </svg>
                                </button>
                              </div>
                            </li>
                          );
                        })}
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
                            className="py-3 flex items-center justify-between"
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify(fav))}
                          >
                            <div className="flex items-center">
                              <div className="h-12 w-12 relative rounded-md overflow-hidden mr-4">
                                <Image
                                  src={imageMap[fav.id] || getPlaceholderImage(100, 100, fav.title)}
                                  alt={fav.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="text-sm font-medium">{fav.title}</h3>
                                <p className="text-xs text-rose-500">{fav.category}</p>
                              </div>
                            </div>
                            <button onClick={() => toggleFavorite(fav)} className="text-rose-500">
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                            </button>
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
                            <div className="h-12 w-12 relative rounded-md overflow-hidden mr-4">
                              <Image
                                src={imageMap[fav.id] || getPlaceholderImage(100, 100, fav.title)}
                                alt={fav.title}
                                fill
                                className="object-cover"
                              />
                            </div>
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
                      className="flex-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-md shadow-sm text-sm"
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
                      className="flex-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-md shadow-sm text-sm"
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
                  <p className="mt-2 text-sm text-gray-500">
                    To subscribe via Google Calendar:
                    <ol className="list-decimal list-inside">
                      <li>In Google Calendar, click the “+” next to “Other calendars” and choose “From URL”.</li>
                      <li>Paste this URL: <code>https://dateideas.cc/api/calendar.ics?calendarId={calendarId}</code></li>
                      <li>Click “Add calendar”—your favorites will sync automatically.</li>
                    </ol>
                  </p>
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
                  <div className="flex items-center space-x-2 flex-wrap relative">
                    {/* Mobile menu toggle */}
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="sm:hidden p-2"
                    >
                      <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 10a2 2 0 114 0 2 2 0 01-4 0zm-6 0a2 2 0 114 0 2 2 0 01-4 0zm12 0a2 2 0 114 0 2 2 0 01-4 0z" />
                      </svg>
                    </button>
                    {/* Mobile menu items */}
                    {isMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded shadow-md z-20 flex flex-col">
                        {/* Prev */}
                        <button onClick={() => {
                          setCurrentDate(prev =>
                            new Date(calendarView === 'month'
                              ? moment(prev).subtract(1, 'months').toDate()
                              : moment(prev).subtract(1, 'weeks').toDate()
                            )
                          );
                        }} className="px-4 py-2 text-left w-full hover:bg-gray-100">Prev</button>
                        {/* Today */}
                        <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-left w-full hover:bg-gray-100">Today</button>
                        {/* Next */}
                        <button onClick={() => {
                          setCurrentDate(prev =>
                            new Date(calendarView === 'month'
                              ? moment(prev).add(1, 'months').toDate()
                              : moment(prev).add(1, 'weeks').toDate()
                            )
                          );
                        }} className="px-4 py-2 text-left w-full hover:bg-gray-100">Next</button>
                        {/* Undo */}
                        <button onClick={undo} className="px-4 py-2 text-left w-full hover:bg-gray-100">Undo</button>
                        {/* Redo */}
                        <button onClick={redo} className="px-4 py-2 text-left w-full hover:bg-gray-100">Redo</button>
                        {/* Week */}
                        <button onClick={() => setCalendarView('week')} className="px-4 py-2 text-left w-full hover:bg-gray-100">Week</button>
                        {/* Month */}
                        <button onClick={() => setCalendarView('month')} className="px-4 py-2 text-left w-full hover:bg-gray-100">Month</button>
                      </div>
                    )}
                    {/* Desktop buttons */}
                    <button
                      onClick={() => {
                        setCurrentDate(prev =>
                          new Date(calendarView === 'month'
                            ? moment(prev).subtract(1, 'months').toDate()
                            : moment(prev).subtract(1, 'weeks').toDate()
                          )
                        );
                      }}
                      className="hidden sm:inline px-2 py-1 bg-gray-200 rounded"
                    >Prev</button>
                    <button onClick={() => setCurrentDate(new Date())} className="hidden sm:inline px-2 py-1 bg-gray-200 rounded">Today</button>
                    <button onClick={() => {
                      setCurrentDate(prev =>
                        new Date(calendarView === 'month'
                          ? moment(prev).add(1, 'months').toDate()
                          : moment(prev).add(1, 'weeks').toDate()
                        )
                      );
                    }} className="hidden sm:inline px-2 py-1 bg-gray-200 rounded">Next</button>
                    <button onClick={undo} disabled={pastEvents.length === 0} className="hidden sm:inline px-3 py-1 rounded text-sm bg-gray-200 text-gray-700 disabled:opacity-50">Undo</button>
                    <button onClick={redo} disabled={futureEvents.length === 0} className="hidden sm:inline px-3 py-1 rounded text-sm bg-gray-200 text-gray-700 disabled:opacity-50">Redo</button>
                    <button onClick={() => setIsModalOpen(true)} className="px-3 py-1 rounded text-sm bg-gray-200 text-gray-700">Manage Dates</button>
                    <button onClick={() => setCalendarView('week')} className={`hidden sm:inline px-3 py-1 rounded text-sm ${calendarView === 'week' ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Week</button>
                    <button onClick={() => setCalendarView('month')} className={`hidden sm:inline px-3 py-1 rounded text-sm ${calendarView === 'month' ? 'bg-rose-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Month</button>
                  </div>
                </div>
                {/* Modal for managing scheduled events */}
                {isModalOpen && (
                  <div className="fixed z-50 inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg w-full sm:w-3/4 max-w-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Manage Scheduled Dates</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-500 text-xl leading-none">×</button>
                      </div>
                      <div className="mb-4 flex space-x-2 items-center">
                        <select value={modalSelectedIdea} className="bg-gray-300 py-4" onChange={e => setModalSelectedIdea(Number(e.target.value) || '')}>
                          <option value="">Select Favorite</option>
                          {myFavorites.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
                        </select>
                        <input type="datetime-local" className="py-4 bg-gray-300" value={modalDateLine} onChange={e => setModalDateLine(e.target.value)} />
                        <button onClick={handleAddModalEvent} className="px-2 py-1 bg-rose-500 text-white rounded">Add</button>
                      </div>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {events.length === 0 ? (
                          <p className="text-gray-500">No scheduled dates.</p>
                        ) : events.map(ev => (
                          <div key={ev.id} className="flex items-center space-x-2">
                            <span className="flex-1 text-sm font-medium">{ev.title}</span>
                            <span className="text-xs text-gray-600">{new Date(ev.start as Date).toLocaleString()}</span>
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
                <div className="border border-gray-200 rounded overflow-x-auto">
                  <div className="w-full sm:min-w-[600px]">
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
                            `h-24 p-1 border-t border-l border-gray-200 bg-white
                             ${isToday(date) ? 'bg-yellow-100' : ''}
                             ${dragOverDateKey === date.toISOString() ? 'bg-blue-50 border-blue-400' : ''}`
                          }
                          onDragOver={e => { e.preventDefault(); setDragOverDateKey(date.toISOString()); }}
                          onDragLeave={() => setDragOverDateKey(null)}
                          onDrop={e => {
                            e.preventDefault();
                            setDragOverDateKey(null);
                            const data = JSON.parse(e.dataTransfer.getData('application/json'));
                            if (data.idea) {
                              updateEventDate(data.id, date.toISOString());
                            } else {
                              scheduleDate(data, date);
                            }
                          }}
                        >
                          <div className="flex justify-end items-center text-right text-xs text-gray-500 mb-1">
                            <span>{date.getDate()}</span>
                            {isToday(date) && <span className="ml-1 text-red-500">♥</span>}
                          </div>
                          {/* Render events */}
                          {events.filter(ev => isSameDay(ev.start, date)).map(ev => (
                            <div
                              key={ev.id}
                              draggable
                              onDragStart={e => { setDraggingId(ev.id); e.dataTransfer.setData('application/json', JSON.stringify(ev)); }}
                              onDragEnd={() => setDraggingId(null)}
                              className={
                                `px-2 py-1 rounded text-xs mb-1 truncate transition-all cursor-grab
                                 ${draggingId === ev.id ? 'cursor-grabbing opacity-75 shadow-lg scale-105 bg-rose-200' : 'bg-rose-100 text-rose-600'}`
                              }
                            >
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
          </div>
        </main>
        <Footer />
      </div>
      </div>
    );
  }
