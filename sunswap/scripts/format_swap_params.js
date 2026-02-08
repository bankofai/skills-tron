#!/usr/bin/env node

/**
 * SunSwap Smart Router Parameter Formatter
 * 
 * Converts API quote response into MCP-ready write_contract parameters
 * Usage: node format_swap_params.js '<quote_json>' '<recipient>' '<network>' [slippage]
 */

const ROUTER_ADDRESSES = {
  mainnet: 'TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax',
  nile: 'TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3'
};

const SWAP_EXACT_INPUT_ABI = [{
  "inputs": [
    {"name": "path", "type": "address[]"},
    {"name": "poolVersion", "type": "string[]"},
    {"name": "versionLen", "type": "uint256[]"},
    {"name": "fees", "type": "uint24[]"},
    {
      "components": [
        {"name": "amountIn", "type": "uint256"},
        {"name": "amountOutMin", "type": "uint256"},
        {"name": "to", "type": "address"},
        {"name": "deadline", "type": "uint256"}
      ],
      "name": "data",
      "type": "tuple"
    }
  ],
  "name": "swapExactInput",
  "outputs": [{"name": "amountsOut", "type": "uint256[]"}],
  "stateMutability": "payable",
  "type": "function"
}];

const TRX_ADDRESS = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb';

function formatSwapParams(quoteData, recipient, network = 'nile', slippage = 0.20) {
  const { tokens: path, poolVersions, poolFees, amountIn, amountOut } = quoteData;

  // 1. Merge consecutive versions and calculate versionLen
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

  // 2. Fees: Keep ALL elements
  const fees = poolFees.map(f => parseInt(f));

  // 3. Amount Conversion
  const amountInSun = amountIn.includes('.') 
    ? BigInt(Math.floor(parseFloat(amountIn) * 1e6)).toString()
    : amountIn;
  
  const amountOutNum = parseFloat(amountOut);
  const minOutSun = BigInt(Math.floor(amountOutNum * (1 - slippage) * 1e6)).toString();

  // 4. Generate deadline (current time + 5 minutes)
  const deadline = Math.floor(Date.now() / 1000) + 300;

  const dataTuple = [
      amountInSun,
      minOutSun,
      recipient,
      deadline.toString()
  ];

  // 5. Validation
  const sumVersionLen = versionLen.reduce((a, b) => a + b, 0);
  if (sumVersionLen !== path.length) {
    throw new Error(`versionLen sum (${sumVersionLen}) != path.length (${path.length})`);
  }
  if (fees.length !== path.length) {
    throw new Error(`fees.length (${fees.length}) != path.length (${path.length})`);
  }

  // 6. Check if input is TRX (native)
  const isTRXInput = path[0] === TRX_ADDRESS;
  const value = isTRXInput ? amountInSun : undefined;

  // 7. Build MCP write_contract parameters
  const mcpParams = {
    contractAddress: ROUTER_ADDRESSES[network],
    functionName: "swapExactInput",
    args: [
      path,
      mergedVersions,
      versionLen,
      fees,
      dataTuple
    ],
    network: network
  };

  // Only include ABI for nile testnet (required)
  if (network === 'nile') {
    mcpParams.abi = SWAP_EXACT_INPUT_ABI;
  }

  if (value) {
    mcpParams.value = value;
  }

  return {
    mcpParams,
    validation: {
      pathLength: path.length,
      versionLenSum: sumVersionLen,
      feesLength: fees.length,
      valid: sumVersionLen === path.length && fees.length === path.length,
      isTRXInput,
      slippage: `${(slippage * 100).toFixed(1)}%`
    }
  };
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: node format_swap_params.js \'<quote_json>\' \'<recipient>\' \'<network>\' [slippage]');
    console.error('');
    console.error('Arguments:');
    console.error('  quote_json  - API response data[0] object');
    console.error('  recipient   - Wallet address (e.g., TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH)');
    console.error('  network     - mainnet or nile');
    console.error('  slippage    - Optional, default 0.20 (20%)');
    console.error('');
    console.error('Example:');
    console.error('  node format_swap_params.js \\');
    console.error('    \'{"tokens":["T9yD..."],"poolVersions":["v1","v3"],...}\' \\');
    console.error('    \'TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH\' \\');
    console.error('    \'nile\' \\');
    console.error('    0.05');
    process.exit(1);
  }

  try {
    const quoteData = JSON.parse(args[0]);
    const recipient = args[1];
    const network = args[2];
    const slippage = args[3] ? parseFloat(args[3]) : 0.20;
    
    // Validate slippage
    if (slippage < 0 || slippage >= 1) {
      console.error(`Error: Invalid slippage ${slippage}. Must be between 0 and 1 (e.g., 0.05 for 5%)`);
      process.exit(1);
    }

    const result = formatSwapParams(quoteData, recipient, network, slippage);
    
    // Output MCP params to stdout (clean JSON)
    console.log(JSON.stringify(result.mcpParams, null, 2));
    
    // Output validation to stderr (for debugging)
    if (result.validation.valid) {
      console.error('✓ Validation passed');
      console.error(`  pathLength: ${result.validation.pathLength}`);
      console.error(`  versionLenSum: ${result.validation.versionLenSum}`);
      console.error(`  feesLength: ${result.validation.feesLength}`);
      console.error(`  isTRXInput: ${result.validation.isTRXInput}`);
      console.error(`  slippage: ${result.validation.slippage}`);
      console.error('');
      console.error('📋 Ready to use with MCP:');
      console.error('   Copy the JSON above and pass to mcp_mcp_server_tron_write_contract');
    } else {
      console.error('✗ Validation failed:', JSON.stringify(result.validation, null, 2));
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

module.exports = { formatSwapParams };
