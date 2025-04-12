import { createConfig, http } from 'wagmi'
import { mainnet, base } from 'wagmi/chains'
import { coinbaseWallet, injected } from 'wagmi/connectors'

// Create wallet connectors
const connectors = [
  coinbaseWallet({
    appName: 'NABULINES',
    appLogoUrl: '/logo.png',
    headlessMode: false
  }),
  injected({
    target: 'phantom',
  })
]

// Create config
export const config = createConfig({
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
  connectors,
}) 