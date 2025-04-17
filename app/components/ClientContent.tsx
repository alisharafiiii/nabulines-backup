"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect, useState } from "react";
import { Press_Start_2P } from "next/font/google";
import Image from "next/image";
import WalletSelector from "./WalletSelector";
import { useAccount } from "wagmi";

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export default function ClientContent() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const { isConnected } = useAccount();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  useEffect(() => {
    setUsername(localStorage.getItem('username'));
  }, []);

  return (
    <div className="flex flex-col min-h-screen font-sans text-white bg-black">
      <header className="w-full max-w-7xl mx-auto px-4 pt-24 pb-6">
        <div className="w-full flex flex-col sm:flex-row items-center gap-4">
          {isConnected && username && (
            <div className="absolute left-4 top-4">
              <span className={`text-[#00FF00] ${pressStart.className}`}>{username}</span>
            </div>
          )}
          <div className="flex-1 flex justify-center">
            <Image
              src="/logo.png"
              alt="NABULINES"
              width={128}
              height={128}
              priority
              className="w-auto h-auto"
            />
          </div>
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-4 py-3">
        <main className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
          <WalletSelector />
        </main>

        <footer className="mt-2 pt-4 flex justify-center">
          <p className={`text-xs text-gray-500 ${pressStart.className}`}>
            Built on Base with MiniKit
          </p>
        </footer>
      </div>
    </div>
  );
} 