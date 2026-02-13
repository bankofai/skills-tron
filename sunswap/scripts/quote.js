#!/usr/bin/env node

/**
 * SunSwap Quote Script
 * 
 * Get price quote for token swap
 * Usage: node quote.js <FROM> <TO> <AMOUNT> [--network nile|mainnet]
 * 
 * FROM/TO can be either:
 *   - Token symbol (USDT, TRX, USDC, etc.)
 *   - Token contract address (T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb)
 * 
 * Examples:
 *   node quote.js TRX USDT 100
 *   node quote.js TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb 50
 *   node quote.js USDT TRX 50 --network mainnet
 */

const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Load token addresses
const tokensPath = path.join(__dirname, '../resources/common_tokens.json');
const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

// API endpoints
const API_ENDPOINTS = {
  mainnet: 'https://rot.endjgfsv.link/swap/router',
  nile: 'https://tnrouter.endjgfsv.link/swap/router'
};

const TYPE_LIST = 'PSM,CURVE,CURVE_COMBINATION,WTRX,SUNSWAP_V1,SUNSWAP_V2,SUNSWAP_V3';

function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: node quote.js <FROM> <TO> <AMOUNT> [--network nile|mainnet]');
    console.error('');
    console.error('FROM/TO can be token symbol (USDT, TRX) or address (T9yD...)');
    console.error('');
    console.error('Examples:');
    console.error('  node quote.js TRX USDT 100');
    console.error('  node quote.js USDT TRX 50 --network mainnet');
    process.exit(1);
  }

  // Don't convert to uppercase if it's an address (starts with T and length 34)
  const fromSymbol = (args[0].startsWith('T') && args[0].length === 34) ? args[0] : args[0].toUpperCase();
  const toSymbol = (args[1].startsWith('T') && args[1].length === 34) ? args[1] : args[1].toUpperCase();
  const amount = args[2];
  
  const networkIndex = args.indexOf('--network');
  const network = networkIndex !== -1 ? args[networkIndex + 1] : 'nile';

  return { fromSymbol, toSymbol, amount, network };
}

function getTokenAddress(symbolOrAddress, network) {
  const networkTokens = tokens[network];
  if (!networkTokens) {
    throw new Error(`Unknown network: ${network}`);
  }

  // Check if it's already an address (starts with T and is 34 characters)
  if (symbolOrAddress.startsWith('T') && symbolOrAddress.length === 34) {
    return symbolOrAddress;
  }

  // It's a symbol - look it up
  const token = networkTokens[symbolOrAddress];
  if (!token) {
    throw new Error(`Unknown token: ${symbolOrAddress} on ${network}`);
  }

  return token.address;
}

function getTokenDecimals(symbolOrAddress, network) {
  const networkTokens = tokens[network];
  if (!networkTokens) {
    throw new Error(`Unknown network: ${network}`);
  }

  // Check if it's an address
  if (symbolOrAddress.startsWith('T') && symbolOrAddress.length === 34) {
    // Try to find it in the token list
    for (const [symbol, tokenData] of Object.entries(networkTokens)) {
      if (tokenData.address === symbolOrAddress) {
        return tokenData.decimals || 6;
      }
    }
    // Not found - default to 6
    return 6;
  }

  // It's a symbol
  const token = networkTokens[symbolOrAddress];
  if (!token) {
    throw new Error(`Unknown token: ${symbolOrAddress} on ${network}`);
  }

  return token.decimals;
}

function formatAmount(amount, decimals = 6) {
  // Convert to raw amount (with decimals)
  if (amount.includes('.')) {
    return BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals))).toString();
  }
  return (BigInt(amount) * BigInt(Math.pow(10, decimals))).toString();
}

function formatOutput(rawAmount, decimals = 6) {
  // If rawAmount is already a decimal string (contains '.'), return as is
  if (typeof rawAmount === 'string' && rawAmount.includes('.')) {
    return parseFloat(rawAmount).toFixed(6);
  }
  // Otherwise convert from raw integer
  const num = parseFloat(rawAmount) / Math.pow(10, decimals);
  return num.toFixed(6);
}

async function getQuote(fromToken, toToken, amountIn, network) {
  const apiUrl = API_ENDPOINTS[network];
  // API expects amountIn as integer (in smallest unit, e.g., Sun for TRX)
  const url = `${apiUrl}?fromToken=${fromToken}&toToken=${toToken}&amountIn=${amountIn}&typeList=${TYPE_LIST}`;

  try {
    const response = await axios.get(url, { timeout: 10000 });
    
    if (response.data.code !== 0) {
      throw new Error(`API Error: ${response.data.message || 'Unknown error'}`);
    }

    if (!response.data.data || response.data.data.length === 0) {
      throw new Error('No route found for this swap');
    }

    return response.data.data[0]; // Best route
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
    const { fromSymbol, toSymbol, amount, network } = parseArgs();

    console.error(`🔍 Getting quote for ${amount} ${fromSymbol} → ${toSymbol} on ${network}...`);
    console.error('');

    // Get token addresses and decimals
    const fromToken = getTokenAddress(fromSymbol, network);
    const toToken = getTokenAddress(toSymbol, network);
    const fromDecimals = getTokenDecimals(fromSymbol, network);
    const toDecimals = getTokenDecimals(toSymbol, network);

    // API expects amountIn as integer WITHOUT decimals
    // Convert decimal input to integer (e.g., "0.1" -> "0", "10.5" -> "10")
    // For proper precision, we should multiply by token decimals first
    const amountInInteger = Math.floor(parseFloat(amount) * Math.pow(10, fromDecimals)).toString();

    // Get quote
    const quote = await getQuote(fromToken, toToken, amountInInteger, network);

    // Format output with correct decimals
    // API returns amountOut also WITHOUT decimals (e.g., "5.577799")
    const amountOut = quote.amountOut;
    const priceImpact = parseFloat(quote.impact || 0);

    // Build route symbols
    const routeSymbols = quote.tokens.map(addr => {
      // Find token by address in the network tokens object
      for (const [symbol, tokenData] of Object.entries(tokens[network])) {
        if (tokenData.address === addr) {
          return symbol;
        }
      }
      return addr.substring(0, 8) + '...';
    });

    // Build result
    const result = {
      fromToken: fromSymbol,
      toToken: toSymbol,
      amountIn: amount,
      amountOut: amountOut,
      priceImpact: `${priceImpact.toFixed(2)}%`,
      route: routeSymbols,
      gasEstimate: '25-50 TRX',
      network: network,
      _rawQuote: quote // Include raw quote for swap.js
    };

    // Output JSON to stdout
    console.log(JSON.stringify(result, null, 2));

    // Output summary to stderr
    console.error('');
    console.error('✅ Quote received:');
    console.error(`   ${amount} ${fromSymbol} → ${amountOut} ${toSymbol}`);
    console.error(`   Price Impact: ${result.priceImpact}`);
    console.error(`   Route: ${result.route.join(' → ')}`);
    console.error('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getQuote, formatAmount, formatOutput };
