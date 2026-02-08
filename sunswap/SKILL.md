---
name: SunSwap DEX Trading
description: Execute token swaps on SunSwap DEX for TRON blockchain.
version: 2.4.0
dependencies:
  - mcp-server-tron
tags:
  - defi
  - dex
  - swap
  - tron
  - sunswap
---

# SunSwap DEX Trading Skill

## 🚨 STOP! READ THIS FIRST - DO NOT SKIP!

**Before attempting any swap, read the Quick Reference Card below.**

**The ONLY correct workflow is documented below. Follow it exactly.**

---

## 🔴 CRITICAL: RESPECT USER'S EXACT TOKEN CHOICE

**🚨 ABSOLUTE RULE: User says what token, you use EXACTLY that token!**

**User says "TRX"** → `T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb` (native, same on all networks)

**User says "WTRX"** → Network-specific address:
- **Mainnet**: `TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR`
- **Nile**: `TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a`

**NEVER substitute tokens!** See [INTENT_LOCK.md](INTENT_LOCK.md) for details.

**Key Differences:**

| Feature | TRX (Native) | WTRX (Wrapped) |
|---------|--------------|----------------|
| Type | Native token | TRC20 token |
| Approval | ❌ Not needed | ✅ Required |
| Transaction | Via `value` parameter | Standard TRC20 transfer |
| Address | Same on all networks | Network-specific |

---

## 🚀 Quick Reference Card

### ⚠️ CRITICAL STEPS CHECKLIST

| Step | Action | Required? | Skip Condition |
|------|--------|-----------|----------------|
| 1️⃣ | **Get Price Quote** | ✅ ALWAYS | Never skip |
| 2️⃣ | **Check Balance** | ✅ ALWAYS | Never skip |
| 3️⃣ | **Check Allowance** | ✅ For TRC20 only | Skip if input is native TRX |
| 4️⃣ | **Approve Token** | ⚠️ CONDITIONAL | Skip if: (1) input is TRX OR (2) allowance >= amountIn |
| 5️⃣ | **Execute Swap** | ✅ ALWAYS | Never skip |

**🔴 MOST COMMON MISTAKE: Forgetting to approve TRC20 tokens before swap**

---

### API Price Quote Format

**🚨 Use EXACTLY the token addresses that match user's specified tokens!**

```bash
curl 'https://tnrouter.endjgfsv.link/swap/router?fromToken=<FROM_ADDRESS>&toToken=<TO_ADDRESS>&amountIn=<RAW_AMOUNT>&typeList=PSM,CURVE,CURVE_COMBINATION,WTRX,SUNSWAP_V1,SUNSWAP_V2,SUNSWAP_V3'
```

**Parameters:**
- `fromToken`: Input token address (user's exact token choice)
- `toToken`: Output token address (user's exact token choice)
- `amountIn`: Raw integer amount (e.g., `1000000` for 1 TRX with 6 decimals)
- `typeList`: Always use the full list shown above

---

### Complete Workflow

```bash
# Step 1: Get Price Quote (✅ ALWAYS)
curl 'https://tnrouter.endjgfsv.link/swap/router?fromToken=<FROM>&toToken=<TO>&amountIn=<AMOUNT>&typeList=...'

# Step 2: Check Balance (✅ ALWAYS)
# Use mcp_mcp_server_tron_get_balance and read_contract (balanceOf)

# Step 3: Check Allowance (✅ For TRC20, ❌ Skip for TRX)
# Use read_contract with allowance function

# Step 4: Approve Token (⚠️ Only if allowance < amountIn)
# mcp_mcp_server_tron_write_contract (approve function)
# Wait for confirmation before proceeding!

# Step 5: Convert Parameters (✅ ALWAYS)
node scripts/format_swap_params.js '<quote_json>' '<recipient>' '<network>' [slippage]

# Step 6: Execute Swap (✅ ALWAYS)
mcp_mcp_server_tron_write_contract({...output_from_step_5...})
```

---

### Quick Token Lookup

```bash
# Find token address quickly
node skills/sunswap/scripts/lookup_token.js <SYMBOL> <NETWORK>
# Example: node skills/sunswap/scripts/lookup_token.js USDT nile
```

### Gas Fee Estimates

- **Approve**: ~5-10 TRX
- **Swap**: ~20-50 TRX  
- **Recommended**: Keep at least 100 TRX for gas

---

## 📋 Quick Start

This skill helps you execute token swaps on SunSwap DEX. Follow the workflow step-by-step.

**Before you start:**
- Ensure `mcp-server-tron` is configured
- Have your wallet set up with sufficient TRX for gas (minimum 100 TRX recommended)

---

## 🎯 User Communication Protocol

**CRITICAL**: You MUST communicate with the user at each step.

### Step Start Template
```
🔄 [Step N]: [Action Name]
📝 What I'm doing: [Brief description]
```

### Step Complete Template
```
✅ [Step N] Complete
📊 Result: [Key information]
➡️ Next: [What happens next]
```

### Error Template
```
❌ Error in [Step N]
🔍 Issue: [What went wrong]
💡 Solution: [How to fix]
```

---

## 🛠️ Execution Workflow

**Follow these steps in order. Each step is in a separate file to keep context focused.**

### Step 0: Token Address Lookup
**File**: [workflow/00_token_lookup.md](workflow/00_token_lookup.md)

**When to use**: If you don't have token addresses for the swap pair.

**User Message**:
```
🔍 Step 0: Looking up token addresses
📝 Checking: [TOKEN_SYMBOL] on [NETWORK]
```

---

### Step 1: Price Quote
**File**: [workflow/01_price_quote.md](workflow/01_price_quote.md)

**Always required**: Get the best swap route and expected output.

**User Message**:
```
💰 Step 1: Getting price quote
📝 Querying: [AMOUNT] [FROM_TOKEN] → [TO_TOKEN]
```

---

### Step 2: Balance & Allowance Check
**File**: [workflow/02_balance_check.md](workflow/02_balance_check.md)

**Always required**: Verify you have sufficient balance and token approval.

**User Message**:
```
📊 Step 2: Checking balance and allowance
📝 Verifying: Wallet balance and router approval
```

---

### Step 3: Approve Token (Conditional)
**File**: [workflow/03_approve.md](workflow/03_approve.md)

**When to use**: Only if input is a token (not TRX) AND allowance is insufficient.

**User Message**:
```
✅ Step 3: Approving token
📝 Approving: [TOKEN] for SunSwap Router
⏳ Please wait for confirmation...
```

---

### Step 4: Execute Swap
**File**: [workflow/04_execute_swap.md](workflow/04_execute_swap.md)

**Always required**: Execute the actual swap transaction.

**User Message**:
```
🔄 Step 4: Executing swap
📝 Swapping: [AMOUNT_IN] [TOKEN_IN] → [EXPECTED_OUT] [TOKEN_OUT]
⏳ Submitting transaction...
```

---

## 📚 Resources & Tools

- **Token Registry**: [resources/common_tokens.json](resources/common_tokens.json)
- **Contract Addresses**: [resources/sunswap_contracts.json](resources/sunswap_contracts.json)
- **Token Lookup**: [scripts/lookup_token.js](scripts/lookup_token.js) - Quick token address finder
- **Parameter Formatter**: [scripts/format_swap_params.js](scripts/format_swap_params.js) - Converts API quote to MCP params
- **Complete Examples**: [examples/](examples/) - Real working examples with full output

---

## 📖 Examples

1. **[TRX → USDJ](examples/complete_swap_example.md)** - Native TRX swap (no approve needed)
2. **[USDT → TRX](examples/swap_with_approve.md)** - TRC20 token swap (approve required)

---

## 🚨 Critical Rules

1. **Respect User's Token Choice**: Use EXACTLY the token user specified (see top of document)
2. **User Communication**: Announce every step before and after execution
3. **No Shortcuts**: Follow all steps in order
4. **Use Helper Script**: Always use `format_swap_params.js` for parameter formatting
5. **Include ABI**: Always include ABI for Nile testnet

---

## 📖 Detailed Workflow Files

Each workflow step is in a separate file to keep context focused:

- `workflow/00_token_lookup.md` - Find token addresses
- `workflow/01_price_quote.md` - Get swap quote from API
- `workflow/02_balance_check.md` - Verify balance and allowance
- `workflow/03_approve.md` - Approve token spending
- `workflow/04_execute_swap.md` - Execute the swap

**Load only the file you need for the current step.**

---

## 🔧 Troubleshooting

**Only consult this section if you encounter errors.**

### API Errors

**400 Bad Request**: Check that you're using the exact API format from the Quick Reference Card above.

**Empty data array**: The token pair may not have liquidity on this network. Verify token addresses are correct for the network (mainnet vs nile).

**Response validation fails**: Ensure `amountIn` in the response matches your intended input amount.

### Transaction Errors

**INSUFFICIENT_OUTPUT_AMOUNT**: Increase slippage tolerance or split into smaller swaps.

**TRANSFER_FAILED**: Check balance and allowance (return to Step 2).

**EXPIRED**: Deadline passed - get a new quote and retry.
