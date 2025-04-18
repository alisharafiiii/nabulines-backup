import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Return the TikTok verification content
  const verificationContent = 'tiktok-developers-site-verification=KAbDnQ7NkuricEmeNdXCllaw2tS4sr4M';
  
  return new NextResponse(verificationContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-store'
    }
  });
} 