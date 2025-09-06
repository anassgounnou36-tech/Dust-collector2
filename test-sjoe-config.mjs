#!/usr/bin/env node

/**
 * Test script to verify sJOE production configuration validation
 */

import { config } from 'dotenv';
import { env } from './dist/config/env.js';
import { validateClaimRecipients } from './dist/config/addresses.js';

// Load environment variables
config();

console.log('🔍 Testing sJOE Production Configuration...\n');

console.log('📋 Current Environment Variables:');
console.log(`  MOCK_MODE: ${process.env.MOCK_MODE}`);
console.log(`  DEFAULT_CLAIM_RECIPIENT_AVAX: ${process.env.DEFAULT_CLAIM_RECIPIENT_AVAX ? '✅ Set' : '❌ Not Set'}`);
console.log(`  TRADERJOE_SJOE_STAKING_ADDRESS: ${process.env.TRADERJOE_SJOE_STAKING_ADDRESS ? '✅ Set' : '❌ Not Set'}`);
console.log(`  SJOE_TOKEN_ADDRESS: ${process.env.SJOE_TOKEN_ADDRESS ? '✅ Set' : '❌ Not Set'}`);
console.log(`  JOE_TOKEN_ADDRESS: ${process.env.JOE_TOKEN_ADDRESS ? '✅ Set' : '❌ Not Set'}`);
console.log(`  SJOE_MIN_USD: ${env.sJoeMinUsd}`);
console.log(`  SJOE_HARVEST_FUNCTION: ${env.sJoeHarvestFunction}\n`);

// Test validation logic similar to what's in run.ts
const mockMode = process.env.MOCK_MODE === 'true';

console.log('🧪 Testing Validation Logic:');

try {
  validateClaimRecipients(mockMode);
  console.log('✅ Claim recipient validation passed');
} catch (error) {
  console.log('❌ Claim recipient validation failed:', error.message);
}

if (!mockMode) {
  console.log('🔒 Production Mode Validation:');
  
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
  }
} else {
  console.log('🧪 Mock Mode - Production validation skipped');
}

console.log('\n🎯 Test completed.');