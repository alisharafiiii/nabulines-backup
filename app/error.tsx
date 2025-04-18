'use client'

import { useEffect } from 'react'
import { Press_Start_2P } from 'next/font/google'

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] })

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
      <h2 className={`text-2xl mb-6 ${pressStart.className}`}>Something went wrong!</h2>
      <p className="mb-8 text-center max-w-md">An unexpected error has occurred. Please try again later.</p>
      <button
        onClick={reset}
        className={`px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
      >
        Try again
      </button>
    </div>
  )
} 