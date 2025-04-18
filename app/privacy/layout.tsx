import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - NABULINES',
  description: 'Privacy policy for NABULINES, a gateway for creators to join curated, onchain opportunities.',
  // Adding TikTok verification as a meta tag
  other: {
    'tiktok-domain-verification': 'KAbDnQ7NkuricEmeNdXCllaw2tS4sr4M'
  }
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Render the TikTok verification as a text node for crawlers */}
      <div style={{ display: 'none' }}>
        tiktok-developers-site-verification=KAbDnQ7NkuricEmeNdXCllaw2tS4sr4M
      </div>
      {children}
    </>
  );
} 