# DeFi and Decentralized Exchange (DEX)

This project implements a decentralized exchange (DEX) using an Automated Market Maker (AMM) model based on the constant product formula.

**Testnet:** Sepolia  
**Date:** April 2026

## Deployed Contracts and Addresses

## 🔍 Etherscan (Sepolia)
Verified contract source code and interaction interfaces.

* **TokenA:** `0x4e2FC1DAbF303B1051FB45eE676f2854b03E2a1F`
    * [View on Etherscan](https://sepolia.etherscan.io/address/0x4e2FC1DAbF303B1051FB45eE676f2854b03E2a1F#code)
* **TokenB:** `0x1faA21bDfA7EcB554438c564eb4a4DD0Bbceb405`
    * [View on Etherscan](https://sepolia.etherscan.io/address/0x1faA21bDfA7EcB554438c564eb4a4DD0Bbceb405#code)
* **DEX 1:** `0xcA03dCFfa1DA5CcE60713a8c410882CCA01d935A`
    * [View on Etherscan](https://sepolia.etherscan.io/address/0xcA03dCFfa1DA5CcE60713a8c410882CCA01d935A#code)
* **DEX 2:** `0x6fcE2ade5fFB1CA0B2094e58dED18a6A4Cf95823`
    * [View on Etherscan](https://sepolia.etherscan.io/address/0x6fcE2ade5fFB1CA0B2094e58dED18a6A4Cf95823#code)
* **LP Token 1:** `0xC5A0c38E75926d6a81fC3eb817Cf3E5bb6D5aaf3`
    * [View on Etherscan](https://sepolia.etherscan.io/address/0xC5A0c38E75926d6a81fC3eb817Cf3E5bb6D5aaf3#code)
* **LP Token 2:** `0x872dCef941266F93f67464149564cB68cfD6f961`
    * [View on Etherscan](https://sepolia.etherscan.io/address/0x872dCef941266F93f67464149564cB68cfD6f961#code)
* **Arbitrage:** `0x450cDf54178756E577EEacD8930490cb051207A9`
    * [View on Etherscan](https://sepolia.etherscan.io/address/0x450cDf54178756E577EEacD8930490cb051207A9#code)

---

## 💎 Sourcify
Decentralized automated contract verifying service.

* **TokenA:** `0x4e2FC1DAbF303B1051FB45eE676f2854b03E2a1F`
    * [View on Sourcify](https://sourcify.dev/server/repo-ui/11155111/0x4e2FC1DAbF303B1051FB45eE676f2854b03E2a1F)
* **TokenB:** `0x1faA21bDfA7EcB554438c564eb4a4DD0Bbceb405`
    * [View on Sourcify](https://sourcify.dev/server/repo-ui/11155111/0x1faA21bDfA7EcB554438c564eb4a4DD0Bbceb405)
* **DEX 1:** `0xcA03dCFfa1DA5CcE60713a8c410882CCA01d935A`
    * [View on Sourcify](https://sourcify.dev/server/repo-ui/11155111/0xcA03dCFfa1DA5CcE60713a8c410882CCA01d935A)
* **DEX 2:** `0x6fcE2ade5fFB1CA0B2094e58dED18a6A4Cf95823`
    * [View on Sourcify](https://sourcify.dev/server/repo-ui/11155111/0x6fcE2ade5fFB1CA0B2094e58dED18a6A4Cf95823)
* **LP Token 1:** `0xC5A0c38E75926d6a81fC3eb817Cf3E5bb6D5aaf3`
    * [View on Sourcify](https://sourcify.dev/server/repo-ui/11155111/0xC5A0c38E75926d6a81fC3eb817Cf3E5bb6D5aaf3)
* **LP Token 2:** `0x872dCef941266F93f67464149564cB68cfD6f961`
    * [View on Sourcify](https://sourcify.dev/server/repo-ui/11155111/0x872dCef941266F93f67464149564cB68cfD6f961)
* **Arbitrage:** `0x450cDf54178756E577EEacD8930490cb051207A9`
    * [View on Sourcify](https://sourcify.dev/server/repo-ui/11155111/0x450cDf54178756E577EEacD8930490cb051207A9)

## Live User Interface
**https://aryan-dex-ui.vercel.app/**

## Features Implemented
- ERC20 TokenA & TokenB with mint functionality
- Constant Product AMM (`x × y = k`) with 0.3% swap fee
- Liquidity addition/removal with strict ratio enforcement
- LP Token minting and burning restricted to DEX only
- Token swaps (A ↔ B) with dynamic pricing
- Arbitrage contract between two DEX instances
- Clean UI with wallet connection, minting, liquidity, and swapping

## Simulation Results
- 75 random transactions generated (5 Liquidity Providers + 8 Traders)
- Key metrics tracked: TVL, Spot Price, Slippage, Reserve Ratio, Swap Volume, Fee Accumulation
- Results saved in `simulation.csv`
- Charts generated showing price dynamics and slippage behavior

## Theory Questions
For the theoretical questions exploredee `theory.pdf` in the repository.

## Video Demonstration
[Demo Video](https://youtu.be/YOUR_VIDEO_LINK_HERE)

## How to Interact
1. Visit the Live UI and connect MetaMask (Sepolia network)
2. Click "Mint Tokens" to get test tokens
3. Add liquidity (TokenA and TokenB must maintain current pool ratio)
4. Perform token swaps
5. Switch between DEX1 and DEX2 to observe different ratios

## Deployment
Local Deployment 
npx hardhat run scripts/deploy.ts

Sepolia Deployment
npx hardhat run scripts/deploy.ts --network sepolia

##

**Note**: All contracts are deployed and verified on Sepolia testnet.

---