import React from 'react';

export default function PassportPage() {
  // sample twitter data for testing (replace with real data later)
  const twitterData = {
    id: "1458855197237821449",
    name: "nabu.base.eth",
    screen_name: "sharafi_eth",
    profile_image_url: "https://pbs.twimg.com/profile_images/1911790623893422080/vxsHVWbL_normal.jpg",
    followers_count: 74456,
    description: "recruiting @Ledger | i do @base & u should too | financial advice: don't ape what i ape"
  };

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