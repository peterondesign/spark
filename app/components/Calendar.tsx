import React from 'react';

interface CalendarProps {
  onDrop: (event: React.DragEvent, date: string) => void;
  onRemove: (slug: string) => void;
  scheduledDates: Record<string, string>;
  view?: "month" | "week"; // Only allow month and week views
}

const Calendar: React.FC<CalendarProps> = ({ 
  onDrop, 
  onRemove, 
  scheduledDates,
  view = "month" 
}) => {
  const days = Array.from({ length: 30 }, (_, i) => i + 1); // Example: 30 days in a month

  const handleDrop = (event: React.DragEvent, date: string) => {
    event.preventDefault();
    onDrop(event, date);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // Display either a full month or just a week based on the view prop
  const displayDays = view === "week" ? days.slice(0, 7) : days;

  return (
    <div className="grid grid-cols-7 gap-4">
      {displayDays.map((day) => (
        <div
          key={day}
          className="bg-white border border-gray-200 rounded-lg p-4"
          onDrop={(event) => handleDrop(event, `2023-10-${day}`)}
          onDragOver={handleDragOver}
        >
          <div className="text-gray-800 font-bold mb-2">October {day}</div>
          {Object.entries(scheduledDates).map(([slug, date]) => (
            date === `2023-10-${day}` && (
              <div key={slug} className="bg-rose-100 text-rose-800 p-2 rounded-lg flex justify-between items-center">
                <span>{slug}</span>
                <button onClick={() => onRemove(slug)} className="text-rose-500 hover:text-rose-600">
                  Remove
                </button>
              </div>
            )
          ))}
        </div>
      ))}
    </div>
  );
};

export default Calendar;
