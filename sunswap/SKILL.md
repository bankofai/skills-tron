---
name: SunSwap DEX Trading
description: Execute token swaps on SunSwap DEX for TRON blockchain.
version: 2.2.0
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

## 📋 Quick Start

This skill helps you execute token swaps on SunSwap DEX. Follow the workflow step-by-step.

**Before you start:**
- Ensure `mcp-server-tron` is configured
- Have your wallet set up with sufficient TRX for gas

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

---

## 🚨 Critical Rules

1. **User Communication**: Announce every step before and after execution
2. **No Shortcuts**: Follow all steps in order
3. **Respect Intent**: Never change user's token choice (TRX vs WTRX)
4. **Use Helper Script**: Always use `format_swap_params.js` for Step 4
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
