
# 2. 📊 Balance & Allowance Check

## Overview
Confirm you have enough tokens for the swap and that the Router is authorized to spend them.

---

## 💰 Gas Fee Requirements

**Before checking token balance, ensure sufficient TRX for gas:**

| Operation | Estimated Gas | Notes |
|-----------|---------------|-------|
| Approve (if needed) | 5-10 TRX | Only for TRC20 tokens |
| Swap | 20-50 TRX | Varies by route complexity |
| **Recommended Minimum** | **100 TRX** | Safe buffer for multiple operations |

**Check your TRX balance first:**
```javascript
// Use mcp_mcp_server_tron_get_balance
{
  "address": "YOUR_WALLET_ADDRESS",
  "network": "nile"  // or "mainnet"
}
```

**If TRX balance < 100 TRX**: ⚠️ Warn user about potential gas issues.

---

## 2.1 Check Balance
**Tool**: `read_contract` -> `balanceOf`

- **Input**: User Wallet Address
- **Output**: Token Balance (Raw Integer)
- **Check**: `balance >= amountIn`
    - *If insufficient*: **STOP**. Notify user.

## 2.2 Check Allowance
**Tool**: `read_contract` -> `allowance`

- **Owner**: User Wallet Address
- **Spender**: Smart Router Address (`TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax` / `TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3`)
- **Output**: Allowed Amount (Raw Integer)
- **Decision**:
    - If `allowance >= amountIn`: **Proceed to Step 4** (Skip Step 3).
    - If `allowance < amountIn`: **Proceed to Step 3** (Approve).
    - If input token is TRX (Native): **Skip Step 3**. (No approval needed).

## ⚠️ Important Note
**Nile Testnet**: You **MUST** include the `abi` parameter for `balanceOf` and `allowance`.

### ABI Snippets
See `04_execute_swap.md` or `SKILL.md` for ABI JSON.

---

## ✅ Step 2 Completion Checklist

Before proceeding, confirm:

- [ ] TRX balance checked (≥ 100 TRX recommended)
- [ ] Token balance checked (≥ amountIn required)
- [ ] Allowance checked (if input is TRC20 token)
- [ ] Decision made: Skip to Step 4 OR proceed to Step 3

**If all checked ✅, proceed to next step**
