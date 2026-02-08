
# 3. ✅ Approve Token Spending

## Overview
Authorize the SunSwap Smart Router to withdraw tokens from your wallet. This is a crucial security step.

## When to Approve?
- **REQUIRED**: Swapping `TRC20 Token -> Any Asset` (e.g., USDT -> TRX).
- **NOT NEEDED**: Swapping `Native TRX -> Any Asset` (e.g., TRX -> USDT).

## Execute Approval
**Tool**: `write_contract` -> `approve`

- **Contract**: Token Address (e.g., USDT: `TR7...`)
- **Spender**: Router Address (`TKzxd...` mainnet)
- **Amount**: Raw Integer (e.g., `100000000` = 100 USDT).
    *   *Tip*: Approve slightly more than needed (e.g., 2x) to save gas on future swaps, or exact amount for security.

## Wait & Verify
1.  **Wait**: 5-15 seconds for confirmation.
2.  **Verify**: Re-check `allowance` (Step 2.2).
    - If `allowance >= amountIn`, proceed to **Step 4**.

## ABI Snippet (Required for Nile)

```json
[
  {
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
```
