#!/usr/bin/env node

/**
 * SunSwap Token Price Script
 *
 * Get token USD price from open.sun.io price API.
 *
 * Usage:
 *   node price.js <TOKEN_SYMBOL_OR_ADDRESS> [--network nile|mainnet]
 *
 * Examples:
 *   node price.js TRX
 *   node price.js TRX --network mainnet
 *   node price.js T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Load token addresses
const tokensPath = path.join(__dirname, '../resources/common_tokens.json');
const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

// Price API (chain-agnostic by token address)
const PRICE_API_URL = 'https://open.sun.io/apiv2/price';

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: node price.js <TOKEN_SYMBOL_OR_ADDRESS> [--network nile|mainnet]');
    console.error('');
    console.error('Examples:');
    console.error('  node price.js TRX');
    console.error('  node price.js TRX --network mainnet');
    console.error('  node price.js T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb');
    process.exit(1);
  }

  const tokenInput = args[0];
  const networkIndex = args.indexOf('--network');
  const network = networkIndex !== -1 ? args[networkIndex + 1] : 'nile';

  return { tokenInput, network };
}

function getTokenAddress(symbolOrAddress, network) {
  const networkTokens = tokens[network];
  if (!networkTokens) {
    throw new Error(`Unknown network: ${network}`);
  }

  // If already an address (starts with T and length 34), use directly
  if (symbolOrAddress.startsWith('T') && symbolOrAddress.length === 34) {
    return symbolOrAddress;
  }

  const symbol = symbolOrAddress.toUpperCase();
  const token = networkTokens[symbol];
  if (!token) {
    throw new Error(`Unknown token: ${symbol} on ${network}`);
  }

  return token.address;
}

async function getTokenPriceUSD(tokenAddress) {
  const url = `${PRICE_API_URL}?tokenAddress=${encodeURIComponent(tokenAddress)}`;

  try {
    const response = await axios.get(url, { timeout: 10000 });

    if (response.data.code !== 0) {
      throw new Error(`API Error: ${response.data.msg || 'Unknown error'}`);
    }

    const tokenData = response.data.data[tokenAddress];
    if (!tokenData || !tokenData.quote || !tokenData.quote.USD) {
      throw new Error('No USD price data returned for token');
    }

    const priceStr = tokenData.quote.USD.price;
    const lastUpdated = tokenData.quote.USD.last_updated;

    const price = parseFloat(priceStr);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error('Invalid price value from API');
    }

    return {
      priceUSD: price,
      lastUpdated
    };
  } catch (error) {
    if (error.response) {
      throw new Error(`API request failed: ${error.response.status} ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('API request timeout or network error');
    } else {
      throw error;
    }
  }
}

async function main() {
  try {
    const { tokenInput, network } = parseArgs();

    console.error(`🔍 Getting USD price for ${tokenInput} on ${network}...`);
    console.error('');

    const tokenAddress = getTokenAddress(tokenInput, network);
    const { priceUSD, lastUpdated } = await getTokenPriceUSD(tokenAddress);

    const result = {
      token: tokenInput.startsWith('T') && tokenInput.length === 34 ? tokenAddress : tokenInput.toUpperCase(),
      tokenAddress,
      network,
      priceUSD,
      lastUpdated,
      source: 'https://open.sun.io/apiv2/price'
    };

    // JSON for parsing
    console.log(JSON.stringify(result, null, 2));

    // Human-readable summary
    console.error('✅ Price fetched successfully:');
    console.error(`   Token: ${result.token} (${result.tokenAddress})`);
    console.error(`   Network: ${network}`);
    console.error(`   Price: $${result.priceUSD}`);
    console.error(`   Last Updated: ${new Date(result.lastUpdated).toISOString()}`);
    console.error('');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getTokenAddress,
  getTokenPriceUSD
};

