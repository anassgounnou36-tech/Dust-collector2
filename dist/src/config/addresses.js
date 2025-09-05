"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlaceholderAddress = isPlaceholderAddress;
exports.getDefaultClaimRecipient = getDefaultClaimRecipient;
exports.validateClaimRecipients = validateClaimRecipients;
/**
 * Placeholder addresses used during development and testing.
 * These must be replaced with real addresses in production.
 */
const PLACEHOLDER_ADDRESSES = {
    avalanche: '0x0000000000000000000000000000000000000000',
    tron: 'T0000000000000000000000000000000000000000'
};
/**
 * Check if an address is a placeholder that should not be used in production.
 */
function isPlaceholderAddress(address) {
    const placeholder = PLACEHOLDER_ADDRESSES[address.chain];
    return address.value.toLowerCase() === placeholder.toLowerCase();
}
/**
 * Get the default claim recipient for a chain from environment variables.
 * Returns null if not configured.
 */
function getDefaultClaimRecipient(chain) {
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
function validateClaimRecipients(mockMode) {
    if (mockMode) {
        return; // No validation needed in mock mode
    }
    const missingChains = [];
    if (!process.env.DEFAULT_CLAIM_RECIPIENT_AVAX) {
        missingChains.push('avalanche');
    }
    // TRON is optional - only validate if we actually have TRON integrations running
    // This is a more flexible approach than requiring it always
    if (missingChains.length > 0) {
        throw new Error(`Missing required environment variables for non-mock mode: ${missingChains.map(chain => chain === 'avalanche' ? 'DEFAULT_CLAIM_RECIPIENT_AVAX' : 'DEFAULT_CLAIM_RECIPIENT_TRON').join(', ')}`);
    }
}
//# sourceMappingURL=addresses.js.map