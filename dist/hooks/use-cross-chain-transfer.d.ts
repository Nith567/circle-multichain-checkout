declare const CHAIN_IDS: {
    readonly ETH_SEPOLIA: 11155111;
    readonly AVAX_FUJI: 43113;
    readonly BASE_SEPOLIA: 84532;
};
export type ChainId = typeof CHAIN_IDS[keyof typeof CHAIN_IDS];
export type TransferStep = "idle" | "approving" | "burning" | "waiting-attestation" | "minting" | "completed" | "error";
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
    } | undefined>;
    reset: () => void;
};
export {};
