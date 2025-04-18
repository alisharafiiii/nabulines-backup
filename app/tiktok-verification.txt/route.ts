import { NextResponse } from 'next/server';

export async function GET() {
  // TikTok verification content
  const content = 'tiktok-developers-site-verification=9mCuZrAy1oofxb1Lo2Mo3ZNnCVTTeY54';
  
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-store',
    },
  });
} 