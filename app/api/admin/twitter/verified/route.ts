import { NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

export async function GET() {
  try {
    // Get all verified Twitter keys
    const keys = await redis.keys('twitter:verified:*');
    console.log('Found verified Twitter keys:', keys);

    // Fetch data for each key
    const verifiedUsers = await Promise.all(
      keys.map(async (key) => {
        const data = await redis.get<string>(key);
        if (data) {
          return {
            key,
            data: JSON.parse(data)
          };
        }
        return null;
      })
    );

    // Filter out any null results and return the data
    const validUsers = verifiedUsers.filter((user): user is NonNullable<typeof user> => user !== null);
    
    return NextResponse.json({
      count: validUsers.length,
      users: validUsers
    });
  } catch (error) {
    console.error('Error fetching verified Twitter data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verified Twitter data' },
      { status: 500 }
    );
  }
} 