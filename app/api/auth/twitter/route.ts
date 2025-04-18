import { NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { redis } from '@/app/lib/redis';

// Use environment variables
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;

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
  try {
    // Check if Twitter API credentials are configured
    if (!TWITTER_API_KEY || !TWITTER_API_SECRET) {
      console.error('Twitter API credentials are not configured');
      return NextResponse.json(
        { error: 'Twitter API credentials are not configured' },
        { status: 500 }
      );
    }
    
    // Get the callback URL from the request
    const requestUrl = new URL(request.url);
    const callbackUrl = requestUrl.searchParams.get('callbackUrl') || 'https://nabulines.com/api/auth/twitter/callback';

    // Generate request token
    const requestData = {
      url: 'https://api.twitter.com/oauth/request_token',
      method: 'POST',
      data: { oauth_callback: callbackUrl }
    };

    // Generate authorization header
    const authHeader = oauth.toHeader(oauth.authorize(requestData));

    // Make the request to Twitter
    const response = await fetch(requestData.url, {
      method: requestData.method,
      headers: {
        ...authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(requestData.data).toString(),
      cache: 'no-store'
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Failed to get request token. Status:', response.status);
      return NextResponse.json(
        { error: 'Failed to get request token from Twitter' },
        { status: response.status }
      );
    }

    const params = new URLSearchParams(responseText);
    const oauthToken = params.get('oauth_token');
    const oauthTokenSecret = params.get('oauth_token_secret');

    if (!oauthToken || !oauthTokenSecret) {
      console.error('Missing OAuth tokens in response');
      return NextResponse.json(
        { error: 'Invalid response from Twitter' },
        { status: 500 }
      );
    }

    // Store the token secret in Redis with expiration
    try {
      await redis.set(`twitter:temp:${oauthToken}`, oauthTokenSecret, {
        ex: 300, // 5 minutes expiration
      });
    } catch (redisError) {
      console.error('Failed to store token in Redis:', redisError);
      return NextResponse.json(
        { error: 'Failed to store authentication data' },
        { status: 500 }
      );
    }

    // Generate authorization URL
    const authUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`;

    return NextResponse.json({ authUrl }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Twitter auth error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to authenticate with Twitter' },
      { status: 500 }
    );
  }
} 