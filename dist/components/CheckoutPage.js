import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useAccount, useWalletClient, useSwitchChain } from 'wagmi';
import { useCrossChainTransfer } from '../hooks/use-cross-chain-transfer';
import { CHAIN_IDS } from '../lib/chains';
import { cn } from '../lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { ProgressSteps } from './progress-step';
import { TransferLog } from './transfer-log';
import { ExternalLink, RefreshCw, CheckCircle2 } from 'lucide-react';
const CHAIN_OPTIONS = [
    { id: CHAIN_IDS.ETH_SEPOLIA, name: 'Ethereum Sepolia', icon: '♦️' },
    { id: CHAIN_IDS.AVAX_FUJI, name: 'Avalanche Fuji', icon: '🔺' },
    { id: CHAIN_IDS.BASE_SEPOLIA, name: 'Base Sepolia', icon: '🔵' },
    { id: CHAIN_IDS.ARBITRUM_SEPOLIA, name: 'Arbitrum Sepolia', icon: '🔴' },
    { id: CHAIN_IDS.LINEA_SEPOLIA, name: 'Linea Sepolia', icon: '⚡' },
    { id: CHAIN_IDS.WORLDCHAIN_SEPOLIA, name: 'Worldchain Sepolia', icon: '🌍' },
    { id: CHAIN_IDS.SONIC_BLAZE, name: 'Sonic Blaze', icon: '💨' },
];
export function CheckoutPage({ merchantAddress, preferredChain, amount, onSuccess, onError, customStyles = {} }) {
    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const { switchChain } = useSwitchChain();
    const { executeMerchantPayment, currentStep, logs, error, completedTx, getExplorerLink, reset } = useCrossChainTransfer();
    const [sourceChain, setSourceChain] = useState(CHAIN_IDS.ETH_SEPOLIA);
    const getChainInfo = (chainId) => {
        return CHAIN_OPTIONS.find(chain => chain.id === chainId);
    };
    const preferredChainInfo = getChainInfo(preferredChain);
    const isProcessing = currentStep !== 'idle' && currentStep !== 'completed' && currentStep !== 'error';
    const handlePayment = async () => {
        if (!walletClient || !address) {
            onError?.(new Error('Please connect your wallet first'));
            return;
        }
        try {
            reset(); // Clear any previous errors
            // Auto-switch to the source chain before payment
            try {
                await switchChain({ chainId: sourceChain });
            }
            catch (switchError) {
                onError?.(new Error('Please switch to the source chain to continue'));
                return;
            }
            const result = await executeMerchantPayment(sourceChain, merchantAddress, preferredChain, amount);
            if (result?.burnTx)
                onSuccess?.(result.burnTx);
        }
        catch (error) {
            onError?.(error instanceof Error ? error : new Error('Payment failed'));
        }
    };
    return (_jsxs(Card, { className: "max-w-4xl mx-auto shadow-lg", style: customStyles, children: [_jsxs(CardHeader, { className: "text-center pb-6", children: [_jsx(CardTitle, { className: "text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent", children: "Cross-Chain USDC Payment" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Secure multi-chain payment processing" })] }), _jsxs(CardContent, { className: "space-y-8", children: [_jsx("div", { className: "bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl border border-blue-200 shadow-sm", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-gray-600 font-medium", children: "Amount to Pay" }), _jsxs("div", { className: "text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent", children: [amount, " USDC"] })] }), _jsxs("div", { className: "text-right", children: [_jsx(Label, { className: "text-gray-600 font-medium", children: "Destination" }), _jsxs("div", { className: "flex items-center text-lg font-semibold text-gray-800", children: [_jsx("span", { className: "mr-2", children: preferredChainInfo?.icon }), preferredChainInfo?.name || `Chain ${preferredChain}`] })] })] }) }), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { className: "text-lg font-medium", children: "Pay From Chain" }), _jsxs(Select, { value: String(sourceChain), onValueChange: (value) => setSourceChain(Number(value)), disabled: isProcessing, children: [_jsx(SelectTrigger, { className: "h-14 text-lg", children: _jsx(SelectValue, { placeholder: "Select source chain" }) }), _jsx(SelectContent, { children: CHAIN_OPTIONS.map((chain) => (_jsx(SelectItem, { value: String(chain.id), className: "h-12", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("span", { className: "text-xl", children: chain.icon }), _jsx("span", { className: "font-medium", children: chain.name })] }) }, chain.id))) })] })] }), _jsxs("div", { className: "bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-xl border border-slate-200 shadow-sm", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-slate-800", children: "Payment Progress" }), _jsx(ProgressSteps, { currentStep: currentStep })] }), currentStep === 'completed' && completedTx && (_jsxs("div", { className: "bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border border-emerald-200 rounded-xl p-6 shadow-lg", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-4", children: [_jsx(CheckCircle2, { className: "w-8 h-8 text-emerald-600" }), _jsx("h3", { className: "text-lg font-semibold text-emerald-800", children: "Payment Completed Successfully!" })] }), _jsxs("a", { href: getExplorerLink(completedTx.hash, completedTx.chainId), target: "_blank", rel: "noopener noreferrer", className: "inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-700 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg", children: [_jsx("span", { children: "View Transaction" }), _jsx(ExternalLink, { className: "w-4 h-4" })] })] })), error && (_jsxs("div", { className: "bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 border border-red-200 rounded-xl p-4 shadow-md", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-red-500", children: "\u274C" }), _jsx("span", { className: "text-red-700 font-medium", children: "Payment Failed" })] }), _jsx("p", { className: "text-red-600 mt-2", children: error })] })), currentStep !== 'completed' && logs.length > 0 && (_jsx("div", { className: "bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 shadow-sm", children: _jsx(TransferLog, { logs: logs }) })), _jsx(Button, { onClick: handlePayment, disabled: isProcessing || !isConnected || currentStep === 'completed', className: cn("w-full h-14 text-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg", currentStep === 'completed' && "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 cursor-default"), children: !isConnected
                            ? _jsxs(_Fragment, { children: [_jsx(ExternalLink, { className: "w-5 h-5 mr-2" }), " Connect Wallet to Pay"] })
                            : currentStep === 'completed'
                                ? _jsxs(_Fragment, { children: [_jsx(CheckCircle2, { className: "w-5 h-5 mr-2" }), " Payment Completed"] })
                                : currentStep === 'error'
                                    ? _jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-5 h-5 mr-2" }), " Try Again"] })
                                    : isProcessing
                                        ? _jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-5 h-5 mr-2 animate-spin" }), " Processing Payment..."] })
                                        : `💳 Pay ${amount} USDC` }), (currentStep === 'completed' || currentStep === 'error') && (_jsxs(Button, { onClick: reset, variant: "outline", className: "w-full h-12 flex items-center justify-center", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Start New Payment"] }))] })] }));
}
