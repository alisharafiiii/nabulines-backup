import NextAuth from "next-auth";
import { Session } from "next-auth";

/**
 * For NextAuth.js with TikTok OAuth, you need to:
 * 
 * 1. Register a TikTok developer app and get CLIENT_ID and CLIENT_SECRET
 * 2. Configure the Redirect URI to be https://<YOUR_DOMAIN>/api/auth/callback/tiktok
 * 3. Add TIKTOK_CLIENT_ID and TIKTOK_CLIENT_SECRET to .env.local and Vercel
 */

// Get base URL from environment or fallback
const BASE_URL = process.env.NEXTAUTH_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

// Extend the session type to include user id
interface ExtendedSession extends Session {
  provider?: string;
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const handler = NextAuth({
  providers: [
    {
      id: "tiktok",
      name: "TikTok",
      type: "oauth",
      clientId: process.env.TIKTOK_CLIENT_ID,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET,
      authorization: {
        url: "https://www.tiktok.com/v2/auth/authorize/",
        params: { 
          scope: "user.info.basic",
          response_type: "code" 
        }
      },
      token: {
        url: "https://open.tiktokapis.com/v2/oauth/token/",
        async request({ params, provider }) {
          const tokenUrl = "https://open.tiktokapis.com/v2/oauth/token/";
          const response = await fetch(tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: provider.clientId || process.env.TIKTOK_CLIENT_ID || "",
              client_secret: provider.clientSecret || process.env.TIKTOK_CLIENT_SECRET || "",
              code: params.code || "",
              grant_type: "authorization_code",
              redirect_uri: `${BASE_URL}/api/auth/callback/tiktok`
            })
          });
          const tokens = await response.json();
          return { tokens };
        }
      },
      userinfo: {
        url: "https://open.tiktokapis.com/v2/user/info/",
        async request({ tokens, provider }) {
          const userinfoUrl = "https://open.tiktokapis.com/v2/user/info/";
          const response = await fetch(userinfoUrl, {
            headers: { 
              "Authorization": `Bearer ${tokens.access_token}`,
              "Content-Type": "application/json"
            }
          });
          return await response.json();
        }
      },
      profile(profile) {
        return {
          id: profile.data?.user?.open_id || "tiktok-user",
          name: profile.data?.user?.display_name || "TikTok User",
          image: profile.data?.user?.avatar_url
        };
      }
    }
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      // Cast to extended session type
      const extendedSession = session as ExtendedSession;
      
      if (token.sub) {
        extendedSession.user.id = token.sub;
      }
      
      extendedSession.provider = token.provider as string;
      
      return extendedSession;
    }
  },
  pages: {
    signIn: '/',
    error: '/'
  },
  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST }; 