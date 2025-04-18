"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentBaseUrl } from "@/app/utils/dynamic-url";
import { Press_Start_2P } from "next/font/google";

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export default function TikTokSignIn() {
  const [isClient, setIsClient] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setIsClient(true);
    // Get the current base URL for absolute paths
    setBaseUrl(getCurrentBaseUrl());
  }, []);

  const handleTikTokSignIn = async () => {
    await signIn("tiktok", { callbackUrl: "/" });
  };

  if (!isClient) return null;

  // Construct absolute URLs for TikTok
  const termsUrl = `${baseUrl}/terms`;
  const privacyUrl = `${baseUrl}/privacy`;

  return (
    <button
      onClick={handleTikTokSignIn}
      className={`flex items-center justify-center w-full space-x-2 px-4 py-3 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
    >
      <Image src="/tt.jpg" alt="TikTok" width={24} height={24} className="w-6 h-6 rounded" />
      <span className="text-sm">Connect TikTok</span>
    </button>
  );
} 