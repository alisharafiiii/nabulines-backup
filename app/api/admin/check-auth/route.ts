import { NextResponse } from 'next/server';

const ADMIN_WALLET = "0x37Ed24e7c7311836FD01702A882937138688c1A9";

export async function GET(request: Request) {
  try {
    // Get wallet address from headers
    const walletAddress = request.headers.get('x-wallet-address');
    
    if (!walletAddress) {
      return NextResponse.json({ 
        authorized: false, 
        message: 'No wallet address provided' 
      }, { status: 400 });
    }
    
    // Check if wallet is authorized
    const isAuthorized = walletAddress.toLowerCase() === ADMIN_WALLET.toLowerCase();
    
    if (isAuthorized) {
      return NextResponse.json({ 
        authorized: true,
        message: 'Wallet is authorized for admin access'
      });
    } else {
      return NextResponse.json({ 
        authorized: false, 
        message: 'Wallet is not authorized for admin access' 
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Error checking auth:', error);
    return NextResponse.json({ 
      authorized: false, 
      message: 'Error checking authorization',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 