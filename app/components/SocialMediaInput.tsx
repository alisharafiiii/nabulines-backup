import { useState, useEffect, useCallback } from 'react'
import { Press_Start_2P } from 'next/font/google'
import Image from 'next/image'
import { useAccount } from 'wagmi'

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] })

interface SocialMediaData {
  platform: string
  handle: string
  followers: number
  engagement_rate?: number
  verified: boolean
  last_updated: string
  total_followers: number
  platform_rank: number
  onchain_activity: number
}

export default function SocialMediaInput() {
  const { address } = useAccount()
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [handle, setHandle] = useState('')
  const [followers, setFollowers] = useState('')
  const [socialData, setSocialData] = useState<SocialMediaData[]>([])
  const [sortBy, setSortBy] = useState('total_followers')
  const [order, setOrder] = useState('desc')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const platforms = [
    { name: 'Twitter', icon: '/twitter.jpg' },
    { name: 'Instagram', icon: '/ig.jpg' },
    { name: 'TikTok', icon: '/tt.jpg' },
    { name: 'YouTube', icon: '/yt.jpg' },
    { name: 'Telegram', icon: '/tg.jpg' },
    { name: 'LinkedIn', icon: '/link.jpg' }
  ]

  const fetchSocialData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/social?sortBy=${sortBy}&order=${order}`)
      if (!response.ok) {
        throw new Error('Failed to fetch social data')
      }
      const { data } = await response.json()
      setSocialData(data || [])
    } catch (error) {
      console.error('Error fetching social data:', error)
      setError('Failed to load social data. Please try again later.')
      setSocialData([])
    } finally {
      setLoading(false)
    }
  }, [sortBy, order])

  useEffect(() => {
    fetchSocialData()
  }, [fetchSocialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlatform || !handle || !followers) {
      setError('Please fill in all fields')
      return
    }

    const username = localStorage.getItem('username')
    if (!username) {
      setError('Username not found. Please set a username first.')
      return
    }

    if (!address) {
      setError('Wallet not connected. Please connect your wallet first.')
      return
    }

    const newData = {
      platform: selectedPlatform,
      handle,
      followers: parseInt(followers)
    }

    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/social', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          username,
          ...newData
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save social data')
      }

      await fetchSocialData() // Refresh data after successful submission
      setSelectedPlatform(null)
      setHandle('')
      setFollowers('')
    } catch (error) {
      console.error('Error saving social data:', error)
      setError(error instanceof Error ? error.message : 'Failed to save social data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="flex space-x-4 mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded"
        >
          <option value="total_followers">Total Followers</option>
          <option value="engagement_rate">Engagement Rate</option>
          <option value="platform_rank">Platform Rank</option>
          <option value="onchain_activity">Onchain Activity</option>
        </select>
        <button
          onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
          className={`px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
        >
          {order === 'asc' ? '↑ Ascending' : '↓ Descending'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {platforms.map((platform) => (
          <button
            key={platform.name}
            onClick={() => setSelectedPlatform(platform.name)}
            className="flex flex-col items-center p-4 bg-black border-2 border-[#00FF00] rounded-lg hover:bg-[#00FF00] hover:text-black transition-colors"
          >
            <Image
              src={platform.icon}
              alt={platform.name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-full mb-2"
            />
            <span className={`${pressStart.className} text-sm`}>{platform.name}</span>
          </button>
        ))}
      </div>

      {selectedPlatform && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-black border-2 border-[#00FF00] p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className={`text-xl text-white mb-4 ${pressStart.className} text-center`}>
              Add {selectedPlatform} Details
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded focus:outline-none focus:border-[#00FF00]"
                placeholder={`${selectedPlatform} handle`}
                required
              />
              <input
                type="number"
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                className="px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded focus:outline-none focus:border-[#00FF00]"
                placeholder="Number of followers"
                required
              />
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setSelectedPlatform(null)}
                  className={`flex-1 px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 bg-[#00FF00] text-black rounded hover:bg-opacity-80 transition-colors ${pressStart.className}`}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className={`text-white ${pressStart.className}`}>Loading...</div>
      ) : error ? (
        <div className={`text-red-500 ${pressStart.className} text-center`}>
          {error}
        </div>
      ) : (
        <div className="w-full max-w-4xl">
          <h2 className={`text-xl text-white mb-4 ${pressStart.className} text-center`}>
            Social Media Rankings
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {socialData.length > 0 ? (
              socialData.map((data) => (
                <div
                  key={`${data.platform}-${data.handle}`}
                  className="bg-black border-2 border-[#00FF00] p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className={`text-lg text-white ${pressStart.className}`}>
                        {data.handle} ({data.platform})
                      </h3>
                      <p className="text-gray-400">Followers: {data.followers.toLocaleString()}</p>
                      <p className="text-gray-400">Engagement: {data.engagement_rate?.toFixed(2)}%</p>
                      <p className="text-gray-400">Onchain Activity: {data.onchain_activity}</p>
                    </div>
                    {data.verified && (
                      <span className="text-[#00FF00]">✓ Verified</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className={`text-white ${pressStart.className} text-center`}>
                No social media data available yet
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 