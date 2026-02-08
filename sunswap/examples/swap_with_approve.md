# Complete Swap Example with Approve: 10 USDT → TRX on Nile

This example shows the complete workflow when swapping a TRC20 token (USDT) that requires approval.

---

## Prerequisites

- Wallet: `TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH`
- Network: Nile Testnet
- USDT Balance: 100 USDT (sufficient for swap)
- TRX Balance: 100 TRX (sufficient for gas)

---

## Step 1: Get Price Quote

### Command
```bash
curl -s 'https://tnrouter.endjgfsv.link/swap/router?fromToken=TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf&toToken=T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb&amountIn=10000000&typeList=PSM,CURVE,CURVE_COMBINATION,WTRX,SUNSWAP_V1,SUNSWAP_V2,SUNSWAP_V3' | jq .
```

**Note**: 
- `fromToken`: USDT on Nile (`TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf`)
- `toToken`: TRX (`T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb`)
- `amountIn`: 10 USDT = 10,000,000 (6 decimals)

### Response
```json
{
  "code": 0,
  "message": "SUCCESS",
  "data": [
    {
      "amountIn": "10.000000",
      "amountOut": "48.523456",
      "tokens": [
        "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf",
        "TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a"
      ],
      "symbols": ["USDT", "WTRX"],
      "poolVersions": ["v2"],
      "poolFees": ["0", "0"],
      "impact": "-0.002341",
      "fee": "0.003000"
    }
  ]
}
```

### Analysis
- ✅ Expected output: 48.52 TRX
- ✅ Simple route: USDT → WTRX (direct pair)
- ✅ Low price impact: -0.23%

---

## Step 2: Check Balance & Allowance

### 2.1 Check USDT Balance

```javascript
// MCP Tool Call
mcp_mcp_server_tron_read_contract({
  "contractAddress": "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf",
  "functionName": "balanceOf",
  "args": ["TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH"],
  "network": "nile",
  "abi": [{
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }]
})
```

**Response**: `100000000` (100 USDT) ✅ Sufficient

### 2.2 Check Allowance

```javascript
// MCP Tool Call
mcp_mcp_server_tron_read_contract({
  "contractAddress": "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf",
  "functionName": "allowance",
  "args": [
    "TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH",  // owner
    "TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3"   // spender (SunSwap Router)
  ],
  "network": "nile",
  "abi": [{
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }]
})
```

**Response**: `0` ❌ No allowance - Need to approve!

---

## Step 3: Approve USDT

### Why Approve?
The SunSwap Router needs permission to spend your USDT. This is a security feature of TRC20 tokens.

### Approve Transaction

```javascript
// MCP Tool Call
mcp_mcp_server_tron_write_contract({
  "contractAddress": "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf",
  "functionName": "approve",
  "args": [
    "TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3",  // spender (Router)
    "20000000"                              // amount (20 USDT, 2x for future use)
  ],
  "network": "nile",
  "abi": [{
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }]
})
```

### Response
```json
{
  "network": "nile",
  "contractAddress": "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf",
  "function": "approve",
  "txHash": "abc123...",
  "message": "Transaction sent. Use get_transaction_info to check confirmation."
}
```

### Wait for Confirmation
⏳ Wait 5-15 seconds for the approval transaction to confirm.

### Verify Approval
Re-check allowance (same as Step 2.2):
**Response**: `20000000` ✅ Approved!

---

## Step 4: Convert Parameters

### Extract Quote Data
```json
{
  "amountIn": "10.000000",
  "amountOut": "48.523456",
  "tokens": [
    "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf",
    "TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a"
  ],
  "poolVersions": ["v2"],
  "poolFees": ["0", "0"]
}
```

### Run Formatter Script
```bash
node skills/sunswap/scripts/format_swap_params.js \
  '{"amountIn":"10.000000","amountOut":"48.523456","tokens":["TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf","TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a"],"poolVersions":["v2"],"poolFees":["0","0"]}' \
  'TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH' \
  'nile' \
  0.05
```

### Script Output
```json
{
  "contractAddress": "TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3",
  "functionName": "swapExactInput",
  "args": [
    [
      "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf",
      "TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a"
    ],
    ["v2"],
    [2],
    [0, 0],
    [
      "10000000",
      "46097284",
      "TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH",
      "1770545000"
    ]
  ],
  "network": "nile",
  "abi": [...]
}
```

**Note**: No `value` parameter because input is TRC20, not native TRX.

---

## Step 5: Execute Swap

### MCP Tool Call
```javascript
mcp_mcp_server_tron_write_contract({
  "abi": [...],
  "args": [
    ["TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf", "TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a"],
    ["v2"],
    [2],
    [0, 0],
    ["10000000", "46097284", "TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH", "1770545000"]
  ],
  "contractAddress": "TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3",
  "functionName": "swapExactInput",
  "network": "nile"
})
```

### Response
```json
{
  "network": "nile",
  "contractAddress": "TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3",
  "function": "swapExactInput",
  "from": "TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH",
  "txHash": "def456...",
  "message": "Transaction sent. Use get_transaction_info to check confirmation."
}
```

---

## Result Summary

✅ **Swap Successful!**

- **Input**: 10 USDT
- **Output**: ~48.52 TRX
- **Route**: USDT → WTRX (direct)
- **Slippage**: 5% protection (minimum 46.09 TRX)
- **Gas Used**: 
  - Approve: ~8 TRX
  - Swap: ~25 TRX
  - Total: ~33 TRX
- **Transactions**: 
  - Approve: `abc123...`
  - Swap: `def456...`

---

## Key Differences from TRX Input

| Aspect | TRX Input | TRC20 Input (USDT) |
|--------|-----------|-------------------|
| Approve needed? | ❌ No | ✅ Yes (if allowance insufficient) |
| `value` parameter | ✅ Yes (amountIn) | ❌ No |
| Gas cost | Lower (~20-30 TRX) | Higher (~30-40 TRX, includes approve) |
| Steps | 3 steps | 4 steps (includes approve) |

---

## Common Mistakes to Avoid

❌ Forgetting to check allowance before swap
❌ Not waiting for approve transaction to confirm
❌ Approving exact amount (approve 2x for future use)
❌ Including `value` parameter for TRC20 input
❌ Skipping balance check

---

## Checklist for TRC20 Swaps

- [ ] Get price quote from API
- [ ] Check token balance (≥ amountIn)
- [ ] Check TRX balance (≥ 100 TRX for gas)
- [ ] Check allowance
- [ ] If allowance < amountIn: Approve token
- [ ] Wait for approve confirmation
- [ ] Convert parameters with script
- [ ] Execute swap (no `value` parameter)
- [ ] Verify transaction

---

**Pro Tip**: Approve 2-3x the swap amount to save gas on future swaps. The Router can only spend up to the approved amount, so it's safe.
