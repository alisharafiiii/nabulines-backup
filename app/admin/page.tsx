"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAccount } from 'wagmi';

// Import AdminPanel with ssr: false to completely avoid hydration errors
const AdminPanel = dynamic(() => import('./components/AdminPanel'), { ssr: false });

// Admin wallet address
const ADMIN_WALLET = "0x37Ed24e7c7311836FD01702A882937138688c1A9";

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { address } = useAccount();

  useEffect(() => {
    setIsMounted(true);
    
    const checkAuthorization = async () => {
      try {
        // Check if user has a connected wallet
        if (!address) {
          console.log('No wallet connected');
          router.push('/');
          return;
        }

        // Store the wallet address in localStorage for API requests
        localStorage.setItem('walletAddress', address);

        // Check if wallet is admin
        if (address.toLowerCase() === ADMIN_WALLET.toLowerCase()) {
          console.log('Admin wallet detected, authorization granted');
          setIsAuthorized(true);
        } else {
          console.log('Non-admin wallet detected:', address);
          router.push('/');
        }
      } catch (error) {
        console.error('Authorization check failed:', error);
        router.push('/');
      }
    };

    if (isMounted) {
      checkAuthorization();
    }
  }, [router, address, isMounted]);

  // Show nothing during server rendering or while checking auth
  if (!isMounted || !isAuthorized) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  // Only render on client side after authorization is confirmed
  return <AdminPanel />;
} 