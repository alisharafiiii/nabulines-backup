import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Return the TikTok verification content for Terms of Service
  const verificationContent = 'tiktok-developers-site-verification=rBTfLFCDpwGEymExx7g3Wx6K7gAvEFWg';
  
  return new NextResponse(verificationContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-store'
    }
  });
} 