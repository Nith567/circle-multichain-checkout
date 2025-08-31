"use client";
import { useState } from "react";
import { createPublicClient, http, encodeFunctionData, TransactionExecutionError, parseUnits, } from "viem";
import axios from "axios";
import { sepolia, avalancheFuji, baseSepolia, arbitrumSepolia, worldchainSepolia, sonicBlazeTestnet, lineaSepolia, unichainSepolia } from "viem/chains";
import { useWalletClient, usePublicClient, useSwitchChain } from 'wagmi';
import { CHAIN_IDS, CHAIN_IDS_TO_USDC_ADDRESSES, CHAIN_IDS_TO_TOKEN_MESSENGER, CHAIN_IDS_TO_MESSAGE_TRANSMITTER, DESTINATION_DOMAINS, CHAIN_EXPLORERS } from "../lib/chains";
const chains = {
    [CHAIN_IDS.ETH_SEPOLIA]: sepolia,
    [CHAIN_IDS.AVAX_FUJI]: avalancheFuji,
    [CHAIN_IDS.BASE_SEPOLIA]: baseSepolia,
    [CHAIN_IDS.SONIC_BLAZE]: sonicBlazeTestnet,
    [CHAIN_IDS.LINEA_SEPOLIA]: lineaSepolia,
    [CHAIN_IDS.ARBITRUM_SEPOLIA]: arbitrumSepolia,
    [CHAIN_IDS.WORLDCHAIN_SEPOLIA]: worldchainSepolia,
    [CHAIN_IDS.UNICHAIN_SEPOLIA]: unichainSepolia
};
export function useCrossChainTransfer() {
    const { data: walletClient } = useWalletClient();
    const publicClient = usePublicClient();
    const { switchChain } = useSwitchChain();
    const [currentStep, setCurrentStep] = useState("idle");
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState(null);
    const [completedTx, setCompletedTx] = useState(null);
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
    const addLog = (message, isImportant = false) => {
        // Only add important logs for user-facing messages
        if (isImportant) {
            setLogs((prev) => [...prev, message]);
        }
    };
    const getPublicClient = (chainId) => {
        return createPublicClient({
            chain: chains[chainId],
            transport: http(),
        });
    };
    const checkAndApproveUSDC = async (client, sourceChainId, amount) => {
        const publicClient = getPublicClient(sourceChainId);
        const tokenMessenger = CHAIN_IDS_TO_TOKEN_MESSENGER[sourceChainId];
        const usdcAddress = CHAIN_IDS_TO_USDC_ADDRESSES[sourceChainId];
        // Check current allowance
        try {
            const allowance = await publicClient.readContract({
                address: usdcAddress,
                abi: [
                    {
                        type: "function",
                        name: "allowance",
                        stateMutability: "view",
                        inputs: [
                            { name: "owner", type: "address" },
                            { name: "spender", type: "address" },
                        ],
                        outputs: [{ name: "", type: "uint256" }],
                    },
                ],
                functionName: "allowance",
                args: [client.account.address, tokenMessenger],
            });
            // If allowance is sufficient, skip approval
            if (allowance >= amount) {
                addLog("Sufficient allowance found, skipping approval", false);
                return null; // No transaction needed
            }
            // Need to approve
            setInternalStep("approving");
            const tx = await client.sendTransaction({
                to: usdcAddress,
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
                    args: [tokenMessenger, amount * 2n], // Approve 2x amount for future transactions
                }),
            });
            return tx;
        }
        catch (err) {
            setError("Payment failed - please try again");
            throw err;
        }
    };
    const burnUSDC = async (client, sourceChainId, amount, destinationChainId, destinationAddress, transferType) => {
        setInternalStep("burning");
        // No user-facing logs for burning step
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
            setError("Payment failed - please try again");
            throw err;
        }
    };
    const retrieveAttestation = async (transactionHash, sourceChainId) => {
        setInternalStep("waiting-attestation");
        // No user-facing logs during attestation wait
        const url = `https://iris-api-sandbox.circle.com/v2/messages/${DESTINATION_DOMAINS[sourceChainId]}?transactionHash=${transactionHash}`;
        while (true) {
            try {
                const response = await axios.get(url);
                if (response.data?.messages?.[0]?.status === "complete") {
                    return response.data.messages[0];
                }
                await new Promise((resolve) => setTimeout(resolve, 5000));
            }
            catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                    continue;
                }
                setError("Payment failed - please try again");
                throw error;
            }
        }
    };
    const mintUSDC = async (client, destinationChainId, attestation) => {
        const MAX_RETRIES = 3;
        let retries = 0;
        setInternalStep("minting");
        // No user-facing logs during minting
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
                // Set completion data with explorer link
                setCompletedTx({ hash: tx, chainId: destinationChainId });
                addLog(`Payment completed successfully! View transaction: ${CHAIN_EXPLORERS[destinationChainId]}${tx}`, true);
                setInternalStep("completed");
                break;
            }
            catch (err) {
                if (err instanceof TransactionExecutionError && retries < MAX_RETRIES) {
                    retries++;
                    // No retry logs for users
                    await new Promise((resolve) => setTimeout(resolve, 2000 * retries));
                    continue;
                }
                const errorMessage = err instanceof Error ? err.message : String(err);
                setError("Payment failed - please try again");
                throw err;
            }
        }
    };
    const executeMerchantPayment = async (sourceChainId, merchantAddress, preferredChainId, amount) => {
        if (!walletClient)
            throw new Error('Wallet not connected');
        try {
            const numericAmount = parseUnits(amount, DEFAULT_DECIMALS);
            // Check allowance and approve if needed
            const approveTx = await checkAndApproveUSDC(walletClient, sourceChainId, numericAmount);
            const burnTx = await burnUSDC(walletClient, sourceChainId, numericAmount, preferredChainId, merchantAddress, "fast");
            const attestation = await retrieveAttestation(burnTx, sourceChainId);
            const mintTx = await mintUSDC(walletClient, preferredChainId, attestation);
            return { burnTx, mintTx, attestation, sourceChain: sourceChainId, destinationChain: preferredChainId, approveTx };
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
        setCompletedTx(null);
    };
    const getExplorerLink = (hash, chainId) => {
        return `${CHAIN_EXPLORERS[chainId]}${hash}`;
    };
    return {
        currentStep,
        logs,
        error,
        completedTx,
        getExplorerLink,
        executeMerchantPayment,
        reset,
    };
}
