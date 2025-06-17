"use client";
import { jsx as _jsx } from "react/jsx-runtime";
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
    return (_jsx(WagmiProvider, { config: config, children: _jsx(RainbowKitProvider, { children: _jsx("main", { className: "flex min-h-screen flex-col items-center justify-between p-24", children: _jsx(CheckoutPage, { merchantAddress: "0xcfb31219238fe98eff27BBae2a00cEEaf0bE8BE5", preferredChain: 84532, amount: "99.99", onSuccess: (txHash) => console.log("Payment successful:", txHash), onError: (error) => console.error("Payment failed:", error) }) }) }) }));
}
