module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['pbs.twimg.com', 'abs.twimg.com', 'twitter.com'],
  },
  async rewrites() {
    return [
      // Serve TikTok verification at the root path
      {
        source: '/',
        has: [
          {
            type: 'header',
            key: 'user-agent',
            value: '(.*Tiktok.*)',
          },
        ],
        destination: '/tiktok-verification.txt',
      },
    ];
  },
}; 