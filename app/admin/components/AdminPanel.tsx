import { useEffect, useState } from 'react';
import { Press_Start_2P } from 'next/font/google';
import { useAccount } from 'wagmi';
import Image from 'next/image';

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] });

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

const socialIcons: Record<string, string> = {
  twitter: '/twitter.jpg',
  instagram: '/ig.jpg',
  tiktok: '/tt.jpg',
  youtube: '/yt.jpg',
};

export default function AdminPanel() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const { address } = useAccount();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!address) {
        setError('Please connect your wallet');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching users with address:', address);
        
        const response = await fetch('/api/admin/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-wallet-address': address
          }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response:', errorData);
          
          if (response.status === 503) {
            throw new Error('Database connection error. Please try again later.');
          } else if (response.status === 401) {
            throw new Error('Unauthorized access. Please connect with the admin wallet.');
          } else if (response.status === 500) {
            if (retryCount < 3) {
              setRetryCount(prev => prev + 1);
              setTimeout(fetchUsers, 1000 * retryCount);
              return;
            }
            throw new Error('Server error. Please try again later.');
          }
          
          throw new Error(errorData.error || `Failed to fetch users: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched data:', data);
        setUsers(data);
        setError('');
      } catch (err) {
        console.error('Detailed error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [address, retryCount]);

  // Filter users based on search term and platform
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.socialData.some(data => 
        data.handle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesPlatform = 
      selectedPlatform === 'all' || 
      user.socialData.some(data => data.platform === selectedPlatform);
    
    return matchesSearch && matchesPlatform;
  });

  // Get top 10 users by followers
  const leaderboard = [...filteredUsers]
    .sort((a, b) => {
      const aFollowers = a.socialData.reduce((sum, data) => sum + data.followers, 0);
      const bFollowers = b.socialData.reduce((sum, data) => sum + data.followers, 0);
      return bFollowers - aFollowers;
    })
    .slice(0, 10);

  // Calculate analytics
  const totalUsers = filteredUsers.length;
  const totalFollowers = filteredUsers.reduce((sum, user) => 
    sum + user.socialData.reduce((platformSum, platform) => 
      platformSum + platform.followers, 0), 0);
  
  const platformCounts = filteredUsers.reduce((acc, user) => {
    user.socialData.forEach(platform => {
      acc[platform.platform] = (acc[platform.platform] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to delete all user data? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/admin/clear-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-wallet-address': address || ''
          }
        })

        if (!response.ok) {
          throw new Error('Failed to clear data')
        }

        // Refresh the data
        if (address) {
          const refreshResponse = await fetch('/api/admin/users', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-wallet-address': address
            }
          });
          
          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            setUsers(data);
          }
        }
      } catch (error) {
        console.error('Error clearing data:', error)
        setError('Failed to clear data')
      }
    }
  }

  if (loading) {
    return <div className="text-white text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${pressStart.className}`}>Admin Dashboard</h1>
          <button
            onClick={handleClearData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear All Data
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex gap-4">
          <input
            type="text"
            placeholder="Search by username, address, or handle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded-lg focus:outline-none focus:border-[#00FF00]"
          />
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded-lg focus:outline-none focus:border-[#00FF00]"
          >
            <option value="all">All Platforms</option>
            {Object.keys(platformCounts).map(platform => (
              <option key={platform} value={platform}>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Leaderboard */}
        <div className="mb-8">
          <h2 className={`text-xl text-white mb-4 ${pressStart.className}`}>Top 10 Leaderboard</h2>
          <div className="bg-black border-2 border-[#00FF00] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#00FF00]">
                  <th className={`text-white p-4 text-left ${pressStart.className}`}>Rank</th>
                  <th className={`text-white p-4 text-left ${pressStart.className}`}>Username</th>
                  <th className={`text-white p-4 text-left ${pressStart.className}`}>Total Followers</th>
                  <th className={`text-white p-4 text-left ${pressStart.className}`}>Platforms</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, index) => (
                  <tr key={user.address} className="border-b border-gray-800">
                    <td className="text-white p-4">{index + 1}</td>
                    <td className="text-white p-4">{user.username}</td>
                    <td className="text-white p-4">
                      {user.socialData.reduce((sum, platform) => sum + platform.followers, 0).toLocaleString()}
                    </td>
                    <td className="text-white p-4">
                      {user.socialData.map(platform => (
                        <div key={platform.platform} className="mb-1">
                          <Image
                            src={socialIcons[platform.platform]}
                            alt={platform.platform}
                            width={24}
                            height={24}
                            className="w-6 h-6 inline-block mr-2"
                          />
                          <span>{platform.handle}</span>
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-black border-2 border-[#00FF00] p-4 rounded-lg">
            <h2 className={`text-white text-lg mb-2 ${pressStart.className}`}>Total Users</h2>
            <p className="text-white text-3xl">{totalUsers}</p>
          </div>
          <div className="bg-black border-2 border-[#00FF00] p-4 rounded-lg">
            <h2 className={`text-white text-lg mb-2 ${pressStart.className}`}>Total Followers</h2>
            <p className="text-white text-3xl">{totalFollowers.toLocaleString()}</p>
          </div>
          <div className="bg-black border-2 border-[#00FF00] p-4 rounded-lg">
            <h2 className={`text-white text-lg mb-2 ${pressStart.className}`}>Platform Distribution</h2>
            <div className="space-y-2">
              {Object.entries(platformCounts).map(([platform, count]) => (
                <div key={platform} className="flex justify-between">
                  <div className="flex items-center">
                    <Image
                      src={socialIcons[platform]}
                      alt={platform}
                      width={24}
                      height={24}
                      className="w-6 h-6 mr-2"
                    />
                    <span className="text-white capitalize">{platform}</span>
                  </div>
                  <span className="text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Data Table */}
        <div className="bg-black border-2 border-[#00FF00] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#00FF00]">
                <th className={`text-white p-4 text-left ${pressStart.className}`}>Wallet Address</th>
                <th className={`text-white p-4 text-left ${pressStart.className}`}>Username</th>
                <th className={`text-white p-4 text-left ${pressStart.className}`}>Social Platforms</th>
                <th className={`text-white p-4 text-left ${pressStart.className}`}>Total Followers</th>
                <th className={`text-white p-4 text-left ${pressStart.className}`}>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.address} className="border-b border-gray-800">
                  <td className="text-white p-4 text-sm break-all">{user.address}</td>
                  <td className="text-white p-4">{user.username}</td>
                  <td className="text-white p-4">
                    {user.socialData.map((platform) => (
                      <div key={platform.platform} className="mb-2">
                        <Image
                          src={socialIcons[platform.platform]}
                          alt={platform.platform}
                          width={24}
                          height={24}
                          className="w-6 h-6 inline-block mr-2"
                        />
                        <span>{platform.handle}</span>
                      </div>
                    ))}
                  </td>
                  <td className="text-white p-4">
                    {user.socialData.reduce((sum, platform) => sum + platform.followers, 0).toLocaleString()}
                  </td>
                  <td className="text-white p-4">
                    {new Date(Math.max(...user.socialData.map(p => p.timestamp))).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 