import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useCrossChainTransfer } from '../hooks/use-cross-chain-transfer';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { ProgressSteps } from './progress-step';
import { TransferLog } from './transfer-log';
const CHAIN_OPTIONS = [
    { id: 11155111, name: 'Ethereum Sepolia' },
    { id: 43113, name: 'Avalanche Fuji' },
    { id: 84532, name: 'Base Sepolia' },
];
export function CheckoutPage({ merchantAddress, preferredChain, amount, onSuccess, onError, customStyles = {} }) {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const { executeMerchantPayment, currentStep, logs } = useCrossChainTransfer();
    const [sourceChain, setSourceChain] = useState(11155111);
    const handlePayment = async () => {
        if (!walletClient || !address) {
            onError?.(new Error('Please connect your wallet first'));
            return;
        }
        try {
            const result = await executeMerchantPayment(sourceChain, merchantAddress, preferredChain, amount);
            onSuccess?.(result.burnTx);
        }
        catch (error) {
            onError?.(error instanceof Error ? error : new Error('Payment failed'));
        }
    };
    return (_jsxs(Card, { className: "max-w-3xl mx-auto", style: customStyles, children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-center", children: "USDC Payment" }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Amount to Pay" }), _jsxs("div", { className: "text-2xl font-bold", children: [amount, " USDC"] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Will be received on chain ", preferredChain] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Pay From Chain" }), _jsxs(Select, { value: String(sourceChain), onValueChange: (value) => setSourceChain(Number(value)), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select source chain" }) }), _jsx(SelectContent, { children: CHAIN_OPTIONS.map((chain) => (_jsx(SelectItem, { value: String(chain.id), children: chain.name }, chain.id))) })] })] }), _jsx(ProgressSteps, { currentStep: currentStep }), _jsx(TransferLog, { logs: logs }), _jsx(Button, { onClick: handlePayment, disabled: currentStep !== 'idle' || !isConnected, className: "w-full", children: !isConnected ? 'Connect Wallet to Pay' : `Pay ${amount} USDC` })] })] }));
}
