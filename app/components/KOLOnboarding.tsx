import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { KOLData } from '@/app/lib/redis';
import Image from 'next/image';
import { Press_Start_2P } from 'next/font/google';

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] });

interface SocialAccount {
  handle: string;
  followers: number;
}

interface KOLFormData {
  username: string;
  socialAccounts: Record<string, SocialAccount>;
  activeChain: string;
  targetCountry: string;
  contentTypes: string[];
  platforms: string[];
}

export default function KOLOnboarding() {
  const { address } = useAccount();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<KOLFormData>({
    username: '',
    socialAccounts: {},
    activeChain: '',
    targetCountry: '',
    contentTypes: [],
    platforms: []
  });

  const socialPlatforms = [
    { id: 'x', name: 'X (Twitter)', image: '/twitter.jpg' },
    { id: 'ig', name: 'Instagram', image: '/ig.jpg' },
    { id: 'tg', name: 'Telegram', image: '/tg.jpg' },
    { id: 'yt', name: 'YouTube', image: '/yt.jpg' },
    { id: 'tt', name: 'TikTok', image: '/tt.jpg' },
  ];

  const followerRanges = [
    { id: '1k-5k', label: '1,000 - 5,000' },
    { id: '5k-10k', label: '5,000 - 10,000' },
    { id: '10k-50k', label: '10,000 - 50,000' },
    { id: '50k-100k', label: '50,000 - 100,000' },
    { id: '100k-500k', label: '100,000 - 500,000' },
    { id: '500k-1m', label: '500,000 - 1,000,000' },
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      if (!address) return;

      try {
        const response = await fetch(`/api/kol?address=${address}`);
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setFormData(data);
            // If we have user data, skip to step 2
            if (data.username) {
              setStep(2);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [address]);

  const handleSubmit = async () => {
    if (!address) return;

    const data: KOLData = {
      walletAddress: address,
      username: formData.username || '',
      socialAccounts: formData.socialAccounts || {},
      activeChain: formData.activeChain || '',
      targetCountry: formData.targetCountry || '',
      contentTypes: formData.contentTypes || [],
      platforms: formData.platforms || [],
      createdAt: Date.now(),
    };

    try {
      const response = await fetch('/api/kol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStep(5);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const isFormComplete = () => {
    return Object.values(formData.socialAccounts).every(account => account.followers > 0);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-4 text-white ${pressStart.className}`}>Choose Your Username</h2>
            <input
              type="text"
              value={formData.username || ''}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className={`p-2 border rounded w-full max-w-xs bg-black border-[#00FF00] text-white ${pressStart.className}`}
              placeholder="Enter unique username"
            />
            <div className="mt-4">
              <button
                onClick={() => {
                  if (formData.username) {
                    setStep(2);
                  }
                }}
                disabled={!formData.username}
                className={`px-4 py-2 bg-[#00FF00] text-black rounded hover:bg-[#00CC00] disabled:opacity-50 ${pressStart.className}`}
              >
                Next
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-4 text-white ${pressStart.className}`}>Select Your Social Platforms</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {socialPlatforms.map((platform) => (
                <div key={platform.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={platform.id}
                    checked={formData.socialAccounts[platform.id] !== undefined}
                    onChange={(e) => {
                      const accounts = { ...formData.socialAccounts };
                      if (e.target.checked) {
                        accounts[platform.id] = { handle: '', followers: 0 };
                      } else {
                        delete accounts[platform.id];
                      }
                      setFormData({ ...formData, socialAccounts: accounts });
                    }}
                    className="w-4 h-4"
                  />
                  <label htmlFor={platform.id} className="flex items-center space-x-2">
                    <Image
                      src={platform.image}
                      alt={platform.name}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                    <span className="text-white">{platform.name}</span>
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <button
                onClick={() => setStep(3)}
                disabled={Object.keys(formData.socialAccounts).length === 0}
                className={`px-4 py-2 bg-[#00FF00] text-black rounded hover:bg-[#00CC00] disabled:opacity-50 ${pressStart.className}`}
              >
                Next
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-4 text-white ${pressStart.className}`}>Enter Your Follower Counts</h2>
            {Object.keys(formData.socialAccounts).map((platformId) => {
              const platform = socialPlatforms.find(p => p.id === platformId);
              if (!platform) return null;
              return (
                <div key={platformId} className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Image
                      src={platform.image}
                      alt={platform.name}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                    <span className="text-white">{platform.name}</span>
                  </div>
                  <select
                    value={formData.socialAccounts[platformId].followers || ''}
                    onChange={(e) => {
                      const accounts = { ...formData.socialAccounts };
                      const range = e.target.value;
                      let followers = 0;
                      switch (range) {
                        case '1k-5k': followers = 3000; break;
                        case '5k-10k': followers = 7500; break;
                        case '10k-50k': followers = 30000; break;
                        case '50k-100k': followers = 75000; break;
                        case '100k-500k': followers = 300000; break;
                        case '500k-1m': followers = 750000; break;
                      }
                      accounts[platformId].followers = followers;
                      setFormData({ ...formData, socialAccounts: accounts });
                    }}
                    className={`p-2 border rounded w-full max-w-xs bg-black border-[#00FF00] text-white ${pressStart.className}`}
                  >
                    <option value="">Select follower range</option>
                    {followerRanges.map((range) => (
                      <option key={range.id} value={range.id}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
            <div className="mt-4">
              <button
                onClick={handleSubmit}
                disabled={!isFormComplete()}
                className={`px-4 py-2 bg-[#00FF00] text-black rounded hover:bg-[#00CC00] disabled:opacity-50 ${pressStart.className}`}
              >
                Save Profile
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-4 text-white ${pressStart.className}`}>Review & Submit</h2>
            <div className={`text-left max-w-md mx-auto text-white ${pressStart.className}`}>
              <p><strong>Username:</strong> {formData.username}</p>
              <p><strong>Active Chain:</strong> {formData.activeChain}</p>
              <p><strong>Target Country:</strong> {formData.targetCountry}</p>
              <p><strong>Content Types:</strong> {formData.contentTypes?.join(', ')}</p>
              <p><strong>Platforms:</strong> {Object.keys(formData.socialAccounts || {}).join(', ')}</p>
            </div>
            <button
              onClick={handleSubmit}
              className={`mt-4 px-6 py-2 bg-[#00FF00] text-black rounded hover:bg-[#00CC00] ${pressStart.className}`}
            >
              Submit
            </button>
          </div>
        );

      case 5:
        return (
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-4 text-white ${pressStart.className}`}>Thank You!</h2>
            <p className={`text-white ${pressStart.className}`}>Your KOL profile has been successfully created.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {step > 1 && formData.username && (
        <div className="absolute top-4 left-4">
          <button
            onClick={() => {
              const event = new CustomEvent('showWalletDetails', { detail: true });
              window.dispatchEvent(event);
            }}
            className={`text-white hover:text-[#00FF00] transition-colors ${pressStart.className}`}
          >
            {formData.username}
          </button>
        </div>
      )}

      {renderStep()}
      
      {step > 1 && step < 5 && (
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className={`px-4 py-2 border rounded disabled:opacity-50 text-white ${pressStart.className}`}
          >
            Back
          </button>
          <button
            onClick={() => setStep(step + 1)}
            className={`px-4 py-2 bg-[#00FF00] text-black rounded hover:bg-[#00CC00] ${pressStart.className}`}
          >
            {step === 4 ? 'Submit' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
} 