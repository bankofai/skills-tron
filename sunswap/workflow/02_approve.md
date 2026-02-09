
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
- **Amount**:
    *   **Default**: `1461501637330902918203684832716283019655932542975` (MaxUint160).
    *   **Override**: Only use a specific amount if the user EXPLICITLY asks for it.
    *   **Reason**: Approvals cost gas (~15 TRX). Frequent small approvals are wasteful. Max approval saves gas for all future swaps.

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

---

## ✅ Step 3 Completion Checklist

Before proceeding to Step 4, confirm:

- [ ] Approval transaction sent successfully
- [ ] Transaction confirmed (wait 5-15 seconds)
- [ ] Allowance re-checked and verified (≥ amountIn)
- [ ] Ready to proceed to swap execution

## Next Step

→ [Step 3: Price Quote](03_price_quote.md)

**If all checked ✅, proceed to Step 4**
