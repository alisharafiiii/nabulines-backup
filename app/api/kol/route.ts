import { NextResponse } from 'next/server';
import { redis, KOLData } from '@/app/lib/redis';

export async function POST(request: Request) {
  try {
    const data: KOLData = await request.json();
    
    // Validate required fields
    if (!data.walletAddress || !data.username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if username is unique
    const existingUser = await redis.get(`kol:username:${data.username}`);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Store data in Redis
    await redis.set(`kol:${data.walletAddress}`, data);
    await redis.set(`kol:username:${data.username}`, data.walletAddress);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing KOL data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chain = searchParams.get('chain');
    const country = searchParams.get('country');
    const contentType = searchParams.get('contentType');
    const platform = searchParams.get('platform');

    // Get all KOLs
    const keys = await redis.keys('kol:*');
    const kols = await Promise.all(
      keys.map(async (key) => {
        if (!key.startsWith('kol:username:')) {
          const data = await redis.get(key);
          return data as KOLData | null;
        }
        return null;
      })
    );

    // Filter KOLs based on parameters
    const filteredKols = kols.filter((kol): kol is KOLData => {
      if (!kol) return false;
      if (chain && kol.activeChain !== chain) return false;
      if (country && kol.targetCountry !== country) return false;
      if (contentType && !kol.contentTypes.includes(contentType)) return false;
      if (platform && !kol.platforms.includes(platform)) return false;
      return true;
    });

    return NextResponse.json(filteredKols);
  } catch (error) {
    console.error('Error fetching KOLs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 