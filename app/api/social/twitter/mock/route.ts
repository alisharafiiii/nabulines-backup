import { NextResponse } from 'next/server';

export async function GET() {
  const mockData = {
    verifiedRecords: [
      {
        key: 'user1',
        data: {
          screen_name: 'elonmusk',
          name: 'Elon Musk',
          followers_count: 100000000,
          profile_image_url: 'https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRaGO_400x400.jpg',
          verified_at: new Date().toISOString()
        }
      },
      {
        key: 'user2',
        data: {
          screen_name: 'vitalikbuterin',
          name: 'Vitalik Buterin',
          followers_count: 5000000,
          profile_image_url: 'https://pbs.twimg.com/profile_images/977496875887558661/L86xyLF4_400x400.jpg',
          verified_at: new Date().toISOString()
        }
      }
    ]
  };

  return NextResponse.json(mockData);
} 