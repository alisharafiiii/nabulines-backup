import { useAccount, useDisconnect } from 'wagmi'
import { useState, useEffect } from 'react'
import { Press_Start_2P } from 'next/font/google'

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] })

export default function UserProfile() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [showDetails, setShowDetails] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (!isConnected) {
      setUsername('')
      setShowDetails(false)
      return
    }

    const fetchUsername = async () => {
      if (!address) return

      try {
        const response = await fetch(`/api/kol?address=${address}`)
        if (response.ok) {
          const data = await response.json()
          if (data?.username) {
            setUsername(data.username)
          }
        }
      } catch (error) {
        console.error('Error fetching username:', error)
      }
    }

    fetchUsername()
  }, [address, isConnected])

  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''

  if (!username || !isConnected) return null

  return (
    <div className="absolute top-4 left-4">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`text-white hover:text-[#00FF00] transition-colors ${pressStart.className}`}
      >
        {username}
      </button>
      
      {showDetails && (
        <div className="mt-2 p-4 bg-black border-2 border-[#00FF00] rounded">
          <p className={`text-white mb-2 ${pressStart.className}`}>
            {shortAddress}
          </p>
          <button
            onClick={() => disconnect()}
            className={`w-full px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
} 