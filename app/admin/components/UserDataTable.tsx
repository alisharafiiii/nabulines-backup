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