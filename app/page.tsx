"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect, useState } from "react";
import { Press_Start_2P } from "next/font/google";
import Image from "next/image";
import WalletSelector from "./components/WalletSelector";
import { useAccount } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";
import { updateDynamicUrls, getCurrentBaseUrl } from "./utils/dynamic-url";
import { TypeAnimation } from "react-type-animation";

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] });

// Use dynamic URL utility
const localUrl = typeof window !== 'undefined' ? getCurrentBaseUrl() : 'http://localhost:3000';

export default function App() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const { isConnected } = useAccount();
  const [username, setUsername] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [twitterLoginSuccess, setTwitterLoginSuccess] = useState(false);
  const [twitterUser, setTwitterUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for TikTok verification request
  useEffect(() => {
    if (!isMounted) return;

    const isTikTokVerify = searchParams?.get('tiktok-verify') === 'true';
    if (isTikTokVerify) {
      setShowVerification(true);
    }
  }, [searchParams, isMounted]);

  // If this is a TikTok verification request, show only the verification text
  if (showVerification) {
    return <div>tiktok-developers-site-verification=9mCuZrAy1oofxb1Lo2Mo3ZNnCVTTeY54</div>;
  }
  
  // Initialize dynamic URLs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      updateDynamicUrls();
    }
  }, []);

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Set frame ready
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  // Load user data from localStorage
  useEffect(() => {
    if (!isMounted) return;
    
    try {
      // Check if user has a username
      const storedUsername = localStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
      
      // Check for Twitter user data
      const twitterUserData = localStorage.getItem('twitter_user');
      if (twitterUserData) {
        try {
          const userData = JSON.parse(twitterUserData);
          setTwitterUser(userData.screen_name || null);
        } catch (e) {
          console.error('Error parsing Twitter user data:', e);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [isMounted]);

  // Handle URL parameters
  useEffect(() => {
    if (!isMounted) return;
    
    try {
      // Check if there's an error parameter
      const errorParam = searchParams?.get('error');
      if (errorParam) {
        setError(`Twitter login failed: ${errorParam}`);
        router.replace('/'); // Remove the error parameter
        return;
      }
      
      // Check if this is a Twitter login redirect
      const twitterLogin = searchParams?.get('twitter_login');
      if (twitterLogin === 'success') {
        setTwitterLoginSuccess(true);
        
        // Remove query parameter
        router.replace('/');
      }
    } catch (error) {
      console.error('Error handling URL parameters:', error);
      setError('An unexpected error occurred');
    }
  }, [router, searchParams, isMounted]);

  // Show success message after Twitter login
  useEffect(() => {
    if (twitterLoginSuccess) {
      try {
        // Show success message
        alert(`Twitter login successful!${twitterUser ? ` Welcome, @${twitterUser}!` : ''}`);
        setTwitterLoginSuccess(false);
      } catch (error) {
        console.error('Error showing Twitter success:', error);
      }
    }
  }, [twitterLoginSuccess, twitterUser]);

  // Show error message if there's an error
  useEffect(() => {
    if (error) {
      alert(`Error: ${error}`);
      setError(null);
    }
  }, [error]);

  // Don't render anything during server rendering
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {/* TikTok domain verification content - must be quickly discoverable by crawlers */}
      <div id="tiktok-verification" data-testid="tiktok-verification">
        tiktok-developers-site-verification=9mCuZrAy1oofxb1Lo2Mo3ZNnCVTTeY54
      </div>
      
      <div className="flex flex-col min-h-screen font-sans text-white bg-black">
        <header className="w-full max-w-7xl mx-auto px-4 pt-16 pb-4">
          <div className="w-full flex flex-col items-center gap-4">
            {/* Show the username if either connected with wallet or logged in with Twitter */}
            {(isConnected || twitterUser) && username && (
              <div className="absolute left-4 top-4" suppressHydrationWarning>
                <span className={`text-[#00FF00] ${pressStart.className}`}>
                  {username}
                </span>
              </div>
            )}
            <div className="flex-1 flex flex-col items-center">
              <Image
                src="/logo.png"
                alt="NABULINES"
                width={128}
                height={128}
                priority
                className="w-auto h-auto mb-4"
              />
              <h1 className={`text-2xl mb-4 ${pressStart.className}`}>NABULINES</h1>
              <div className={`h-8 ${pressStart.className} relative flex items-center`}>
                <TypeAnimation
                  sequence={[
                    'welcome to The System.',
                    2500, // Pause after sentence
                    '',
                    500,
                    'this isn\'t for everyone.',
                    2500,
                    '',
                    500,
                    'access isn\'t given. it\'s earned.',
                    2500,
                    '',
                    500,
                    'are you one of the real ones?',
                    2500,
                    '',
                    500,
                    'welcome to The System.',
                    2500
                  ]}
                  wrapper="p"
                  // Use the "randomness" parameter for natural-feeling typing
                  speed={{ type: 'keyStrokeDelayInMs', value: 90 }}
                  deletionSpeed={{ type: 'keyStrokeDelayInMs', value: 70 }}
                  style={{ 
                    fontSize: '0.8rem', 
                    display: 'inline-block', 
                    color: '#FFFFFF' 
                  }}
                  repeat={Infinity}
                  cursor={false}
                  omitDeletionAnimation={false}
                  className="text-white"
                />
                <span className="inline-block ml-[1px] w-[7px] h-[14px] bg-[#00FF00] opacity-80 animate-pulse shadow-[0_0_5px_#00FF00,0_0_10px_#00FF00]"></span>
              </div>
            </div>
          </div>
        </header>

        <div className="w-full max-w-7xl mx-auto px-4 py-0">
          <main className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-240px)]">
            <WalletSelector />
          </main>

          <footer className="mt-2 pt-4 flex justify-center">
            <p className={`text-xs text-gray-500 ${pressStart.className}`}>
              Built on Base with MiniKit
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}