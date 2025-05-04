import { DateIdea } from './dateIdeas';

export interface CalendarEvent {
  id: string;
  dateIdea: DateIdea;
  date: string; // ISO date string
  source: 'my' | 'partner' | 'joint';
}

export interface CalendarState {
  events: CalendarEvent[];
}

export type CalendarAction =
  | { type: 'ADD_EVENT'; payload: CalendarEvent }
  | { type: 'REMOVE_EVENT'; payload: string }
  | { type: 'RESET_CALENDAR'; payload: CalendarEvent[] };

export const initialCalendarState: CalendarState = {
  events: []
};

export const calendarReducer = (state: CalendarState, action: CalendarAction): CalendarState => {
  switch (action.type) {
    case 'ADD_EVENT':
      return {
        ...state,
        events: [...state.events, action.payload]
      };
    case 'REMOVE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.payload)
      };
    case 'RESET_CALENDAR':
      return {
        ...state,
        events: action.payload
      };
    default:
      return state;
  }
};