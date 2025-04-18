"use client";

import Image from 'next/image';
import { Press_Start_2P } from 'next/font/google';

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] });

interface AnalyticsSectionProps {
  totalUsers: number;
  totalFollowers: number;
  platformCounts: Record<string, number>;
}

const socialIcons: Record<string, string> = {
  twitter: '/twitter.jpg',
  instagram: '/ig.jpg',
  tiktok: '/tt.jpg',
  youtube: '/yt.jpg',
};

export default function AnalyticsSection({ 
  totalUsers, 
  totalFollowers, 
  platformCounts 
}: AnalyticsSectionProps) {
  const formatFollowers = (count: number) => {
    return count.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-black border-2 border-[#00FF00] p-4 rounded-lg">
        <h2 className={`text-white text-lg mb-2 ${pressStart.className}`}>Total Users</h2>
        <p className="text-white text-3xl">{totalUsers}</p>
      </div>
      <div className="bg-black border-2 border-[#00FF00] p-4 rounded-lg">
        <h2 className={`text-white text-lg mb-2 ${pressStart.className}`}>Total Followers</h2>
        <p className="text-white text-3xl">{formatFollowers(totalFollowers)}</p>
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
  );
} 