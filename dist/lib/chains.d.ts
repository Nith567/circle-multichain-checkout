import type { Hex } from "viem";
export declare const CHAIN_IDS: {
    readonly ETH_SEPOLIA: 11155111;
    readonly AVAX_FUJI: 43113;
    readonly BASE_SEPOLIA: 84532;
    readonly SONIC_BLAZE: 161;
    readonly LINEA_SEPOLIA: 59144;
    readonly ARBITRUM_SEPOLIA: 421614;
    readonly WORLDCHAIN_SEPOLIA: 1666700000;
    readonly UNICHAIN_SEPOLIA: 1301;
};
export type ChainId = typeof CHAIN_IDS[keyof typeof CHAIN_IDS];
export declare enum SupportedChainId {
    ETH_SEPOLIA = 11155111,
    AVAX_FUJI = 43113,
    BASE_SEPOLIA = 84532
}
export declare const DEFAULT_MAX_FEE = 1000n;
export declare const DEFAULT_FINALITY_THRESHOLD = 2000;
export declare const CHAIN_TO_CHAIN_NAME: Record<number, string>;
export declare const CHAIN_IDS_TO_USDC_ADDRESSES: Record<ChainId, Hex>;
export declare const CHAIN_IDS_TO_TOKEN_MESSENGER: Record<ChainId, Hex>;
export declare const CHAIN_IDS_TO_MESSAGE_TRANSMITTER: Record<ChainId, Hex>;
export declare const DESTINATION_DOMAINS: Record<ChainId, number>;
export declare const CHAIN_EXPLORERS: Record<ChainId, string>;
