'use client'

import Link from 'next/link'
import { Press_Start_2P } from 'next/font/google'
import Image from 'next/image'

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] })

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
      <div className="mb-8">
        <Image
          src="/logo.png"
          alt="NABULINES"
          width={120}
          height={120}
          priority
          className="w-auto h-auto"
        />
      </div>
      <h2 className={`text-2xl mb-6 ${pressStart.className}`}>404 - Not Found</h2>
      <p className="mb-8 text-center max-w-md">The page you are looking for doesn't exist or has been moved.</p>
      <Link 
        href="/"
        className={`px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
      >
        Return Home
      </Link>
    </div>
  )
} 