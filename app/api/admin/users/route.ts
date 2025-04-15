import { NextResponse } from "next/server";
import { redis } from "@/app/lib/redis";
import { SocialData } from '@/app/types'

const ADMIN_WALLET = "0x37Ed24e7c7311836FD01702A882937138688c1A9";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Check Redis connection
    try {
      await redis.ping();
      console.log('Redis connection successful');
    } catch (redisError) {
      console.error('Redis connection error:', redisError);
      return NextResponse.json(
        { error: "Database connection error" },
        { status: 503 }
      );
    }

    // Get the wallet address from the request headers
    const walletAddress = request.headers.get("x-wallet-address");
    console.log('Received request from wallet:', walletAddress);

    if (!walletAddress) {
      console.error('No wallet address provided in headers');
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Check if the request is from the admin wallet
    if (walletAddress.toLowerCase() !== ADMIN_WALLET.toLowerCase()) {
      console.error('Unauthorized wallet:', walletAddress);
      return NextResponse.json(
        { error: "Unauthorized wallet address" },
        { status: 401 }
      );
    }

    // Get all address mappings
    const addressKeys = await redis.keys("address:*");
    console.log('Found address keys:', addressKeys.length);

    const users = [];

    // Fetch data for each address
    for (const key of addressKeys) {
      try {
        const address = key.replace('address:', '');
        const username = await redis.get(key);
        
        if (username) {
          // Get social data for this username
          const socialData = await redis.get<SocialData[]>(`social:${username}`) || [];
          
          users.push({
            address,
            username,
            socialData
          });
        }
      } catch (error) {
        console.error('Error processing user data:', error);
        continue;
      }
    }

    console.log('Returning users:', users.length);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 