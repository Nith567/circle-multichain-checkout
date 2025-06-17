import { type ChainId } from '../hooks/use-cross-chain-transfer';
export interface CheckoutPageProps {
    merchantAddress: string;
    preferredChain: ChainId;
    amount: string;
    onSuccess?: (txHash: string) => void;
    onError?: (error: Error) => void;
    customStyles?: {
        primaryColor?: string;
        borderRadius?: string;
    };
}
export declare function CheckoutPage({ merchantAddress, preferredChain, amount, onSuccess, onError, customStyles }: CheckoutPageProps): import("react/jsx-runtime").JSX.Element;
