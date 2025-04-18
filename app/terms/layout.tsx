import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - NABULINES',
  description: 'Terms of service for NABULINES, a gateway for creators to join curated, onchain opportunities.',
  // Adding TikTok verification as a meta tag
  other: {
    'tiktok-domain-verification': 'rBTfLFCDpwGEymExx7g3Wx6K7gAvEFWg'
  }
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Render the TikTok verification as a text node for crawlers */}
      <div style={{ display: 'none' }}>
        tiktok-developers-site-verification=rBTfLFCDpwGEymExx7g3Wx6K7gAvEFWg
      </div>
      {children}
    </>
  );
} 