import { NextResponse } from 'next/server';
import OAuth from 'oauth-1.0a';
import crypto from 'crypto';
import { redis } from '@/app/lib/redis';

// Use environment variables with fallback for development
const TWITTER_API_KEY = process.env.TWITTER_API_KEY || '8as6C4vDg6OLJyyi2Gy1CcYBU';
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET || 'zgqEXqe8sUyKSYYtYFWNaCnTZAgdkWz6w7u5279dOLcVdlKJXe';

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
    console.log('🚨 entered twitter callback route');
    
    const { searchParams } = new URL(request.url);
    const oauthToken = searchParams.get('oauth_token');
    const oauthVerifier = searchParams.get('oauth_verifier');

    console.log('OAuth token:', oauthToken);
    console.log('OAuth verifier:', oauthVerifier);

    if (!oauthToken || !oauthVerifier) {
      console.error('Missing OAuth token or verifier');
      return NextResponse.json(
        { error: 'Invalid OAuth response' },
        { status: 400 }
      );
    }

    // Get the stored token secret
    const tokenSecret = await redis.get<string>(`twitter:temp:${oauthToken}`);
    if (!tokenSecret) {
      console.error('Token secret not found for token:', oauthToken);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    console.log('Found token secret, exchanging for access token...');

    // Exchange request token for access token
    const request_data = {
      url: 'https://api.twitter.com/oauth/access_token',
      method: 'POST',
      data: {
        oauth_token: oauthToken,
        oauth_verifier: oauthVerifier,
      },
    };

    const authHeader = oauth.toHeader(oauth.authorize(request_data, {
      key: oauthToken,
      secret: tokenSecret,
    }));

    console.log('Making request to exchange token...');
    const response = await fetch(request_data.url, {
      method: request_data.method,
      headers: {
        ...authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('Token exchange response status:', response.status);
    const responseText = await response.text();
    console.log('Token exchange response:', responseText);

    if (!response.ok) {
      console.error('Failed to exchange token:', responseText);
      return NextResponse.json(
        { error: 'Failed to exchange token' },
        { status: response.status }
      );
    }

    // Parse the response
    const params = new URLSearchParams(responseText);
    const accessToken = params.get('oauth_token');
    const accessTokenSecret = params.get('oauth_token_secret');
    const userId = params.get('user_id');
    const screenName = params.get('screen_name');

    console.log('Token exchange response params:', {
      accessToken: accessToken ? 'present' : 'missing',
      accessTokenSecret: accessTokenSecret ? 'present' : 'missing',
      userId: userId ? 'present' : 'missing',
      screenName: screenName ? 'present' : 'missing'
    });

    // Test if we can fetch user data from twitter
    const testRequestData = {
      url: 'https://api.twitter.com/1.1/account/verify_credentials.json',
      method: 'GET',
    };

    const testAuthHeader = oauth.toHeader(
      oauth.authorize(testRequestData, {
        key: accessToken as string,
        secret: accessTokenSecret as string,
      })
    );

    console.log('⚙️ pre-fetch: about to call verify_credentials');
    const testRes = await fetch(testRequestData.url, {
      method: 'GET',
      headers: testAuthHeader,
    });
    console.log('⚙️ post-fetch: verify_credentials call finished');

    const testData = await testRes.json();
    if (!testRes.ok) {
      console.error('❌ failed to fetch user data:', testRes.status, testData);
    } else {
      console.log('🧪 full twitter data dump:', JSON.stringify(testData, null, 2));
    }

    if (!accessToken || !accessTokenSecret || !userId || !screenName) {
      console.error('Missing required tokens or user info. Full params:', Object.fromEntries(params.entries()));
      return NextResponse.json(
        { error: 'Invalid token exchange response' },
        { status: 500 }
      );
    }

    // Store the complete Twitter data
    const twitterData = {
      access_token: accessToken,
      access_token_secret: accessTokenSecret,
      user_id: userId,
      screen_name: screenName,
      name: testData.name,
      description: testData.description,
      profile_image_url: testData.profile_image_url_https,
      followers_count: testData.followers_count,
      following_count: testData.friends_count,
      verified: testData.verified
    };

    console.log('Storing Twitter data in Redis:', {
      key: `twitter:user:${screenName}`,
      data: {
        ...twitterData,
        access_token: '***' + accessToken.slice(-4),
        access_token_secret: '***' + accessTokenSecret.slice(-4)
      }
    });

    await redis.set(`twitter:user:${screenName}`, JSON.stringify(twitterData));
    console.log('Twitter credentials stored for user:', screenName);

    // Clean up the temporary token
    await redis.del(`twitter:temp:${oauthToken}`);

    // Redirect back to the main app
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'https://nabulines.com'}`);
  } catch (error) {
    console.error('Twitter callback error:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to process Twitter callback' },
      { status: 500 }
    );
  }
} 