
# 1. 📊 Balance & Allowance Check

## Overview
Check if you have enough tokens and allowance.

---

## ✅ Step 1 Completion Checklist

...

**Decision**:
- If `allowance >= amountIn`: **Proceed to Step 3** (Price Quote).
- If `allowance < amountIn`: **Proceed to Step 2** (Approve).
- If from token is TRX: **Proceed to Step 3** (Price Quote).

---

## Next Step

→ [Step 2: Approve Token](02_approve.md) (Conditional)
OR
→ [Step 3: Price Quote](03_price_quote.md) (If approved/native)

## 🔑 Step 2.0: Get Wallet Address

**FIRST: Identify the wallet address to check.**

**Method**: Get the configured wallet address from your TRON wallet provider.

**Returns**: Your wallet address in Base58 format (e.g., `TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH`)

**User Communication**:
```
🔑 Wallet Address: [ADDRESS]
📝 This wallet will be used for:
   • Checking token balance
   • Checking allowance
   • Sending transactions (approve & swap)
   • Receiving swap output
```

**Save this address** - you'll use it in all subsequent steps.

---

## 💰 Step 2.1: Check TRX Balance (Gas Fee)

**Before checking token balance, ensure sufficient TRX for gas:**

| Operation | Estimated Gas | Notes |
|-----------|---------------|-------|
| Approve (if needed) | 5-10 TRX | Only for TRC20 tokens |
| Swap | 20-50 TRX | Varies by route complexity |
| **Recommended Minimum** | **100 TRX** | Safe buffer for multiple operations |

**Action**: Query the TRX (native token) balance for the wallet address from Step 2.0.

**Result Interpretation:**
- ✅ **TRX Balance ≥ 100 TRX**: Sufficient for operations
- ⚠️ **TRX Balance < 100 TRX**: Warn user about potential gas shortage
- ❌ **TRX Balance < 20 TRX**: Insufficient - ask user to add funds before continuing

---

## 📊 Step 2.2: Check From Token Balance

**Check the balance of the token you want to swap FROM.**

### Case A: From Token is TRX (Native)

**Already checked in Step 2.1!**

- Use the TRX balance from Step 2.1
- **Important**: Ensure TRX balance >= (amountIn + gas fees)
  - Example: To swap 100 TRX, you need at least 120 TRX (100 for swap + 20 for gas)
- **Check**: `trx_balance >= (amountIn + 20)` (in TRX units)
  - *If insufficient*: **STOP**. Notify user they don't have enough TRX.

### Case B: From Token is TRC20 (USDT, USDC, WTRX, etc.)

**Action**: Call the `balanceOf` function on the from token contract.

**Parameters**:
- **Contract**: From token address (from Step 0 or user input)
- **Function**: `balanceOf(address)`
- **Argument**: Wallet address from Step 2.0

**Returns**: Token balance as raw integer (includes token's decimals)
- Example: `6685283637` with 6 decimals = 6685.283637 USDT

**Check**: `balance >= amountIn`
- *If insufficient*: **STOP**. Notify user they don't have enough tokens.

**Note**: TRX balance from Step 2.1 must still be >= 100 TRX for gas fees.

---

## 🔐 Step 2.3: Check Allowance

**Action**: Call the `allowance` function on the from token contract to check if the router is authorized.

**Parameters**:
- **Contract**: From token address
- **Function**: `allowance(address owner, address spender)`
- **Arguments**:
  - `owner`: Wallet address from Step 2.0
  - `spender`: SunSwap Router address
    - **Refer to**: `resources/sunswap_contracts.json` for current Router addresses.

**Returns**: Allowed amount as raw integer (includes token's decimals)

**Decision**:
- If `allowance >= amountIn`: **Proceed to Step 4** (Skip Step 3).
- If `allowance < amountIn`: **Proceed to Step 3** (Approve).
- If from token is TRX (Native): **Skip this step and Step 3**. (No approval needed).

## ⚠️ Important Note
**Nile Testnet**: You **MUST** include the `abi` parameter for `balanceOf` and `allowance`.

### ABI Snippets
See `04_execute_swap.md` or `SKILL.md` for ABI JSON.

---

## ✅ Step 2 Completion Checklist

Before proceeding, confirm:

- [ ] Wallet address obtained (Step 2.0)
- [ ] TRX balance checked (≥ 100 TRX recommended)
- [ ] Token balance checked (≥ amountIn required)
- [ ] Allowance checked (if input is TRC20 token)
- [ ] Decision made: Skip to Step 4 OR proceed to Step 3

**If all checked ✅, proceed to next step**
