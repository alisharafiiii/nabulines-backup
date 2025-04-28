"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Press_Start_2P } from 'next/font/google';

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] });

interface VerifiedUser {
  screen_name: string;
  name: string;
  followers_count: number;
  friends_count?: number;
  profile_image_url: string;
  verified_at: string;
  verified?: boolean;
  description?: string;
  location?: string;
  url?: string;
  userId?: string;
}

interface VerifiedUsersSectionProps {
  users: VerifiedUser[];
}

// Add Twitter URL mapping function
const getTwitterUrl = (handle: string): string => {
  return `https://twitter.com/${handle}`;
};

export default function VerifiedUsersSection({ users }: VerifiedUsersSectionProps) {
  // Track images that failed to load
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Unknown date';
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Handle image error
  const handleImageError = (screenName: string) => {
    setFailedImages(prev => ({ ...prev, [screenName]: true }));
  };

  return (
    <div className="mb-8">
      <h2 className={`text-xl text-white mb-4 ${pressStart.className}`}>Verified Twitter Users</h2>
      {users.length === 0 ? (
        <div className="bg-black border-2 border-[#00FF00] p-6 rounded-lg text-center">
          <p className="text-gray-400">No verified Twitter users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div key={user.screen_name} className="bg-black border-2 border-[#00FF00] p-4 rounded-lg">
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-[#00FF00]">
                  {failedImages[user.screen_name] ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-[#00FF00]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <Image
                      src={user.profile_image_url.replace('_normal', '')}
                      alt={user.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                      onError={() => handleImageError(user.screen_name)}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{user.name}</h3>
                    {user.verified && (
                      <div className="bg-[#00FF00] text-black rounded-full w-4 h-4 flex items-center justify-center text-xs">
                        ✓
                      </div>
                    )}
                  </div>
                  <div className="text-[#00FF00]">
                    <a 
                      href={getTwitterUrl(user.screen_name)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-white hover:underline transition-colors"
                    >
                      @{user.screen_name}
                    </a>
                  </div>
                  {user.location && (
                    <p className="text-gray-400 text-xs mt-1">
                      📍 {user.location}
                    </p>
                  )}
                </div>
              </div>
              
              {user.description && (
                <p className="text-white text-sm mb-3">
                  {truncateText(user.description, 100)}
                </p>
              )}
              
              <div className="flex justify-between items-center mt-2">
                <div>
                  <p className="text-sm text-gray-400">Followers</p>
                  <p className="text-xl text-white">{formatFollowers(user.followers_count)}</p>
                </div>
                
                {user.friends_count !== undefined && (
                  <div>
                    <p className="text-sm text-gray-400">Following</p>
                    <p className="text-xl text-white">{formatFollowers(user.friends_count)}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-400">Connected</p>
                  <p className="text-sm text-white">{formatDate(user.verified_at)}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <a 
                  href={user.url || `https://twitter.com/${user.screen_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00FF00] hover:text-white bg-black border border-[#00FF00] rounded px-3 py-1 text-sm transition-colors w-full block text-center"
                >
                  View Profile
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 