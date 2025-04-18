import { NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

export async function GET() {
  try {
    // Get all username keys
    const usernameKeys = await redis.keys('address:*');
    
    const usernames = [];
    
    // Process each username
    for (const key of usernameKeys) {
      try {
        const username = await redis.get(key);
        if (username) {
          usernames.push({
            username,
            address: key.replace('address:', '')
          });
        }
      } catch (error) {
        console.error(`Error processing username for ${key}:`, error);
      }
    }
    
    return NextResponse.json(usernames);
  } catch (error) {
    console.error('Error fetching all usernames:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 