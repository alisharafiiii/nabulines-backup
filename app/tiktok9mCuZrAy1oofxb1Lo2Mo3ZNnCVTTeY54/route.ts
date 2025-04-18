import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Return the TikTok verification content for domain verification
  const verificationContent = 'tiktok-developers-site-verification=9mCuZrAy1oofxb1Lo2Mo3ZNnCVTTeY54';
  
  return new NextResponse(verificationContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-store'
    }
  });
} 