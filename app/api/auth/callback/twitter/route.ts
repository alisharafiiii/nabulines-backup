import { NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { redis } from '@/app/lib/redis';

// Use environment variables with fallback for development
const TWITTER_API_KEY = process.env.TWITTER_API_KEY || '8as6C4vDg6OLJyyi2Gy1CcYBU';
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET || 'zgqEXqe8sUyKSYYtYFWNaCnTZAgdkWz6w7u5279dOLcVdlKJXe';

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
    const url = new URL(request.url);
    const oauth_token = url.searchParams.get('oauth_token');
    const oauth_verifier = url.searchParams.get('oauth_verifier');

    console.log('Twitter callback received:', { oauth_token, oauth_verifier });

    if (!oauth_token || !oauth_verifier) {
      console.error('Missing OAuth parameters');
      throw new Error('Missing OAuth parameters');
    }

    // Get the token secret from Redis
    const oauth_token_secret = await redis.get<string>(`twitter:temp:${oauth_token}`);
    if (!oauth_token_secret) {
      console.error('Invalid or expired token');
      throw new Error('Invalid or expired token');
    }

    console.log('Found token secret in Redis');

    const request_data = {
      url: 'https://api.twitter.com/oauth/access_token',
      method: 'POST',
      data: {
        oauth_token,
        oauth_verifier,
      },
    };

    console.log('Making request to Twitter for access token:', request_data);

    const authHeader = oauth.toHeader(oauth.authorize(request_data, {
      key: oauth_token,
      secret: oauth_token_secret,
    }));

    console.log('Auth header:', authHeader);

    const response = await fetch(request_data.url, {
      method: request_data.method,
      headers: {
        ...authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('Access token response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get access token:', errorText);
      throw new Error('Failed to get access token');
    }

    const text = await response.text();
    console.log('Access token response:', text);

    const params = new URLSearchParams(text);
    const access_token = params.get('oauth_token');
    const access_token_secret = params.get('oauth_token_secret');
    const user_id = params.get('user_id');
    const screen_name = params.get('screen_name');

    console.log('Parsed access token data:', {
      access_token,
      access_token_secret,
      user_id,
      screen_name
    });

    if (!access_token || !access_token_secret || !user_id || !screen_name) {
      console.error('Invalid response from Twitter');
      throw new Error('Invalid response from Twitter');
    }

    // Store the access token and user info in Redis with the correct key format
    const twitterUserData = {
      access_token,
      access_token_secret,
      screen_name,
      user_id
    };

    console.log('Storing Twitter user data in Redis:', twitterUserData);

    await redis.set(`twitter:user:${screen_name}`, JSON.stringify(twitterUserData));

    // Clean up the temporary token
    await redis.del(`twitter:temp:${oauth_token}`);

    // Redirect back to the main page with success message
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Twitter callback error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.redirect(new URL('/?error=twitter_auth_failed', request.url));
  }
} 