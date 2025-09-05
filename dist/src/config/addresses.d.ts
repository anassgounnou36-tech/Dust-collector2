import type { Address, Chain } from '../types/common.js';
/**
 * Check if an address is a placeholder that should not be used in production.
 */
export declare function isPlaceholderAddress(address: Address): boolean;
/**
 * Get the default claim recipient for a chain from environment variables.
 * Returns null if not configured.
 */
export declare function getDefaultClaimRecipient(chain: Chain): Address | null;
/**
 * Validate that required claim recipients are configured for non-mock mode.
 */
export declare function validateClaimRecipients(mockMode: boolean): void;
//# sourceMappingURL=addresses.d.ts.map