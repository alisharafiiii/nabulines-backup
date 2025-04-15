import { NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { redis } from '@/app/lib/redis';

// Use environment variables
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;

// Log credentials status (without exposing actual values)
console.log('Twitter API credentials status:', {
  hasKey: !!TWITTER_API_KEY,
  keyLength: TWITTER_API_KEY?.length,
  hasSecret: !!TWITTER_API_SECRET,
  secretLength: TWITTER_API_SECRET?.length,
  environment: process.env.NODE_ENV
});

if (!TWITTER_API_KEY || !TWITTER_API_SECRET) {
  throw new Error('Twitter API credentials are not configured');
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
  try {
    console.log('Starting Twitter authentication...');
    
    // Get the callback URL from the request
    const requestUrl = new URL(request.url);
    const callbackUrl = requestUrl.searchParams.get('callbackUrl') || 'https://nabulines.com/api/auth/callback/twitter';
    console.log('Callback URL:', callbackUrl);

    // Endpoint for testing environment variables
    if (requestUrl.searchParams.get('test') === 'env') {
      return NextResponse.json({
        status: 'success',
        credentials: {
          key: {
            exists: !!TWITTER_API_KEY,
            length: TWITTER_API_KEY?.length,
            first2Chars: TWITTER_API_KEY?.substring(0, 2),
            last2Chars: TWITTER_API_KEY?.substring(TWITTER_API_KEY.length - 2)
          },
          secret: {
            exists: !!TWITTER_API_SECRET,
            length: TWITTER_API_SECRET?.length,
            first2Chars: TWITTER_API_SECRET?.substring(0, 2),
            last2Chars: TWITTER_API_SECRET?.substring(TWITTER_API_SECRET.length - 2)
          }
        }
      });
    }

    // Generate request token
    const requestData = {
      url: 'https://api.twitter.com/oauth/request_token',
      method: 'POST',
      data: { oauth_callback: callbackUrl }
    };

    // Log the exact credentials being used
    console.log('Using Twitter API credentials:', {
      key: TWITTER_API_KEY,
      secret: TWITTER_API_SECRET,
      callbackUrl: callbackUrl
    });

    // Generate authorization header and log it
    const authHeader = oauth.toHeader(oauth.authorize(requestData));
    console.log('Full Authorization header:', authHeader);

    // Log the request data being used for signing
    console.log('Request data for signing:', requestData);

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

    console.log('Request token response status:', response.status);
    const responseText = await response.text();
    console.log('Request token response:', responseText);

    if (!response.ok) {
      console.error('Failed to get request token. Status:', response.status);
      console.error('Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2));
      console.error('Response body:', responseText);
      
      // Parse the error response if possible
      let errorDetails = {};
      try {
        const errorParams = new URLSearchParams(responseText);
        errorDetails = {
          status: response.status,
          statusText: response.statusText,
          error: errorParams.get('error'),
          error_description: errorParams.get('error_description'),
          raw_response: responseText
        };
      } catch {
        errorDetails = {
          status: response.status,
          statusText: response.statusText,
          raw_response: responseText
        };
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to get request token from Twitter',
          details: errorDetails
        },
        { status: response.status }
      );
    }

    const params = new URLSearchParams(responseText);
    const oauthToken = params.get('oauth_token');
    const oauthTokenSecret = params.get('oauth_token_secret');

    console.log('OAuth token:', oauthToken);
    console.log('OAuth token secret:', oauthTokenSecret);

    if (!oauthToken || !oauthTokenSecret) {
      console.error('Missing OAuth tokens in response. Full response:', responseText);
      return NextResponse.json(
        { 
          error: 'Invalid response from Twitter',
          details: { 
            response: responseText,
            parsed_params: Object.fromEntries(params.entries())
          }
        },
        { status: 500 }
      );
    }

    // Store the token secret in Redis with expiration
    await redis.set(`twitter:temp:${oauthToken}`, oauthTokenSecret, {
      ex: 300, // 5 minutes expiration
    });

    // Generate authorization URL without force_login parameter
    const authUrl = `https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`;    console.log('Authorization URL:', authUrl);

    return NextResponse.json({ authUrl }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Twitter auth error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { 
        error: 'Failed to authenticate with Twitter',
        details: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        }
      },
      { status: 500 }
    );
  }
} 