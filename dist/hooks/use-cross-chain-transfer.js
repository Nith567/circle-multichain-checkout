"use client";
import { useState } from "react";
import { createPublicClient, http, encodeFunctionData, TransactionExecutionError, parseUnits, } from "viem";
import axios from "axios";
import { sepolia, avalancheFuji, baseSepolia, arbitrumSepolia, worldchainSepolia, sonicBlazeTestnet, lineaSepolia } from "viem/chains";
import { useWalletClient, usePublicClient, useSwitchChain } from 'wagmi';
import { CHAIN_IDS, CHAIN_IDS_TO_USDC_ADDRESSES, CHAIN_IDS_TO_TOKEN_MESSENGER, CHAIN_IDS_TO_MESSAGE_TRANSMITTER, DESTINATION_DOMAINS } from "@/lib/chains";
const chains = {
    [CHAIN_IDS.ETH_SEPOLIA]: sepolia,
    [CHAIN_IDS.AVAX_FUJI]: avalancheFuji,
    [CHAIN_IDS.BASE_SEPOLIA]: baseSepolia,
    [CHAIN_IDS.SONIC_BLAZE]: sonicBlazeTestnet,
    [CHAIN_IDS.LINEA_SEPOLIA]: lineaSepolia,
    [CHAIN_IDS.ARBITRUM_SEPOLIA]: arbitrumSepolia,
    [CHAIN_IDS.WORLDCHAIN_SEPOLIA]: worldchainSepolia,
};
export function useCrossChainTransfer() {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { switchChain } = useSwitchChain();
    const [currentStep, setCurrentStep] = useState("idle");
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);
    const DEFAULT_DECIMALS = 6;
    // Map internal steps to user-friendly steps
    const mapToUserStep = (internalStep) => {
        switch (internalStep) {
            case "idle":
                return "idle";
            case "approving":
            case "burning":
                return "processing";
            case "waiting-attestation":
            case "minting":
                return "confirming";
            case "completed":
                return "completed";
            case "error":
                return "error";
            default:
                return "processing";
        }
    };
    const setInternalStep = (step) => {
        setCurrentStep(mapToUserStep(step));
    };
    const addLog = (message) => setLogs((prev) => [
        ...prev,
        message,
    ]);
    const getPublicClient = (chainId) => {
        return createPublicClient({
            chain: chains[chainId],
            transport: http(),
        });
    };
    const approveUSDC = async (client, sourceChainId) => {
        setInternalStep("approving");
        addLog("Preparing your payment...");
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
            addLog(`Payment preparation complete: ${tx}`);
            return tx;
        }
        catch (err) {
            setError("Payment preparation failed");
            throw err;
        }
    };
    const burnUSDC = async (client, sourceChainId, amount, destinationChainId, destinationAddress, transferType) => {
        setInternalStep("burning");
        addLog("Processing your cross-chain payment...");
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
            addLog(`Payment initiated: ${tx}`);
            return tx;
        }
        catch (err) {
            setError("Payment processing failed");
            throw err;
        }
    };
    const retrieveAttestation = async (transactionHash, sourceChainId) => {
        setInternalStep("waiting-attestation");
        addLog("Confirming your payment...");
        const url = `https://iris-api-sandbox.circle.com/v2/messages/${DESTINATION_DOMAINS[sourceChainId]}?transactionHash=${transactionHash}`;
        while (true) {
            try {
                const response = await axios.get(url);
                if (response.data?.messages?.[0]?.status === "complete") {
                    addLog("Payment confirmed!");
                    return response.data.messages[0];
                }
                addLog("Confirming payment on destination chain...");
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
            catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    continue;
                }
                setError("Payment confirmation failed");
                throw error;
            }
        }
    };
    const mintUSDC = async (client, destinationChainId, attestation) => {
        const MAX_RETRIES = 3;
        let retries = 0;
        setInternalStep("minting");
        addLog("Finalizing your payment...");
        while (retries < MAX_RETRIES) {
            try {
                const publicClient = await getPublicClient(destinationChainId);
                const feeData = await publicClient.estimateFeesPerGas();
                const contractConfig = {
                    address: CHAIN_IDS_TO_MESSAGE_TRANSMITTER[destinationChainId],
                    abi: [
                        {
                            type: "function",
                            name: "receiveMessage",
                            stateMutability: "nonpayable",
                            inputs: [
                                { name: "message", type: "bytes" },
                                { name: "attestation", type: "bytes" },
                            ],
                            outputs: [],
                        },
                    ],
                };
                // Estimate gas with buffer
                const gasEstimate = await publicClient.estimateContractGas({
                    ...contractConfig,
                    functionName: "receiveMessage",
                    args: [attestation.message, attestation.attestation],
                    account: client.account,
                });
                // Add 20% buffer to gas estimate
                const gasWithBuffer = (gasEstimate * 120n) / 100n;
                await switchChain({ chainId: destinationChainId });
                addLog(`Switching to chain: ${destinationChainId}`);
                const tx = await client.sendTransaction({
                    to: contractConfig.address,
                    data: encodeFunctionData({
                        ...contractConfig,
                        functionName: "receiveMessage",
                        args: [attestation.message, attestation.attestation],
                    }),
                    gas: gasWithBuffer,
                    maxFeePerGas: feeData.maxFeePerGas,
                    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
                });
                addLog(`Payment completed successfully: ${tx}`);
                setInternalStep("completed");
                break;
            }
            catch (err) {
                if (err instanceof TransactionExecutionError && retries < MAX_RETRIES) {
                    retries++;
                    addLog(`Retry err: ${err} ${retries}/${MAX_RETRIES}...`);
                    await new Promise((resolve) => setTimeout(resolve, 2000 * retries));
                    continue;
                }
                const errorMessage = err instanceof Error ? err.message : String(err);
                addLog(`Payment error: ${errorMessage}`);
                setError(errorMessage);
                throw err;
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
            const attestation = await retrieveAttestation(burnTx, sourceChainId);
            const mintTx = await mintUSDC(walletClient, preferredChainId, attestation);
            return { burnTx, mintTx, attestation, sourceChain: sourceChainId, destinationChain: preferredChainId };
        }
        catch (error) {
            setInternalStep("error");
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
