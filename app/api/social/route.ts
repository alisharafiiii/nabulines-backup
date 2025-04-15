import { NextResponse } from 'next/server'
import { SocialData } from '@/app/types'
import { redis } from '@/app/lib/redis'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { address, username, platform, handle, followers } = body

    console.log('Received social data:', { address, username, platform, handle, followers })

    if (!address || !username || !platform || !handle || followers === undefined) {
      console.error('Missing fields:', { address, username, platform, handle, followers })
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate followers is a number
    const followerCount = parseInt(followers.toString())
    if (isNaN(followerCount)) {
      console.error('Invalid followers count:', followers)
      return NextResponse.json(
        { error: "Followers must be a number" },
        { status: 400 }
      )
    }

    try {
      // First, verify this is the correct user by checking the wallet->username mapping
      const storedUsername = await redis.get(`address:${address}`)
      console.log('Stored username:', storedUsername, 'Provided username:', username)
      
      if (storedUsername !== username) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      // Get existing social data for this username
      const existingSocialData = await redis.get<SocialData[]>(`social:${username}`) || []
      console.log('Existing social data:', existingSocialData)

      // Check if this platform already exists for this user
      const platformExists = existingSocialData.some(data => data.platform === platform)
      
      let updatedSocialData: SocialData[]
      if (platformExists) {
        // Update existing platform data
        updatedSocialData = existingSocialData.map(data => 
          data.platform === platform 
            ? { 
                platform,
                handle,
                followers: followerCount,
                timestamp: Date.now()
              }
            : data
        )
      } else {
        // Add new platform data
        updatedSocialData = [
          ...existingSocialData,
          {
            platform,
            handle,
            followers: followerCount,
            timestamp: Date.now()
          }
        ]
      }

      // Save the updated data
      await redis.set(`social:${username}`, updatedSocialData)
      console.log('Saved social data:', updatedSocialData)

      return NextResponse.json({ data: updatedSocialData })
    } catch (redisError) {
      console.error('Redis operation failed:', redisError)
      return NextResponse.json(
        { error: "Database operation failed" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in social POST:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// New endpoint for fetching sorted data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: "Address is required" },
        { status: 400 }
      )
    }

    // Get username for this address
    const username = await redis.get(`address:${address}`)
    if (!username) {
      return NextResponse.json([])
    }

    // Get social data for this username
    const socialData = await redis.get<SocialData[]>(`social:${username}`)
    return NextResponse.json(socialData || [])
  } catch (error) {
    console.error('Error in social GET:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 