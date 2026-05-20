import { http, createConfig } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

// Fallback public or placeholder Project ID for WalletConnect support
const projectId = 'b2a75d506abaf9a64e4604fb7b7c2957'

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [
    injected(),
    metaMask(),
    safe(),
    walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
})
