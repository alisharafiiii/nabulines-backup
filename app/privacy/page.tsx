"use client";

import { Press_Start_2P } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export default function Privacy() {
  const searchParams = useSearchParams();
  const [showVerification, setShowVerification] = useState(false);
  
  useEffect(() => {
    // Check if this is a TikTok verification request
    const isTikTokVerify = searchParams.get('tiktok-verify') === 'true';
    if (isTikTokVerify) {
      setShowVerification(true);
    }
  }, [searchParams]);

  if (showVerification) {
    // Return only the verification content for TikTok
    return <div>tiktok-developers-site-verification=KAbDnQ7NkuricEmeNdXCllaw2tS4sr4M</div>;
  }

  return (
    <div className="flex flex-col min-h-screen font-sans text-white bg-black">
      <header className="w-full max-w-7xl mx-auto px-4 pt-16 pb-4">
        <div className="w-full flex flex-col items-center gap-4">
          <div className="flex-1 flex flex-col items-center">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="NABULINES"
                width={64}
                height={64}
                priority
                className="w-auto h-auto mb-4"
              />
            </Link>
            <h1 className={`text-2xl mb-6 ${pressStart.className}`}>PRIVACY POLICY</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-8">
        {/* 
          Hidden verification text for TikTok crawlers
          This will be hidden for regular users but visible to crawlers
        */}
        <div className="tiktok-verification" aria-hidden="true">
          tiktok-developers-site-verification=KAbDnQ7NkuricEmeNdXCllaw2tS4sr4M
        </div>
        
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>Last Updated: April 18, 2025</h2>
            
            <p className="mb-4">
              NABULINES serves as a gateway for creators to join curated, onchain opportunities,
              connecting real Key Opinion Leaders (KOLs) with meaningful campaigns, rewards, and ecosystems.
            </p>
            
            <p className="mb-4">
              This Privacy Policy explains how we collect, use, and protect your information when you use our services,
              including through TikTok authentication.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>Information We Collect</h2>
            
            <h3 className="text-lg mb-2">From TikTok:</h3>
            <p className="mb-4">
              When you connect your TikTok account, we receive your basic profile information including:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Display name</li>
              <li>Profile picture</li>
              <li>User ID</li>
              <li>Other public profile data that you've made available</li>
            </ul>
            
            <h3 className="text-lg mb-2">We Do Not Collect:</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Private messages</li>
              <li>Email addresses (unless specifically provided)</li>
              <li>Phone numbers</li>
              <li>Any content from your private TikTok accounts</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>How We Use Your Information</h2>
            
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Create and manage your NABULINES account</li>
              <li>Verify your identity as a creator</li>
              <li>Match you with appropriate onchain opportunities</li>
              <li>Ensure transparency in the verification process</li>
              <li>Communicate with you about opportunities and system updates</li>
              <li>Improve our services</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>Self-Custody and Data Control</h2>
            
            <p className="mb-4">
              In line with our commitment to self-custody, you maintain control over your data:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>You can disconnect your TikTok account at any time</li>
              <li>You can request deletion of your account and associated data</li>
              <li>We only store the minimum necessary information to provide our services</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>Data Sharing</h2>
            
            <p className="mb-4">
              We do not sell your personal data. We may share your information:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>With campaigns and opportunities you choose to engage with</li>
              <li>When required by law</li>
              <li>To protect our rights or the safety of users</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>Security</h2>
            
            <p className="mb-4">
              We implement appropriate security measures to protect your personal information from unauthorized access,
              alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic 
              storage is 100% secure.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>Contact Us</h2>
            
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us at privacy@nabulines.com
            </p>
          </section>
        </div>
      </main>

      <footer className="w-full mt-auto py-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className={`text-xs text-gray-500 ${pressStart.className}`}>
            NABULINES — Real influence, activated onchain.
          </p>
        </div>
      </footer>
    </div>
  );
} 