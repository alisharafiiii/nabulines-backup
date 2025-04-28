"use client";

import { useState, useEffect } from 'react';
import { Press_Start_2P } from 'next/font/google';
import dynamic from 'next/dynamic';

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] });

// Dynamically import all components to avoid hydration issues
const VerifiedUsersSection = dynamic(() => import('./VerifiedUsersSection'), { ssr: false });
const LeaderboardSection = dynamic(() => import('./LeaderboardSection'), { ssr: false });
const UserDataTable = dynamic(() => import('./UserDataTable'), { ssr: false });

interface UserData {
  address: string;
  username: string;
  displayName?: string;
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

interface SocialData {
  platform: string;
  handle: string;
  followers: number;
  timestamp: number;
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
  const [filteredUserCount, setFilteredUserCount] = useState(0);
  const [filteredUsersData, setFilteredUsersData] = useState<UserData[]>([]);
  
  // Add state for input fields
  const [searchInput, setSearchInput] = useState('');
  const [filterInput, setFilterInput] = useState('all');
  
  // Add debug log function
  const addDebugLog = (message: string) => {
    setDebug(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };
  
  // Set mounted state
  useEffect(() => {
    setMounted(true);
    addDebugLog('Component mounted');
  }, []);
  
  // Add a separate useEffect for debug logging when search/filter changes
  useEffect(() => {
    if (mounted && users.length > 0) {
      addDebugLog(`Filtered users updated: ${filteredUserCount} results`);
      if (searchTerm !== '') {
        addDebugLog(`Active search term: "${searchTerm}" showing ${filteredUserCount}/${users.length} users`);
      }
      if (filterPlatform !== 'all') {
        addDebugLog(`Platform filter active: "${filterPlatform}" showing ${filteredUserCount}/${users.length} users`);
      }
    }
  }, [searchTerm, filterPlatform, users.length, filteredUserCount, mounted]);

  // Update filtered users whenever search term, platform filter, or users change
  useEffect(() => {
    if (mounted) {
      addDebugLog(`Filtering triggered with: searchTerm="${searchTerm}", platform="${filterPlatform}", users=${users.length}`);
      
      // First filter users according to search term and platform
      const filtered = users.filter(user => {
        if (!user) return false;
        
        // Check for match in username or address
        const matchesSearch = 
          searchTerm === '' || 
          user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.socialData?.some(data => 
            data.handle.toLowerCase().includes(searchTerm.toLowerCase())
          );
        
        const matchesPlatform = 
          filterPlatform === 'all' || 
          user.socialData?.some(data => data?.platform === filterPlatform);
        
        return matchesSearch && matchesPlatform;
      });
      
      // Log some sample data for debugging
      if (filtered.length > 0) {
        addDebugLog(`First filtered result username: ${filtered[0].username}`);
      } else {
        addDebugLog(`No users match filter criteria`);
      }
      
      // Ensure no duplicates by creating a map with usernames as keys
      const uniqueUsers = new Map<string, UserData>();
      
      filtered.forEach(user => {
        if (!user.username) return;
        
        const userKey = user.username.toLowerCase();
        const existingUser = uniqueUsers.get(userKey);
        
        // If we already have this user, keep the one with more data
        if (existingUser) {
          // Keep the one with an address if the other doesn't have one
          if (!existingUser.address && user.address) {
            uniqueUsers.set(userKey, user);
          }
          // Otherwise, check if this user has more social data
          else if (
            (user.socialData?.length || 0) > (existingUser.socialData?.length || 0)
          ) {
            uniqueUsers.set(userKey, user);
          }
        } else {
          uniqueUsers.set(userKey, user);
        }
      });
      
      // Convert map back to array and sort by total followers (descending)
      const sortedUsers = Array.from(uniqueUsers.values()).sort((a, b) => {
        const aFollowers = a.socialData?.reduce((sum, data) => sum + data.followers, 0) || 0;
        const bFollowers = b.socialData?.reduce((sum, data) => sum + data.followers, 0) || 0;
        return bFollowers - aFollowers; // Sort in descending order
      });
      
      addDebugLog(`Filtered ${filtered.length} -> ${sortedUsers.length} unique users`);
      
      // Log some top results for debugging
      if (sortedUsers.length > 0) {
        addDebugLog(`Top result: ${sortedUsers[0].username} with ${sortedUsers[0].socialData?.reduce((sum, data) => sum + data.followers, 0) || 0} followers`);
      }
      
      // IMPORTANT: Force async state update to ensure React picks up the change
      setTimeout(() => {
        setFilteredUsersData(sortedUsers);
        setFilteredUserCount(sortedUsers.length);
      }, 0);
    }
  }, [users, searchTerm, filterPlatform, mounted]);

  // Get color for platform visualization
  const getPlatformColor = (platform: string, index: number): string => {
    const colors = {
      twitter: '#1DA1F2',
      instagram: '#E1306C',
      tiktok: '#000000',
      youtube: '#FF0000'
    };
    
    return colors[platform as keyof typeof colors] || 
      `hsl(${(index * 70) % 360}, 70%, 50%)`; // Fallback color
  };
  
  // Render pie chart segments for platforms
  const renderPieChart = (platformCounts: Record<string, number>) => {
    const total = Object.values(platformCounts).reduce((sum, count) => sum + count, 0);
    if (total === 0) return null;
    
    let currentAngle = 0;
    
    return Object.entries(platformCounts).map(([platform, count], index) => {
      const startAngle = currentAngle;
      const percentage = (count / total) * 100;
      const angleSize = (percentage / 100) * 360;
      currentAngle += angleSize;
      
      return (
        <div 
          key={platform}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            clipPath: `path('M 96 96 L 96 0 A 96 96 0 ${angleSize > 180 ? 1 : 0} 1 ${
              96 + 96 * Math.sin((startAngle + angleSize) * (Math.PI / 180))
            } ${
              96 - 96 * Math.cos((startAngle + angleSize) * (Math.PI / 180))
            } L 96 96')`,
            transform: `rotate(${startAngle}deg)`,
            backgroundColor: getPlatformColor(platform, index)
          }}
        />
      );
    });
  };

  // Process verified Twitter users and merge with existing user data
  const processVerifiedUsers = (users: UserData[], verifiedTwitterUsers: VerifiedUser[]): UserData[] => {
    addDebugLog(`Processing ${users.length} users and ${verifiedTwitterUsers.length} verified Twitter users`);
    
    // Find duplicates for debugging
    const findDuplicates = (verifiedUsers: VerifiedUser[]) => {
      const screenNames = verifiedUsers.map(user => user.screen_name);
      const duplicates = screenNames.filter((name, index) => screenNames.indexOf(name) !== index);
      return Array.from(new Set(duplicates));
    };
    
    const duplicates = findDuplicates(verifiedTwitterUsers);
    if (duplicates.length > 0) {
      addDebugLog(`Found duplicates in verified users: ${duplicates.join(', ')}`);
    }
    
    // Create a map to store unique users with their wallet addresses
    const uniqueUserMap = new Map<string, UserData>();
    
    // First process users to establish wallet addresses
    users.forEach(user => {
      if (!user.username) return;
      
      // Special case for 'nabu'
      if (user.username.toLowerCase() === 'nabu') {
        addDebugLog(`Found special user: ${user.username}`);
      }
      
      // Update existing or add new
      uniqueUserMap.set(user.username.toLowerCase(), {
        address: user.address,
        username: user.username,
        displayName: user.displayName,
        socialData: user.socialData || []
      });
    });
    
    // Now process verified Twitter users
    verifiedTwitterUsers.forEach(twitterUser => {
      const twitterHandle = twitterUser.screen_name.toLowerCase();
      const existingUser = uniqueUserMap.get(twitterHandle);
      
      if (existingUser) {
        // Update existing user with Twitter data
        addDebugLog(`Updating existing user ${twitterHandle} with Twitter data`);
        
        // Check if this user already has Twitter social data
        const existingTwitterData = existingUser.socialData?.find(
          data => data.platform === 'twitter' && data.handle.toLowerCase() === twitterHandle
        );
        
        if (existingTwitterData) {
          // Update existing Twitter data
          existingTwitterData.followers = twitterUser.followers_count;
          existingTwitterData.timestamp = Date.now();
        } else {
          // Add new Twitter social data
          const newSocialData: SocialData = {
            platform: 'twitter',
            handle: twitterUser.screen_name,
            followers: twitterUser.followers_count,
            timestamp: Date.now()
          };
          
          existingUser.socialData = [...(existingUser.socialData || []), newSocialData];
        }
        
        // Update display name if not already set
        if (!existingUser.displayName) {
          existingUser.displayName = twitterUser.name;
        }
        
        // Ensure address is present (required by UserData interface)
        if (!existingUser.address) {
          existingUser.address = ''; // Set empty string as fallback
          addDebugLog(`Warning: User ${twitterHandle} has no wallet address, setting empty string`);
        }
        
        // Update the map
        uniqueUserMap.set(twitterHandle, existingUser);
      } else {
        // Create new user entry from Twitter data
        addDebugLog(`Creating new user entry for Twitter user: ${twitterHandle}`);
        
        const newUser: UserData = {
          address: '', // Set empty string as required by UserData interface
          username: twitterUser.screen_name,
          displayName: twitterUser.name,
          socialData: [{
            platform: 'twitter',
            handle: twitterUser.screen_name,
            followers: twitterUser.followers_count,
            timestamp: Date.now()
          }]
        };
        
        uniqueUserMap.set(twitterHandle, newUser);
      }
    });
    
    // Second pass - check for Twitter usernames that match wallet addresses
    // This helps transfer addresses to profiles that might not have been linked
    uniqueUserMap.forEach((userData, username) => {
      if (!userData.address && username) {
        // Look for a matching wallet address in other entries
        users.forEach(user => {
          if (user.username && user.username.toLowerCase() === username && user.address) {
            addDebugLog(`Found matching wallet address for ${username}: ${user.address.slice(0, 6)}...`);
            userData.address = user.address;
          }
        });
      }
    });
    
    // Convert map back to array and filter out invalid entries
    const processedUsers = Array.from(uniqueUserMap.values()).filter(user => {
      // Filter criteria: must have either a valid address or social data
      return (
        user.username && 
        (user.address || (user.socialData && user.socialData.length > 0))
      );
    });
    
    addDebugLog(`Processed ${processedUsers.length} total users after merging`);
    return processedUsers;
  };
  
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
          
          // Process the data to merge verified Twitter users with existing user data
          const processedUsers = processVerifiedUsers(usersData || [], verifiedData || []);
          
          setUsers(processedUsers);
          setVerifiedUsers(verifiedData || []);
        } catch (apiError) {
          // If API fetch fails, fall back to mock data
          addDebugLog(`API fetch failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`);
          addDebugLog('Falling back to mock data');
          
          // Process the mock data as well
          const processedMockUsers = processVerifiedUsers(mockUsers, mockVerified);
          
          setUsers(processedMockUsers);
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

  // At top of component, add state for tracking tooltips
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  // Don't render anything during server rendering
  if (!mounted) {
    return null;
  }
  
  // Simple analytics data - use filteredUsers for calculations when filter is applied
  const totalUsers = users.length;
  const totalFilteredUsers = filteredUsersData.length;
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
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search users..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded border border-[#00FF00]"
            />
            <select
              value={filterInput}
              onChange={(e) => setFilterInput(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded border border-[#00FF00]"
            >
              <option value="all">All Platforms</option>
              <option value="twitter">Twitter</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
            </select>
            <button
              onClick={() => {
                addDebugLog(`Search applied: "${searchInput}" with platform filter: ${filterInput}`);
                // Force these to be different values to trigger the useEffect
                setSearchTerm(prev => prev === searchInput ? searchInput + " " : searchInput);
                setFilterPlatform(filterInput);
                
                // Set after a small delay to ensure the state updates
                setTimeout(() => {
                  setSearchTerm(searchInput);
                }, 10);
              }}
              className="bg-[#00FF00] text-black px-4 py-2 rounded hover:bg-[#00CC00] transition-colors"
            >
              Search
            </button>
            {(searchTerm !== '' || filterPlatform !== 'all') && (
              <button
                onClick={() => {
                  addDebugLog('Search reset');
                  setSearchInput('');
                  setFilterInput('all');
                  setSearchTerm('');
                  setFilterPlatform('all');
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Debug Information Section with Platform Percentages */}
        <div className="bg-black border border-[#00FF00] rounded-lg p-6 mb-6">
          <h2 className={`text-lg ${pressStart.className} mb-3 text-[#00FF00]`}>Dashboard Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Users</p>
                  <p className="text-xl text-white">{users.length}</p>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Followers</p>
                  <p className="text-xl text-white">{totalFollowers.toLocaleString()}</p>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Selected Platform</p>
                  <p className="text-xl text-white capitalize">{filterPlatform}</p>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Filtered Results</p>
                  <p className="text-xl text-white">{filteredUserCount}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Platform Distribution</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                    {Object.entries(platformCounts).sort((a, b) => b[1] - a[1]).map(([platform, count]) => (
                      <div 
                        key={platform} 
                        className={`flex justify-between items-center text-xs cursor-pointer p-1 rounded transition-colors ${selectedPlatform === platform ? 'bg-gray-800' : 'hover:bg-gray-800'}`}
                        onClick={() => setSelectedPlatform(platform === selectedPlatform ? null : platform)}
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 mr-1 rounded-full" 
                            style={{ backgroundColor: getPlatformColor(platform, Object.keys(platformCounts).indexOf(platform)) }}
                          />
                          <span className="text-white capitalize mr-1">{platform}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-white mr-2">{count.toLocaleString()}</span>
                          <span className="text-[#00FF00]">
                            {Math.round((count / totalFollowers) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm mb-1">Connected Wallet</p>
                  <p className="text-sm text-white font-mono break-all">{address}</p>
                </div>
              </div>
            </div>
            
            {/* Platform Percentage Circular Chart */}
            <div className="bg-gray-900 p-3 rounded-lg flex flex-col items-center justify-center">
              <p className="text-gray-400 text-sm mb-2">Platform Distribution</p>
              
              <div className="relative w-56 h-56">
                {/* Background circle */}
                <div className="absolute top-0 left-0 w-full h-full rounded-full border-4 border-gray-800"></div>
                
                {/* SVG container for chart */}
                <svg viewBox="0 0 56 56" className="absolute top-0 left-0 w-full h-full">
                  {/* Draw pie chart segments */}
                  {Object.entries(platformCounts).map(([platform, count], index, arr) => {
                    const total = Object.values(platformCounts).reduce((sum, c) => sum + c, 0);
                    if (total === 0) return null;
                    
                    // Calculate angles and percentages
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    
                    // Calculate start and end angles for this segment
                    let startAngle = 0;
                    for (let i = 0; i < index; i++) {
                      startAngle += (Object.values(platformCounts)[i] / total) * 360;
                    }
                    const endAngle = startAngle + (count / total) * 360;
                    const midAngle = startAngle + (endAngle - startAngle) / 2;
                    
                    // Prepare for drawing the segment
                    const isLargeArc = endAngle - startAngle > 180 ? 1 : 0;
                    
                    // Calculate coordinates for the segment path
                    const startX = 28 + Math.cos((startAngle - 90) * Math.PI / 180) * 28;
                    const startY = 28 + Math.sin((startAngle - 90) * Math.PI / 180) * 28;
                    const endX = 28 + Math.cos((endAngle - 90) * Math.PI / 180) * 28;
                    const endY = 28 + Math.sin((endAngle - 90) * Math.PI / 180) * 28;
                    
                    // Calculate segment highlight offset (for hover/selection effect)
                    const highlightOffset = selectedPlatform === platform ? 3 : 0;
                    const offsetX = highlightOffset * Math.cos((midAngle - 90) * Math.PI / 180);
                    const offsetY = highlightOffset * Math.sin((midAngle - 90) * Math.PI / 180);
                    
                    // Generate path for the segment
                    const path = `M ${28 + offsetX} ${28 + offsetY} L ${startX + offsetX} ${startY + offsetY} A 28 28 0 ${isLargeArc} 1 ${endX + offsetX} ${endY + offsetY} Z`;
                    
                    return (
                      <g key={platform}>
                        <path
                          d={path}
                          fill={getPlatformColor(platform, index)}
                          stroke="#000"
                          strokeWidth="0.5"
                          className={`transition-all duration-300 cursor-pointer ${
                            selectedPlatform === platform ? 'opacity-100 filter drop-shadow-lg' : 'opacity-90 hover:opacity-100'
                          }`}
                          onClick={() => setSelectedPlatform(platform === selectedPlatform ? null : platform)}
                        />
                        <title>{`${platform}: ${count.toLocaleString()} followers (${percentage.toFixed(1)}%)`}</title>
                      </g>
                    );
                  })}
                </svg>
                
                {/* Inner circle with info */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-black border-2 border-gray-800 flex flex-col items-center justify-center text-center p-1 shadow-inner">
                  {selectedPlatform ? (
                    <>
                      <p className="text-sm text-[#00FF00] font-semibold capitalize">{selectedPlatform}</p>
                      <p className="text-xl text-white font-bold">{platformCounts[selectedPlatform]?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-400">followers</p>
                      <p className="text-xs text-[#00FF00] mt-1">
                        {Math.round((platformCounts[selectedPlatform] / totalFollowers) * 100)}% of total
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-[#00FF00] font-semibold">{Object.keys(platformCounts).length}</p>
                      <p className="text-lg text-white">Platforms</p>
                      <p className="text-xs text-gray-400 mt-1">(click segments for details)</p>
                    </>
                  )}
                </div>
              </div>
              
              {/* Platform list under the chart */}
              <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                {Object.entries(platformCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([platform, count], index) => {
                    const percentage = Math.round((count / totalFollowers) * 100);
                    return (
                      <div 
                        key={platform} 
                        className={`flex items-center justify-between text-xs cursor-pointer p-1.5 rounded transition-colors ${
                          selectedPlatform === platform 
                            ? 'bg-gray-800 ring-1 ring-[#00FF00]' 
                            : 'hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedPlatform(platform === selectedPlatform ? null : platform)}
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 mr-1.5 rounded-full" 
                            style={{ backgroundColor: getPlatformColor(platform, Object.keys(platformCounts).indexOf(platform)) }}
                          />
                          <span className="text-white capitalize">{platform}</span>
                        </div>
                        <span className={`${selectedPlatform === platform ? 'text-[#00FF00]' : 'text-gray-300'}`}>
                          {percentage}%
                        </span>
                      </div>
                    );
                  })
                }
              </div>
              
              {/* Debug status */}
              <div className="mt-4 w-full">
                <div className="bg-gray-800 p-2 rounded">
                  <p className="text-gray-400 text-xs mb-1">Last Debug Message</p>
                  <p className="text-xs text-white font-mono break-all">
                    {debug.length > 0 ? debug[debug.length - 1].split(': ').slice(1).join(': ') : 'No messages'}
                  </p>
                </div>
              </div>
            </div>
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
          {/* Force filteredUsers to be re-evaluated by adding key prop with searchTerm and filterPlatform */}
          {filteredUsersData?.length > 0 ? (
            <LeaderboardSection key={`leader-${searchTerm}-${filterPlatform}`} users={filteredUsersData} />
          ) : (
            <div className="bg-black border-2 border-[#00FF00] p-6 rounded-lg text-center mt-8">
              <p className="text-gray-400">No matching users found for the current search or filter</p>
            </div>
          )}
          
          {/* Force filteredUsers to be re-evaluated by adding key prop with searchTerm and filterPlatform */}
          {filteredUsersData?.length > 0 ? (
            <UserDataTable key={`table-${searchTerm}-${filterPlatform}`} users={filteredUsersData} />
          ) : (
            <div className="bg-black border-2 border-[#00FF00] p-6 rounded-lg text-center">
              <p className="text-gray-400">No matching users found for the current search or filter</p>
            </div>
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

export default AdminPanel;