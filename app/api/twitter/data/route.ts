import { NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

export async function GET() {
  const username = 'sharafi_eth';
  const key = `twitter:user:${username}`;
  
  // log the key we're looking for
  console.log('DEBUG - looking for redis key:', key);
  
  // (optional) get all keys matching "twitter:*" to see what's stored
  let allKeys;
  try {
    allKeys = await redis.keys('twitter:*');
    console.log('DEBUG - redis keys:', allKeys);
  } catch (e) {
    console.error('DEBUG - error fetching redis keys:', e);
  }
  
  const twitterData = await redis.get<string>(key);
  console.log('DEBUG - value for', key, ':', twitterData);

  if (!twitterData) {
    return NextResponse.json({ error: 'No twitter data found' }, { status: 404 });
  }
  return NextResponse.json(JSON.parse(twitterData));
} 