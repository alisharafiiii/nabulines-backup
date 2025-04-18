import { NextResponse } from 'next/server';
import { redis } from '@/app/lib/redis';

const ADMIN_WALLET = "0x37Ed24e7c7311836FD01702A882937138688c1A9";

export async function GET(request: Request) {
  try {
    // Check authorization
    const walletAddress = request.headers.get('x-wallet-address');
    
    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 401 });
    }
    
    // Verify that the request is from the admin wallet
    if (walletAddress.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
      return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
    }
    
    // Get all Twitter users
    const keys = await redis.keys('twitter:*');
    
    // Filter out temporary tokens
    const userKeys = keys.filter(key => !key.startsWith('twitter:temp:'));
    
    const userMap = new Map(); // Use a map to deduplicate by screen_name
    
    for (const key of userKeys) {
      try {
        const rawData = await redis.get(key);
        if (!rawData) continue;
        
        // Parse the stored JSON
        const userData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
        
        // Skip if missing essential data
        const screenName = userData.screenName || userData.screen_name;
        if (!screenName) continue;
        
        // Create formatted user object
        const userObj = {
          screen_name: screenName,
          name: userData.name || userData.screenName || userData.screen_name || 'Twitter User',
          profile_image_url: userData.profileImageUrl || userData.profile_image_url || `https://twitter.com/${screenName}/profile_image?size=original`,
          followers_count: userData.followersCount || userData.followers_count || 0,
          friends_count: userData.friendsCount || userData.friends_count || 0,
          verified: userData.verified || false,
          description: userData.description || '',
          location: userData.location || '',
          url: userData.url || `https://twitter.com/${screenName}`,
          verified_at: userData.createdAt || userData.verified_at || userData.created_at || new Date().toISOString(),
          userId: userData.userId || userData.user_id || key.replace('twitter:', ''),
          timestamp: userData.timestamp || Date.now()
        };
        
        // Only keep the most complete entry for each screen name
        if (!userMap.has(screenName) || isMoreComplete(userObj, userMap.get(screenName))) {
          userMap.set(screenName, userObj);
        }
      } catch (error) {
        console.error(`Error processing Twitter user data for key ${key}:`, error);
        // Continue with the next key
      }
    }
    
    // Convert map to array and sort by followers count (descending)
    const verifiedUsers = Array.from(userMap.values())
      .sort((a, b) => b.followers_count - a.followers_count);
    
    return NextResponse.json(verifiedUsers);
  } catch (error) {
    console.error('Error in Twitter verified endpoint:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch verified Twitter users'
    }, { status: 500 });
  }
}

// Helper function to determine if one user entry is more complete than another
function isMoreComplete(newUser: any, existingUser: any): boolean {
  if (!existingUser) return true;
  
  // Count properties that have actual values
  const countValidProps = (obj: any) => {
    return Object.values(obj).filter(val => 
      val !== null && val !== undefined && val !== '' && val !== 0
    ).length;
  };
  
  // Check followers count first
  if (newUser.followers_count > existingUser.followers_count) return true;
  if (newUser.followers_count < existingUser.followers_count) return false;
  
  // Check if the new entry has a profile image URL and the existing one doesn't
  if (newUser.profile_image_url && !existingUser.profile_image_url) return true;
  
  // If both have similar follower counts, prefer the more complete entry
  return countValidProps(newUser) > countValidProps(existingUser);
} 