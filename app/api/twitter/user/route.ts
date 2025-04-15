import { NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { redis } from '@/app/lib/redis';

// Use environment variables
const TWITTER_API_KEY = process.env.TWITTER_API_KEY as string;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET as string;

// Only throw error in production if credentials are missing
if (process.env.NODE_ENV === 'production' && (!TWITTER_API_KEY || !TWITTER_API_SECRET)) {
  throw new Error('Twitter API credentials are not configured in production');
}

const oauth = new OAuth({
  consumer: {
    key: TWITTER_API_KEY,
    secret: TWITTER_API_SECRET,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string: string, key: string) {
    return crypto
      .createHmac('sha1', key)
      .update(base_string)
      .digest('base64');
  },
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    console.log('Fetching Twitter data for user:', userId);

    if (!userId) {
      console.error('No userId provided');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get stored Twitter credentials
    const twitterData = await redis.get<string>(`twitter:user:${userId.toLowerCase()}`);
    if (!twitterData) {
      console.error('Twitter credentials not found for user:', userId);
      return NextResponse.json({ error: 'Twitter credentials not found' }, { status: 404 });
    }

    console.log('Found Twitter credentials for user:', userId);
    console.log('Raw Twitter data from Redis:', twitterData);

    let parsedTwitterData;
    try {
      // First try to parse as JSON
      parsedTwitterData = JSON.parse(twitterData);
    } catch (error) {
      console.error('Failed to parse Twitter data as JSON:', error);
      // If it's not valid JSON, try to handle it as a string
      try {
        // Try to parse it as a URL-encoded string
        const params = new URLSearchParams(twitterData);
        parsedTwitterData = {
          access_token: params.get('oauth_token'),
          access_token_secret: params.get('oauth_token_secret')
        };
      } catch (innerError) {
        console.error('Failed to parse Twitter data in alternative format:', innerError);
        return NextResponse.json({ 
          error: 'Invalid Twitter credentials format',
          details: {
            originalError: error instanceof Error ? error.message : 'Unknown error',
            alternativeError: innerError instanceof Error ? innerError.message : 'Unknown error',
            rawData: twitterData
          }
        }, { status: 500 });
      }
    }

    const { access_token, access_token_secret } = parsedTwitterData;

    if (!access_token || !access_token_secret) {
      console.error('Missing access token or secret in parsed data:', parsedTwitterData);
      return NextResponse.json({ error: 'Invalid Twitter credentials' }, { status: 500 });
    }

    // Fetch user data from Twitter API
    const request_data = {
      url: 'https://api.twitter.com/1.1/users/show.json',
      method: 'GET',
      data: {
        screen_name: userId,
      },
    };

    console.log('Making request to Twitter API:', {
      ...request_data,
      auth: {
        access_token: '***' + access_token.slice(-4),
        access_token_secret: '***' + access_token_secret.slice(-4)
      }
    });

    const authHeader = oauth.toHeader(oauth.authorize(request_data, {
      key: access_token,
      secret: access_token_secret,
    }));

    console.log('Auth header:', authHeader);

    const response = await fetch(`${request_data.url}?screen_name=${userId}`, {
      method: request_data.method,
      headers: {
        ...authHeader,
      },
    });

    console.log('Twitter API response status:', response.status);

    if (!response.ok) {
      let errorDetails;
      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData);
      } catch {
        errorDetails = await response.text();
      }
      
      console.error('Twitter API error:', errorDetails);
      return NextResponse.json(
        { 
          error: 'Failed to fetch user data from Twitter',
          details: errorDetails
        },
        { status: response.status }
      );
    }

    const userData = await response.json();
    console.log('Received user data from Twitter:', userData);

    // Create NABUPASS data
    const nabupass = {
      username: userData.screen_name,
      name: userData.name,
      verified: userData.verified,
      profileImage: userData.profile_image_url_https.replace('_normal', ''),
      description: userData.description,
      nabupassId: `NABUPASS-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    console.log('Created NABUPASS data:', nabupass);

    // Store NABUPASS data
    await redis.set(`nabupass:${userId}`, JSON.stringify(nabupass));

    return NextResponse.json(nabupass);
  } catch (error) {
    console.error('Error fetching Twitter user data:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { 
        error: 'Failed to fetch Twitter user data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 