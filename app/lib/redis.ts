import { Redis } from '@upstash/redis';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Redis environment variables');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export interface KOLData {
  walletAddress: string;
  username: string;
  socialAccounts: {
    [key: string]: {
      handle: string;
      followers: number;
    };
  };
  activeChain: string;
  targetCountry: string;
  contentTypes: string[];
  platforms: string[];
  createdAt: number;
} 