
# 2. 📊 Balance & Allowance Check

## Overview
Confirm you have enough tokens for the swap and that the Router is authorized to spend them.

---

## 🔑 Step 2.0: Get Wallet Address

**FIRST: Identify the wallet address to check.**

### Tool: `mcp_mcp_server_tron_get_wallet_address`

```javascript
// Get the configured wallet address
mcp_mcp_server_tron_get_wallet_address()
```

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

**Check your TRX balance using the wallet address from Step 2.0:**
```javascript
// Use mcp_mcp_server_tron_get_balance
{
  "address": "WALLET_ADDRESS_FROM_STEP_2.0",
  "network": "nile"  // or "mainnet"
}
```

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

**Tool**: `read_contract` -> `balanceOf`

- **Contract Address**: From token address (from Step 0 or user input)
- **Function**: `balanceOf`
- **Args**: `[WALLET_ADDRESS_FROM_STEP_2.0]`
- **Output**: Token Balance (Raw Integer, with token's decimals)
- **Check**: `balance >= amountIn`
  - *If insufficient*: **STOP**. Notify user they don't have enough tokens.

**Example (checking USDT balance on Nile):**
```javascript
mcp_mcp_server_tron_read_contract({
  contractAddress: "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf",  // USDT on Nile
  functionName: "balanceOf",
  args: ["WALLET_ADDRESS_FROM_STEP_2.0"],
  network: "nile"
})
// Returns: "6685283637" (raw amount with 6 decimals = 6685.283637 USDT)
```

**Note**: TRX balance from Step 2.1 must still be >= 100 TRX for gas fees.

---

## 🔐 Step 2.3: Check Allowance
**Tool**: `read_contract` -> `allowance`

- **Contract Address**: Input token address
- **Function**: `allowance`
- **Owner**: Wallet address from Step 2.0
- **Spender**: Smart Router Address
  - Nile: `TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax`
  - Mainnet: `TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3`
- **Output**: Allowed Amount (Raw Integer)

**Example**:
```javascript
mcp_mcp_server_tron_read_contract({
  contractAddress: "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf",  // USDT on Nile
  functionName: "allowance",
  args: [
    "WALLET_ADDRESS_FROM_STEP_2.0",  // owner
    "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax"  // spender (router)
  ],
  network: "nile"
})
```

**Decision**:
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

- [ ] Wallet address obtained (Step 2.0)
- [ ] TRX balance checked (≥ 100 TRX recommended)
- [ ] Token balance checked (≥ amountIn required)
- [ ] Allowance checked (if input is TRC20 token)
- [ ] Decision made: Skip to Step 4 OR proceed to Step 3

**If all checked ✅, proceed to next step**
