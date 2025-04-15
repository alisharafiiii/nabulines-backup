import { useConnect, useAccount, useDisconnect } from 'wagmi'
import { Press_Start_2P } from 'next/font/google'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Connector } from 'wagmi'
import { useRouter } from 'next/navigation'

// WalletSelector component for handling wallet connections and user data
const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] })

interface SocialData {
  platform: string;
  handle: string;
  followers: number;
  timestamp: number;
}

interface TwitterData {
  username: string;
  name: string;
  verified: boolean;
  profileImage: string;
  description: string;
  nabupassId: string;
  createdAt: string;
}

const socialPlatforms = {
  twitter: { icon: '/twitter.jpg', label: 'Twitter' },
  instagram: { icon: '/ig.jpg', label: 'Instagram' },
  tiktok: { icon: '/tt.jpg', label: 'TikTok' },
  youtube: { icon: '/yt.jpg', label: 'YouTube' }
} as const;

type PlatformType = keyof typeof socialPlatforms;

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
  const [handle, setHandle] = useState('')
  const [followers, setFollowers] = useState('')
  const [showSocial, setShowSocial] = useState(false)
  const [twitterData, setTwitterData] = useState<TwitterData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user is admin
  useEffect(() => {
    if (address) {
      setIsAdmin(address.toLowerCase() === '0x37Ed24e7c7311836FD01702A882937138688c1A9'.toLowerCase())
    }
  }, [address])

  // Initialize username from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('username')
    if (storedUsername) {
      setUsername(storedUsername)
      setShowSocial(true)
    }
  }, [])

  // Reset states when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setUsername('')
      setInputValue('')
      setSocialData([])
      setSelectedPlatform('')
      setHandle('')
      setFollowers('')
      setShowSocial(false)
      localStorage.removeItem('username')
    }
  }, [isConnected])

  useEffect(() => {
    // Check if we're on mobile
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
  }, [])

  useEffect(() => {
    const checkExistingData = async () => {
      if (address && isConnected) {
        try {
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

  // Add this effect to fetch Twitter data when social data changes
  useEffect(() => {
    const fetchTwitterData = async () => {
      try {
        // First check if we have Twitter data in social data
        const twitterAccount = socialData.find(data => data.platform === 'twitter');
        
        if (!twitterAccount) {
          console.error('No Twitter account found in social data');
          return;
        }

        console.log('Fetching Twitter user data for:', twitterAccount.handle);
        const response = await fetch(`/api/twitter/user?userId=${twitterAccount.handle}`);
        console.log('Twitter user data response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Received Twitter user data:', data);
          
          // Transform the data into our TwitterData format
          const twitterData: TwitterData = {
            username: data.username,
            name: data.name,
            verified: data.verified,
            profileImage: data.profile_image_url,
            description: data.description,
            nabupassId: `NABU-${data.id}`,
            createdAt: data.created_at
          };
          
          setTwitterData(twitterData);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch Twitter data:', errorText);
        }
      } catch (error) {
        console.error('Error fetching Twitter data:', error);
      }
    };
    
    // Fetch Twitter data when component mounts and after Twitter login
    fetchTwitterData();
  }, [socialData]);

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
              window.location.href = 'https://apps.apple.com/app/phantom-solana-wallet/1598432977'
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
    if (!inputValue.trim() || !address || isSubmitting) {
      return;
    }
    
    try {
      setIsSubmitting(true)
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
        return
      }

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
        return
      }

      const responseData = await response.json()
      setSocialData([...socialData, responseData.data])
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
        
        // Log error details
        if (data.details) {
          console.error('Error details:', data.details);
        }
        
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

      // Check if we're in a popup window
      const isPopup = window.opener || window.parent !== window;
      
      if (isPopup) {
        // If we're already in a popup, redirect directly
        window.location.href = data.authUrl;
        return;
      }

      // For main window, try to open in a new window
      const width = 600;
      const height = 600;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      
      const windowFeatures = `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`;
      
      console.log('Opening Twitter auth window...');
      const twitterWindow = window.open(data.authUrl, '_blank', windowFeatures);
      
      if (!twitterWindow) {
        // If popup is blocked, fall back to direct navigation
        console.log('Popup blocked, falling back to direct navigation');
        window.location.href = data.authUrl;
        return;
      }
      
      console.log('Twitter auth window opened successfully');
      
      // Add event listener for the popup window
      const checkPopup = setInterval(() => {
        if (twitterWindow.closed) {
          console.log('Twitter auth window closed, checking authentication status...');
          clearInterval(checkPopup);
          
          // Fetch Twitter user data directly
          const twitterAccount = socialData.find(data => data.platform === 'twitter');
          if (!twitterAccount) {
            console.error('No Twitter account found in social data');
            return;
          }

          fetch(`/api/twitter/user?userId=${twitterAccount.handle}`)
            .then(response => {
              if (response.ok) {
                return response.json();
              }
              throw new Error('Failed to fetch Twitter user data');
            })
            .then(data => {
              console.log('Received Twitter user data:', data);
              
              // Transform the data into our TwitterData format
              const twitterData: TwitterData = {
                username: data.username,
                name: data.name,
                verified: data.verified,
                profileImage: data.profile_image_url,
                description: data.description,
                nabupassId: `NABU-${data.id}`,
                createdAt: data.created_at
              };
              
              // Update Twitter data state
              setTwitterData(twitterData);
              
              // Add to social data if not already present
              if (!socialData.some(social => social.platform === 'twitter')) {
                const newSocialData = {
                  platform: 'twitter',
                  handle: data.username,
                  followers: data.followers_count || 0,
                  timestamp: Date.now()
                };
                
                // Save to social data
                fetch('/api/social', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    address,
                    username,
                    ...newSocialData
                  }),
                })
                .then(response => {
                  if (response.ok) {
                    return response.json();
                  }
                  throw new Error('Failed to save social data');
                })
                .then(responseData => {
                  setSocialData([...socialData, responseData.data]);
                })
                .catch(error => {
                  console.error('Error saving social data:', error);
                });
              }
            })
            .catch(error => {
              console.error('Error fetching Twitter data:', error);
            });
        }
      }, 1000);
    } catch (error) {
      console.error('Twitter login error:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto px-4">
      {!isConnected ? (
        <div className="flex flex-col items-center space-y-4 w-full">
          <div className="text-center mb-4">
            <h1 className={`text-2xl mb-2 ${pressStart.className}`}>NABULINES</h1>
            <p className={`text-white ${pressStart.className}`}>Connect. Create. Conquer.</p>
          </div>
          <div className="flex flex-col items-center space-y-4 w-full">
            <button
              onClick={() => handleConnect('coinbase')}
              className={`flex items-center justify-center w-full space-x-2 px-4 py-3 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
            >
              <Image src="/coinbase.svg" alt="Coinbase" width={24} height={24} className="w-6 h-6" />
              <span className="text-sm">Connect Coinbase</span>
            </button>
            <button
              onClick={() => handleConnect('phantom')}
              className={`flex items-center justify-center w-full space-x-2 px-4 py-3 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
            >
              <span className="text-xl">👻</span>
              <span className="text-sm">Connect Phantom</span>
            </button>
            <button
              onClick={handleTwitterLogin}
              className={`flex items-center justify-center w-full space-x-2 px-4 py-3 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
            >
              <Image src="/twitter.jpg" alt="Twitter" width={24} height={24} className="w-6 h-6 rounded" />
              <span className="text-sm">Connect Twitter</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-4">
          {/* Admin Panel Button */}
          {isAdmin && (
            <button
              onClick={() => router.push('/admin')}
              className={`w-full px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
            >
              Admin Panel
            </button>
          )}

          {/* NABUPASS Card */}
          {twitterData && (
            <div className="w-full mb-4">
              <div className="bg-black border-4 border-[#00FF00] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-xl text-[#00FF00] ${pressStart.className}`}>NABUPASS</h2>
                  <span className="text-white text-sm">#{twitterData.nabupassId}</span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <Image
                      src={twitterData.profileImage}
                      alt={twitterData.name}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-[#00FF00]"
                    />
                    {twitterData.verified && (
                      <div className="absolute -bottom-1 -right-1 bg-[#00FF00] rounded-full p-1">
                        <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className={`text-white ${pressStart.className}`}>{twitterData.name}</h3>
                    <p className="text-gray-400 text-sm">@{twitterData.username}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  <p>{twitterData.description}</p>
                  <p className="mt-2">Member since: {new Date(twitterData.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
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
                              <p className="text-white font-bold">{data.handle}</p>
                              <p className="text-gray-400 text-sm">{data.followers.toLocaleString()} followers</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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

          {/* Disconnect Button */}
          <button
            onClick={() => disconnect()}
            className={`mt-4 px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className}`}
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}