import { NextRequest, NextResponse } from 'next/server';
import { getFullAstrologyData, performMatchMaking } from '@/lib/astrology/calculator';

async function getClientLocation(req: NextRequest) {
  // 1. Try Vercel headers
  const vercelLat = req.headers.get('x-vercel-ip-latitude');
  const vercelLng = req.headers.get('x-vercel-ip-longitude');
  
  if (vercelLat && vercelLng) {
    const lat = parseFloat(vercelLat);
    const lng = parseFloat(vercelLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      console.log(`[API Astrology] Detected Vercel location: ${lat}, ${lng}`);
      return { lat, lng };
    }
  }

  // 2. Try to get IP from x-forwarded-for
  const forwardedFor = req.headers.get('x-forwarded-for');
  let ip = forwardedFor ? forwardedFor.split(',')[0].trim() : null;
  if (!ip) {
    ip = req.headers.get('x-real-ip');
  }

  // Skip lookup for localhost / private IPs
  if (ip && ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
    try {
      // Use ip-api.com (free, no key required for HTTP)
      const res = await fetch(`http://ip-api.com/json/${ip}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const geo = await res.json();
        if (geo && geo.status === 'success' && typeof geo.lat === 'number' && typeof geo.lon === 'number') {
          console.log(`[API Astrology] Detected Geo-IP location for ${ip}: ${geo.lat}, ${geo.lon}`);
          return { lat: geo.lat, lng: geo.lon };
        }
      }
    } catch (err) {
      console.warn('[API Astrology] GeoIP lookup failed:', err);
    }
  }

  // 3. Fallback to Central India default
  console.log('[API Astrology] Using default Central India location: 22.9734, 78.6569');
  return { lat: 22.9734, lng: 78.6569 };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    if (type === 'match') {
      const { boyDetails, girlDetails } = data;
      // Convert ISO strings back to Date objects
      const bDate = new Date(boyDetails.date);
      const gDate = new Date(girlDetails.date);
      
      const result = await performMatchMaking(
        { ...boyDetails, date: bDate },
        { ...girlDetails, date: gDate }
      );
      return NextResponse.json(result);
    }

    if (type === 'kundli' || type === 'horoscope' || type === 'full') {
      const { date, lat, lng, timezoneOffset } = data;
      
      let finalLat = lat;
      let finalLng = lng;
      if (type === 'horoscope' && (!lat || !lng || (lat === 22.9734 && lng === 78.6569))) {
        const geo = await getClientLocation(req);
        finalLat = geo.lat;
        finalLng = geo.lng;
      }
      
      const bDate = new Date(date);
      const result = await getFullAstrologyData(bDate, finalLat, finalLng, timezoneOffset);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('[API Astrology] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
