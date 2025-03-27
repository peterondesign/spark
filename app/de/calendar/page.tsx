"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer, Event, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css'; // Import custom styles
import { supabase } from "@/utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import FavoritesAccordion from "../../components/FavoritesAccordion";
import {favoritesService } from "../../services/favoritesService";
import { X, Clock, Calendar as CalendarIcon } from 'lucide-react';
import Image from 'next/image';
import PageTitle from "../../components/PageTitle";
import { PAGE_TITLES } from "../../utils/titleUtils";

// Define DateIdea interface to represent a date activity
interface DateIdea {
  id: number; // Changed to strictly number
  title: string;
  description: string; // Changed to strictly string
  image: string; // Changed from optional to required string
  category?: string;
  rating?: number;
  location?: string;
  price: string; // Changed to string
  duration?: string;
  slug?: string;
  [key: string]: any; // Allow additional properties to ensure compatibility
}

// For compatibility with FavoritesAccordion component
type ServiceDateIdea = DateIdea;

// Define the custom event type that includes the date idea
interface CalendarEvent extends Event {
  dateIdea?: DateIdea;
  id: string;
  allDay?: boolean;
}

const CalendarPage: React.FC = () => {
  const localizer = momentLocalizer(moment);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [myFavorites, setMyFavorites] = useState<DateIdea[]>([]);
  const [partnerFavorites, setPartnerFavorites] = useState<DateIdea[]>([]);
  const [jointFavorites, setJointFavorites] = useState<DateIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dragOverCalendar, setDragOverCalendar] = useState(false);
  const [currentView, setCurrentView] = useState('month');
  const [dropTarget, setDropTarget] = useState<{ date: Date, position: { x: number, y: number } } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Load data on mount
  useEffect(() => {
    // Fetch favorites from your database
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);

        // Fetch all saved favorites
        if (typeof window !== 'undefined') {
          const savedIdeas = localStorage.getItem('savedDateIdeas');
          if (savedIdeas) {
            const favorites = JSON.parse(savedIdeas) as DateIdea[];
            setMyFavorites(favorites);
          } else {
            // If no localStorage data, try to get from service
            const favorites = await favoritesService.getRecentFavorites(20); // Get more than just 3
            setMyFavorites(favorites);
          }

          // Load saved calendar events
          const savedEvents = localStorage.getItem('calendarEvents');
          if (savedEvents) {
            setEvents(JSON.parse(savedEvents));
          }
        } else {
          // Fallback for server-side
          const favorites = await favoritesService.getRecentFavorites(20);
          setMyFavorites(favorites);
        }

        // Sync favorites with Supabase if possible
        await favoritesService.syncFavorites();

        // Partner favorites and joint favorites would need additional implementation
        // You can add that logic when ready

      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('calendarEvents', JSON.stringify(events));
    }
  }, [events]);

  // Handle view change
  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setDropTarget(null); // Clear drop target when view changes
  };

  // Custom event component with image and delete button
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const handleRemoveEvent = (e: React.MouseEvent, eventId: string) => {
      e.stopPropagation();
      setEvents(prevEvents => prevEvents.filter(ev => ev.id !== eventId));
    };

    const dateIdea = event.dateIdea;
    if (!dateIdea) return <div className="px-2 py-1">{event.title}</div>;

    return (
      <div className="relative group calendar-event">
        <div className="px-2 py-1 flex items-center gap-2">
          <div className="relative h-8 w-8 flex-shrink-0 rounded-full overflow-hidden">
            <Image
              src={dateIdea.image || "/placeholder-date.jpg"}
              alt={dateIdea.title}
              fill
              className="object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder-date.jpg";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="truncate text-sm font-medium block">{event.title}</span>
            {!event.allDay && event.start && (
              <span className="text-xs text-gray-500 flex items-center">
                <Clock size={10} className="mr-1" />
                {moment(event.start).format('h:mm A')}
                {event.end && ` - ${moment(event.end).format('h:mm A')}`}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => handleRemoveEvent(e, event.id)}
          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remove event"
        >
          <X size={14} />
        </button>
      </div>
    );
  };

  // Track mouse position inside calendar for drop targeting
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragOverCalendar && calendarRef.current) {
      // Get calendar element position
      const rect = calendarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Find the date cell or time slot under the mouse
      const dateElement = document.elementFromPoint(e.clientX, e.clientY);

      if (dateElement) {
        // For month view - look for date cells
        const dateCell = dateElement.closest('.rbc-date-cell') || dateElement.closest('.rbc-day-bg');
        if (dateCell && currentView === 'month') {
          // Try to find the parent header that contains the date
          const headerDate = getDateFromMonthCell(dateCell as HTMLElement);

          if (headerDate) {
            setDropTarget({
              date: headerDate,
              position: { x, y }
            });
            return;
          }
        }

        // For week/day view - look for time slots
        const timeSlot = dateElement.closest('.rbc-time-slot') || dateElement.closest('.rbc-event-content');
        if (timeSlot && (currentView === 'week' || currentView === 'day')) {
          const dateTime = getDateTimeFromWeekDaySlot(timeSlot as HTMLElement, e);

          if (dateTime) {
            setDropTarget({
              date: dateTime,
              position: { x, y }
            });
            return;
          }
        }
      }
    }
  };

  // Helper function to get date from a month view cell
  const getDateFromMonthCell = (cell: HTMLElement): Date | null => {
    // First check if the cell has a data-date attribute
    const dataDate = cell.getAttribute('data-date');
    if (dataDate) {
      return new Date(dataDate);
    }

    // Check if it's part of a row with a date header
    const row = cell.closest('.rbc-row-bg, .rbc-month-row');
    if (!row) return null;

    // Find the index of the cell within the row
    const cells = Array.from(row.querySelectorAll('.rbc-day-bg'));
    const cellIndex = cells.indexOf(cell as HTMLElement);
    if (cellIndex === -1) return null;

    // Find the corresponding header cell that contains the date
    const calendarContainer = cell.closest('.rbc-calendar');
    if (!calendarContainer) return null;

    const headerCells = Array.from(calendarContainer.querySelectorAll('.rbc-header'));
    const headerCell = headerCells[cellIndex];

    if (!headerCell) return null;

    // Extract date from header
    const headerDate = headerCell.getAttribute('data-date');
    if (headerDate) {
      return new Date(headerDate);
    }

    // If we can't find a date in the header, try another approach
    // Look at the visual content - day number in the cell
    const dayNumber = parseInt(cell.textContent?.trim() || '');
    if (!isNaN(dayNumber)) {
      // Get the month/year from the calendar view's current date
      const monthView = cell.closest('.rbc-month-view');
      if (monthView) {
        // Extract current month/year from an element with an accessible date
        const currentDateCell = monthView.querySelector('[data-date]');
        if (currentDateCell) {
          const currentDate = new Date(currentDateCell.getAttribute('data-date') || '');
          return new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
        }
      }

      // Fallback to current month/year
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), dayNumber);
    }

    return null;
  };

  // Helper function to get date and time from week/day view slot
  const getDateTimeFromWeekDaySlot = (slot: HTMLElement, mouseEvent: React.MouseEvent): Date | null => {
    // First check if the slot or parent has a data-date attribute
    const dataDate = slot.getAttribute('data-date');
    if (dataDate) {
      return new Date(dataDate);
    }

    // Find the time column and corresponding header
    const timeColumn = slot.closest('.rbc-time-column, .rbc-day-slot');
    if (!timeColumn) return null;

    // Get the date from the header
    const dayColumn = timeColumn.closest('.rbc-day-slot, .rbc-time-column');
    if (!dayColumn) return null;

    const headerElement = document.querySelector(`.rbc-header[data-date]:nth-child(${Array.from(dayColumn.parentElement?.children || []).indexOf(dayColumn) + 1})`);
    const headerDate = headerElement?.getAttribute('data-date');

    if (!headerDate) return null;

    // Calculate time from vertical position in the column
    const rect = timeColumn.getBoundingClientRect();
    const relativeY = mouseEvent.clientY - rect.top;

    // Calculate time (this will depend on your calendar setup)
    const slotHeight = 30; // Default height for 30-min slots, adjust if different
    const startHour = 0; // Adjust based on your calendar start time

    // Calculate hours and minutes based on position
    const totalMinutes = startHour * 60 + (relativeY / slotHeight) * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    // Create the date object with the right date and calculated time
    const result = new Date(headerDate);
    result.setHours(hours, minutes, 0, 0);
    return result;
  };

  // Handle drag enter to show visual feedback
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCalendar(true);
  };

  // Handle drag leave to remove visual feedback
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const relatedTarget = e.relatedTarget as Node;
    // Only set dragOverCalendar to false if we're actually leaving the calendar container
    if (calendarRef.current && !calendarRef.current.contains(relatedTarget)) {
      setDragOverCalendar(false);
      setDropTarget(null);
    }
  };

  // Handle drag over to prevent default behavior
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle drop on the calendar
  const handleCalendarDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverCalendar(false);

    try {
      const dropData = JSON.parse(e.dataTransfer.getData('application/json')) as DateIdea;

      // Default to current date/time if no specific target
      let targetDate = new Date();
      let isAllDay = currentView === 'month'; // Default to all day for month view
      let endDate: Date | undefined;

      // Use drop target if available
      if (dropTarget && dropTarget.date) {
        targetDate = new Date(dropTarget.date);

        // For week/day views, set a 1 hour duration
        if (currentView !== 'month') {
          isAllDay = false;
          endDate = new Date(targetDate);
          endDate.setHours(endDate.getHours() + 1);
        }
      } else {
        // Try to find the date cell or time slot from the event target
        const target = e.target as HTMLElement;

        // For month view
        const dateCell = target.closest('.rbc-date-cell') || target.closest('.rbc-day-bg');
        if (dateCell && currentView === 'month') {
          const date = getDateFromMonthCell(dateCell as HTMLElement);
          if (date) {
            targetDate = date;
            isAllDay = true;
          }
        }

        // For week/day view
        const timeSlot = target.closest('.rbc-time-slot') || target.closest('.rbc-day-slot');
        if (timeSlot && (currentView === 'week' || currentView === 'day')) {
          const dateTime = getDateTimeFromWeekDaySlot(timeSlot as HTMLElement, e as unknown as React.MouseEvent);
          if (dateTime) {
            targetDate = dateTime;
            isAllDay = false;
            // Create an end date 1 hour later
            endDate = new Date(targetDate);
            endDate.setHours(endDate.getHours() + 1);
          }
        }
      }

      // Create a new calendar event
      const newEvent: CalendarEvent = {
        id: `${dropData.id}-${Date.now()}`, // Generate a unique ID
        title: dropData.title,
        start: targetDate,
        end: endDate || targetDate,
        dateIdea: dropData,
        allDay: isAllDay
      };

      setEvents(prevEvents => [...prevEvents, newEvent]);
      // Clear the drop target after adding the event
      setDropTarget(null);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  // Format the calendar cell based on the view
  const dayPropGetter = (date: Date) => {
    const isDropTarget = dropTarget?.date &&
      date.getDate() === dropTarget.date.getDate() &&
      date.getMonth() === dropTarget.date.getMonth() &&
      date.getFullYear() === dropTarget.date.getFullYear();

    return {
      className: `custom-day-cell ${isDropTarget && currentView === 'month' ? 'drop-target' : ''}`,
    };
  };

  // Style for time slots in week/day view
  const slotPropGetter = (date: Date) => {
    const isDropTarget = dropTarget?.date &&
      date.getHours() === dropTarget.date.getHours() &&
      date.getMinutes() === dropTarget.date.getMinutes();

    return {
      className: `${isDropTarget && (currentView === 'week' || currentView === 'day') ? 'time-slot-drop-target' : ''}`,
    };
  };

  // Map the favorites to the expected structure before passing them to FavoritesAccordion
  const mappedMyFavorites = myFavorites.map(fav => ({
    ...fav,
    id: Number(fav.id),
    description: fav.description || '',
    image: fav.image || '/placeholder-date.jpg', // Ensure image has a default
    category: fav.category || '',
    rating: fav.rating || 0,
    location: fav.location || '',
    price: String(fav.price || '0'),
    duration: fav.duration || '',
    slug: fav.slug || ''
  }));

  const mappedPartnerFavorites = partnerFavorites.map(fav => ({
    ...fav,
    id: Number(fav.id),
    description: fav.description || '',
    image: fav.image || '/placeholder-date.jpg', // Ensure image has a default
    category: fav.category || '',
    rating: fav.rating || 0,
    location: fav.location || '',
    price: String(fav.price || '0'),
    duration: fav.duration || '',
    slug: fav.slug || ''
  }));

  const mappedJointFavorites = jointFavorites.map(fav => ({
    ...fav,
    id: Number(fav.id),
    description: fav.description || '',
    image: fav.image || '/placeholder-date.jpg', // Ensure image has a default
    category: fav.category || '',
    rating: fav.rating || 0,
    location: fav.location || '',
    price: String(fav.price || '0'),
    duration: fav.duration || '',
    slug: fav.slug || ''
  }));

  return (
    <div className="min-h-screen bg-gray-100">
      <PageTitle title={PAGE_TITLES.CALENDAR} />
      <Header />

      <div className="w-full mx-auto py-6 sm:px-6 lg:px-8">
        {/* Introduction section with meaningful content */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Interactive Date Planning Calendar</h1>

          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              Welcome to your personal Date Night Calendar - the perfect way to plan, organize, and remember your most special moments together.
              This interactive tool helps couples maintain a healthy relationship by ensuring quality time is scheduled regularly, making it easier
              to prioritize your connection despite busy lives.
            </p>

            <div className="justify-center gap-4 mx-auto flex flex-col md:flex-row mb-8 w-full">
              <FavoritesAccordion
                title="My Favorites"
                items={mappedMyFavorites}
                defaultOpen={true}
                isLoading={isLoading}
              />

              <FavoritesAccordion
                title="Partner's Favorites"
                items={mappedPartnerFavorites}
                isLoading={isLoading}
              />

              <FavoritesAccordion
                title="Joint Favorites"
                items={mappedJointFavorites}
                isLoading={isLoading}
              />
            </div>

            <div
              ref={calendarRef}
              className={`calendar-container flex-grow ${dragOverCalendar ? 'drag-over' : ''}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleCalendarDrop}
              onMouseMove={handleMouseMove}
            >
              {/* Drop indicator overlay */}
              {dragOverCalendar && dropTarget && (
                <div
                  className="absolute pointer-events-none z-10 drop-indicator"
                  style={{
                    left: dropTarget.position.x,
                    top: dropTarget.position.y,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="drop-indicator-inner">
                    <CalendarIcon size={20} className="drop-indicator-icon" />
                  </div>
                </div>
              )}

              <Calendar
                localizer={localizer}
                events={events}
                defaultView="month"
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                className={`bg-white p-4 rounded-lg shadow flex-grow ${dragOverCalendar ? 'rbc-calendar-drag-over' : ''}`}
                views={[Views.MONTH, Views.WEEK]}
                components={{
                  event: EventComponent
                }}
                dayPropGetter={dayPropGetter}
                slotPropGetter={slotPropGetter}
                popup
                tooltipAccessor={event => {
                  const idea = (event as CalendarEvent).dateIdea;
                  return idea ? `${idea.title}: ${idea.description || 'No description provided'}` : '';
                }}
                eventPropGetter={(event) => ({
                  className: `calendar-event ${!event.allDay ? 'calendar-event-timed' : ''}`
                })}
                onView={handleViewChange}
                step={30}
                timeslots={2}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">How to Use Your Calendar</h2>
          <p className="text-gray-700">
            Get started by browsing your favorite date ideas in the panel to the left. If you haven't saved any favorites yet, visit our
            <a href="/" className="text-rose-600 hover:text-rose-800 font-medium"> main page</a> to discover and save date ideas. Then simply drag
            your chosen date idea to your preferred day on the calendar. Your date plans will be automatically saved to your device so you can
            always come back to review and update your schedule.
          </p>
        </div>


        <div className='container mx-auto px-4'>
          <p className="text-gray-700 mb-4">
            Your date planning calendar offers a simple drag-and-drop interface that makes scheduling date nights effortless. Browse your favorite
            date ideas on the left panel and simply drag them onto your preferred day. You can view your calendar by month or week, allowing you
            to plan dates well in advance or schedule spontaneous outings for the coming days.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6">
            <div className="bg-rose-50 p-4 rounded-lg">
              <h3 className="font-medium text-rose-800 mb-2">Benefits of Regular Date Nights</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Strengthens emotional bonds and intimacy</li>
                <li>Creates new shared experiences and memories</li>
                <li>Reduces relationship stress and prevents staleness</li>
                <li>Improves communication through quality time together</li>
                <li>Increases relationship satisfaction and happiness</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2">Calendar Features</h3>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Drag-and-drop date planning interface</li>
                <li>Monthly and weekly calendar views</li>
                <li>Personal, partner, and joint favorites sections</li>
                <li>Visual previews of each date idea</li>
                <li>Automatic local storage of your planned dates</li>
                <li>Time-specific scheduling for detailed planning</li>
              </ul>
            </div>
          </div>

          <p className="text-gray-700 mb-4">
            Relationship experts recommend scheduling at least one date night per week to maintain a healthy connection with your partner.
            Our calendar makes this easy by giving you a visual overview of your upcoming dates, helping you ensure you're making time for what
            matters most - your relationship. Studies show that couples who regularly plan and engage in date nights report higher levels of
            communication, sexual satisfaction, and commitment.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CalendarPage;
