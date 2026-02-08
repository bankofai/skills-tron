---
name: SunSwap DEX Trading
description: Execute token swaps on SunSwap DEX for TRON blockchain.
version: 2.3.0
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

## 🔴 CRITICAL: TRX vs WTRX - NEVER SUBSTITUTE!

**User says "TRX"** → Use `T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb` (native TRX)
**User says "WTRX"** → Use `TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a` (wrapped TRC20)

**NEVER assume user meant WTRX when they said TRX!** See [INTENT_LOCK.md](INTENT_LOCK.md) for details.

---

## 🚀 Quick Reference Card

### Complete Workflow

```bash
# Step 1: Get Price Quote (REQUIRED - Always)
curl 'https://tnrouter.endjgfsv.link/swap/router?fromToken=<FROM_ADDRESS>&toToken=<TO_ADDRESS>&amountIn=<RAW_AMOUNT>&typeList=PSM,CURVE,CURVE_COMBINATION,WTRX,SUNSWAP_V1,SUNSWAP_V2,SUNSWAP_V3'

# Step 2: Check Balance & Allowance (REQUIRED - Always)
# Use mcp_mcp_server_tron_get_balance and read_contract (balanceOf, allowance)

# Step 3: Approve Token (CONDITIONAL - Only if input is TRC20 token)
# Skip if input is native TRX
# Skip if allowance >= amountIn
# Otherwise: mcp_mcp_server_tron_write_contract (approve function)

# Step 4: Convert Parameters (REQUIRED - Always)
node skills/sunswap/scripts/format_swap_params.js '<quote_data[0]_json>' '<recipient_address>' '<network>' [slippage]

# Step 5: Execute Swap (REQUIRED - Always)
# Use the JSON output from Step 4 as parameters for:
mcp_mcp_server_tron_write_contract({...output_from_step_4...})
```

### When is Approve Needed?

| Input Token | Approve Needed? | Reason |
|-------------|-----------------|--------|
| Native TRX | ❌ NO | Sent via `value` parameter |
| TRC20 (USDT, WTRX, etc.) | ✅ YES | Router needs permission to spend your tokens |
| Already approved | ❌ NO | If `allowance >= amountIn`, skip approve |

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

### Common API Errors

| Error | Cause | Fix |
|-------|-------|-----|
| 400 Bad Request | Wrong parameter names | Use `fromToken`/`toToken`, not `tokenIn`/`tokenOut` |
| Empty `data` array | No liquidity | Check token addresses or try different pair |
| `amountIn` mismatch | Wrong decimals | Use raw integer (1 TRX = 1000000) |

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

## 🔧 Helper Tools

### Parameter Formatter Script

**Location**: `skills/sunswap/scripts/format_swap_params.js`

**Purpose**: Automatically generates MCP-ready parameters from API quote.

**Usage**:
```bash
node skills/sunswap/scripts/format_swap_params.js \
  '<quote_json>' \
  '<recipient_address>' \
  '<network>' \
  [slippage]
```

**Output**: Complete MCP `write_contract` parameters (JSON).

---

## 📚 Resources

- **Token Registry**: [resources/common_tokens.json](resources/common_tokens.json)
- **Contract Addresses**: [resources/sunswap_contracts.json](resources/sunswap_contracts.json)
- **Complete Examples**: [examples/](examples/) - Real working examples with full output
- **Token Lookup Tool**: [scripts/lookup_token.js](scripts/lookup_token.js) - Quick token address finder

---

## 📖 Examples

**Two complete examples with full output:**

1. **[TRX → USDJ](examples/complete_swap_example.md)** - Native TRX swap (no approve needed)
   - Simple 3-step workflow
   - Direct execution with `value` parameter
   - Lower gas cost

2. **[USDT → TRX](examples/swap_with_approve.md)** - TRC20 token swap (approve required)
   - Complete 4-step workflow including approve
   - Balance and allowance checking
   - Higher gas cost (includes approve)

**Use these as references when implementing swaps!**

---

## 🚨 Critical Rules

1. **User Communication**: Announce every step before and after execution
2. **No Shortcuts**: Follow all steps in order
3. **🔴 RESPECT USER INTENT - TRX vs WTRX**:
   - If user says "TRX", use TRX address: `T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb`
   - If user says "WTRX", use WTRX address: `TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a`
   - **NEVER** substitute one for the other
   - **NEVER** assume user meant WTRX when they said TRX
   - When in doubt, ask the user to clarify
4. **Use Helper Script**: Always use `format_swap_params.js` for Step 4
5. **Include ABI**: Always include ABI for Nile testnet

---

## ⚠️ TRX vs WTRX - Critical Distinction

**TRX (Native)**:
- Address: `T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb`
- This is the native TRON token
- When used as input: Send via `value` parameter (no approval needed)
- User says: "swap TRX to USDT" → Use TRX address

**WTRX (Wrapped)**:
- Address: `TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a` (mainnet) or `TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a` (nile)
- This is a TRC20 token wrapper
- When used as input: Requires approval like any other token
- User says: "swap WTRX to USDT" → Use WTRX address

**Example - User Intent Matters:**
```
❌ WRONG:
User: "swap 1 TRX to USDT"
Agent: *uses WTRX address in query*

✅ CORRECT:
User: "swap 1 TRX to USDT"
Agent: *uses TRX address T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb*
```

---

## 📖 Detailed Workflow Files

Each workflow step is in a separate file to keep context focused:

- `workflow/00_token_lookup.md` - Find token addresses
- `workflow/01_price_quote.md` - Get swap quote from API
- `workflow/02_balance_check.md` - Verify balance and allowance
- `workflow/03_approve.md` - Approve token spending
- `workflow/04_execute_swap.md` - Execute the swap

**Load only the file you need for the current step.**
