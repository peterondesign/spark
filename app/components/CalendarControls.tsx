import React from 'react';
import { format, addMonths, subMonths, addDays, subDays } from 'date-fns';
import { ArrowLeft, ArrowRight, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDateIdeaContext } from '@/app/context/DateIdeaContext';

interface CalendarControlsProps {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  viewMode: 'week' | 'month';
  setViewMode: React.Dispatch<React.SetStateAction<'week' | 'month'>>;
}

const CalendarControls: React.FC<CalendarControlsProps> = ({
  currentDate,
  setCurrentDate,
  viewMode,
  setViewMode,
}) => {
  const { undoAction, redoAction, canUndo, canRedo } = useDateIdeaContext();

  const handlePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(prev => subDays(prev, 7));
    } else {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(prev => addDays(prev, 7));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
      <div className="flex items-center">
        <Button 
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={handlePrevious}
          aria-label="Previous"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          className="font-medium"
          onClick={handleToday}
        >
          Today
        </Button>
        <Button 
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={handleNext}
          aria-label="Next"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold ml-4">
          {format(currentDate, viewMode === 'week' ? 'MMM yyyy' : 'MMMM yyyy')}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <Button
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            size="sm"
            className={viewMode === 'week' ? 'bg-date-primary' : ''}
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
          <Button
            variant={viewMode === 'month' ? 'default' : 'ghost'}
            size="sm"
            className={viewMode === 'month' ? 'bg-date-primary' : ''}
            onClick={() => setViewMode('month')}
          >
            Month
          </Button>
        </div>

        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-gray-100 rounded-full"
            onClick={undoAction}
            disabled={!canUndo}
            aria-label="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="hover:bg-gray-100 rounded-full"
            onClick={redoAction}
            disabled={!canRedo}
            aria-label="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarControls;