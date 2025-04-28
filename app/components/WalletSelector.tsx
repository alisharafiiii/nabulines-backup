import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { Press_Start_2P } from 'next/font/google'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Connector } from 'wagmi'
import { useRouter } from 'next/navigation'
import { TypeAnimation } from 'react-type-animation';
import dynamic from 'next/dynamic';
import TikTokSignIn from './TikTokSignIn';

// WalletSelector component for handling wallet connections and user data
const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] })

interface SocialData {
  platform: string;
  handle: string;
  followers: number;
  timestamp: number;
}

interface PlatformStats {
  platform: string;
  totalUsers: number;
  totalFollowers: number;
}

interface User {
  username: string;
  isVerified: boolean;    // Verified in our system
  isXVerified?: boolean;  // Has Twitter blue checkmark
  platform?: string;
  handle?: string;
  profileImage?: string;
}

const socialPlatforms = {
  twitter: { icon: '/twitter.jpg', label: 'Twitter' },
  instagram: { icon: '/ig.jpg', label: 'Instagram' },
  tiktok: { icon: '/tt.jpg', label: 'TikTok' },
  youtube: { icon: '/yt.jpg', label: 'YouTube' },
  telegram: { icon: '/tg.jpg', label: 'Telegram' },
  farcaster: { icon: '/fc.jpg', label: 'Farcaster' }
} as const;

type PlatformType = keyof typeof socialPlatforms;

// Add platform URL maps with template functions
const getPlatformUrl = (platform: string, handle: string): string => {
  const urlMap: Record<string, (handle: string) => string> = {
    twitter: (h) => `https://twitter.com/${h}`,
    instagram: (h) => `https://instagram.com/${h}`,
    tiktok: (h) => `https://tiktok.com/@${h}`,
    youtube: (h) => `https://youtube.com/@${h}`,
    telegram: (h) => `https://t.me/${h}`,
    farcaster: (h) => `https://warpcast.com/${h}`
  };
  
  const urlGenerator = urlMap[platform];
  return urlGenerator ? urlGenerator(handle) : '#';
};

export default function WalletSelector() {
  const { connect, connectors } = useConnect()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [socialData, setSocialData] = useState<SocialData[]>([])
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [selectedViewPlatform, setSelectedViewPlatform] = useState<string | null>(null)
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [handle, setHandle] = useState('')
  const [followers, setFollowers] = useState('')
  const [showSocial, setShowSocial] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [twitterConnected, setTwitterConnected] = useState(false)
  const [twitterUser, setTwitterUser] = useState<any>(null)
  const [statsError, setStatsError] = useState(false)
  
  // New search-related states
  const [searchQuery, setSearchQuery] = useState('')
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Check if user is admin
  useEffect(() => {
    if (address) {
      setIsAdmin(address.toLowerCase() === '0x37Ed24e7c7311836FD01702A882937138688c1A9'.toLowerCase())
    }
  }, [address])

  // Initialize data from localStorage
  useEffect(() => {
    // Get username
    const storedUsername = localStorage.getItem('username')
    if (storedUsername) {
      setUsername(storedUsername)
      setShowSocial(true)
    }

    // Check for Twitter user data
    const twitterUserData = localStorage.getItem('twitter_user')
    if (twitterUserData) {
      try {
        const parsedData = JSON.parse(twitterUserData)
        setTwitterUser(parsedData)
        setTwitterConnected(true)
      } catch (e) {
        console.error('Error parsing Twitter user data:', e)
      }
    }
  }, [])

  // Fetch all users for search feature
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        console.log('Fetching all users for search...');
        
        // Fetch regular users
        const response = await fetch('/api/username/all');
        const regularUsers = await response.json();
        console.log('Regular users fetched:', regularUsers.length);
        
        // Fetch verified Twitter users
        const twitterResponse = await fetch('/api/twitter/verified');
        const verifiedUsers = await response.json();
        console.log('Verified Twitter users fetched:', verifiedUsers);
        
        // Create a map to deduplicate users by username
        const userMap = new Map();
        
        // Add regular users to the map
        if (Array.isArray(regularUsers)) {
          regularUsers.forEach((user: any) => {
            if (user.username) {
              userMap.set(user.username.toLowerCase(), {
                username: user.username,
                isVerified: false,
                address: user.address
              });
            }
          });
          console.log('Added regular users to map, size:', userMap.size);
        }
        
        // Add or update with verified Twitter users
        if (Array.isArray(verifiedUsers)) {
          verifiedUsers.forEach((user: any) => {
            const screenName = user.screen_name || 'unknown';
            const lowerScreenName = screenName.toLowerCase();
            
            // Check if this user is already in the map
            if (userMap.has(lowerScreenName)) {
              // Update existing entry with Twitter verification data
              const existingUser = userMap.get(lowerScreenName);
              userMap.set(lowerScreenName, {
                ...existingUser,
                isVerified: Boolean(user.verified_at),
                isXVerified: Boolean(user.is_verified),
                platform: 'twitter',
                handle: screenName,
                profileImage: user.profile_image_url
              });
            } else {
              // Add new Twitter user
              userMap.set(lowerScreenName, {
                username: screenName,
                isVerified: Boolean(user.verified_at),
                isXVerified: Boolean(user.is_verified),
                platform: 'twitter',
                handle: screenName,
                profileImage: user.profile_image_url
              });
            }
          });
          console.log('After adding Twitter users, map size:', userMap.size);
        }
        
        // Convert map values to array
        const combinedUsers = Array.from(userMap.values());
        
        console.log('Combined users after deduplication:', combinedUsers.length);
        setAllUsers(combinedUsers);
      } catch (error) {
        console.error('Error fetching users for search:', error);
      }
    };
    
    fetchAllUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers([])
      return
    }
    
    const query = searchQuery.toLowerCase()
    console.log('Filtering users with query:', query)
    console.log('Total users to search through:', allUsers.length)
    
    // Create a scoring function to rank results by relevance
    const scoreUser = (user: User): number => {
      let score = 0;
      
      // Exact username match gets highest score
      if (user.username.toLowerCase() === query) {
        score += 100;
      } 
      // Username starts with query
      else if (user.username.toLowerCase().startsWith(query)) {
        score += 50;
      }
      // Username contains query
      else if (user.username.toLowerCase().includes(query)) {
        score += 25;
      }
      
      // Bonus points for verified users
      if (user.isVerified) {
        score += 10;
      }
      
      // Extra bonus for X verified users
      if (user.isXVerified) {
        score += 15;
      }
      
      // Handle matches
      if (user.handle && user.handle.toLowerCase().includes(query)) {
        score += 15;
      }
      
      return score;
    };
    
    // Filter and sort users by score
    const filtered = allUsers
      .filter(user => {
        // Ensure the user has a username
        if (!user.username) return false;
        
        // Skip Twitter users without profile images
        if (user.platform === 'twitter' && !user.profileImage) return false;
        
        // Check if username or handle contains query
        return (
          user.username.toLowerCase().includes(query) ||
          (user.handle && user.handle.toLowerCase().includes(query))
        );
      })
      .sort((a, b) => scoreUser(b) - scoreUser(a)); // Sort by highest score
    
    console.log('Filtered users:', filtered);
    setFilteredUsers(filtered);
  }, [searchQuery, allUsers])

  // Reset wallet-specific states when wallet disconnects
  useEffect(() => {
    if (!isConnected && address) {
      // Only clear wallet-related data, keep Twitter data
      localStorage.removeItem('walletAddress')
    }
  }, [isConnected, address])

  useEffect(() => {
    // Check if we're on mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  useEffect(() => {
    const checkExistingData = async () => {
      if (address && isConnected) {
        try {
          // Store wallet address for API auth
          localStorage.setItem('walletAddress', address)
          
          // Check for username
          const usernameResponse = await fetch(`/api/username?address=${address}`)
          if (usernameResponse.ok) {
            const usernameData = await usernameResponse.json()
            if (usernameData.username) {
              setUsername(usernameData.username)
              localStorage.setItem('username', usernameData.username)
              setShowSocial(true)
            }
          }

          // Only fetch social data if we have a username
          if (username) {
            const socialResponse = await fetch(`/api/social?address=${address}`)
            if (socialResponse.ok) {
              const data = await socialResponse.json()
              if (data && Array.isArray(data)) {
                setSocialData(data)
              }
            }
          }
        } catch (error) {
          console.error('Error checking existing data:', error)
        }
      }
    }
    checkExistingData()
  }, [address, isConnected, username])

  // Fetch platform stats when a platform is selected
  useEffect(() => {
    const fetchPlatformStats = async () => {
      if (!selectedViewPlatform) {
        setPlatformStats(null)
        setStatsError(false)
        return
      }
      
      try {
        setIsLoadingStats(true)
        setStatsError(false)
        setPlatformStats(null) // Clear previous data while loading
        
        const response = await fetch(`/api/social/stats?platform=${selectedViewPlatform}`)
        if (response.ok) {
          const data = await response.json()
          // Validate the data format
          if (data && typeof data.totalUsers === 'number' && typeof data.totalFollowers === 'number') {
            setPlatformStats(data)
          } else {
            console.error('Invalid platform stats format:', data)
            setStatsError(true)
            setPlatformStats({
              platform: selectedViewPlatform,
              totalUsers: 0,
              totalFollowers: 0
            })
          }
        } else {
          console.error('Failed to fetch platform stats')
          setStatsError(true)
          setPlatformStats({
            platform: selectedViewPlatform,
            totalUsers: 0,
            totalFollowers: 0
          })
        }
      } catch (error) {
        console.error('Error fetching platform stats:', error)
        setStatsError(true)
        setPlatformStats({
          platform: selectedViewPlatform,
          totalUsers: 0,
          totalFollowers: 0
        })
      } finally {
        setIsLoadingStats(false)
      }
    }
    
    fetchPlatformStats()
  }, [selectedViewPlatform])

  const handleConnect = async (walletType: 'coinbase' | 'phantom') => {
    try {
      let connector: Connector | undefined
      if (walletType === 'coinbase') {
        connector = connectors.find((c: Connector) => c.type === 'coinbaseWallet')
      } else {
        // For Phantom on mobile, we need to handle it differently
        if (isMobile) {
          const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
          const isAndroid = /Android/.test(navigator.userAgent)
          
          if (isIOS) {
            // Try to open Phantom app directly first
            const phantomUrl = 'phantom://browse?url=' + encodeURIComponent(window.location.href)
            window.location.href = phantomUrl
            
            // Set a timeout to check if the app opened
            setTimeout(() => {
              // If we're still here, Phantom app didn't open
              window.location.href = 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977'
            }, 2000)
            return
          } else if (isAndroid) {
            // For Android, try to open the app directly
            window.location.href = 'intent://browse?url=' + encodeURIComponent(window.location.href) + '#Intent;scheme=phantom;package=app.phantom;end'
            
            // Set a timeout to check if the app opened
            setTimeout(() => {
              // If we're still here, Phantom app didn't open
              window.location.href = 'https://play.google.com/store/apps/details?id=app.phantom'
            }, 2000)
            return
          }
        }
        connector = connectors.find((c: Connector) => c.type === 'injected' && c.id === 'phantom')
      }

      if (!connector) {
        console.error('Connector not found:', walletType)
        return
      }

      // For desktop browsers, open in the same window
      if (!isMobile) {
        const provider = await connector.getProvider()
        if (provider && typeof provider === 'object' && 'url' in provider && typeof provider.url === 'string') {
          window.location.href = provider.url
          return
        }
      }

      await connect({ connector })
    } catch (error) {
      console.error('Connection error:', error)
    }
  }

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isSubmitting) {
      return;
    }
    
    try {
      setIsSubmitting(true)
      
      // If connected with a wallet, save username to the backend
      if (isConnected && address) {
        const response = await fetch('/api/username', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address,
            username: inputValue.trim()
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save username')
        }
      }

      // Store locally regardless of wallet connection
      setUsername(inputValue.trim())
      localStorage.setItem('username', inputValue.trim())
      setInputValue('')
      setShowSocial(true) // Show social section after username is set
    } catch (error) {
      console.error('Error saving username:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlatform || !handle || !followers || isSubmitting) return

    try {
      setIsSubmitting(true)
      
      // Only send to API if wallet is connected
      if (isConnected && address) {
        const response = await fetch('/api/social', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            username,
            platform: selectedPlatform,
            handle: handle.trim(),
            followers: parseInt(followers),
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save social data')
        }

        const responseData = await response.json()
        setSocialData([...socialData, responseData.data])
      } else {
        // Just update the local state for Twitter-only users
        const newSocialData = {
          platform: selectedPlatform,
          handle: handle.trim(),
          followers: parseInt(followers),
          timestamp: Date.now()
        }
        setSocialData([...socialData, newSocialData])
      }
      
      setSelectedPlatform('')
      setHandle('')
      setFollowers('')
    } catch (error) {
      console.error('Error saving social data:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTwitterLogin = async () => {
    try {
      console.log('Twitter login button clicked');
      
      // Use fixed callback URL that matches Twitter Developer Portal settings
      const callbackUrl = 'https://nabulines.com/api/auth/twitter/callback';
      console.log('Current callback URL:', callbackUrl);
      
      console.log('Making request to Twitter auth endpoint...');
      const response = await fetch(`/api/auth/twitter?callbackUrl=${encodeURIComponent(callbackUrl)}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }).catch(error => {
        console.error('Network error during Twitter auth:', error);
        throw new Error('Network error. Please check your ad blocker or privacy settings.');
      });
      
      if (!response) {
        throw new Error('Failed to connect to Twitter. Please check your network connection.');
      }
      
      console.log('Twitter auth response status:', response.status);
      
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error('Twitter login error:', data);
        return;
      }
      
      const data = await response.json().catch(error => {
        console.error('Error parsing Twitter response:', error);
        throw new Error('Invalid response from Twitter. Please try again.');
      });
      
      console.log('Received auth URL:', data.authUrl);
      
      if (!data.authUrl) {
        console.error('No auth URL in response:', data);
        return;
      }
      
      // Just redirect to the auth URL
      window.location.href = data.authUrl;
      
    } catch (error) {
      console.error('Twitter login error:', error);
    }
  };

  const handleTwitterDisconnect = () => {
    localStorage.removeItem('twitter_user');
    setTwitterConnected(false);
    setTwitterUser(null);
    
    // If username came from Twitter, also remove it
    if (twitterUser?.screen_name === username) {
      setUsername('');
      localStorage.removeItem('username');
      setShowSocial(false);
    }
  };

  const handlePlatformSelect = (platform: string) => {
    setSelectedViewPlatform(platform);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsSearching(e.target.value.trim().length > 0);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setIsSearching(false);
  };

  const viewUserProfile = (username: string) => {
    // Navigate to user profile
    router.push(`/user/${username}`);
  };

  // Get the selected platform data
  const selectedPlatformData = selectedViewPlatform 
    ? socialData.find(data => data.platform === selectedViewPlatform) 
    : null;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4">
      {/* First section - Connect wallet or Twitter */}
      {!isConnected && !twitterConnected ? (
        <div className="flex flex-col items-center space-y-4 w-full">
          <div className="flex flex-col items-center space-y-4 w-full">
            <button
              onClick={() => handleConnect('coinbase')}
              className={`flex items-center justify-center w-full space-x-2 px-4 py-3 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
            >
              <Image src="/cb.JPG" alt="Coinbase" width={24} height={24} className="w-6 h-6 rounded" />
              <span className="text-sm">Connect Coinbase</span>
            </button>
            <button
              onClick={() => handleConnect('phantom')}
              className={`flex items-center justify-center w-full space-x-2 px-4 py-3 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
            >
              <Image src="/phantom.jpg" alt="Phantom" width={24} height={24} className="w-6 h-6 rounded" />
              <span className="text-sm">Connect Phantom</span>
            </button>
            <button
              onClick={handleTwitterLogin}
              className={`flex items-center justify-center w-full space-x-2 px-4 py-3 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
            >
              <Image src="/twitter.jpg" alt="Twitter" width={24} height={24} className="w-6 h-6 rounded" />
              <span className="text-sm">Connect Twitter</span>
            </button>
            
            {/* TikTok Sign-In button */}
            <TikTokSignIn />
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-4">
          {/* Admin Panel Button - only show if wallet is connected */}
          {isAdmin && isConnected && (
            <button
              onClick={() => router.push('/admin')}
              className={`w-full px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
            >
              Admin Panel
            </button>
          )}

          {/* Connected with Twitter */}
          {twitterConnected && twitterUser && (
            <div className="w-full bg-black border-2 border-[#00FF00] p-4 rounded-lg mb-4">
              <h3 className={`text-lg text-white mb-2 ${pressStart.className} text-center`}>
                Connected with Twitter
              </h3>
              <div className="flex items-center gap-4 mb-3">
                <div className="h-12 w-12 relative rounded-full overflow-hidden border-2 border-[#00FF00]">
                  <Image 
                    src={twitterUser.profile_image_url || "/twitter.jpg"} 
                    alt={twitterUser.screen_name}
                    fill
                    sizes="48px"
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/twitter.jpg";
                    }}
                  />
                </div>
                <div>
                  <p className="text-white font-bold">@{twitterUser.screen_name}</p>
                  <p className="text-gray-400 text-sm">Connected: {new Date(twitterUser.verified_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button
                onClick={handleTwitterDisconnect}
                className={`mt-2 w-full px-3 py-1 bg-gray-800 text-red-500 text-sm rounded hover:bg-red-700 hover:text-white transition-colors`}
              >
                Disconnect Twitter
              </button>
            </div>
          )}

          {/* Username Input */}
          {!username && (
            <div className="w-full">
              <div className="bg-black border-2 border-[#00FF00] p-4 rounded-lg">
                <h3 className={`text-lg text-white mb-4 ${pressStart.className} text-center`}>
                  Choose Your Username
                </h3>
                <div className="flex flex-col space-y-4">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded focus:outline-none focus:border-[#00FF00]"
                    placeholder="Enter username"
                  />
                  <button
                    onClick={handleUsernameSubmit}
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-[#00FF00] text-black rounded hover:bg-opacity-80 transition-colors ${pressStart.className}`}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Username'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Social Data */}
          {showSocial && (
            <div className="w-full">
              {socialData.length > 0 && (
                <div className="mb-4">
                  <h3 className={`text-lg text-white mb-4 ${pressStart.className} text-center`}>
                    Your Social Platforms
                  </h3>
                  
                  {/* Platform selection buttons */}
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    {socialData.map((data, index) => {
                      const platformInfo = socialPlatforms[data.platform as PlatformType];
                      if (!platformInfo) return null;

                      return (
                        <button
                          key={index}
                          onClick={() => handlePlatformSelect(data.platform)}
                          className={`px-3 py-2 rounded ${
                            selectedViewPlatform === data.platform 
                              ? 'bg-[#00FF00] text-black'
                              : 'bg-black border border-[#00FF00] text-white hover:bg-gray-900'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Image
                              src={platformInfo.icon}
                              alt={platformInfo.label}
                              width={20}
                              height={20}
                              className="rounded"
                            />
                            <span className="text-xs">{platformInfo.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Platform data display */}
                  {selectedPlatformData && (
                    <div className="bg-black border-2 border-[#00FF00] p-4 rounded-lg mb-4">
                      <div className="flex flex-col items-center">
                        {(() => {
                          const platformInfo = socialPlatforms[selectedPlatformData.platform as PlatformType];
                          if (!platformInfo) return null;
                          
                          return (
                            <>
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-16 h-16 relative">
                                  <Image
                                    src={platformInfo.icon}
                                    alt={platformInfo.label}
                                    fill
                                    className="rounded object-cover"
                                  />
                                </div>
                                <div>
                                  <h4 className={`text-xl text-white ${pressStart.className}`}>
                                    {platformInfo.label}
                                  </h4>
                                </div>
                              </div>
                              
                              <div className="w-full grid grid-cols-1 gap-4">
                                {/* Platform Stats */}
                                <div className="bg-black border-2 border-[#00FF00] p-3 rounded-lg mb-2">
                                  <h5 className={`text-center text-white text-sm mb-2 ${pressStart.className}`}>
                                    Platform Statistics
                                  </h5>
                                  {isLoadingStats ? (
                                    <div className="text-center py-2">
                                      <p className="text-white">Loading statistics...</p>
                                    </div>
                                  ) : statsError ? (
                                    <div className="text-center py-2">
                                      <p className="text-red-500">Error loading statistics</p>
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="bg-black border border-[#00FF00] p-2 rounded">
                                        <p className="text-gray-400 text-xs mb-1">Total Users</p>
                                        <p className="text-white text-lg font-bold text-center">
                                          {platformStats?.totalUsers.toLocaleString() || '0'}
                                        </p>
                                      </div>
                                      <div className="bg-black border border-[#00FF00] p-2 rounded">
                                        <p className="text-gray-400 text-xs mb-1">Total Followers</p>
                                        <p className="text-white text-lg font-bold text-center">
                                          {platformStats?.totalFollowers.toLocaleString() || '0'}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="bg-black border border-[#00FF00] p-3 rounded-lg">
                                  <p className="text-gray-400 text-sm mb-1">Handle</p>
                                  <p className="text-white text-lg font-bold">
                                    <a 
                                      href={getPlatformUrl(selectedPlatformData.platform, selectedPlatformData.handle)}
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="hover:text-[#00FF00] hover:underline transition-colors"
                                    >
                                      {selectedPlatformData.handle}
                                    </a>
                                  </p>
                                </div>
                                
                                <div className="bg-black border border-[#00FF00] p-3 rounded-lg">
                                  <p className="text-gray-400 text-sm mb-1">Followers</p>
                                  <p className="text-white text-lg font-bold">{selectedPlatformData.followers.toLocaleString()}</p>
                                </div>
                                
                                <div className="bg-black border border-[#00FF00] p-3 rounded-lg">
                                  <p className="text-gray-400 text-sm mb-1">Added</p>
                                  <p className="text-white text-lg font-bold">{new Date(selectedPlatformData.timestamp).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                  
                  {/* Show all platforms as a list when no specific platform is selected */}
                  {!selectedViewPlatform && (
                    <div className="space-y-4">
                      {socialData.map((data, index) => {
                        const platformInfo = socialPlatforms[data.platform as PlatformType];
                        if (!platformInfo) return null;

                        return (
                          <div key={index} className="bg-black border-2 border-[#00FF00] p-4 rounded-lg">
                            <div className="flex items-center gap-4">
                              <Image
                                src={platformInfo.icon}
                                alt={platformInfo.label}
                                width={32}
                                height={32}
                                className="rounded"
                              />
                              <div>
                                <p className="text-white font-bold">
                                  <a 
                                    href={getPlatformUrl(data.platform, data.handle)}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="hover:text-[#00FF00] hover:underline transition-colors"
                                  >
                                    {data.handle}
                                  </a>
                                </p>
                                <p className="text-gray-400 text-sm">{data.followers.toLocaleString()} followers</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Add New Social Platform */}
              <div className="bg-black border-2 border-[#00FF00] p-4 rounded-lg">
                <h3 className={`text-lg text-white mb-4 ${pressStart.className} text-center`}>
                  Add New Platform
                </h3>
                <div className="flex flex-col space-y-4">
                  <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded focus:outline-none focus:border-[#00FF00]"
                  >
                    <option value="">Select Platform</option>
                    {Object.entries(socialPlatforms).map(([key, platform]) => (
                      <option key={key} value={key}>
                        {platform.label}
                      </option>
                    ))}
                  </select>
                  {selectedPlatform && (
                    <>
                      <input
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        className="px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded focus:outline-none focus:border-[#00FF00]"
                        placeholder={`${selectedPlatform} handle`}
                      />
                      <input
                        type="number"
                        value={followers}
                        onChange={(e) => setFollowers(e.target.value)}
                        className="px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded focus:outline-none focus:border-[#00FF00]"
                        placeholder="Number of followers"
                      />
                      <button
                        onClick={handleSocialSubmit}
                        disabled={isSubmitting}
                        className={`px-4 py-2 bg-[#00FF00] text-black rounded hover:bg-opacity-80 transition-colors ${pressStart.className}`}
                      >
                        {isSubmitting ? 'Saving...' : 'Add Platform'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Disconnect Buttons */}
          <div className="flex flex-col w-full gap-2 mt-4">
            {/* Wallet disconnect */}
            {isConnected && (
              <button
                onClick={() => disconnect()}
                className={`px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
              >
                Disconnect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}