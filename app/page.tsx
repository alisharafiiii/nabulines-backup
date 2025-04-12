"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect } from "react";
import Image from "next/image";
import { Press_Start_2P } from "next/font/google";
import WalletSelector from "./components/WalletSelector";
import { useAccount } from "wagmi";

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export default function App() {
  const { setFrameReady, isFrameReady } = useMiniKit();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-white bg-black">
      <header className="w-full max-w-7xl mx-auto px-4 py-6">
        <div className="w-full flex justify-center">
          <Image
            src="/logo.png"
            alt="NABULINES"
            width={128}
            height={128}
            priority
          />
        </div>
      </header>

      <div className="w-full max-w-7xl mx-auto px-4 py-3">
        <main className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
          {!isConnected && (
            <div className="flex flex-col items-center justify-center p-4">
              <h1 className={`text-sm md:text-base text-center mb-8 ${pressStart.className} text-white`}>
                building onchain influence with real ones.
              </h1>
              <WalletSelector />
            </div>
          )}
          {isConnected && <WalletSelector />}
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
