import type { Hex } from "viem";
export declare enum SupportedChainId {
    ETH_SEPOLIA = 11155111,
    AVAX_FUJI = 43113,
    BASE_SEPOLIA = 84532
}
export declare const DEFAULT_MAX_FEE = 1000n;
export declare const DEFAULT_FINALITY_THRESHOLD = 2000;
export declare const CHAIN_TO_CHAIN_NAME: Record<number, string>;
export declare const CHAIN_IDS_TO_USDC_ADDRESSES: Record<number, Hex>;
export declare const CHAIN_IDS_TO_TOKEN_MESSENGER: Record<number, Hex>;
export declare const CHAIN_IDS_TO_MESSAGE_TRANSMITTER: Record<number, Hex>;
export declare const DESTINATION_DOMAINS: Record<number, number>;
export declare const SUPPORTED_CHAINS: SupportedChainId[];
