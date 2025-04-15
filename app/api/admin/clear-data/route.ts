import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

export async function POST() {
  try {
    // Get all keys
    const keys = await redis.keys('*')
    
    // Delete all keys
    if (keys.length > 0) {
      await redis.del(...keys)
    }

    return NextResponse.json({ success: true, message: 'All data cleared successfully' })
  } catch (error) {
    console.error('Error clearing data:', error)
    return NextResponse.json(
      { error: 'Failed to clear data' },
      { status: 500 }
    )
  }
} 