import { NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

export async function GET() {
  try {
    console.log('DEBUG - Starting admin endpoint');
    
    // fetch all keys matching the verified data pattern
    const keys = await redis.keys('twitter:verified:*');
    console.log('DEBUG - Found verified keys:', keys);
    
    const verifiedRecords = [];
    for (const key of keys) {
      console.log('DEBUG - Processing key:', key);
      const data = await redis.get<string>(key);
      if (!data) {
        console.log('DEBUG - No data found for key:', key);
        continue;
      }
      console.log('DEBUG - Raw data for key:', key, ':', data);
      
      let parsedData;
      try {
        parsedData = JSON.parse(data);
        console.log('DEBUG - Successfully parsed data for key:', key);
      } catch (err) {
        console.error('DEBUG - Failed to parse data for key:', key, 'Error:', err);
        parsedData = data; // fallback: use raw data if JSON.parse fails
      }
      verifiedRecords.push({ key, data: parsedData });
    }
    
    console.log('DEBUG - Returning response with', verifiedRecords.length, 'records');
    return NextResponse.json({
      totalVerified: keys.length,
      verifiedRecords,
    });
  } catch (error) {
    console.error('ERROR in admin endpoint:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch verified records',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 