import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = params.filename;
  
  // Handle specifically the TikTok verification file
  if (filename === 'tiktokrBTfLFCDpwGEymExx7g3Wx6K7gAvEFWg.txt') {
    // Return the exact verification content
    const verificationContent = 'tiktok-developers-site-verification=rBTfLFCDpwGEymExx7g3Wx6K7gAvEFWg';
    
    return new NextResponse(verificationContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store'
      }
    });
  }
  
  // For other files, return a 404
  return new NextResponse('Not found', { status: 404 });
} 