import React from 'react';
import { redis } from '@/app/lib/redis';

export default async function PassportPage() {
  // Get the screen name from the URL
  const screenName = 'sharafi_eth'; // TODO: Get this from URL params or context

  // Fetch Twitter data from Redis
  const twitterDataStr = await redis.get<string>(`twitter:user:${screenName}`);
  
  if (!twitterDataStr) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: "20px", background: "#f0f0f0", minHeight: "100vh" }}>
        <div style={{
          border: "5px solid #1DA1F2",
          borderRadius: "10px",
          padding: "20px",
          maxWidth: "400px",
          background: "#fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h2>No Twitter data found</h2>
          <p>Please connect your Twitter account first.</p>
        </div>
      </div>
    );
  }

  const twitterData = JSON.parse(twitterDataStr);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: "20px", background: "#f0f0f0", minHeight: "100vh" }}>
      <div style={{
          border: "5px solid #1DA1F2",
          borderRadius: "10px",
          padding: "20px",
          maxWidth: "400px",
          background: "#fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
        <img 
          src={twitterData.profile_image_url} 
          alt="Passport Photo" 
          style={{ borderRadius: "50%", width: "100px", height: "100px" }} 
        />
        <h2 style={{ margin: "10px 0 5px" }}>{twitterData.name}</h2>
        <h3 style={{ margin: "0 0 10px", color: "#555" }}>@{twitterData.screen_name}</h3>
        <p style={{ fontStyle: "italic" }}>{twitterData.description}</p>
        <p style={{ margin: "10px 0", fontWeight: "bold" }}>Followers: {twitterData.followers_count}</p>
      </div>
    </div>
  );
} 