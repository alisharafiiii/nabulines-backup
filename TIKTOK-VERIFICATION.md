# TikTok Domain Verification Guide

This document guides you through verifying your domain ownership for TikTok integration.

## Overview

TikTok requires you to verify ownership of your domain by placing verification files at specific URLs. We've set up special routes in your Next.js application to handle these verifications.

## Verification File Details

We have three TikTok verification files set up:

### Privacy Policy Verification
- Filename: `tiktokKAbDnQ7NkuricEmeNdXCllaw2tS4sr4M.txt`
- Content: `tiktok-developers-site-verification=KAbDnQ7NkuricEmeNdXCllaw2tS4sr4M`
- URL Path: `/privacy/tiktokKAbDnQ7NkuricEmeNdXCllaw2tS4sr4M.txt`

### Terms of Service Verification
- Filename: `tiktokrBTfLFCDpwGEymExx7g3Wx6K7gAvEFWg.txt`
- Content: `tiktok-developers-site-verification=rBTfLFCDpwGEymExx7g3Wx6K7gAvEFWg`
- URL Path: `/terms/tiktokrBTfLFCDpwGEymExx7g3Wx6K7gAvEFWg.txt`

### Domain Verification
- Filename: `tiktok9mCuZrAy1oofxb1Lo2Mo3ZNnCVTTeY54.txt`
- Content: `tiktok-developers-site-verification=9mCuZrAy1oofxb1Lo2Mo3ZNnCVTTeY54`
- URL Path: `/tiktok9mCuZrAy1oofxb1Lo2Mo3ZNnCVTTeY54`

## Verification Process

1. **The application is already configured** with the correct TikTok verification files at:
   - Privacy Policy: `https://nabulines.com/privacy/tiktokKAbDnQ7NkuricEmeNdXCllaw2tS4sr4M.txt`
   - Terms of Service: `https://nabulines.com/terms/tiktokrBTfLFCDpwGEymExx7g3Wx6K7gAvEFWg.txt`
   - Domain Verification: `https://nabulines.com/tiktok9mCuZrAy1oofxb1Lo2Mo3ZNnCVTTeY54`

2. **Verify the files are accessible**:
   - After deployment, you can check if the files are accessible by visiting their respective URLs
   - The pages should display the verification codes without any HTML or formatting
   - Expected content for Privacy Policy: `tiktok-developers-site-verification=KAbDnQ7NkuricEmeNdXCllaw2tS4sr4M`
   - Expected content for Terms of Service: `tiktok-developers-site-verification=rBTfLFCDpwGEymExx7g3Wx6K7gAvEFWg`
   - Expected content for Domain Verification: `tiktok-developers-site-verification=9mCuZrAy1oofxb1Lo2Mo3ZNnCVTTeY54`

3. **Complete TikTok Verification**:
   - Go back to the TikTok developer portal
   - Verify the URLs are set correctly for each verification
   - Click "Verify" to complete the domain verification process

## Implementation Details

The verification files are implemented as Next.js API routes that return the exact verification content when the correct URL paths are accessed.

### For Domain Verification:

```typescript
// app/tiktok9mCuZrAy1oofxb1Lo2Mo3ZNnCVTTeY54/route.ts
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
```

## Multiple Verification Methods

We've implemented multiple redundant methods to ensure TikTok can verify your domain:

1. **Dynamic routes** for all verification paths
2. **Static files** in the public directory
3. **Meta tags** in the HTML head with all verification codes
4. **Root-level routes** for direct file access
5. **.well-known directory** files following standard conventions

## Troubleshooting

If TikTok fails to verify your domain:

1. Ensure the verification URLs are exactly as provided
2. Verify the content is exactly as specified with no extra spaces, line breaks or HTML tags
3. Check server logs for any errors related to the verification file routes
4. Make sure there are no redirect rules interfering with the verification URLs

## Support

If you continue to have issues with TikTok domain verification, please contact the development team for assistance. 