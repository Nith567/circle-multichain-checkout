// Test script to verify imports work correctly
import { CHAIN_IDS, CheckoutPage, useCrossChainTransfer } from './dist/index.js';

console.log('✅ CHAIN_IDS imported successfully:', Object.keys(CHAIN_IDS));
console.log('✅ CheckoutPage imported successfully:', typeof CheckoutPage);
console.log('✅ useCrossChainTransfer imported successfully:', typeof useCrossChainTransfer);
console.log('🎉 All imports working correctly!');
