"use client";

import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminPanel from "./components/AdminPanel";

const ADMIN_WALLET = "0x37Ed24e7c7311836FD01702A882937138688c1A9";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      if (address.toLowerCase() === ADMIN_WALLET.toLowerCase()) {
        setIsAuthorized(true);
      } else {
        router.push("/");
      }
    } else if (!isConnected) {
      router.push("/");
    }
  }, [address, isConnected, router]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <p className="text-white">Unauthorized access</p>
      </div>
    );
  }

  return <AdminPanel />;
} 