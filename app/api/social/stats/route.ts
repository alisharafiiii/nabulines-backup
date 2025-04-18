import { NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';
import { SocialData } from '@/app/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    console.log('Fetching stats for platform:', platform);

    if (!platform) {
      return NextResponse.json(
        { error: "Platform parameter is required" },
        { status: 400 }
      );
    }

    // Get all username keys
    const usernameKeys = await redis.keys('social:*');
    console.log('Found social keys:', usernameKeys.length);
    
    // Initialize stats
    let totalUsers = 0;
    let totalFollowers = 0;
    let processedUsernames: string[] = [];
    
    // Process each user's social data
    for (const key of usernameKeys) {
      // Skip keys that don't match the social data pattern
      if (!key.startsWith('social:')) {
        console.log('Skipping non-social key:', key);
        continue;
      }
      
      // Extract username from key
      const username = key.replace('social:', '');
      
      // Skip if we've already processed this username
      if (processedUsernames.includes(username)) {
        console.log('Skipping already processed username:', username);
        continue;
      }
      
      // Mark username as processed
      processedUsernames.push(username);
      
      try {
        console.log('Processing data for username:', username);
        const socialData = await redis.get<SocialData[]>(key);
        
        if (socialData && Array.isArray(socialData)) {
          console.log('Social data for', username, ':', socialData);
          // Find data for the requested platform
          const platformData = socialData.find(data => data.platform === platform);
          
          if (platformData) {
            console.log('Found platform data:', platformData);
            totalUsers++;
            // Only add followers if they're a valid number
            if (typeof platformData.followers === 'number' && !isNaN(platformData.followers)) {
              totalFollowers += platformData.followers;
              console.log('Added followers:', platformData.followers, 'Total now:', totalFollowers);
            } else {
              console.log('Invalid followers count:', platformData.followers);
            }
          } else {
            console.log('No data found for platform', platform, 'for user', username);
          }
        } else {
          console.log('No valid social data for', username, ':', socialData);
        }
      } catch (error) {
        console.error(`Error processing data for ${key}:`, error);
        // Continue with next user even if this one fails
      }
    }
    
    console.log('Final stats:', { platform, totalUsers, totalFollowers });
    
    return NextResponse.json({
      platform,
      totalUsers,
      totalFollowers
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 