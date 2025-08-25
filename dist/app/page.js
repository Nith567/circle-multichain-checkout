"use client";
import { jsx as _jsx } from "react/jsx-runtime";
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
    return (_jsx(WagmiProvider, { config: config, children: _jsx(RainbowKitProvider, { children: _jsx("main", { className: "flex min-h-screen flex-col items-center justify-between p-24" }) }) }));
}
