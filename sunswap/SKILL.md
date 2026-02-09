---
name: SunSwap DEX Trading
description: Execute token swaps on SunSwap DEX for TRON blockchain.
version: 1.0.0
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
# RULE: approve MaxUint160 (infinite) unless user explicitly requests exact amount.
# Reason: Gas optimization. Frequent approvals are expensive.
# Wait for confirmation before proceeding!

# Step 5: Convert Parameters (✅ ALWAYS)
node scripts/format_swap_params.js '<quote_json>' '<recipient>' '<network>' [slippage]

# Step 6: Execute Swap (✅ ALWAYS)
mcp_mcp_server_tron_write_contract({...output_from_step_5...})
```

---

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

### Step 1: Balance & Allowance Check
**File**: [workflow/01_balance_check.md](workflow/01_balance_check.md)
*   **Always required**: Verify you have sufficient balance and token approval *before* quoting.

### Step 2: Approve Token (Conditional)
**File**: [workflow/02_approve.md](workflow/02_approve.md)
*   **When**: Only if input is TRC20 and allowance is low.
*   **TRX Fast Path**: If input is Native TRX, **SKIP THIS STEP**.

### Step 3: Price Quote
**File**: [workflow/03_price_quote.md](workflow/03_price_quote.md)
*   **Always required**: Get the best swap route immediately before execution to ensure freshness.

**User Message**:
```
✅ Step 3: Approving token
📝 Approving: [TOKEN] for SunSwap Router
⏳ Please wait for confirmation...
```

---

### Step 4: Execute Swap
**File**: [workflow/04_execute_swap.md](workflow/04_execute_swap.md)
*   **When**: Always, after checks pass.
*   **Action**: Submit swap transaction using **EXACT** JSON from Step 5 script.
*   **Warning**: Do not manually modify the JSON parameters.

**User Message**:
```
🔄 Step 4: Executing swap
📝 Swapping: [AMOUNT_IN] [TOKEN_IN] → [EXPECTED_OUT] [TOKEN_OUT]
⏳ Submitting transaction...
```

---

## �️ Technical Protocol & Tips

### ⚠️ MCPorter Usage (CRITICAL)
*   **No Parentheses**: `mcporter call tool_name` (CORRECT) vs `tool_name()` (WRONG - zsh error).
*   **JSON Args**: Use `--args '{ "key": "value" }'` for complex inputs.

### ⚡️ Execution Rules

- **Common Tokens List**: Consult [workflow/00_token_lookup.md](workflow/00_token_lookup.md) for available tokens.
- **Contract Addresses**: [resources/sunswap_contracts.json](resources/sunswap_contracts.json)
- **Parameter Formatter**: [scripts/format_swap_params.js](scripts/format_swap_params.js) - Converts API quote to MCP params
- **Complete Examples**: [examples/](examples/) - Real working examples with full output

---

## 📖 Examples

1. **[TRX → USDJ](examples/complete_swap_example.md)** - Native TRX swap (no approve needed)
2. **[USDT → TRX](examples/swap_with_approve.md)** - TRC20 token swap (approve required)

---

## 🚨 CRITICAL PROTOCOL

1.  **RESPECT USER CHOICE**: Use EXACTLY the token user specified. NEVER substitute tokens!
2.  **CHECK FIRST**: Always check Balance (and Allowance for TRC20) before swapping.
3.  **COMMUNICATE**: Announce every step ("🔄 Checking...", "✅ Approved", "❌ Error").
4.  **USE TOOLS**: Use provided scripts for token lookup and parameter formatting.

### ❌ Common Mistakes (DO NOT DO THIS)
*   **Manual JSON**: NEVER construct complex JSON in shell. Use `format_swap_params.js` output.
*   **Silent Execution**: NEVER run multiple steps without reporting progress.
*   **Skipping Checks**: NEVER swap without verifying balance and allowance first (even for TRX).
5. **Include ABI**: Always include ABI for Nile testnet

---

## 📖 Detailed Workflow Files

Each workflow step is in a separate file to keep context focused:

- `workflow/00_token_lookup.md` - Find token addresses
- `workflow/01_balance_check.md` - Verify balance and allowance
- `workflow/02_approve.md` - Approve token spending
- `workflow/03_price_quote.md` - Get swap quote from API
- `workflow/04_execute_swap.md` - Execute the swap

**Load only the file you need for the current step.**

---
