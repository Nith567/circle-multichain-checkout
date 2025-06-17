"use client";
import { useState } from "react";
import { createPublicClient, http, encodeFunctionData, parseUnits, } from "viem";
import axios from "axios";
import { sepolia, avalancheFuji, baseSepolia } from "viem/chains";
import { useWalletClient, usePublicClient } from 'wagmi';
// Define chain IDs directly
const CHAIN_IDS = {
    ETH_SEPOLIA: 11155111,
    AVAX_FUJI: 43113,
    BASE_SEPOLIA: 84532,
};
const CHAIN_IDS_TO_USDC_ADDRESSES = {
    [CHAIN_IDS.ETH_SEPOLIA]: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238",
    [CHAIN_IDS.AVAX_FUJI]: "0x5425890298aed601595a70AB815c96711a31Bc65",
    [CHAIN_IDS.BASE_SEPOLIA]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};
const CHAIN_IDS_TO_TOKEN_MESSENGER = {
    [CHAIN_IDS.ETH_SEPOLIA]: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
    [CHAIN_IDS.AVAX_FUJI]: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
    [CHAIN_IDS.BASE_SEPOLIA]: "0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa",
};
const CHAIN_IDS_TO_MESSAGE_TRANSMITTER = {
    [CHAIN_IDS.ETH_SEPOLIA]: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
    [CHAIN_IDS.AVAX_FUJI]: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
    [CHAIN_IDS.BASE_SEPOLIA]: "0xe737e5cebeeba77efe34d4aa090756590b1ce275",
};
const DESTINATION_DOMAINS = {
    [CHAIN_IDS.ETH_SEPOLIA]: 0,
    [CHAIN_IDS.AVAX_FUJI]: 1,
    [CHAIN_IDS.BASE_SEPOLIA]: 6,
};
const chains = {
    [CHAIN_IDS.ETH_SEPOLIA]: sepolia,
    [CHAIN_IDS.AVAX_FUJI]: avalancheFuji,
    [CHAIN_IDS.BASE_SEPOLIA]: baseSepolia,
};
export function useCrossChainTransfer() {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const [currentStep, setCurrentStep] = useState("idle");
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);
    const DEFAULT_DECIMALS = 6;
    const addLog = (message) => setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
    const getPublicClient = (chainId) => {
        return createPublicClient({
            chain: chains[chainId],
            transport: http(),
        });
    };
    const approveUSDC = async (client, sourceChainId) => {
        setCurrentStep("approving");
        addLog("Approving USDC transfer...");
        try {
            const tx = await client.sendTransaction({
                to: CHAIN_IDS_TO_USDC_ADDRESSES[sourceChainId],
                data: encodeFunctionData({
                    abi: [
                        {
                            type: "function",
                            name: "approve",
                            stateMutability: "nonpayable",
                            inputs: [
                                { name: "spender", type: "address" },
                                { name: "amount", type: "uint256" },
                            ],
                            outputs: [{ name: "", type: "bool" }],
                        },
                    ],
                    functionName: "approve",
                    args: [CHAIN_IDS_TO_TOKEN_MESSENGER[sourceChainId], 10000000000n],
                }),
            });
            addLog(`USDC Approval Tx: ${tx}`);
            return tx;
        }
        catch (err) {
            setError("Approval failed");
            throw err;
        }
    };
    const burnUSDC = async (client, sourceChainId, amount, destinationChainId, destinationAddress, transferType) => {
        setCurrentStep("burning");
        addLog("Burning USDC...");
        try {
            const finalityThreshold = transferType === "fast" ? 1000 : 2000;
            const maxFee = amount - 1n;
            const mintRecipient = `0x${destinationAddress
                .replace(/^0x/, "")
                .padStart(64, "0")}`;
            const tx = await client.sendTransaction({
                to: CHAIN_IDS_TO_TOKEN_MESSENGER[sourceChainId],
                data: encodeFunctionData({
                    abi: [
                        {
                            type: "function",
                            name: "depositForBurn",
                            stateMutability: "nonpayable",
                            inputs: [
                                { name: "amount", type: "uint256" },
                                { name: "destinationDomain", type: "uint32" },
                                { name: "mintRecipient", type: "bytes32" },
                                { name: "burnToken", type: "address" },
                                { name: "hookData", type: "bytes32" },
                                { name: "maxFee", type: "uint256" },
                                { name: "finalityThreshold", type: "uint32" },
                            ],
                            outputs: [],
                        },
                    ],
                    functionName: "depositForBurn",
                    args: [
                        amount,
                        DESTINATION_DOMAINS[destinationChainId],
                        mintRecipient,
                        CHAIN_IDS_TO_USDC_ADDRESSES[sourceChainId],
                        "0x0000000000000000000000000000000000000000000000000000000000000000",
                        maxFee,
                        finalityThreshold,
                    ],
                }),
            });
            addLog(`Burn Tx: ${tx}`);
            return tx;
        }
        catch (err) {
            setError("Burn failed");
            throw err;
        }
    };
    const retrieveAttestation = async (transactionHash, sourceChainId) => {
        setCurrentStep("waiting-attestation");
        addLog("Retrieving attestation...");
        const url = `https://iris-api-sandbox.circle.com/v2/messages/${DESTINATION_DOMAINS[sourceChainId]}?transactionHash=${transactionHash}`;
        while (true) {
            try {
                const response = await axios.get(url);
                if (response.data?.messages?.[0]?.status === "complete") {
                    addLog("Attestation retrieved!");
                    return response.data.messages[0];
                }
                addLog("Waiting for attestation...");
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
            catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    continue;
                }
                setError("Attestation retrieval failed");
                throw error;
            }
        }
    };
    const executeMerchantPayment = async (sourceChainId, merchantAddress, preferredChainId, amount) => {
        if (!walletClient)
            throw new Error('Wallet not connected');
        try {
            const numericAmount = parseUnits(amount, DEFAULT_DECIMALS);
            // Use walletClient for transactions
            await approveUSDC(walletClient, sourceChainId);
            const burnTx = await burnUSDC(walletClient, sourceChainId, numericAmount, preferredChainId, merchantAddress, "fast");
            // Use publicClient for reading chain data
            const attestation = await retrieveAttestation(burnTx, sourceChainId);
            return { burnTx, attestation, sourceChain: sourceChainId, destinationChain: preferredChainId };
        }
        catch (error) {
            setCurrentStep("error");
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            addLog(`Error: ${errorMessage}`);
            throw error;
        }
    };
    const reset = () => {
        setCurrentStep("idle");
        setLogs([]);
        setError(null);
    };
    return {
        currentStep,
        logs,
        error,
        executeMerchantPayment,
        reset,
    };
}
