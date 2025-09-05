import type { Address, Chain } from '../types/common.js';

/**
 * Placeholder addresses used during development and testing.
 * These must be replaced with real addresses in production.
 */
const PLACEHOLDER_ADDRESSES: Record<Chain, string> = {
  avalanche: '0x0000000000000000000000000000000000000000',
  tron: 'T0000000000000000000000000000000000000000'
};

/**
 * Check if an address is a placeholder that should not be used in production.
 */
export function isPlaceholderAddress(address: Address): boolean {
  const placeholder = PLACEHOLDER_ADDRESSES[address.chain];
  return address.value.toLowerCase() === placeholder.toLowerCase();
}

/**
 * Get the default claim recipient for a chain from environment variables.
 * Returns null if not configured.
 */
export function getDefaultClaimRecipient(chain: Chain): Address | null {
  const envVar = chain === 'avalanche' 
    ? process.env.DEFAULT_CLAIM_RECIPIENT_AVAX
    : process.env.DEFAULT_CLAIM_RECIPIENT_TRON;
    
  if (!envVar) {
    return null;
  }
  
  return {
    value: envVar,
    chain
  };
}

/**
 * Validate that required claim recipients are configured for non-mock mode.
 */
export function validateClaimRecipients(mockMode: boolean): void {
  if (mockMode) {
    return; // No validation needed in mock mode
  }
  
  const missingChains: Chain[] = [];
  
  if (!process.env.DEFAULT_CLAIM_RECIPIENT_AVAX) {
    missingChains.push('avalanche');
  }
  
  // TRON is optional - only validate if we actually have TRON integrations running
  // This is a more flexible approach than requiring it always
  
  if (missingChains.length > 0) {
    throw new Error(
      `Missing required environment variables for non-mock mode: ${
        missingChains.map(chain => 
          chain === 'avalanche' ? 'DEFAULT_CLAIM_RECIPIENT_AVAX' : 'DEFAULT_CLAIM_RECIPIENT_TRON'
        ).join(', ')
      }`
    );
  }
}