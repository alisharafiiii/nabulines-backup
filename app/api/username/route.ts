import { NextResponse } from 'next/server'
import { redis } from '@/app/lib/redis'

export async function POST(request: Request) {
  try {
    const { address, username } = await request.json()

    if (!address || !username) {
      return NextResponse.json(
        { error: "Address and username are required" },
        { status: 400 }
      )
    }

    // Check if username is already taken
    const existingAddress = await redis.get(`username:${username}`)
    if (existingAddress && existingAddress !== address) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 }
      )
    }

    // Store both mappings for two-way lookup
    await redis.set(`address:${address}`, username)
    await redis.set(`username:${username}`, address)

    return NextResponse.json({ username })
  } catch (error) {
    console.error('Error in username POST:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

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

    const username = await redis.get(`address:${address}`)
    return NextResponse.json({ username })
  } catch (error) {
    console.error('Error in username GET:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 