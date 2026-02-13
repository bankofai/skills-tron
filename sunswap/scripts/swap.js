#!/usr/bin/env node

/**
 * SunSwap Swap Script
 * 
 * Execute token swap with automatic approval handling
 * Usage: node swap.js <FROM> <TO> <AMOUNT> [OPTIONS]
 * 
 * FROM/TO can be either:
 *   - Token symbol (USDT, TRX, USDC, etc.)
 *   - Token contract address (T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb)
 * 
 * Options:
 *   --network <nile|mainnet>    Network to use (default: nile)
 *   --slippage <0.5>            Slippage tolerance in % (default: 0.5)
 *   --recipient <address>       Recipient address (default: your wallet)
 *   --execute                   Execute the swap (without this, dry-run only)
 *   --check-only                Only check balance and allowance
 *   --approve-only              Only approve token (if needed)
 *   --swap-only                 Only execute swap (assumes already approved)
 * 
 * Examples:
 *   # Using token symbols
 *   node swap.js TRX USDT 100 --execute
 * 
 *   # Using token addresses
 *   node swap.js T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj 100 --execute
 * 
 *   # Mixed: symbol and address
 *   node swap.js USDT TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj 50 --execute
 * 
 *   # Check balance and allowance only
 *   node swap.js USDT TRX 50 --check-only
 */

const { TronWeb } = require('tronweb');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const { getPrivateKeyOrExit, sleep } = require('./utils');

// Load resources
const tokensPath = path.join(__dirname, '../resources/common_tokens.json');
const contractsPath = path.join(__dirname, '../resources/sunswap_contracts.json');
const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
const contracts = JSON.parse(fs.readFileSync(contractsPath, 'utf8'));

// Import quote functions
const { getQuote, formatAmount, formatOutput } = require('./quote.js');

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

// Standard TRC20 ABI
const TRC20_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "who", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  }
];

const SWAP_ABI = [{
  "inputs": [
    { "name": "path", "type": "address[]" },
    { "name": "poolVersion", "type": "string[]" },
    { "name": "versionLen", "type": "uint256[]" },
    { "name": "fees", "type": "uint24[]" },
    {
      "components": [
        { "name": "amountIn", "type": "uint256" },
        { "name": "amountOutMin", "type": "uint256" },
        { "name": "to", "type": "address" },
        { "name": "deadline", "type": "uint256" }
      ],
      "name": "data",
      "type": "tuple"
    }
  ],
  "name": "swapExactInput",
  "outputs": [{ "name": "amountsOut", "type": "uint256[]" }],
  "stateMutability": "payable",
  "type": "function"
}];

const TRX_ADDRESS = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb';
const MAX_UINT256 = '1461501637330902918203684832716283019655932542975';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: node swap.js <FROM> <TO> <AMOUNT> [OPTIONS]');
    console.error('');
    console.error('FROM/TO can be token symbol (USDT, TRX) or address (T9yD...)');
    console.error('');
    console.error('Options:');
    console.error('  --network <nile|mainnet>    Network (default: nile)');
    console.error('  --slippage <0.5>            Slippage % (default: 0.5)');
    console.error('  --recipient <address>       Recipient (default: your wallet)');
    console.error('  --execute                   Execute the swap');
    console.error('  --check-only                Only check balance/allowance');
    console.error('  --approve-only              Only approve token');
    console.error('  --swap-only                 Only execute swap');
    process.exit(1);
  }

  // Don't convert to uppercase if it's an address (starts with T and length 34)
  const fromSymbol = (args[0].startsWith('T') && args[0].length === 34) ? args[0] : args[0].toUpperCase();
  const toSymbol = (args[1].startsWith('T') && args[1].length === 34) ? args[1] : args[1].toUpperCase();
  const amount = args[2];
  
  let network = 'nile';
  let slippage = 0.5;
  let recipient = null;
  let execute = false;
  let checkOnly = false;
  let approveOnly = false;
  let swapOnly = false;

  for (let i = 3; i < args.length; i++) {
    if (args[i] === '--network' && i + 1 < args.length) {
      network = args[++i];
    } else if (args[i] === '--slippage' && i + 1 < args.length) {
      slippage = parseFloat(args[++i]);
    } else if (args[i] === '--recipient' && i + 1 < args.length) {
      recipient = args[++i];
    } else if (args[i] === '--execute') {
      execute = true;
    } else if (args[i] === '--check-only') {
      checkOnly = true;
    } else if (args[i] === '--approve-only') {
      approveOnly = true;
    } else if (args[i] === '--swap-only') {
      swapOnly = true;
    }
  }

  return { fromSymbol, toSymbol, amount, network, slippage, recipient, execute, checkOnly, approveOnly, swapOnly };
}

function getTokenInfo(symbolOrAddress, network) {
  const networkTokens = tokens[network];
  if (!networkTokens) {
    throw new Error(`Unknown network: ${network}`);
  }

  // Check if it's an address (starts with T and is 34 characters)
  if (symbolOrAddress.startsWith('T') && symbolOrAddress.length === 34) {
    // Check if it's an address - try to find it in the token list
    for (const [key, token] of Object.entries(networkTokens)) {
      if (token.address === symbolOrAddress) {
        return token;
      }
    }
    
    // Address not found in list - return a generic token object
    console.error(`⚠️  Token address ${symbolOrAddress} not in common list, using generic info`);
    return {
      symbol: 'UNKNOWN',
      address: symbolOrAddress,
      decimals: 6 // Default to 6 decimals
    };
  }

  // It's a symbol
  const token = networkTokens[symbolOrAddress];
  if (!token) {
    throw new Error(`Unknown token: ${symbolOrAddress} on ${network}`);
  }

  return token;
}

async function checkBalance(tronWeb, tokenAddress, walletAddress, requiredAmount) {
  if (tokenAddress === TRX_ADDRESS) {
    // Native TRX
    const balance = await tronWeb.trx.getBalance(walletAddress);
    const balanceTRX = balance / 1e6;
    const requiredTRX = parseFloat(requiredAmount) / 1e6;
    
    return {
      balance: balance.toString(),
      balanceFormatted: balanceTRX.toFixed(6),
      required: requiredAmount,
      requiredFormatted: requiredTRX.toFixed(6),
      sufficient: balance >= BigInt(requiredAmount)
    };
  } else {
    // TRC20 token
    const contract = await tronWeb.contract(TRC20_ABI, tokenAddress);
    const balance = await contract.balanceOf(walletAddress).call();
    const balanceNum = BigInt(balance.toString());
    const requiredNum = BigInt(requiredAmount);
    
    return {
      balance: balance.toString(),
      balanceFormatted: formatOutput(balance.toString()),
      required: requiredAmount,
      requiredFormatted: formatOutput(requiredAmount),
      sufficient: balanceNum >= requiredNum
    };
  }
}

async function checkAllowance(tronWeb, tokenAddress, walletAddress, spenderAddress, requiredAmount) {
  if (tokenAddress === TRX_ADDRESS) {
    // Native TRX doesn't need approval
    return {
      allowance: 'N/A',
      required: 'N/A',
      needsApproval: false
    };
  }

  const contract = await tronWeb.contract(TRC20_ABI, tokenAddress);
  const allowance = await contract.allowance(walletAddress, spenderAddress).call();
  const allowanceNum = BigInt(allowance.toString());
  const requiredNum = BigInt(requiredAmount);

  return {
    allowance: allowance.toString(),
    allowanceFormatted: formatOutput(allowance.toString()),
    required: requiredAmount,
    requiredFormatted: formatOutput(requiredAmount),
    needsApproval: allowanceNum < requiredNum
  };
}

async function approveToken(tronWeb, tokenAddress, spenderAddress, amount = MAX_UINT256) {
  console.error('📝 Approving token...');
  
  const contract = await tronWeb.contract(TRC20_ABI, tokenAddress);
  const tx = await contract.approve(spenderAddress, amount).send({
    feeLimit: 100_000_000 // 100 TRX
  });

  console.error(`✅ Approval transaction sent: ${tx}`);
  console.error('⏳ Waiting for confirmation (15 seconds)...');
  
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  return tx;
}

function buildSwapParams(quote, recipient, network, slippage, amountInRaw, toTokenDecimals) {
  const { tokens: path, poolVersions, poolFees, amountOut } = quote;

  // Use the amountInRaw we passed to the API (already in correct Sun format)
  const amountInStr = amountInRaw;
  
  // Convert formatted amountOut back to raw format
  // amountOut from API is formatted (e.g., "0.653094"), need to convert to Sun
  let amountOutStr;
  if (typeof amountOut === 'string' && amountOut.includes('.')) {
    // Convert decimal string to raw integer (multiply by 10^decimals)
    const amountOutNum = parseFloat(amountOut);
    amountOutStr = BigInt(Math.floor(amountOutNum * Math.pow(10, toTokenDecimals))).toString();
  } else if (typeof amountOut === 'string') {
    // Already raw format
    amountOutStr = amountOut;
  } else {
    // Number type
    amountOutStr = BigInt(Math.floor(amountOut * Math.pow(10, toTokenDecimals))).toString();
  }

  // Merge consecutive versions
  const mergedVersions = [];
  const versionLen = [];

  if (poolVersions.length > 0) {
    let currentVer = poolVersions[0];
    let poolCount = 1;

    for (let i = 1; i < poolVersions.length; i++) {
      if (poolVersions[i] === currentVer) {
        poolCount++;
      } else {
        mergedVersions.push(currentVer);
        versionLen.push(poolCount + 1);
        currentVer = poolVersions[i];
        poolCount = 1;
      }
    }
    mergedVersions.push(currentVer);
    versionLen.push(poolCount + 1);

    if (mergedVersions.length === 1) {
      versionLen[0] = path.length;
    } else {
      for (let i = 1; i < versionLen.length; i++) {
        versionLen[i] = versionLen[i] - 1;
      }
    }
  }

  const fees = poolFees.map(f => parseInt(f));
  
  // Calculate min output with slippage
  const slippageRatio = slippage / 100;
  const amountOutNum = BigInt(amountOutStr);
  const minOutSun = (amountOutNum * BigInt(Math.floor((1 - slippageRatio) * 10000)) / BigInt(10000)).toString();
  
  const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes

  const dataTuple = [
    amountInStr,
    minOutSun,
    recipient,
    deadline.toString()
  ];

  const routerAddress = contracts[network].smartRouter.address;
  const isTRXInput = path[0] === TRX_ADDRESS;

  return {
    routerAddress,
    path,
    mergedVersions,
    versionLen,
    fees,
    dataTuple,
    isTRXInput,
    value: isTRXInput ? amountInStr : '0'
  };
}

async function executeSwap(tronWeb, swapParams) {
  console.error('🔄 Executing swap...');
  
  const contract = await tronWeb.contract(SWAP_ABI, swapParams.routerAddress);
  
  const txOptions = {
    feeLimit: 1_000_000_000 // 1000 TRX max
  };

  if (swapParams.isTRXInput) {
    txOptions.callValue = swapParams.value;
  }

  const tx = await contract.swapExactInput(
    swapParams.path,
    swapParams.mergedVersions,
    swapParams.versionLen,
    swapParams.fees,
    swapParams.dataTuple
  ).send(txOptions);

  console.error(`✅ Swap transaction sent: ${tx}`);
  
  return tx;
}

async function main() {
  try {
    const options = parseArgs();
    const { fromSymbol, toSymbol, amount, network, slippage, execute, checkOnly, approveOnly, swapOnly } = options;
    let { recipient } = options;

    console.error(`🦞 SunSwap: ${amount} ${fromSymbol} → ${toSymbol} on ${network}`);
    console.error('');

    // Initialize TronWeb
    const privateKey = getPrivateKeyOrExit();
    const endpoint = TRON_ENDPOINTS[network];
    
    const tronWeb = new TronWeb({
      fullHost: endpoint.fullHost,
      headers: endpoint.apiKey ? { 'TRON-PRO-API-KEY': endpoint.apiKey } : {},
      privateKey: privateKey
    });

    const walletAddress = tronWeb.defaultAddress.base58;
    recipient = recipient || walletAddress;

    console.error(`💼 Wallet: ${walletAddress}`);
    console.error(`📍 Recipient: ${recipient}`);
    console.error('');

    // Get token info
    const fromToken = getTokenInfo(fromSymbol, network);
    const toToken = getTokenInfo(toSymbol, network);
    const routerAddress = contracts[network].smartRouter.address;

    // Format amount
    const amountInRaw = formatAmount(amount, fromToken.decimals || 6);

    // Step 1: Check balances
    console.error('📊 Step 1: Checking balances...');
    
    const trxBalance = await checkBalance(tronWeb, TRX_ADDRESS, walletAddress, '100000000'); // 100 TRX
    console.error(`   TRX: ${trxBalance.balanceFormatted} TRX ${trxBalance.sufficient ? '✅' : '⚠️  (need 100+ for gas)'}`);
    
    const tokenBalance = await checkBalance(tronWeb, fromToken.address, walletAddress, amountInRaw);
    console.error(`   ${fromSymbol}: ${tokenBalance.balanceFormatted} ${tokenBalance.sufficient ? '✅' : '❌ INSUFFICIENT'}`);
    
    if (!tokenBalance.sufficient) {
      throw new Error(`Insufficient ${fromSymbol} balance. Have: ${tokenBalance.balanceFormatted}, Need: ${tokenBalance.requiredFormatted}`);
    }

    // Step 2: Check allowance (if TRC20)
    let needsApproval = false;
    if (fromToken.address !== TRX_ADDRESS) {
      console.error('');
      console.error('🔐 Step 2: Checking allowance...');
      
      const allowanceCheck = await checkAllowance(tronWeb, fromToken.address, walletAddress, routerAddress, amountInRaw);
      
      if (allowanceCheck.needsApproval) {
        console.error(`   Current: ${allowanceCheck.allowanceFormatted} ${fromSymbol}`);
        console.error(`   Required: ${allowanceCheck.requiredFormatted} ${fromSymbol}`);
        console.error(`   Status: ❌ NEEDS APPROVAL`);
        needsApproval = true;
      } else {
        console.error(`   Allowance: ${allowanceCheck.allowanceFormatted} ${fromSymbol} ✅`);
      }
    } else {
      console.error('');
      console.error('🔐 Step 2: Allowance check skipped (TRX is native token)');
    }

    if (checkOnly) {
      console.error('');
      console.error('✅ Check complete (--check-only mode)');
      
      const result = {
        wallet: walletAddress,
        balances: {
          trx: trxBalance.balanceFormatted,
          [fromSymbol.toLowerCase()]: tokenBalance.balanceFormatted
        },
        needsApproval: needsApproval,
        readyToSwap: !needsApproval
      };
      
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    // Step 3: Approve if needed
    if (needsApproval && !swapOnly) {
      console.error('');
      console.error('📝 Step 3: Token approval required');
      
      if (!execute) {
        console.error('   ⚠️  DRY RUN: Would approve token (use --execute to approve)');
      } else {
        const approveTx = await approveToken(tronWeb, fromToken.address, routerAddress);
        console.error(`   ✅ Approved: ${approveTx}`);
      }

      if (approveOnly) {
        console.error('');
        console.error('✅ Approval complete (--approve-only mode)');
        
        const result = {
          approved: execute,
          transaction: execute ? approveTx : null
        };
        
        console.log(JSON.stringify(result, null, 2));
        return;
      }
    }

    // Step 4: Get quote
    console.error('');
    console.error('💱 Step 4: Getting price quote...');
    
    const quote = await getQuote(fromToken.address, toToken.address, amountInRaw, network);
    const amountOut = formatOutput(quote.amountOut, toToken.decimals || 6);
    
    console.error(`   Quote: ${amount} ${fromSymbol} → ${amountOut} ${toSymbol}`);
    console.error(`   Price Impact: ${quote.priceImpact || '0'}%`);

    // Step 5: Execute swap
    console.error('');
    console.error('🔄 Step 5: Executing swap...');
    
    if (!execute) {
      console.error('   ⚠️  DRY RUN: Would execute swap (use --execute to swap)');
      console.error('');
      console.error('📋 Summary:');
      console.error(`   From: ${amount} ${fromSymbol}`);
      console.error(`   To: ~${amountOut} ${toSymbol}`);
      console.error(`   Slippage: ${slippage}%`);
      console.error(`   Recipient: ${recipient}`);
      
      const result = {
        dryRun: true,
        from: { token: fromSymbol, amount: amount },
        to: { token: toSymbol, amount: amountOut },
        slippage: `${slippage}%`,
        recipient: recipient,
        needsApproval: needsApproval
      };
      
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    const swapParams = buildSwapParams(quote, recipient, network, slippage, amountInRaw, toToken.decimals || 6);
    const swapTx = await executeSwap(tronWeb, swapParams);
    
    console.error('');
    console.error('✅ Swap completed successfully!');
    console.error(`   Transaction: ${swapTx}`);
    console.error(`   Explorer: https://${network === 'mainnet' ? '' : 'nile.'}tronscan.org/#/transaction/${swapTx}`);
    
    const result = {
      success: true,
      transaction: swapTx,
      from: { token: fromSymbol, amount: amount },
      to: { token: toSymbol, amount: amountOut },
      explorer: `https://${network === 'mainnet' ? '' : 'nile.'}tronscan.org/#/transaction/${swapTx}`
    };
    
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('');
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkBalance, checkAllowance, approveToken, executeSwap };
