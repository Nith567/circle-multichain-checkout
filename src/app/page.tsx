"use client";
import React from "react";
import { CheckoutPage } from "@/components/CheckoutPage";
import { WagmiProvider, createConfig } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { http } from "viem";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export default function Home() {
  return (
    <WagmiProvider config={config}>
      <RainbowKitProvider>
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
          
        </main>
      </RainbowKitProvider>
    </WagmiProvider>
  );
}