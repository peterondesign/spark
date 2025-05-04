import React from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { Heart } from 'lucide-react';
import { CalendarEvent } from '@/app/types/calendar';
import { useDateIdeaContext } from '@/app/context/DateIdeaContext';

interface MonthCalendarProps {
  currentDate: Date;
  calendarEvents: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({ 
  currentDate, 
  calendarEvents,
  onEventClick
}) => {
  const { addEventToCalendar } = useDateIdeaContext();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const today = new Date();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const dateIdeaId = e.dataTransfer.getData('dateIdeaId');
    const favoriteType = e.dataTransfer.getData('favoriteType') as 'my' | 'partner' | 'joint';

    if (dateIdeaId) {
      addEventToCalendar(dateIdeaId, date, favoriteType);
    }
  };

  const getDayEvents = (date: Date): CalendarEvent[] => {
    return calendarEvents.filter(event => isSameDay(new Date(event.date), date));
  };

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const currentDay = day;
      const isCurrentMonth = isSameMonth(day, monthStart);
      const isToday = isSameDay(day, today);
      const dayEvents = getDayEvents(day);

      days.push(
        <div 
          key={day.toISOString()}
          className={`min-h-[100px] border border-gray-200 p-2 ${
            !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 
            isToday ? 'bg-date-light/10' : 'bg-white'
          }`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, currentDay)}
        >
          <div className="flex justify-between mb-1">
            <span className={`text-sm font-medium ${isToday ? 'text-date-primary' : ''}`}>
              {format(day, 'd')}
            </span>
            {isToday && (
              <Heart className="h-4 w-4 text-date-primary animate-heart-beat" />
            )}
          </div>
          <div className="overflow-y-auto max-h-20">
            {dayEvents.slice(0, 3).map(event => (
              <div
                key={event.id}
                className="text-xs bg-date-light text-date-primary rounded-full px-2 py-0.5 mb-1 truncate cursor-pointer"
                onClick={() => onEventClick(event)}
              >
                {event.dateIdea.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 mt-1">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        </div>
      );

      day = addDays(day, 1);
    }

    rows.push(
      <div key={day.toISOString()} className="grid grid-cols-7">
        {days}
      </div>
    );

    days = [];
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="grid grid-cols-7 text-center bg-gray-50 font-medium">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName) => (
          <div key={dayName} className="py-2">
            {dayName}
          </div>
        ))}
      </div>
      <div>{rows}</div>
    </div>
  );
};

export default MonthCalendar;