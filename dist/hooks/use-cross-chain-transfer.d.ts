import { type ChainId } from "../lib/chains";
export type TransferStep = "idle" | "processing" | "confirming" | "completed" | "error";
export type InternalTransferStep = "idle" | "approving" | "burning" | "waiting-attestation" | "minting" | "completed" | "error";
export declare function useCrossChainTransfer(): {
    currentStep: TransferStep;
    logs: string[];
    error: string | null;
    completedTx: {
        hash: string;
        chainId: ChainId;
    } | null;
    getExplorerLink: (hash: string, chainId: ChainId) => string;
    executeMerchantPayment: (sourceChainId: ChainId, merchantAddress: string, preferredChainId: ChainId, amount: string) => Promise<{
        burnTx: `0x${string}`;
        mintTx: void;
        attestation: any;
        sourceChain: ChainId;
        destinationChain: ChainId;
        approveTx: `0x${string}` | null;
    }>;
    reset: () => void;
};
