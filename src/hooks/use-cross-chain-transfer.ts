"use client";

import { useState } from "react";
import {
  createPublicClient,
  http,
  encodeFunctionData,
  HttpTransport,
  type Chain,
  type Account,
  type WalletClient,
  type Hex,
  TransactionExecutionError,
  parseUnits,
  formatUnits,
} from "viem";
import axios from "axios";
import { sepolia, avalancheFuji, baseSepolia, arbitrumSepolia, worldchainSepolia, sonicBlazeTestnet, lineaSepolia, unichainSepolia } from "viem/chains";
import { useWalletClient, usePublicClient, useSwitchChain } from 'wagmi'
import { SupportedChainId } from "../lib/constants";
import { 
  CHAIN_IDS, 
  type ChainId, 
  CHAIN_IDS_TO_USDC_ADDRESSES,
  CHAIN_IDS_TO_TOKEN_MESSENGER,
  CHAIN_IDS_TO_MESSAGE_TRANSMITTER,
  DESTINATION_DOMAINS,
  CHAIN_EXPLORERS
} from "../lib/chains";

export type TransferStep =
  | "idle"
  | "processing"
  | "confirming"
  | "completed"
  | "error";

// Internal technical steps mapping for developers/debugging
export type InternalTransferStep =
  | "idle"
  | "approving"
  | "burning"
  | "waiting-attestation"
  | "minting"
  | "completed"
  | "error";

const chains: Record<ChainId, Chain> = {
  [CHAIN_IDS.ETH_SEPOLIA]: sepolia,
  [CHAIN_IDS.AVAX_FUJI]: avalancheFuji,
  [CHAIN_IDS.BASE_SEPOLIA]: baseSepolia,
  [CHAIN_IDS.SONIC_BLAZE]: sonicBlazeTestnet,
  [CHAIN_IDS.LINEA_SEPOLIA]: lineaSepolia,
  [CHAIN_IDS.ARBITRUM_SEPOLIA]: arbitrumSepolia,
  [CHAIN_IDS.WORLDCHAIN_SEPOLIA]: worldchainSepolia,
  [CHAIN_IDS.UNICHAIN_SEPOLIA]:unichainSepolia
};

export function useCrossChainTransfer() {
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { switchChain } = useSwitchChain();
  const [currentStep, setCurrentStep] = useState<TransferStep>("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [completedTx, setCompletedTx] = useState<{ hash: string; chainId: ChainId } | null>(null);

  const DEFAULT_DECIMALS = 6;

  // Map internal steps to user-friendly steps
  const mapToUserStep = (internalStep: InternalTransferStep): TransferStep => {
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

  const setInternalStep = (step: InternalTransferStep) => {
    setCurrentStep(mapToUserStep(step));
  };

  const addLog = (message: string, isImportant = false) => {
    // Only add important logs for user-facing messages
    if (isImportant) {
      setLogs((prev) => [...prev, message]);
    }
  };

  const getPublicClient = (chainId: ChainId) => {
    return createPublicClient({
      chain: chains[chainId],
      transport: http(),
    });
  };

  const approveUSDC = async (
    client: WalletClient<HttpTransport, Chain, Account>,
    sourceChainId: ChainId
  ) => {
    setInternalStep("approving");
    // No user-facing logs for approval step

    try {
      const tx = await client.sendTransaction({
        to: CHAIN_IDS_TO_USDC_ADDRESSES[sourceChainId] as `0x${string}`,
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

      return tx;
    } catch (err) {
      setError("Payment failed - please try again");
      throw err;
    }
  };

  const burnUSDC = async (
    client: WalletClient<HttpTransport, Chain, Account>,
    sourceChainId: ChainId,
    amount: bigint,
    destinationChainId: ChainId,
    destinationAddress: string,
    transferType: "fast" | "standard"
  ) => {
    setInternalStep("burning");
    // No user-facing logs for burning step

    try {
      const finalityThreshold = transferType === "fast" ? 1000 : 2000;
      const maxFee = amount - 1n;
      const mintRecipient = `0x${destinationAddress
        .replace(/^0x/, "")
        .padStart(64, "0")}`;

      const tx = await client.sendTransaction({
        to: CHAIN_IDS_TO_TOKEN_MESSENGER[sourceChainId] as `0x${string}`,
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
            mintRecipient as Hex,
            CHAIN_IDS_TO_USDC_ADDRESSES[sourceChainId],
            "0x0000000000000000000000000000000000000000000000000000000000000000",
            maxFee,
            finalityThreshold,
          ],
        }),
      });

      addLog(`Payment initiated: ${tx}`);
      return tx;
    } catch (err) {
      setError("Payment failed - please try again");
      throw err;
    }
  };

  const retrieveAttestation = async (
    transactionHash: string,
    sourceChainId: ChainId
  ) => {
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
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }
        setError("Payment failed - please try again");
        throw error;
      }
    }
  };
  const mintUSDC = async (
    client: WalletClient<HttpTransport, Chain, Account>,
    destinationChainId: number,
    attestation: any,
  ) => {
    const MAX_RETRIES = 3;
    let retries = 0;
    setInternalStep("minting");
    // No user-facing logs during minting

    while (retries < MAX_RETRIES) {
      try {


        const publicClient =await getPublicClient(destinationChainId as ChainId);
        const feeData = await publicClient.estimateFeesPerGas();
        const contractConfig = {
          address: CHAIN_IDS_TO_MESSAGE_TRANSMITTER[
            destinationChainId as ChainId
          ] as `0x${string}`,
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
          ] as const,
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
        setCompletedTx({ hash: tx, chainId: destinationChainId as ChainId });
        addLog(`Payment completed successfully! View transaction: ${CHAIN_EXPLORERS[destinationChainId as ChainId]}${tx}`, true);
        setInternalStep("completed");
        break;
      } catch (err) {
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

  const executeMerchantPayment = async (
    sourceChainId: ChainId,
    merchantAddress: string,
    preferredChainId: ChainId,
    amount: string,
  ) => {
    if (!walletClient) throw new Error('Wallet not connected')
    
    try {
      const numericAmount = parseUnits(amount, DEFAULT_DECIMALS)
      
      // Use walletClient for transactions
      await approveUSDC(walletClient as WalletClient<HttpTransport, Chain, Account>, sourceChainId)
      const burnTx = await burnUSDC(
        walletClient as WalletClient<HttpTransport, Chain, Account>,
        sourceChainId,
        numericAmount,
        preferredChainId,
        merchantAddress,
        "fast"
      )
      const attestation = await retrieveAttestation(burnTx, sourceChainId)
      const mintTx = await mintUSDC(walletClient as WalletClient<HttpTransport, Chain, Account>, preferredChainId, attestation)
      return { burnTx, mintTx, attestation, sourceChain: sourceChainId, destinationChain: preferredChainId }
    } catch (error) {
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

  const getExplorerLink = (hash: string, chainId: ChainId) => {
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
