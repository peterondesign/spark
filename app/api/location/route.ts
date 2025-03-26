import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return NextResponse.json({
      city: data.city,
      country: data.country_name,
      latitude: data.latitude,
      longitude: data.longitude
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 });
  }
}