import React, { useState } from 'react';
import { useAccount, useWalletClient, useSwitchChain } from 'wagmi';
import { useCrossChainTransfer } from '../hooks/use-cross-chain-transfer';
import { CHAIN_IDS, type ChainId } from '../lib/chains';
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
  { id: CHAIN_IDS.UNICHAIN_SEPOLIA, name: 'Unichain Sepolia', icon: '🩷' },
] as const;

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

export function CheckoutPage({
  merchantAddress,
  preferredChain,
  amount,
  onSuccess,
  onError,
  customStyles = {}
}: CheckoutPageProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();
  const { executeMerchantPayment, currentStep, logs, error, completedTx, getExplorerLink, reset } = useCrossChainTransfer();
  const [sourceChain, setSourceChain] = useState<ChainId>(CHAIN_IDS.ETH_SEPOLIA);

  const getChainInfo = (chainId: ChainId) => {
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
      } catch (switchError) {
        onError?.(new Error('Please switch to the source chain to continue'));
        return;
      }
      
      const result = await executeMerchantPayment(
        sourceChain,
        merchantAddress,
        preferredChain,
        amount
      );
      if (result?.burnTx) onSuccess?.(result.burnTx);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Payment failed'));
    }
  };

  return (
    <Card className="max-w-4xl mx-auto shadow-lg" style={customStyles}>
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Cross-Chain USDC Payment
        </CardTitle>
        <p className="text-gray-600 mt-2">Secure multi-chain payment processing</p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Payment Summary */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl border border-blue-200 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <Label className="text-gray-600 font-medium">Amount to Pay</Label>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">{amount} USDC</div>
            </div>
            <div className="text-right">
              <Label className="text-gray-600 font-medium">Destination</Label>
              <div className="flex items-center text-lg font-semibold text-gray-800">
                <span className="mr-2">{preferredChainInfo?.icon}</span>
                {preferredChainInfo?.name || `Chain ${preferredChain}`}
              </div>
            </div>
          </div>
        </div>

        {/* Source Chain Selection */}
        <div className="space-y-3">
          <Label className="text-lg font-medium">Pay From Chain</Label>
          <Select
            value={String(sourceChain)}
            onValueChange={(value) => setSourceChain(Number(value) as ChainId)}
            disabled={isProcessing}
          >
            <SelectTrigger className="h-14 text-lg">
              <SelectValue placeholder="Select source chain" />
            </SelectTrigger>
            <SelectContent>
              {CHAIN_OPTIONS.map((chain) => (
                <SelectItem key={chain.id} value={String(chain.id)} className="h-12">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{chain.icon}</span>
                    <span className="font-medium">{chain.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Progress Steps */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Payment Progress</h3>
          <ProgressSteps currentStep={currentStep} />
        </div>

{/* Success Display with Explorer Link */}
{currentStep === 'completed' && completedTx && (
  <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900 dark:via-green-900 dark:to-teal-900 border border-emerald-200 dark:border-emerald-700 rounded-xl p-6 shadow-lg">
    <div className="flex items-center space-x-3 mb-4">
      <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
      <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-100">
        Payment Completed Successfully!
      </h3>
    </div>
    <a
      href={getExplorerLink(completedTx.hash, completedTx.chainId)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center space-x-2 px-6 py-3 
        bg-emerald-600 hover:bg-emerald-700 
        dark:bg-emerald-500 dark:hover:bg-emerald-600
        text-white rounded-lg 
        transition-all duration-200 
        shadow-lg hover:shadow-xl 
        border border-emerald-500"
    >
      <span>View Transaction</span>
      <ExternalLink className="w-4 h-4" />
    </a>
  </div>
)}


        {/* Error Display */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 via-rose-50 to-pink-50 border border-red-200 rounded-xl p-4 shadow-md">
            <div className="flex items-center space-x-2">
              <span className="text-red-500">❌</span>
              <span className="text-red-700 font-medium">Payment Failed</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        )}

        {/* Transfer Logs - Only show if not completed and has logs */}
        {currentStep !== 'completed' && logs.length > 0 && (
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 shadow-sm">
            <TransferLog logs={logs} />
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={handlePayment}
          disabled={isProcessing || !isConnected || currentStep === 'completed'}
          className={cn(
            "w-full h-14 text-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg",
            currentStep === 'completed' && "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 cursor-default"
          )}
        >
          {!isConnected 
            ? <><ExternalLink className="w-5 h-5 mr-2" /> Connect Wallet to Pay</> 
            : currentStep === 'completed'
            ? <><CheckCircle2 className="w-5 h-5 mr-2" /> Payment Completed</>
            : currentStep === 'error'
            ? <><RefreshCw className="w-5 h-5 mr-2" /> Try Again</>
            : isProcessing
            ? <><RefreshCw className="w-5 h-5 mr-2 animate-spin" /> Processing Payment...</>
            : `💳 Pay ${amount} USDC`
          }
        </Button>

        {/* Reset Button for completed/error states */}
        {(currentStep === 'completed' || currentStep === 'error') && (
          <Button 
            onClick={reset}
            variant="outline"
            className="w-full h-12 flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Start New Payment
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 