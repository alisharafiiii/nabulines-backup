import { NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

export async function GET() {
  try {
    // fetch all keys matching the pattern
    const keys = await redis.keys('twitter:verified:*');
    console.log('DEBUG - verified keys:', keys);
    
    const verifiedRecords = [];
    for (const key of keys) {
      const data = await redis.get<string>(key);
      console.log('DEBUG - key:', key, 'data:', data);
      verifiedRecords.push({ key, data: data ? JSON.parse(data) : null });
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