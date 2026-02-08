#!/usr/bin/env node

/**
 * Token Address Lookup Tool
 * 
 * Quickly find token addresses from the common_tokens.json registry
 * Usage: node lookup_token.js <SYMBOL> [NETWORK]
 * 
 * Examples:
 *   node lookup_token.js USDT nile
 *   node lookup_token.js TRX mainnet
 *   node lookup_token.js WTRX
 */

const fs = require('fs');
const path = require('path');

// Load token registry
const tokensPath = path.join(__dirname, '../resources/common_tokens.json');
const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

function lookupToken(symbol, network = 'mainnet') {
  const upperSymbol = symbol.toUpperCase();
  
  // Check if network exists
  if (!tokens[network]) {
    console.error(`❌ Network "${network}" not found`);
    console.error(`Available networks: ${Object.keys(tokens).filter(k => k !== 'notes').join(', ')}`);
    process.exit(1);
  }
  
  // Check if token exists
  const token = tokens[network][upperSymbol];
  
  if (!token) {
    console.error(`❌ Token "${upperSymbol}" not found on ${network}`);
    console.error(`\nAvailable tokens on ${network}:`);
    Object.keys(tokens[network]).forEach(sym => {
      console.error(`  • ${sym}`);
    });
    process.exit(1);
  }
  
  // Display token info
  console.log(`✅ Token Found: ${token.symbol} on ${network}\n`);
  console.log(`📋 Details:`);
  console.log(`   Name:        ${token.name}`);
  console.log(`   Symbol:      ${token.symbol}`);
  console.log(`   Address:     ${token.address}`);
  console.log(`   Decimals:    ${token.decimals}`);
  console.log(`   Description: ${token.description}`);
  console.log('');
  
  // Output JSON for programmatic use
  console.log('📄 JSON Output:');
  console.log(JSON.stringify(token, null, 2));
  
  return token;
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Token Address Lookup Tool');
    console.log('');
    console.log('Usage: node lookup_token.js <SYMBOL> [NETWORK]');
    console.log('');
    console.log('Arguments:');
    console.log('  SYMBOL   - Token symbol (e.g., USDT, TRX, WTRX)');
    console.log('  NETWORK  - Network name (mainnet or nile), defaults to mainnet');
    console.log('');
    console.log('Examples:');
    console.log('  node lookup_token.js USDT nile');
    console.log('  node lookup_token.js TRX mainnet');
    console.log('  node lookup_token.js WTRX');
    console.log('');
    console.log('Available Networks:');
    Object.keys(tokens).filter(k => k !== 'notes').forEach(net => {
      console.log(`  • ${net}`);
    });
    process.exit(0);
  }
  
  const symbol = args[0];
  const network = args[1] || 'mainnet';
  
  try {
    lookupToken(symbol, network);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = { lookupToken };
