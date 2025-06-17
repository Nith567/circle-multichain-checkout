import React from 'react';
import MyStore from './merchant-implementation';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-8 text-center">CCTP Merchant Checkout Test</h1>
      <MyStore />
    </div>
  );
}