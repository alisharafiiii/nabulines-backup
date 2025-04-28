"use client";

import Image from 'next/image';
import { Press_Start_2P } from 'next/font/google';

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

interface UserDataTableProps {
  users: UserData[];
}

const socialIcons: Record<string, string> = {
  twitter: '/twitter.jpg',
  instagram: '/ig.jpg',
  tiktok: '/tt.jpg',
  youtube: '/yt.jpg',
};

// Add platform URL mapping function
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

export default function UserDataTable({ users }: UserDataTableProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatFollowers = (count: number) => {
    return count.toLocaleString();
  };

  return (
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
          {users.map((user) => (
            <tr key={user.address} className="border-b border-gray-800">
              <td className="text-white p-4 text-sm break-all">{user.address}</td>
              <td className="text-white p-4">
                <a
                  href={`/user/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-[#00FF00] hover:underline transition-colors"
                >
                  {user.username}
                </a>
              </td>
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
                    <a 
                      href={getPlatformUrl(platform.platform, platform.handle)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-[#00FF00] hover:underline transition-colors"
                    >
                      {platform.handle}
                    </a>
                  </div>
                ))}
              </td>
              <td className="text-white p-4">
                {formatFollowers(user.socialData.reduce((sum, platform) => sum + platform.followers, 0))}
              </td>
              <td className="text-white p-4">
                {formatDate(Math.max(...user.socialData.map(p => p.timestamp)))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 