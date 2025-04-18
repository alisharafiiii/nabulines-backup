import { NextResponse } from 'next/server';

export async function GET() {
  const mockData = [
    {
      address: '0x1234567890123456789012345678901234567890',
      username: 'user1',
      socialData: [
        {
          platform: 'twitter',
          handle: 'user1',
          followers: 1000,
          timestamp: Date.now()
        },
        {
          platform: 'instagram',
          handle: 'user1',
          followers: 2000,
          timestamp: Date.now()
        }
      ]
    },
    {
      address: '0x0987654321098765432109876543210987654321',
      username: 'user2',
      socialData: [
        {
          platform: 'twitter',
          handle: 'user2',
          followers: 5000,
          timestamp: Date.now()
        },
        {
          platform: 'youtube',
          handle: 'user2',
          followers: 10000,
          timestamp: Date.now()
        }
      ]
    }
  ];

  return NextResponse.json(mockData);
} 