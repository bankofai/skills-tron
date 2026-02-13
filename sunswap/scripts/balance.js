#!/usr/bin/env node

/**
 * SunSwap Balance Checker
 * 
 * Check token balances for configured wallet
 * Usage: node balance.js [TOKEN] [--network nile|mainnet]
 * 
 * TOKEN can be either:
 *   - Token symbol (USDT, TRX, USDC, etc.)
 *   - Token contract address (T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb)
 * 
 * Examples:
 *   node balance.js                    # Check all tokens
 *   node balance.js TRX                # Check TRX balance only
 *   node balance.js TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj  # Check by address
 *   node balance.js USDT --network mainnet
 */

const { TronWeb } = require('tronweb');
const path = require('path');
const fs = require('fs');
const { getPrivateKeyOrExit } = require('./utils');

// Load token addresses
const tokensPath = path.join(__dirname, '../resources/common_tokens.json');
const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

// TronGrid endpoints
const TRON_ENDPOINTS = {
  mainnet: {
    fullHost: 'https://api.trongrid.io',
    apiKey: process.env.TRONGRID_API_KEY || ''
  },
  nile: {
    fullHost: 'https://nile.trongrid.io',
    apiKey: ''
  }
};

function parseArgs() {
  const args = process.argv.slice(2);
  
  let tokenSymbol = null;
  let network = 'nile';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--network' && i + 1 < args.length) {
      network = args[i + 1];
      i++;
    } else if (!tokenSymbol) {
      // Don't convert to uppercase if it's an address (starts with T and length 34)
      tokenSymbol = (args[i].startsWith('T') && args[i].length === 34) ? args[i] : args[i].toUpperCase();
    }
  }

  return { tokenSymbol, network };
}

async function getTRXBalance(tronWeb, address) {
  const balance = await tronWeb.trx.getBalance(address);
  return (balance / 1e6).toFixed(6); // Convert from Sun to TRX
}

async function getTRC20Balance(tronWeb, tokenAddress, walletAddress) {
  try {
    const contract = await tronWeb.contract().at(tokenAddress);
    const balance = await contract.balanceOf(walletAddress).call();
    return balance.toString();
  } catch (error) {
    return '0';
  }
}

function formatBalance(rawBalance, decimals = 6) {
  const num = parseFloat(rawBalance) / Math.pow(10, decimals);
  return num.toFixed(6);
}

async function main() {
  try {
    const { tokenSymbol, network } = parseArgs();

    // Initialize TronWeb
    const privateKey = getPrivateKeyOrExit();
    const endpoint = TRON_ENDPOINTS[network];
    
    const tronWeb = new TronWeb({
      fullHost: endpoint.fullHost,
      headers: endpoint.apiKey ? { 'TRON-PRO-API-KEY': endpoint.apiKey } : {},
      privateKey: privateKey
    });

    const walletAddress = tronWeb.defaultAddress.base58;

    console.error(`💰 Checking balances for ${walletAddress} on ${network}...`);
    console.error('');

    const networkTokens = tokens[network];
    if (!networkTokens) {
      throw new Error(`Unknown network: ${network}`);
    }

    const balances = [];

    // Filter tokens if specific token requested
    let tokensToCheck;
    
    if (tokenSymbol) {
      // Check if it's an address (starts with T and is 34 characters)
      if (tokenSymbol.startsWith('T') && tokenSymbol.length === 34) {
        // It's an address - try to find it in the token list
        let found = false;
        for (const [symbol, data] of Object.entries(networkTokens)) {
          if (data.address === tokenSymbol) {
            tokensToCheck = [{ symbol, ...data }];
            found = true;
            break;
          }
        }
        
        if (!found) {
          // Address not in list - create generic token entry
          console.error(`⚠️  Token address ${tokenSymbol} not in common list, using generic info`);
          tokensToCheck = [{
            symbol: 'UNKNOWN',
            address: tokenSymbol,
            decimals: 6
          }];
        }
      } else {
        // It's a symbol
        if (networkTokens[tokenSymbol]) {
          tokensToCheck = [{ symbol: tokenSymbol, ...networkTokens[tokenSymbol] }];
        } else {
          tokensToCheck = [];
        }
      }
    } else {
      // No specific token - check all
      tokensToCheck = Object.entries(networkTokens).map(([symbol, data]) => ({ symbol, ...data }));
    }

    if (tokensToCheck.length === 0) {
      throw new Error(`Token ${tokenSymbol} not found on ${network}`);
    }

    // Check balances
    for (const token of tokensToCheck) {
      let balance;
      
      if (token.symbol === 'TRX') {
        balance = await getTRXBalance(tronWeb, walletAddress);
      } else {
        const rawBalance = await getTRC20Balance(tronWeb, token.address, walletAddress);
        balance = formatBalance(rawBalance, token.decimals || 6);
      }

      balances.push({
        symbol: token.symbol,
        balance: balance,
        address: token.address
      });

      console.error(`  ${token.symbol.padEnd(8)} ${balance.padStart(15)}`);
    }

    console.error('');

    // Output JSON to stdout
    const result = {
      wallet: walletAddress,
      network: network,
      balances: balances
    };

    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getTRXBalance, getTRC20Balance, formatBalance };
