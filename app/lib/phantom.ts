import { createConnector } from 'wagmi'
import { type Chain } from 'wagmi/chains'
import { type Address } from 'viem'
import { EventEmitter } from 'events'

declare global {
  interface Window {
    phantom?: {
      solana: {
        connect: () => Promise<{ publicKey: { toString: () => string } }>
        disconnect: () => Promise<void>
        isConnected: boolean
      }
    }
  }
}

export const phantomConnector = ({ chains }: { chains?: Chain[] } = {}) =>
  createConnector((config) => ({
    id: 'phantom',
    name: 'Phantom',
    type: 'injected',
    chains: chains || [],
    options: {
      name: 'Phantom',
      shimDisconnect: true,
    },
    emitter: new EventEmitter(),

    async connect() {
      if (!window.phantom?.solana) {
        throw new Error('Phantom not found')
      }

      const provider = window.phantom.solana
      const accounts = await provider.connect()
      const chainId = chains?.[0]?.id

      if (!chainId) {
        throw new Error('No chains configured')
      }

      return {
        accounts: [accounts.publicKey.toString() as Address],
        chainId,
      }
    },

    async disconnect() {
      if (!window.phantom?.solana) {
        throw new Error('Phantom not found')
      }

      await window.phantom.solana.disconnect()
    },

    async getAccounts() {
      if (!window.phantom?.solana) {
        throw new Error('Phantom not found')
      }

      const accounts = await window.phantom.solana.connect()
      return [accounts.publicKey.toString() as Address]
    },

    async getChainId() {
      const chainId = chains?.[0]?.id
      if (!chainId) {
        throw new Error('No chains configured')
      }
      return chainId
    },

    async getProvider() {
      if (!window.phantom?.solana) {
        throw new Error('Phantom not found')
      }
      return window.phantom.solana
    },

    async isAuthorized() {
      if (!window.phantom?.solana) {
        return false
      }
      return window.phantom.solana.isConnected
    },

    onAccountsChanged(accounts: Address[]) {
      config.emitter.emit('change', { accounts })
    },

    onChainChanged(chainId: string) {
      config.emitter.emit('change', { chainId: Number(chainId) })
    },

    onDisconnect() {
      config.emitter.emit('disconnect')
    },
  })) 