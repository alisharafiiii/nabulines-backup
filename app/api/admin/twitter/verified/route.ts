import { NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

export async function GET() {
  try {
    // fetch all keys matching the verified data pattern
    const keys = await redis.keys('twitter:verified:*');
    console.log('DEBUG - verified keys:', keys);
    
    const verifiedRecords = [];
    for (const key of keys) {
      let data = await redis.get<string>(key);
      if (!data) {
        console.log('DEBUG - no data found for key:', key);
        continue;
      }
      console.log('DEBUG - key:', key, 'raw data:', data);
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (err) {
        console.error('Failed to parse data for key:', key, 'data:', data, 'error:', err);
        parsedData = data; // fallback: use raw data if JSON.parse fails
      }
      verifiedRecords.push({ key, data: parsedData });
    }
    
    return NextResponse.json({
      totalVerified: keys.length,
      verifiedRecords,
    });
  } catch (error) {
    console.error('ERROR fetching verified records:', error);
    return NextResponse.json({ error: 'Failed to fetch verified records' }, { status: 500 });
  }
} 