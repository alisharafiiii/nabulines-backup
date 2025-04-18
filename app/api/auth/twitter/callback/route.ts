import { NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { redis } from '@/app/lib/redis';

// Use environment variables
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;

// Define interface for Twitter user data
interface TwitterAdditionalData {
  name?: string;
  profile_image_url?: string;
  followers_count?: number;
  friends_count?: number;
  verified?: boolean;
  description?: string;
  location?: string;
}

// Initialize OAuth 1.0a
const oauth = new OAuth({
  consumer: {
    key: TWITTER_API_KEY || '',
    secret: TWITTER_API_SECRET || ''
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto
      .createHmac('sha1', key)
      .update(base_string)
      .digest('base64');
  },
});

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  
  try {
    // Check if Twitter API credentials are configured
    if (!TWITTER_API_KEY || !TWITTER_API_SECRET) {
      console.error('Twitter API credentials are not configured');
      return simpleRedirect(requestUrl.origin, 'Twitter API credentials are not configured');
    }
    
    const oauthToken = requestUrl.searchParams.get('oauth_token');
    const oauthVerifier = requestUrl.searchParams.get('oauth_verifier');
    
    if (!oauthToken || !oauthVerifier) {
      console.error('Missing oauth_token or oauth_verifier');
      return simpleRedirect(requestUrl.origin, 'Missing OAuth parameters');
    }
    
    // Verify redis connection
    try {
      // Get the token secret from Redis
      const tokenSecret = await redis.get(`twitter:temp:${oauthToken}`);
      if (!tokenSecret) {
        console.error('Token secret not found in Redis');
        return simpleRedirect(requestUrl.origin, 'Authentication session expired');
      }
      
      // Exchange the request token for an access token
      const requestData = {
        url: 'https://api.twitter.com/oauth/access_token',
        method: 'POST',
        data: {
          oauth_token: oauthToken,
          oauth_verifier: oauthVerifier
        }
      };
      
      const authHeader = oauth.toHeader(oauth.authorize(requestData, {
        key: oauthToken,
        secret: tokenSecret as string
      }));
      
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: {
          ...authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(requestData.data).toString()
      });

      if (!response.ok) {
        console.error('Twitter API response not OK:', response.status);
        return simpleRedirect(requestUrl.origin, `Twitter API error: ${response.status}`);
      }

      const responseText = await response.text();
      const params = new URLSearchParams(responseText);
      const accessToken = params.get('oauth_token');
      const accessTokenSecret = params.get('oauth_token_secret');
      const userId = params.get('user_id');
      const screenName = params.get('screen_name');
      
      if (!accessToken || !accessTokenSecret || !userId || !screenName) {
        console.error('Missing required parameters in Twitter response');
        return simpleRedirect(requestUrl.origin, 'Incomplete data from Twitter');
      }
      
      // Try to fetch additional user data from Twitter API
      let additionalUserData: TwitterAdditionalData = {};
      try {
        // Make a request to the Twitter API to get user details
        const userEndpoint = `https://api.twitter.com/1.1/users/show.json?screen_name=${screenName}`;
        const userRequestData = {
          url: userEndpoint,
          method: 'GET'
        };
        
        const userAuthHeader = oauth.toHeader(
          oauth.authorize(userRequestData, {
            key: accessToken,
            secret: accessTokenSecret
          })
        );
        
        const userResponse = await fetch(userEndpoint, {
          headers: userAuthHeader
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          additionalUserData = {
            name: userData.name,
            profile_image_url: userData.profile_image_url_https?.replace('_normal', '') || 
              `https://twitter.com/${screenName}/profile_image?size=original`,
            followers_count: userData.followers_count || 0,
            friends_count: userData.friends_count || 0,
            verified: userData.verified || false,
            description: userData.description || '',
            location: userData.location || ''
          };
        }
      } catch (twitterApiError) {
        console.error('Error fetching additional Twitter data:', twitterApiError);
        // Continue without additional data
      }
      
      // Store the access token and user data in Redis
      const now = new Date();
      const userData = {
        accessToken,
        accessTokenSecret,
        userId,
        screen_name: screenName,
        // Use fetched profile image if available or fallback
        profile_image_url: additionalUserData.profile_image_url || 
          `https://pbs.twimg.com/profile_images/${userId}`,
        verified_at: now.toISOString(),
        timestamp: now.getTime(),
        ...additionalUserData // Include any additional data we fetched
      };
      
      try {
        await redis.set(`twitter:${userId}`, JSON.stringify(userData));
        // Clean up the temporary token
        await redis.del(`twitter:temp:${oauthToken}`);
      } catch (redisError) {
        console.error('Redis error during user data storage:', redisError);
        // Continue anyway - the callback should still work even with Redis errors
      }

      // Create response with user data for client-side storage
      const redirectUrl = new URL('/?twitter_login=success', requestUrl.origin);
      
      // Create a simple stringified version of the user data
      const userDataString = JSON.stringify({
        screen_name: screenName,
        profile_image_url: userData.profile_image_url,
        timestamp: userData.timestamp
      });
      
      // Create HTML response that will store the user data in localStorage before redirecting
      return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Twitter Login Success</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <p>Redirecting after Twitter login...</p>
          
          <script>
            // Store Twitter user data in localStorage
            try {
              localStorage.setItem('twitter_user', '${userDataString.replace(/'/g, "\\'")}');
              console.log('Twitter user data stored successfully');
            } catch (e) {
              console.error('Error storing Twitter user data:', e);
            }
            
            // Redirect to the main page after a short delay
            setTimeout(function() {
              window.location.href = "${redirectUrl}";
            }, 100);
          </script>
        </body>
      </html>
      `, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    } catch (redisError) {
      console.error('Redis error:', redisError);
      return simpleRedirect(requestUrl.origin, 'Database error');
    }
  } catch (error) {
    console.error('Twitter callback error:', error);
    return simpleRedirect(requestUrl.origin, 'Authentication error');
  }
}

// Simple function to create a redirect with an error parameter
function simpleRedirect(origin: string, errorMessage: string) {
  const url = new URL('/', origin);
  url.searchParams.set('error', errorMessage);
  return NextResponse.redirect(url);
} 