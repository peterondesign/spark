"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import type { DayPickerProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// Use ComponentProps to get the correct type inference
export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  view?: "month" | "week"
  showEventIndicators?: boolean
  eventDates?: Date[]
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  view = "month",
  showEventIndicators = false,
  eventDates = [],
  ...props
}: CalendarProps) {
  // Set number of displayed weeks based on view type
  const numberOfMonths = 1;
  const numberOfWeeks = view === "week" ? 1 : undefined;
  const fixedWeeks = view === "week" ? true : false;

  // Create a map of dates that have events
  const eventDatesMap = React.useMemo(() => {
    const map = new Map<string, boolean>();
    eventDates.forEach(date => {
      map.set(date.toISOString().split('T')[0], true);
    });
    return map;
  }, [eventDates]);

  // Custom day rendering to show event indicators
  const renderDay = (day: Date, modifiers: Record<string, boolean> = {}) => {
    const dateKey = day.toISOString().split('T')[0];
    const hasEvent = showEventIndicators && eventDatesMap.get(dateKey);
    
    return (
      <div className="relative w-full h-full">
        <div className={cn(
          "w-9 h-9 flex items-center justify-center",
          hasEvent && "font-bold"
        )}>
          {day.getDate()}
        </div>
        {hasEvent && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-rose-500 rounded-full"></div>
        )}
      </div>
    );
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      numberOfMonths={numberOfMonths}
      {...(numberOfWeeks !== undefined ? { numberOfWeeks } : {})}
      fixedWeeks={fixedWeeks}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: view === "week" ? 
          "text-sm font-medium" : 
          "text-sm font-medium hidden sm:block",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-auto min-h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        Day: showEventIndicators ? (props) => renderDay(props.date, (props as any).modifiers) : undefined,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
