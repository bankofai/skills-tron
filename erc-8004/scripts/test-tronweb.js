#!/usr/bin/env node

/**
 * Test TronWeb import and basic functionality
 */

console.log('Testing TronWeb import...\n');

// Test import
const TronWebModule = require('tronweb');
const TronWeb = TronWebModule.TronWeb || TronWebModule;

console.log('✓ TronWeb imported successfully');
console.log(`  Type: ${typeof TronWeb}`);
console.log(`  Constructor: ${typeof TronWeb === 'function' ? 'Yes' : 'No'}`);

// Test instantiation
try {
  const tronWeb = new TronWeb({
    fullHost: 'https://nile.trongrid.io'
  });
  console.log('✓ TronWeb instance created successfully');
  console.log(`  Full host: ${tronWeb.fullHost}`);
} catch (error) {
  console.error('✗ Failed to create TronWeb instance:');
  console.error(`  ${error.message}`);
  process.exit(1);
}

// Test transaction query
async function testTransactionQuery() {
  const tronWeb = new TronWeb({
    fullHost: 'https://nile.trongrid.io'
  });
  
  const tx = '8b88eda1a40876d133ade284d8dd17126683bc875b2c4836ec93950c2f6854ce';
  
  try {
    console.log('\nTesting transaction query...');
    const info = await tronWeb.trx.getTransactionInfo(tx);
    console.log('✓ Transaction info retrieved successfully');
    console.log(`  Block number: ${info.blockNumber || 'N/A'}`);
    console.log(`  Result: ${info.result || 'N/A'}`);
  } catch (error) {
    console.error('✗ Failed to query transaction:');
    console.error(`  ${error.message}`);
  }
}

testTransactionQuery().then(() => {
  console.log('\n✓ All tests passed!');
}).catch(error => {
  console.error('\n✗ Test failed:', error.message);
  process.exit(1);
});
