"use client";

import { ReactNode, useEffect } from "react";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { ThemeProvider } from "next-themes";
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './lib/wallet'
import { base } from 'wagmi/chains'
import { updateDynamicUrls } from "./utils/dynamic-url";
import { SessionProvider } from "next-auth/react";

const queryClient = new QueryClient()

export function Providers(props: { children: ReactNode }) {
  // Initialize dynamic URLs at the top level
  useEffect(() => {
    if (typeof window !== 'undefined') {
      updateDynamicUrls();
    }
  }, []);
  
  return (
    <SessionProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <MiniKitProvider
              apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
              chain={base}
              config={{
                appearance: {
                  mode: "auto",
                  theme: "mini-app-theme",
                  name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
                  logo: process.env.NEXT_PUBLIC_ICON_URL,
                },
              }}
            >
              {props.children}
            </MiniKitProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
