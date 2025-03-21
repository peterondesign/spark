"use client";

import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar'; // Uncomment if using react-big-calendar
import moment from 'moment'; // Uncomment if using react-big-calendar
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Uncomment if using react-big-calendar
import { supabase } from "@/utils/supabaseClient";
import Header from '../components/Header';

// moment.locale('en-GB'); // Uncomment if using react-big-calendar

const CalendarPage: React.FC = () => {
  const localizer = momentLocalizer(moment); // Uncomment if using react-big-calendar
  const [events, setEvents] = useState<any[]>([]); // Uncomment if using react-big-calendar

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Calendar Placeholder */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              <li key="calendar">
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="lg:grid lg:grid-cols-3 lg:gap-4">
                      <dt className="text-sm font-medium text-gray-500">
                        Calendar
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 lg:col-span-2">
                        {
                        // Uncomment the below calendar element if using react-big-calendar
                        <Calendar
                          localizer={localizer}
                          events={events}
                          startAccessor="start"
                          endAccessor="end"
                          style={{ height: 500 }}
                        />
                        }
          
                      </dd>
                    </div>
                  </div>
                </div>
              </li>
              <li key="favorites">
                <div className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="lg:grid lg:grid-cols-3 lg:gap-4">
                      <dt className="text-sm font-medium text-gray-500">
                        Partner's Favorites
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 lg:col-span-2">
                        {/* Placeholder for displaying partner's favorites */}
                        Partner's favorites will be displayed here. (Requires user authentication)
                      </dd>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
