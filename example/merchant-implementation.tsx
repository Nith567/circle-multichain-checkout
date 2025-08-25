"use client"
import React from "react";

import { CheckoutPage } from 'circle-multichain-checkout';
export default function MyStore() {
  return (

    <CheckoutPage
      merchantAddress="0xcfb31219238fe98eff27BBae2a00cEEaf0bE8BE5"
      preferredChain={43113}
      amount="0.1"
      onSuccess={(txHash) => console.log('Payment successful:', txHash)}
      onError={(error) => console.error('Payment failed:', error)}
    />
  );
}




