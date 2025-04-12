import { useState, useEffect, useCallback } from 'react';
import { KOLData } from '@/app/lib/redis';

export default function AdminDashboard() {
  const [kols, setKols] = useState<KOLData[]>([]);
  const [filters, setFilters] = useState({
    chain: '',
    country: '',
    contentType: '',
    platform: '',
  });

  const fetchKols = useCallback(async () => {
    const queryParams = new URLSearchParams();
    if (filters.chain) queryParams.append('chain', filters.chain);
    if (filters.country) queryParams.append('country', filters.country);
    if (filters.contentType) queryParams.append('contentType', filters.contentType);
    if (filters.platform) queryParams.append('platform', filters.platform);

    const response = await fetch(`/api/kol?${queryParams.toString()}`);
    const data = await response.json();
    setKols(data);
  }, [filters]);

  useEffect(() => {
    fetchKols();
  }, [fetchKols]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">KOL Management Dashboard</h1>
      
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select
          value={filters.chain}
          onChange={(e) => setFilters({ ...filters, chain: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">All Chains</option>
          <option value="eth">Ethereum</option>
          <option value="sol">Solana</option>
          <option value="base">Base</option>
        </select>

        <select
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">All Countries</option>
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="jp">Japan</option>
        </select>

        <select
          value={filters.contentType}
          onChange={(e) => setFilters({ ...filters, contentType: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">All Content Types</option>
          <option value="threads">Threads</option>
          <option value="video">Video</option>
          <option value="stream">Stream</option>
          <option value="spaces">Spaces</option>
        </select>

        <select
          value={filters.platform}
          onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">All Platforms</option>
          <option value="x">X (Twitter)</option>
          <option value="ig">Instagram</option>
          <option value="tg">Telegram</option>
          <option value="yt">YouTube</option>
        </select>
      </div>

      {/* KOL Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wallet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Followers
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content Types
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platforms
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {kols.map((kol) => (
              <tr key={kol.walletAddress}>
                <td className="px-6 py-4 whitespace-nowrap">{kol.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {kol.walletAddress.slice(0, 6)}...{kol.walletAddress.slice(-4)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{kol.activeChain}</td>
                <td className="px-6 py-4 whitespace-nowrap">{kol.targetCountry}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {Object.values(kol.socialAccounts).reduce(
                    (sum, acc) => sum + acc.followers,
                    0
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {kol.contentTypes.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {kol.platforms.join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 