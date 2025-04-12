import { useState, useEffect } from 'react'
import { useAccount, useDisconnect } from 'wagmi'
import { Press_Start_2P } from 'next/font/google'
import { shortenAddress } from '../lib/utils'

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] })

export default function WalletInfo() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [username, setUsername] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    if (isConnected && !localStorage.getItem('username')) {
      setShowModal(true)
    }
  }, [isConnected])

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      localStorage.setItem('username', username)
      setShowModal(false)
    }
  }

  if (!isConnected) return null

  return (
    <>
      {/* Username Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black border-2 border-[#00FF00] p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className={`text-xl text-white mb-4 ${pressStart.className} text-center`}>
              Choose Your Username
            </h2>
            <form onSubmit={handleUsernameSubmit} className="flex flex-col space-y-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded focus:outline-none focus:border-[#00FF00]"
                placeholder="Enter username"
                required
              />
              <button
                type="submit"
                className={`px-4 py-2 bg-[#00FF00] text-black rounded hover:bg-opacity-80 transition-colors ${pressStart.className}`}
              >
                Save Username
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Wallet Info Display - Only show if username is set */}
      {localStorage.getItem('username') && (
        <div className="fixed top-4 left-4 z-40">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
          >
            {localStorage.getItem('username')}
          </button>

          {showInfo && (
            <div className="absolute top-full left-0 mt-2 bg-black border-2 border-[#00FF00] p-4 rounded-lg">
              <p className={`text-white mb-2 ${pressStart.className}`}>
                Address: {shortenAddress(address || '')}
              </p>
              <button
                onClick={() => disconnect()}
                className={`px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors ${pressStart.className}`}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
} 