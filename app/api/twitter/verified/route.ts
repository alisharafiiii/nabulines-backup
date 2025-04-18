import { NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

interface TwitterUser {
  id: string;
  screen_name: string;
  profile_image_url?: string;
  verified_at: number;
  is_verified?: boolean; // Twitter blue checkmark
  [key: string]: any;
}

export async function GET() {
  try {
    // Get all twitter user keys
    const twitterKeys = await redis.keys('twitter:*');
    console.log('Found Twitter keys:', twitterKeys);
    
    const verifiedUsers: TwitterUser[] = [];
    
    // Process each Twitter user
    for (const key of twitterKeys) {
      try {
        const userData = await redis.get<TwitterUser | null>(key);
        console.log('Twitter user data for', key, ':', userData);
        
        // Include both our own verified users AND users with Twitter blue checkmarks
        if (userData && typeof userData === 'object' && 
            (('verified_at' in userData && userData.verified_at) || 
             ('is_verified' in userData && userData.is_verified === true))
           ) {
          console.log('Found verified Twitter user:', userData.screen_name);
          verifiedUsers.push(userData);
        }
      } catch (error) {
        console.error(`Error processing Twitter user for ${key}:`, error);
      }
    }
    
    console.log('Total verified users found:', verifiedUsers.length);
    return NextResponse.json(verifiedUsers);
  } catch (error) {
    console.error('Error fetching verified Twitter users:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 