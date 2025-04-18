"use client";

import { Press_Start_2P } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export default function Terms() {
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
    return <div>tiktok-developers-site-verification=rBTfLFCDpwGEymExx7g3Wx6K7gAvEFWg</div>;
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
            <h1 className={`text-2xl mb-6 ${pressStart.className}`}>TERMS OF SERVICE</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-8">
        {/* 
          Hidden verification text for TikTok crawlers
          This will be hidden for regular users but visible to crawlers
        */}
        <div className="tiktok-verification" aria-hidden="true">
          tiktok-developers-site-verification=rBTfLFCDpwGEymExx7g3Wx6K7gAvEFWg
        </div>
        
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>Last Updated: April 18, 2025</h2>
            
            <p className="mb-4">
              Welcome to NABULINES. These Terms of Service ("Terms") govern your access to and use of the NABULINES platform,
              services, and website (collectively, the "Service"). By accessing or using the Service, you agree to be bound
              by these Terms.
            </p>
            
            <p className="mb-4">
              NABULINES is a gateway for creators to join curated, onchain opportunities,
              connecting real Key Opinion Leaders (KOLs) with meaningful campaigns, rewards, and ecosystems — 
              all based on transparency, self-custody, and verified presence.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>TikTok Integration</h2>
            
            <p className="mb-4">
              Our Service allows you to connect your TikTok account. By connecting your TikTok account, you:
            </p>
            
            <ul className="list-disc pl-6 mb-4">
              <li>Grant us permission to access your basic public profile information</li>
              <li>Confirm that you are authorized to connect your TikTok account to our Service</li>
              <li>Agree to comply with TikTok's terms of service</li>
              <li>Understand that TikTok may change its API functionality or terms, which could affect our Service</li>
            </ul>
            
            <p className="mb-4">
              We do not claim ownership of your TikTok content. You may disconnect your TikTok account at any time.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>User Accounts</h2>
            
            <p className="mb-4">
              When you create an account with us, you agree to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate, current, and complete account information</li>
              <li>Maintain and update your account information</li>
              <li>Keep your account credentials secure</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
            
            <p className="mb-4">
              We reserve the right to suspend or terminate accounts that violate these Terms,
              provide false information, or engage in unauthorized activities.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>Verification and Authenticity</h2>
            
            <p className="mb-4">
              Our platform focuses on real influence and verified presence. We may:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Verify your identity and social media presence</li>
              <li>Review your content and engagement metrics</li>
              <li>Ask for additional information to confirm your authenticity</li>
              <li>Remove accounts that misrepresent their identity or influence</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>Prohibited Activities</h2>
            
            <p className="mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Use the Service for any illegal purpose</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Provide false or misleading information</li>
              <li>Engage in activity that harms our Service or other users</li>
              <li>Use bots, scrapers, or other automated means to access the Service</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>Intellectual Property</h2>
            
            <p className="mb-4">
              The Service and its content, features, and functionality are owned by NABULINES and are protected
              by copyright, trademark, and other intellectual property laws.
            </p>
            
            <p className="mb-4">
              We respect the intellectual property rights of others. If you believe your intellectual property has been
              used in a way that constitutes infringement, please contact us.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>Termination</h2>
            
            <p className="mb-4">
              We may terminate or suspend your account and access to the Service at our sole discretion, without
              notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties,
              or for any other reason.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>Limitation of Liability</h2>
            
            <p className="mb-4">
              To the maximum extent permitted by law, NABULINES shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, including loss of profits, data, or goodwill, resulting from
              your access to or use of or inability to access or use the Service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>Changes to Terms</h2>
            
            <p className="mb-4">
              We may modify these Terms at any time. We will provide notice of material changes by posting the
              amended Terms on the Service. Your continued use of the Service after such changes constitutes your
              acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className={`text-xl mb-4 text-[#00FF00] ${pressStart.className}`}>Contact</h2>
            
            <p className="mb-4">
              If you have any questions about these Terms, please contact us at terms@nabulines.com
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