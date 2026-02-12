#!/usr/bin/env node

/**
 * SunSwap Quote Script
 * 
 * Get price quote for token swap
 * Usage: node quote.js <FROM> <TO> <AMOUNT> [--network nile|mainnet]
 * 
 * Examples:
 *   node quote.js TRX USDT 100
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
    console.error('Examples:');
    console.error('  node quote.js TRX USDT 100');
    console.error('  node quote.js USDT TRX 50 --network mainnet');
    process.exit(1);
  }

  const fromSymbol = args[0].toUpperCase();
  const toSymbol = args[1].toUpperCase();
  const amount = args[2];
  
  const networkIndex = args.indexOf('--network');
  const network = networkIndex !== -1 ? args[networkIndex + 1] : 'nile';

  return { fromSymbol, toSymbol, amount, network };
}

function getTokenAddress(symbol, network) {
  const networkTokens = tokens[network];
  if (!networkTokens) {
    throw new Error(`Unknown network: ${network}`);
  }

  const token = networkTokens[symbol];
  if (!token) {
    throw new Error(`Unknown token: ${symbol} on ${network}`);
  }

  return token.address;
}

function getTokenDecimals(symbol, network) {
  const networkTokens = tokens[network];
  if (!networkTokens) {
    throw new Error(`Unknown network: ${network}`);
  }

  const token = networkTokens[symbol];
  if (!token) {
    throw new Error(`Unknown token: ${symbol} on ${network}`);
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

    // Format amount with correct decimals
    const amountIn = formatAmount(amount, fromDecimals);

    // Get quote
    const quote = await getQuote(fromToken, toToken, amountIn, network);

    // Format output with correct decimals
    const amountOut = formatOutput(quote.amountOut, toDecimals);
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
