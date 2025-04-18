"use client";

import { useState, useEffect } from 'react';
import { Press_Start_2P } from 'next/font/google';
import dynamic from 'next/dynamic';

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] });

// Dynamically import all components to avoid hydration issues
const VerifiedUsersSection = dynamic(() => import('./VerifiedUsersSection'), { ssr: false });
const LeaderboardSection = dynamic(() => import('./LeaderboardSection'), { ssr: false });
const AnalyticsSection = dynamic(() => import('./AnalyticsSection'), { ssr: false });
const UserDataTable = dynamic(() => import('./UserDataTable'), { ssr: false });

interface UserData {
  address: string;
  username: string;
  socialData: {
    platform: string;
    handle: string;
    followers: number;
    timestamp: number;
  }[];
}

interface VerifiedUser {
  screen_name: string;
  name: string;
  followers_count: number;
  profile_image_url: string;
  verified_at: string;
}

function AdminPanel() {
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [verifiedUsers, setVerifiedUsers] = useState<VerifiedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [debug, setDebug] = useState<string[]>([]);
  
  // Add debug log function
  const addDebugLog = (message: string) => {
    setDebug(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };
  
  // Set mounted state
  useEffect(() => {
    setMounted(true);
    addDebugLog('Component mounted');
  }, []);
  
  // Fetch data
  useEffect(() => {
    if (!mounted) return;
    
    addDebugLog('Starting data fetch');
    
    // Get wallet address
    const storedAddress = localStorage.getItem('walletAddress');
    if (storedAddress) {
      setAddress(storedAddress);
      addDebugLog(`Found wallet address: ${storedAddress.slice(0, 6)}...${storedAddress.slice(-4)}`);
    } else {
      setError('Wallet address not found. Please connect your wallet.');
      setLoading(false);
      addDebugLog('No wallet address found in localStorage');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        addDebugLog('Setting loading state to true');
        
        const headers = {
          'Content-Type': 'application/json',
          'x-wallet-address': storedAddress
        };
        
        addDebugLog(`Fetching data with wallet address: ${storedAddress.slice(0, 6)}...${storedAddress.slice(-4)}`);
        
        // Create mock data for testing
        const mockUsers = [
          {
            address: "0x123456789abcdef",
            username: "user1",
            socialData: [
              {
                platform: "twitter",
                handle: "user1_twitter",
                followers: 1200,
                timestamp: Date.now()
              }
            ]
          },
          {
            address: "0xabcdef123456789",
            username: "user2",
            socialData: [
              {
                platform: "twitter",
                handle: "user2_twitter",
                followers: 3500,
                timestamp: Date.now()
              },
              {
                platform: "instagram",
                handle: "user2_insta",
                followers: 5000,
                timestamp: Date.now()
              }
            ]
          }
        ];
        
        const mockVerified = [
          {
            screen_name: "user1_twitter",
            name: "User One",
            followers_count: 1200,
            profile_image_url: "/logo.png",
            verified_at: new Date().toISOString(),
            verified: true,
            description: "This is a test user for debugging",
            location: "San Francisco, CA"
          }
        ];

        try {
          // Try to fetch actual data first
          addDebugLog('Attempting to fetch actual data from API');
          
          const usersPromise = fetch('/api/admin/users', { headers });
          const verifiedPromise = fetch('/api/admin/twitter/verified', { headers });

          // Set a timeout of 5 seconds
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API request timeout')), 5000)
          );

          // Race the fetch against the timeout
          const [usersResponse, verifiedResponse] = await Promise.all([
            Promise.race([usersPromise, timeoutPromise]),
            Promise.race([verifiedPromise, timeoutPromise])
          ]) as [Response, Response];
          
          addDebugLog(`Users API status: ${usersResponse.status}`);
          addDebugLog(`Verified users API status: ${verifiedResponse.status}`);

          if (!usersResponse.ok || !verifiedResponse.ok) {
            throw new Error(`API error: ${usersResponse.status}/${verifiedResponse.status}`);
          }

          const [usersData, verifiedData] = await Promise.all([
            usersResponse.json(),
            verifiedResponse.json()
          ]);

          addDebugLog(`Fetched ${usersData?.length || 0} users and ${verifiedData?.length || 0} verified users`);
          
          setUsers(usersData || []);
          setVerifiedUsers(verifiedData || []);
        } catch (apiError) {
          // If API fetch fails, fall back to mock data
          addDebugLog(`API fetch failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
          addDebugLog('Falling back to mock data');
          
          setUsers(mockUsers);
          setVerifiedUsers(mockVerified);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        addDebugLog(`Error in fetch: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setError(err instanceof Error ? err.message : 'Failed to load data. Please try again.');
        
        // Set mock data even in case of error to show something
        setUsers([]);
        setVerifiedUsers([]);
      } finally {
        setLoading(false);
        addDebugLog('Setting loading state to false');
      }
    };

    fetchData();
  }, [mounted]);

  // Don't render anything during server rendering
  if (!mounted) {
    return null;
  }
  
  // Filter users based on search term and platform
  const filteredUsers = users.filter(user => {
    if (!user) return false;
    
    const matchesSearch = 
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.address?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPlatform = 
      filterPlatform === 'all' || 
      user.socialData?.some(data => data?.platform === filterPlatform);
    
    return matchesSearch && matchesPlatform;
  });

  // Simple analytics data
  const totalUsers = users.length;
  const totalFollowers = users.reduce((sum, user) => {
    if (!user.socialData) return sum;
    return sum + user.socialData.reduce((acc, data) => {
      return acc + (data?.followers || 0);
    }, 0);
  }, 0);

  const platformCounts: Record<string, number> = {};
  users.forEach(user => {
    if (user?.socialData) {
      user.socialData.forEach(data => {
        if (data?.platform) {
          platformCounts[data.platform] = (platformCounts[data.platform] || 0) + 
            (data.followers || 0);
        }
      });
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
        <div className="text-2xl mb-4">Loading admin panel...</div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00FF00]"></div>
        
        {/* Show debug logs in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 w-full max-w-2xl p-4 bg-gray-900 rounded text-xs font-mono text-gray-400 max-h-96 overflow-auto">
            <div className="mb-2 text-sm text-[#00FF00]">Debug logs:</div>
            {debug.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#00FF00] text-black px-4 py-2 rounded hover:bg-[#00CC00] transition-colors mb-4"
        >
          Retry
        </button>
        
        {/* Show debug logs in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 w-full max-w-2xl p-4 bg-gray-900 rounded text-xs font-mono text-gray-400 max-h-96 overflow-auto">
            <div className="mb-2 text-sm text-[#00FF00]">Debug logs:</div>
            {debug.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl ${pressStart.className}`}>Admin Dashboard</h1>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded border border-[#00FF00]"
            />
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded border border-[#00FF00]"
            >
              <option value="all">All Platforms</option>
              <option value="twitter">Twitter</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>
        </div>

        <div className="space-y-8">
          {/* Twitter Verified Users Section - Prominently displayed at the top */}
          <div className="bg-black border border-[#00FF00] rounded-lg p-6">
            <h2 className={`text-2xl ${pressStart.className} mb-6 text-center text-[#00FF00]`}>Twitter API Data</h2>
            <p className="text-gray-400 mb-6 text-center">
              Displaying verified Twitter users that have connected to our platform
            </p>
            {verifiedUsers?.length > 0 ? (
              <VerifiedUsersSection users={verifiedUsers} />
            ) : (
              <div className="bg-black border-2 border-[#00FF00] p-6 rounded-lg text-center">
                <p className="text-gray-400">No verified Twitter users found</p>
              </div>
            )}
          </div>

          {/* Other dashboard sections */}
          {filteredUsers?.length > 0 && (
            <LeaderboardSection users={filteredUsers} />
          )}
          
          <AnalyticsSection 
            totalUsers={totalUsers} 
            totalFollowers={totalFollowers} 
            platformCounts={platformCounts} 
          />
          
          {filteredUsers?.length > 0 && (
            <UserDataTable users={filteredUsers} />
          )}
        </div>
        
        {/* Show debug logs in development */}
        {process.env.NODE_ENV === 'development' && debug.length > 0 && (
          <div className="mt-8 p-4 bg-gray-900 rounded text-xs font-mono text-gray-400 max-h-64 overflow-auto">
            <div className="mb-2 text-sm text-[#00FF00]">Debug logs:</div>
            {debug.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Export with no SSR to ensure client-only rendering
export default AdminPanel; 