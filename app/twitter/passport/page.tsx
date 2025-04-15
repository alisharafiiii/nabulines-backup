import React from 'react';
import { redis } from '@/app/lib/redis';

export default async function PassportPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Get the screen name from URL parameters
  const screenName = searchParams.screen_name as string;
  
  if (!screenName) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: "20px", 
        background: "#f0f0f0", 
        minHeight: "100vh",
        fontFamily: "'Press Start 2P', cursive"
      }}>
        <div style={{
          border: "5px solid #1DA1F2",
          borderRadius: "10px",
          padding: "20px",
          maxWidth: "400px",
          background: "#fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          textAlign: "center",
          imageRendering: "pixelated"
        }}>
          <h2 style={{ fontSize: "16px", marginBottom: "20px" }}>NO SCREEN NAME</h2>
          <p style={{ fontSize: "12px" }}>Please provide a Twitter screen name.</p>
        </div>
      </div>
    );
  }

  // Fetch Twitter data from Redis
  const twitterDataStr = await redis.get<string>(`twitter:verified:${screenName}`);
  
  if (!twitterDataStr) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: "20px", 
        background: "#f0f0f0", 
        minHeight: "100vh",
        fontFamily: "'Press Start 2P', cursive"
      }}>
        <div style={{
          border: "5px solid #1DA1F2",
          borderRadius: "10px",
          padding: "20px",
          maxWidth: "400px",
          background: "#fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          textAlign: "center",
          imageRendering: "pixelated"
        }}>
          <h2 style={{ fontSize: "16px", marginBottom: "20px" }}>NO PASSPORT FOUND</h2>
          <p style={{ fontSize: "12px" }}>Please connect your Twitter account first.</p>
        </div>
      </div>
    );
  }

  const twitterData = JSON.parse(twitterDataStr);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      padding: "20px", 
      background: "#f0f0f0", 
      minHeight: "100vh",
      fontFamily: "'Press Start 2P', cursive"
    }}>
      <div style={{
        border: "5px solid #1DA1F2",
        borderRadius: "10px",
        padding: "20px",
        maxWidth: "400px",
        background: "#fff",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        textAlign: "center",
        imageRendering: "pixelated"
      }}>
        {/* Passport Header */}
        <div style={{ 
          borderBottom: "2px solid #1DA1F2", 
          marginBottom: "20px",
          paddingBottom: "10px"
        }}>
          <h1 style={{ fontSize: "20px", color: "#1DA1F2" }}>X PASSPORT</h1>
          <p style={{ fontSize: "12px" }}>VERIFIED CITIZEN</p>
        </div>

        {/* Profile Section */}
        <div style={{ marginBottom: "20px" }}>
          <img 
            src={twitterData.profile_image_url_https} 
            alt="Passport Photo" 
            style={{ 
              borderRadius: "50%", 
              width: "100px", 
              height: "100px",
              imageRendering: "pixelated",
              border: "3px solid #1DA1F2"
            }} 
          />
          <h2 style={{ fontSize: "16px", margin: "10px 0 5px" }}>{twitterData.name}</h2>
          <h3 style={{ fontSize: "12px", margin: "0 0 10px", color: "#555" }}>@{twitterData.screen_name}</h3>
        </div>

        {/* Stats Section */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
          marginBottom: "20px"
        }}>
          <div style={{ 
            border: "2px solid #1DA1F2",
            padding: "10px",
            borderRadius: "5px"
          }}>
            <p style={{ fontSize: "12px" }}>FOLLOWERS</p>
            <p style={{ fontSize: "16px", color: "#1DA1F2" }}>{twitterData.followers_count}</p>
          </div>
          <div style={{ 
            border: "2px solid #1DA1F2",
            padding: "10px",
            borderRadius: "5px"
          }}>
            <p style={{ fontSize: "12px" }}>FOLLOWING</p>
            <p style={{ fontSize: "16px", color: "#1DA1F2" }}>{twitterData.friends_count}</p>
          </div>
        </div>

        {/* Bio Section */}
        <div style={{ 
          border: "2px solid #1DA1F2",
          padding: "10px",
          borderRadius: "5px",
          marginBottom: "20px"
        }}>
          <p style={{ fontSize: "12px", marginBottom: "5px" }}>BIO</p>
          <p style={{ fontSize: "10px", lineHeight: "1.4" }}>{twitterData.description}</p>
        </div>

        {/* Verification Section */}
        <div style={{ 
          border: "2px solid #1DA1F2",
          padding: "10px",
          borderRadius: "5px"
        }}>
          <p style={{ fontSize: "12px" }}>VERIFIED ON</p>
          <p style={{ fontSize: "10px" }}>{new Date(twitterData.verified_at).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
} 