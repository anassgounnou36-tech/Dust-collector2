#!/usr/bin/env node

/**
 * Test script to verify the CLI validation works correctly
 */

import { config } from 'dotenv';

// Load environment variables
config();

// Set mock mode to false to test production validation
process.env.MOCK_MODE = 'false';

console.log('🧪 Testing CLI Production Validation...\n');

async function testCliValidation() {
  try {
    // Import the validation logic from run.ts
    const { validateClaimRecipients } = await import('./dist/config/addresses.js');
    const { env } = await import('./dist/config/env.js');
    
    const mockMode = process.env.MOCK_MODE === 'true';
    
    console.log(`🔍 Mock Mode: ${mockMode}`);
    console.log('🔍 Environment Variables:');
    console.log(`  DEFAULT_CLAIM_RECIPIENT_AVAX: ${env.defaultClaimRecipientAvax ? 'Set' : 'Not Set'}`);
    console.log(`  TRADERJOE_SJOE_STAKING_ADDRESS: ${env.traderJoeSJoeStakingAddress ? 'Set' : 'Not Set'}`);
    console.log(`  SJOE_TOKEN_ADDRESS: ${env.sJoeToken ? 'Set' : 'Not Set'}`);
    console.log(`  JOE_TOKEN_ADDRESS: ${env.joeToken ? 'Set' : 'Not Set'}\n`);
    
    // Test recipient validation
    console.log('🧪 Testing claim recipient validation...');
    try {
      validateClaimRecipients(mockMode);
      console.log('✅ Claim recipient validation passed');
    } catch (error) {
      console.log('❌ Claim recipient validation failed:', error.message);
      return false;
    }
    
    // Test sJOE integration validation 
    if (!mockMode) {
      console.log('🧪 Testing sJOE integration validation...');
      try {
        if (!env.traderJoeSJoeStakingAddress) {
          throw new Error('TRADERJOE_SJOE_STAKING_ADDRESS is required for non-mock mode');
        }
        
        if (!env.sJoeToken) {
          throw new Error('SJOE_TOKEN_ADDRESS is required for non-mock mode');
        }
        
        if (!env.joeToken) {
          throw new Error('JOE_TOKEN_ADDRESS is required for non-mock mode');
        }
        
        console.log('✅ sJOE integration configuration validated for production mode');
      } catch (error) {
        console.log('❌ sJOE integration configuration validation failed:', error.message);
        return false;
      }
    }
    
    console.log('\n🎉 All validations passed! CLI is ready for production.');
    return true;
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    return false;
  }
}

testCliValidation().then(success => {
  process.exit(success ? 0 : 1);
});