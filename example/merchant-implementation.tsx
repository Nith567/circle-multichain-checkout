import React from 'react';
import { CheckoutPage } from 'cctp-merchant-checkout';

export default function MyStore() {
  return (
    <CheckoutPage
      merchantAddress="0xcfb31219238fe98eff27BBae2a00cEEaf0bE8BE5"
      preferredChain={84532}
      amount="99.99"
      onSuccess={(txHash) => console.log('Payment successful:', txHash)}
      onError={(error) => console.error('Payment failed:', error)}
    />
  );
}
