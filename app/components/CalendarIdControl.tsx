import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useDateIdeaContext } from '@/app/context/DateIdeaContext';

interface CalendarIdControlProps {
  calendarId: string;
}

const CalendarIdControl: React.FC<CalendarIdControlProps> = ({ calendarId }) => {
  const [partnerCalendarId, setPartnerCalendarId] = useState('');
  const { syncWithPartnerCalendar, generateGoogleCalendarLink } = useDateIdeaContext();

  const handleCopyCalendarId = () => {
    navigator.clipboard.writeText(calendarId);
    toast.success('Calendar ID copied to clipboard');
  };

  const handleSyncPartnerCalendar = () => {
    if (!partnerCalendarId.trim()) {
      toast.error('Please enter a partner calendar ID');
      return;
    }
    
    const success = syncWithPartnerCalendar(partnerCalendarId.trim());
    
    if (success) {
      toast.success('Partner calendar synced successfully');
      setPartnerCalendarId('');
    } else {
      toast.error('Invalid calendar ID or sync failed');
    }
  };

  const handleExportToGoogleCalendar = () => {
    const calendarLink = generateGoogleCalendarLink();
    window.open(calendarLink, '_blank');
    toast.success(
      'Google Calendar URL generated', 
      { 
        description: 'Copy this URL and paste it into Google Calendar\'s "Add by URL" to subscribe.' 
      }
    );
  };

  return (
    <div className="mb-6">
      <div className="bg-white rounded-xl shadow-md p-4">
        <h3 className="font-semibold text-lg mb-3">Calendar ID</h3>
        <p className="text-sm text-gray-600 mb-3">Share this ID with your partner to connect calendars</p>
        
        <div className="flex mb-4">
          <Input
            value={calendarId}
            readOnly
            className="rounded-r-none"
          />
          <Button
            variant="outline"
            className="rounded-l-none border-l-0"
            onClick={handleCopyCalendarId}
          >
            <Copy className="h-4 w-4 mr-1" /> Copy
          </Button>
        </div>
        
        <h3 className="font-semibold text-lg mb-3">Partner's Calendar</h3>
        <div className="flex mb-4">
          <Input
            placeholder="Enter partner's calendar ID"
            value={partnerCalendarId}
            onChange={(e) => setPartnerCalendarId(e.target.value)}
            className="rounded-r-none"
          />
          <Button
            variant="default"
            className="rounded-l-none bg-date-secondary hover:bg-date-tertiary"
            onClick={handleSyncPartnerCalendar}
          >
            Sync
          </Button>
        </div>
        
        <div className="mt-6">
          <Button 
            variant="outline" 
            className="w-full border-date-primary text-date-primary hover:bg-date-light/20"
            onClick={handleExportToGoogleCalendar}
          >
            Export to Google Calendar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarIdControl;