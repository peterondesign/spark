import { NextResponse } from 'next/server';

// Multiple geolocation service endpoints to try as fallbacks
const GEO_SERVICES = [
  'https://ipapi.co/json/',
  'https://api.ipify.org?format=json', // Just gets IP
  'https://geolocation-db.com/json/' // Another free geo service
];

export async function GET() {
  try {
    // Try each location service in order until one works
    let locationData = null;
    let errors = [];

    // First attempt: Primary service
    try {
      const response = await fetch(GEO_SERVICES[0], { 
        cache: 'no-store',
        headers: { 'User-Agent': 'Spark Date Ideas App/1.0' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.city) {
          console.log('Location detected from primary service');
          locationData = data;
        } else {
          errors.push('Primary service returned no city information');
        }
      } else {
        errors.push(`Primary service responded with status: ${response.status}`);
      }
    } catch (error) {
      errors.push(`Primary service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Second attempt: Try with ipify to get IP then try geoIP service
    if (!locationData) {
      try {
        // Get IP address first
        const ipResponse = await fetch(GEO_SERVICES[1], { cache: 'no-store' });
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          if (ipData && ipData.ip) {
            // Use IP with geolocation-db
            const geoResponse = await fetch(`https://geolocation-db.com/json/${ipData.ip}`, { cache: 'no-store' });
            if (geoResponse.ok) {
              const geoData = await geoResponse.json();
              if (geoData && geoData.city) {
                console.log('Location detected from secondary service');
                locationData = {
                  city: geoData.city,
                  country_name: geoData.country_name,
                  country_code: geoData.country_code,
                  latitude: geoData.latitude,
                  longitude: geoData.longitude,
                  ip: ipData.ip
                };
              } else {
                errors.push('Secondary service returned no city information');
              }
            }
          }
        }
      } catch (error) {
        errors.push(`Secondary service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Third attempt: Direct call to third service
    if (!locationData) {
      try {
        const response = await fetch(GEO_SERVICES[2], { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          if (data && data.city && data.city !== "Not found") {
            console.log('Location detected from tertiary service');
            locationData = {
              city: data.city,
              country_name: data.country_name,
              country_code: data.country_code,
              latitude: data.latitude,
              longitude: data.longitude,
              ip: data.IPv4
            };
          } else {
            errors.push('Tertiary service returned no city information');
          }
        } else {
          errors.push(`Tertiary service responded with status: ${response.status}`);
        }
      } catch (error) {
        errors.push(`Tertiary service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // If we found location data, return it
    if (locationData) {
      return NextResponse.json({
        city: locationData.city,
        country: locationData.country_name,
        country_code: locationData.country_code,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        region: locationData.region,
        postal: locationData.postal,
        timezone: locationData.timezone,
        // Include all other fields from response
        ip: locationData.ip,
        org: locationData.org,
        currency: locationData.currency,
        currency_name: locationData.currency_name,
        in_eu: locationData.in_eu,
        // Include timestamp to help with cache management
        timestamp: Date.now(),
        // Debug info
        source: 'geo-api'
      });
    }

    // If we've exhausted all services, return a 404
    return NextResponse.json({
      error: 'Location detection failed',
      message: 'Could not determine your location from your IP address',
      details: errors,
      timestamp: Date.now()
    }, { status: 404 });
    
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch location',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }, { status: 500 });
  }
}