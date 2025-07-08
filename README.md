# Circle Multichain Checkout

**Built by [Nithin Reddy](http://github.com/Nith567)**


A merchant-focused npm package for seamless cross-chain USDC payments using Circle's CCTP V2 protocol. Accept USDC payments from any supported EVM chain and receive them on your preferred destination chain.

## Features

- **Cross-Chain USDC Transfers**: Accept payments from any supported EVM chain
- **CCTP V2 Integration**: Powered by Circle's Cross-Chain Transfer Protocol
- **Merchant-Friendly**: Simple integration with single line
- **Multi-Chain Support**: Currently supports Ethereum Sepolia, Avalanche Fuji, Base Sepolia, and more
- **Coming Soon**: Solana mainnet and Devnet support for complete cross-chain across all Major Chains

## Supported Chains

### Current (EVM)
- Ethereum Sepolia
- Avalanche Fuji C-Chain  
- Base Sepolia

### Coming Soon
- Solana (Mainnet & Devnet)

## Installation

```bash
npm install circle-multichain-checkout
# or
yarn add circle-multichain-checkout
```

## Quick Start

```tsx
import { CheckoutPage } from 'circle-multichain-checkout';

  <CheckoutPage
      merchantAddress="0xcfb31219238fe98eff27BBae2a00cEEaf0bE8BE5"
      preferredChain={84532}
      amount="99.99"
      onSuccess={(txHash) => console.log('Payment successful:', txHash)}//handle successful payment
      onError={(error) => console.error('Payment failed:', error)}//handle custom error
    />
```

## Upcoming Version(From EvmChains to onlySolana)

```tsx
import { CheckoutPage } from 'circle-multichain-checkout';

function MyMerchantApp() {
  return (
    <CheckoutPage merchantAddress="AGPUNVimcG2Vybik5vnBSfHEsci9LmiL9Sbwf1rri3Y9"
      preferredChain={solanaDevnet}//or Solana Mainnet 
      amount="30"//usdc amount
      onSuccess={(txHash) => {
        console.log('Payment successful:', txHash);
        // Handle successful payment
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
        // Handle payment failure
      }}
    />
  );
}
```

## How It Works

1. **Customer selects source chain** (where they have USDC)
2. **System burns USDC** on source chain using CCTP V2
3. **Circle provides attestation** for the cross-chain transfer
4. **USDC is minted** on your preferred destination chain
5. **You receive USDC** on your specified address



### Upcoming and present  Working Chains

```typescript
const CHAIN = {
    SOLANA,
    SOLANA DEVNET,
  ETH_SEPOLIA: 11155111,
  AVAX_FUJI: 43113,
  BASE_SEPOLIA: 84532,
  SONIC_BLAZE: 161,
  LINEA_SEPOLIA: 59144,
  ARBITRUM_SEPOLIA: 421614,
  WORLDCHAIN_SEPOLIA: 1666700000,
} as const;
```

## Use Cases

- **E-commerce**: Accept USDC payments from any chain
- **SaaS Subscriptions**: Cross-chain recurring payments
- **NFT Marketplaces**: Multi-chain payment support
- **DeFi Protocols**: Cross-chain liquidity provision
- **Gaming**: In-game purchases with any chain's USDC



**Built by [Nithin Reddy](http://github.com/Nith567)**