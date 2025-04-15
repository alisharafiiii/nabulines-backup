import { NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

export async function GET() {
  // using a static key for testing
  const username = 'sharafi_eth';
  const key = `twitter:user:${username}`;
  const twitterData = await redis.get<string>(key);

  // TEMPORARY: log the value from redis
  console.log('DEBUG - redis key:', key, 'value:', twitterData);

  if (!twitterData) {
    return NextResponse.json({ error: 'No twitter data found' }, { status: 404 });
  }
  return NextResponse.json(JSON.parse(twitterData));
} 