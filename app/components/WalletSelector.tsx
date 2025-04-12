import { useConnect } from 'wagmi'
import { Press_Start_2P } from 'next/font/google'
import Image from 'next/image'
import WalletInfo from './WalletInfo'

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"] })

export default function WalletSelector() {
  const { connectors, connect, error, status } = useConnect()

  const handleConnect = async (walletType: string) => {
    console.log('Connecting to:', walletType)
    console.log('Available connectors:', connectors.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      ready: c.ready
    })))

    let connector
    if (walletType === 'coinbase') {
      connector = connectors.find(c => c.type === 'coinbaseWallet')
    } else if (walletType === 'phantom') {
      connector = connectors.find(c => c.id === 'phantom')
    }
    
    console.log('Found connector:', connector)
    
    if (!connector) {
      console.error(`${walletType} connector not found`)
      return
    }

    try {
      console.log('Attempting to connect...')
      await connect({ connector })
      console.log('Connection successful')
    } catch (err) {
      console.error('Connection error:', err)
    }
  }

  if (status === 'pending') {
    return (
      <div className="flex items-center space-x-2">
        <div className="px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded">
          <span className={`${pressStart.className}`}>Connecting...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <WalletInfo />
      
      <button
        onClick={() => handleConnect('coinbase')}
        className={`px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className} flex items-center justify-center space-x-2`}
      >
        <Image
          src="/coinbase.svg"
          alt="Coinbase Wallet"
          width={24}
          height={24}
          className="w-6 h-6"
        />
        <span>Connect Coinbase Wallet</span>
      </button>

      <button
        onClick={() => handleConnect('phantom')}
        className={`px-4 py-2 bg-black border-2 border-[#00FF00] text-white rounded hover:bg-[#00FF00] hover:text-black transition-colors ${pressStart.className} flex items-center justify-center space-x-2`}
      >
        <Image
          src="/phantom.svg"
          alt="Phantom"
          width={24}
          height={24}
          className="w-6 h-6"
        />
        <span>Connect Phantom</span>
      </button>

      {error && (
        <div className="flex flex-col items-center space-y-2">
          <p className={`text-[#00FF00] ${pressStart.className} text-center`}>
            Connection rejected? No worries!
          </p>
          <p className={`text-white ${pressStart.className} text-center`}>
            Try again to join the onchain revolution
          </p>
        </div>
      )}
    </div>
  )
} 