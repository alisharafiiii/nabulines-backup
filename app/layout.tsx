import './theme.css';
import '@coinbase/onchainkit/styles.css';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Inter, Press_Start_2P } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });
const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL;
  return {
    title: {
      template: '%s | NABULINES',
      default: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || 'NABULINES - Onchain Influence',
    },
    description: 'NABULINES is a gateway for creators to join curated, onchain opportunities.',
    other: {
      'tiktok-domain-verification': '9mCuZrAy1oofxb1Lo2Mo3ZNnCVTTeY54 KAbDnQ7NkuricEmeNdXCllaw2tS4sr4M rBTfLFCDpwGEymExx7g3Wx6K7gAvEFWg',
      'tiktok-site-verification': '9mCuZrAy1oofxb1Lo2Mo3ZNnCVTTeY54',
      'tiktokauthverification': '9mCuZrAy1oofxb1Lo2Mo3ZNnCVTTeY54',
      'tiktok-verification': '9mCuZrAy1oofxb1Lo2Mo3ZNnCVTTeY54',
      "fc:frame": JSON.stringify({
        version: process.env.NEXT_PUBLIC_VERSION,
        imageUrl: process.env.NEXT_PUBLIC_IMAGE_URL,
        button: {
          title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME}`,
          action: {
            type: "launch_frame",
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE_URL,
            splashBackgroundColor: `#${process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR}`,
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="tiktok-domain-verification" content="9mCuZrAy1oofxb1Lo2Mo3ZNnCVTTeY54" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div id="tiktok-domain-verification" style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
          tiktok-developers-site-verification=9mCuZrAy1oofxb1Lo2Mo3ZNnCVTTeY54
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
