import React, { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useCrossChainTransfer, type ChainId } from '../hooks/use-cross-chain-transfer';
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
  const { executeMerchantPayment, currentStep, logs } = useCrossChainTransfer();
  const [sourceChain, setSourceChain] = useState<ChainId>(11155111);

  const handlePayment = async () => {
    if (!walletClient || !address) {
      onError?.(new Error('Please connect your wallet first'));
      return;
    }

    try {
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
    <Card className="max-w-3xl mx-auto" style={customStyles}>
      <CardHeader>
        <CardTitle className="text-center">USDC Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Amount to Pay</Label>
          <div className="text-2xl font-bold">{amount} USDC</div>
          <div className="text-sm text-muted-foreground">
            Will be received on chain {preferredChain}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Pay From Chain</Label>
          <Select
            value={String(sourceChain)}
            onValueChange={(value) => setSourceChain(Number(value) as ChainId)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source chain" />
            </SelectTrigger>
            <SelectContent>
              {CHAIN_OPTIONS.map((chain) => (
                <SelectItem key={chain.id} value={String(chain.id)}>
                  {chain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ProgressSteps currentStep={currentStep} />

        <TransferLog logs={logs} />

        <Button 
          onClick={handlePayment}
          disabled={currentStep !== 'idle' || !isConnected}
          className="w-full"
        >
          {!isConnected ? 'Connect Wallet to Pay' : `Pay ${amount} USDC`}
        </Button>
      </CardContent>
    </Card>
  );
} 