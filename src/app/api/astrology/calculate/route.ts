import { NextRequest, NextResponse } from 'next/server';
import { getFullAstrologyData, performMatchMaking } from '@/lib/astrology/calculator';

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

    if (type === 'kundli') {
      const { date, lat, lng } = data;
      const bDate = new Date(date);
      const result = await getFullAstrologyData(bDate, lat, lng);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('[API Astrology] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
