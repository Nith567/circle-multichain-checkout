import { type ChainId } from "../lib/chains";
export type TransferStep = "idle" | "processing" | "confirming" | "completed" | "error";
export type InternalTransferStep = "idle" | "approving" | "burning" | "waiting-attestation" | "minting" | "completed" | "error";
export declare function useCrossChainTransfer(): {
    currentStep: TransferStep;
    logs: string[];
    error: string | null;
    executeMerchantPayment: (sourceChainId: ChainId, merchantAddress: string, preferredChainId: ChainId, amount: string) => Promise<{
        burnTx: `0x${string}`;
        mintTx: void;
        attestation: any;
        sourceChain: ChainId;
        destinationChain: ChainId;
    }>;
    reset: () => void;
};
