# Complete Swap Example: 1 TRX → USDJ on Nile

This is a real, working example showing the complete workflow from start to finish.

---

## Prerequisites

- Wallet: `TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH`
- Network: Nile Testnet
- TRX Balance: 8926 TRX (sufficient for gas)

---

## Step 1: Get Price Quote

### Command
```bash
curl -s 'https://tnrouter.endjgfsv.link/swap/router?fromToken=T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb&toToken=TLBaRhANQoJFTqre9Nf1mjuwNWjCJeYqUL&amountIn=1000000&typeList=PSM,CURVE,CURVE_COMBINATION,WTRX,SUNSWAP_V1,SUNSWAP_V2,SUNSWAP_V3' | jq .
```

### Response
```json
{
  "code": 0,
  "message": "SUCCESS",
  "data": [
    {
      "amountIn": "1.000000",
      "amountOut": "0.323547447256963200",
      "inUsd": "0.277150807640000000000000",
      "outUsd": "0.139273531280573200756391400277104000",
      "impact": "-0.005615",
      "fee": "0.006090",
      "tokens": [
        "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb",
        "TQz9i4JygMCzizdVu8NE4BdqesrsHv1L93",
        "TWrZRHY9aKQZcyjpovdH6qeCEyYZrRQDZt",
        "TLBaRhANQoJFTqre9Nf1mjuwNWjCJeYqUL"
      ],
      "symbols": [
        "TRX",
        "ETH",
        "SUN",
        "USDJ"
      ],
      "poolFees": [
        "0",
        "0",
        "100",
        "0"
      ],
      "poolVersions": [
        "v1",
        "v2",
        "v3"
      ],
      "stepAmountsOut": [
        "75.392631167102103036",
        "0.064969264137640692",
        "0.323547447256963200"
      ]
    }
  ]
}
```

### Analysis
- ✅ `code == 0` - Success
- ✅ Best route: TRX → ETH → SUN → USDJ
- ✅ Expected output: 0.323547 USDJ
- ✅ Price impact: -0.56% (acceptable)
- ✅ Fee: 0.61%

---

## Step 2: Convert Parameters

### Extract Quote Data
```json
{
  "amountIn": "1.000000",
  "amountOut": "0.323547447256963200",
  "tokens": [
    "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb",
    "TQz9i4JygMCzizdVu8NE4BdqesrsHv1L93",
    "TWrZRHY9aKQZcyjpovdH6qeCEyYZrRQDZt",
    "TLBaRhANQoJFTqre9Nf1mjuwNWjCJeYqUL"
  ],
  "poolVersions": ["v1", "v2", "v3"],
  "poolFees": ["0", "0", "100", "0"]
}
```

### Run Formatter Script
```bash
node skills/sunswap/scripts/format_swap_params.js \
  '{"amountIn":"1.000000","amountOut":"0.323547447256963200","tokens":["T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb","TQz9i4JygMCzizdVu8NE4BdqesrsHv1L93","TWrZRHY9aKQZcyjpovdH6qeCEyYZrRQDZt","TLBaRhANQoJFTqre9Nf1mjuwNWjCJeYqUL"],"poolVersions":["v1","v2","v3"],"poolFees":["0","0","100","0"]}' \
  'TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH' \
  'nile' \
  0.10
```

### Script Output
```json
{
  "contractAddress": "TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3",
  "functionName": "swapExactInput",
  "args": [
    [
      "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb",
      "TQz9i4JygMCzizdVu8NE4BdqesrsHv1L93",
      "TWrZRHY9aKQZcyjpovdH6qeCEyYZrRQDZt",
      "TLBaRhANQoJFTqre9Nf1mjuwNWjCJeYqUL"
    ],
    ["v1", "v2", "v3"],
    [2, 1, 1],
    [0, 0, 100, 0],
    [
      "1000000",
      "291192",
      "TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH",
      "1770542025"
    ]
  ],
  "network": "nile",
  "abi": [...],
  "value": "1000000"
}
```

### Validation
```
✓ Validation passed
  pathLength: 4
  versionLenSum: 4
  feesLength: 4
  isTRXInput: true
  slippage: 10.0%
```

---

## Step 3: Execute Swap

### MCP Tool Call
```javascript
mcp_mcp_server_tron_write_contract({
  "abi": [{"inputs": [{"name": "path", "type": "address[]"}, {"name": "poolVersion", "type": "string[]"}, {"name": "versionLen", "type": "uint256[]"}, {"name": "fees", "type": "uint24[]"}, {"components": [{"name": "amountIn", "type": "uint256"}, {"name": "amountOutMin", "type": "uint256"}, {"name": "to", "type": "address"}, {"name": "deadline", "type": "uint256"}], "name": "data", "type": "tuple"}], "name": "swapExactInput", "outputs": [{"name": "amountsOut", "type": "uint256[]"}], "stateMutability": "payable", "type": "function"}],
  "args": [
    ["T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb", "TQz9i4JygMCzizdVu8NE4BdqesrsHv1L93", "TWrZRHY9aKQZcyjpovdH6qeCEyYZrRQDZt", "TLBaRhANQoJFTqre9Nf1mjuwNWjCJeYqUL"],
    ["v1", "v2", "v3"],
    [2, 1, 1],
    [0, 0, 100, 0],
    ["1000000", "291192", "TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH", "1770542025"]
  ],
  "contractAddress": "TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3",
  "functionName": "swapExactInput",
  "network": "nile",
  "value": "1000000"
})
```

### Response
```json
{
  "network": "nile",
  "contractAddress": "TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3",
  "function": "swapExactInput",
  "from": "TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH",
  "txHash": "136e7712058158268c2f819d160390cfcccaf8c9886bfa11ff3f8ac614b1e629",
  "message": "Transaction sent. Use get_transaction_info to check confirmation."
}
```

### Verify Transaction
```bash
# View on TronScan
https://nile.tronscan.org/#/transaction/136e7712058158268c2f819d160390cfcccaf8c9886bfa11ff3f8ac614b1e629
```

---

## Result Summary

✅ **Swap Successful!**

- **Input**: 1 TRX
- **Output**: ~0.323 USDJ (actual amount may vary slightly)
- **Route**: TRX → ETH → SUN → USDJ
- **Slippage**: 10% protection (minimum 0.291 USDJ)
- **Gas Used**: ~30 TRX
- **Transaction**: `136e7712...`

---

## Key Takeaways

1. **Always use the API** - Don't try to construct parameters manually
2. **Use the formatter script** - It handles complex version merging logic
3. **Set appropriate slippage** - 10% for testnet, 0.5-2% for mainnet
4. **Verify token addresses** - TRX vs WTRX matters!
5. **Check gas balance** - Keep at least 100 TRX for operations

---

## Common Mistakes to Avoid

❌ Using `tokenIn`/`tokenOut` instead of `fromToken`/`toToken`
❌ Forgetting the `typeList` parameter
❌ Manually constructing swap parameters
❌ Using WTRX address when user said TRX
❌ Not checking gas balance before swap
