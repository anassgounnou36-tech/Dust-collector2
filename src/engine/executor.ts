import type { ClaimBundle, ChainClient, TxResult, Address } from '../types/common.js';
import { logger } from './logger.js';
import { isPlaceholderAddress } from '../config/addresses.js';
import { verifyPayout, type PricingService } from './verifyPayout.js';

// Global pricing service instance for injection
let pricingService: PricingService | undefined;

/**
 * Inject pricing service for payout verification and gas calculations
 */
export function injectPricingService(service: PricingService): void {
  pricingService = service;
  logger.info('Pricing service injected for payout verification');
}

/**
 * Validate bundle recipient is not a placeholder in non-mock mode
 */
function validateRecipient(bundle: ClaimBundle, mockMode: boolean): void {
  if (mockMode) {
    return; // No validation in mock mode
  }
  
  if (isPlaceholderAddress(bundle.claimTo)) {
    throw new Error(`Cannot execute bundle with placeholder recipient ${bundle.claimTo.value} in non-mock mode`);
  }
}

export async function execute(
  bundle: ClaimBundle, 
  clients: Map<string, ChainClient>,
  mockMode: boolean = false
): Promise<TxResult> {
  try {
    // Validate recipient before execution
    validateRecipient(bundle, mockMode);
    
    const client = clients.get(bundle.chain);
    
    if (!client) {
      const error = `No client configured for chain: ${bundle.chain}`;
      logger.error(`Execution failed for bundle ${bundle.id}: ${error}`);
      return {
        success: false,
        error,
        claimedUsd: 0,
        chain: bundle.chain,
        verifiedPayout: false
      };
    }

    logger.info(`Executing bundle ${bundle.id} with ${bundle.items.length} items worth $${bundle.totalUsd.toFixed(2)}`);
    
    const result = await client.sendRaw(bundle);
    
    // Post-execution payout verification
    let verifiedResult = result;
    if (result.success && result.txHash) {
      verifiedResult = await performPayoutVerification(result, bundle, mockMode);
    }
    
    if (verifiedResult.success) {
      logger.bundleExecuted(bundle.id, true, verifiedResult.txHash);
    } else {
      logger.bundleExecuted(bundle.id, false, undefined, verifiedResult.error);
    }
    
    return verifiedResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Execution error for bundle ${bundle.id}:`, errorMessage);
    
    return {
      success: false,
      error: `Execution error: ${errorMessage}`,
      claimedUsd: 0,
      chain: bundle.chain,
      verifiedPayout: false
    };
  }
}

/**
 * Perform post-execution payout verification
 */
async function performPayoutVerification(
  result: TxResult, 
  bundle: ClaimBundle, 
  mockMode: boolean
): Promise<TxResult> {
  try {
    // In mock mode, skip verification but still set verified flag
    if (mockMode) {
      return {
        ...result,
        verifiedPayout: true
      };
    }
    
    // Get transaction receipt (this would need to be implemented per chain)
    // For now, we'll simulate this since we don't have the full receipt structure
    const txReceipt = await getTransactionReceipt(result.txHash!, result.chain);
    
    if (!txReceipt || !txReceipt.logs) {
      logger.warn(`Could not get transaction receipt for ${result.txHash}`);
      return {
        ...result,
        verifiedPayout: false,
        error: result.error || 'Could not verify payout - no transaction receipt'
      };
    }
    
    // Verify transfers to expected recipient
    const verification = await verifyPayout(
      result.txHash!,
      txReceipt.logs,
      bundle.claimTo,
      pricingService
    );
    
    if (!verification.verified) {
      // In non-mock mode, fail if no verified payout
      return {
        ...result,
        success: false,
        verifiedPayout: false,
        error: verification.error || 'NO_VERIFIED_PAYOUT'
      };
    }
    
    // Calculate gas cost in USD
    let gasUsd = result.gasUsd || 0;
    if (result.gasUsed && pricingService) {
      try {
        // This is simplified - real implementation would get gas price and native token price
        gasUsd = await calculateGasUsd(result.gasUsed, result.chain, pricingService);
      } catch (error) {
        logger.warn(`Failed to calculate gas USD for ${result.txHash}:`, error);
      }
    }
    
    // Return enhanced result with verified payout data
    return {
      ...result,
      claimedUsd: verification.totalUsd, // Use actual verified amount
      gasUsd,
      verifiedPayout: true
    };
    
  } catch (error) {
    logger.error(`Payout verification failed for ${result.txHash}:`, error);
    return {
      ...result,
      verifiedPayout: false,
      error: result.error || `Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get transaction receipt (placeholder - would be implemented per chain)
 */
async function getTransactionReceipt(txHash: string, chain: string): Promise<any> {
  // This is a placeholder implementation
  // Real implementation would use chain-specific RPC calls
  logger.warn(`Transaction receipt retrieval not implemented for chain ${chain}, txHash ${txHash}`);
  return null;
}

/**
 * Calculate gas cost in USD (placeholder)
 */
async function calculateGasUsd(gasUsed: string, chain: string, pricing: PricingService): Promise<number> {
  // This is a placeholder implementation
  // Real implementation would get gas price and native token price
  return 0;
}

export async function executeSequential(
  bundles: ClaimBundle[], 
  clients: Map<string, ChainClient>,
  mockMode: boolean = false
): Promise<TxResult[]> {
  const results: TxResult[] = [];
  
  // Execute bundles sequentially to avoid nonce conflicts and better error handling
  for (const bundle of bundles) {
    const result = await execute(bundle, clients, mockMode);
    results.push(result);
    
    // Add small delay between executions
    if (bundles.indexOf(bundle) < bundles.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

export async function executeBatch(
  bundles: ClaimBundle[], 
  clients: Map<string, ChainClient>,
  batchSize: number = 3,
  mockMode: boolean = false
): Promise<TxResult[]> {
  const results: TxResult[] = [];
  
  // Process bundles in batches to balance speed and reliability
  for (let i = 0; i < bundles.length; i += batchSize) {
    const batch = bundles.slice(i, i + batchSize);
    
    // Execute batch in parallel
    const batchPromises = batch.map(bundle => execute(bundle, clients, mockMode));
    const batchResults = await Promise.allSettled(batchPromises);
    
    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      const bundle = batch[j];
      
      if (!bundle) continue;
      
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        logger.error(`Execution promise rejected for bundle ${bundle.id}:`, result.reason);
        results.push({
          success: false,
          error: `Promise rejection: ${result.reason}`,
          claimedUsd: 0,
          chain: bundle.chain
        });
      }
    }
    
    // Add delay between batches
    if (i + batchSize < bundles.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return results;
}

export function aggregateExecutionResults(results: TxResult[]): {
  successCount: number;
  failureCount: number;
  totalClaimedUsd: number;
  totalGasUsd: number;
  netUsd: number;
  successRate: number;
  verifiedPayoutCount: number;
} {
  let successCount = 0;
  let failureCount = 0;
  let totalClaimedUsd = 0;
  let totalGasUsd = 0;
  let verifiedPayoutCount = 0;
  
  for (const result of results) {
    if (result.success) {
      successCount++;
      totalClaimedUsd += result.claimedUsd;
      if (result.gasUsd) {
        totalGasUsd += result.gasUsd;
      }
    } else {
      failureCount++;
    }
    
    if (result.verifiedPayout) {
      verifiedPayoutCount++;
    }
  }
  
  const netUsd = totalClaimedUsd - totalGasUsd;
  const successRate = results.length > 0 ? successCount / results.length : 0;
  
  return {
    successCount,
    failureCount,
    totalClaimedUsd,
    totalGasUsd,
    netUsd,
    successRate,
    verifiedPayoutCount
  };
}