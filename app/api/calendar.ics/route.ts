import { NextRequest, NextResponse } from 'next/server';
import { createEvents } from 'ics';
import { supabase } from '@/utils/supabaseClient';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const calendarId = searchParams.get('calendarId');
  if (!calendarId) {
    return new NextResponse('Missing calendarId', { status: 400 });
  }

  // Fetch favorites with timestamps
  const { data: favs, error: favError } = await supabase
    .from('favorites')
    .select('date_idea_id, created_at')
    .eq('device_id', calendarId);
  if (favError) {
    return new NextResponse(favError.message, { status: 500 });
  }

  // Fetch corresponding date ideas
  const ideaIds = favs?.map(f => f.date_idea_id) || [];
  const { data: ideas, error: ideaError } = await supabase
    .from('date_ideas')
    .select('id, title, description')
    .in('id', ideaIds);
  if (ideaError) {
    return new NextResponse(ideaError.message, { status: 500 });
  }

  // Build ICS events
  const events = favs?.map(fav => {
    const idea = ideas?.find(i => i.id === fav.date_idea_id);
    const date = new Date(fav.created_at);
    return {
      title: idea?.title || 'Date Idea',
      description: idea?.description || '',
      start: [date.getUTCFullYear(), date.getUTCMonth()+1, date.getUTCDate()] as [number, number, number],
      duration: { hours: 0 },
      uid: `${fav.date_idea_id}-${calendarId}`
    };
  }) || [];

  const { error: icsError, value } = createEvents(events);
  if (icsError) {
    return new NextResponse(icsError.message, { status: 500 });
  }

  return new NextResponse(value, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="favorites.ics"'
    }
  });
}