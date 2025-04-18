import { Press_Start_2P } from 'next/font/google'
import Image from 'next/image'

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] })

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
      <div className="mb-8 animate-pulse">
        <Image
          src="/logo.png"
          alt="NABULINES"
          width={120}
          height={120}
          priority
          className="w-auto h-auto"
        />
      </div>
      <h2 className={`text-xl mb-4 ${pressStart.className}`}>Loading...</h2>
      <div className="w-16 h-1 bg-[#00FF00] animate-pulse"></div>
    </div>
  )
} 