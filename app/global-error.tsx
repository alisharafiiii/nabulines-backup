'use client'

import { Press_Start_2P } from 'next/font/google'

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] })

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white">
          <h2 className={`text-2xl mb-6 ${pressStart.className}`}>Something went wrong!</h2>
          <p className="mb-8 text-center max-w-md">
            A server error has occurred. Our team has been notified.
          </p>
          <button
            onClick={reset}
            className={`px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
} 