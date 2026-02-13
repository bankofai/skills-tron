---
name: SunSwap DEX Trading
description: Execute token swaps on SunSwap DEX for TRON blockchain using automated scripts.
version: 2.0.0
dependencies:
  - node >= 18.0.0
  - tronweb
tags:
  - defi
  - dex
  - swap
  - tron
  - sunswap
---

# SunSwap DEX Trading Skill

## 🚀 Quick Start

This skill provides automated scripts for token swaps on SunSwap DEX. No complex MCP calls needed!

### Prerequisites

1. **Install dependencies** (first time only):
   ```bash
   cd ~/.openclaw/skills/sunswap
   npm install
   ```

2. **Set environment variables**:
   ```bash
   export TRON_PRIVATE_KEY="your_private_key_here"
   export TRONGRID_API_KEY="your_api_key_here"  # Optional, for mainnet
   ```

---

## 📋 Available Scripts

### 1. Check Balance
```bash
node scripts/balance.js [TOKEN_SYMBOL_OR_ADDRESS] [--network nile|mainnet]
```

**Parameters:**
- `TOKEN_SYMBOL_OR_ADDRESS`: Token symbol (e.g., USDT, TRX) or contract address (e.g., TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf)

**Examples:**
```bash
# Check all token balances
node scripts/balance.js

# Check specific token by symbol
node scripts/balance.js TRX
node scripts/balance.js USDT --network mainnet

# Check specific token by address
node scripts/balance.js TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf
```

**Output:** JSON with wallet address and token balances

---

### 2. Get Price Quote
```bash
node scripts/quote.js <FROM_TOKEN> <TO_TOKEN> <AMOUNT> [--network nile|mainnet]
```

**Parameters:**
- `FROM_TOKEN`: Source token symbol (e.g., USDT, TRX) or contract address (e.g., TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf)
- `TO_TOKEN`: Destination token symbol or contract address
- `AMOUNT`: Amount to swap (in token units)

**Examples:**
```bash
# Get quote using token symbols
node scripts/quote.js TRX USDT 100

# Get quote using contract addresses
node scripts/quote.js TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a 0.1

# Mix symbols and addresses
node scripts/quote.js USDT TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a 50

# Get quote on mainnet
node scripts/quote.js USDT TRX 50 --network mainnet
```

**Output:** JSON with price, route, and price impact

---

### 3. Execute Swap (Flexible Workflow)
```bash
node scripts/swap.js <FROM_TOKEN> <TO_TOKEN> <AMOUNT> [OPTIONS]
```

**Parameters:**
- `FROM_TOKEN`: Source token symbol or contract address
- `TO_TOKEN`: Destination token symbol or contract address
- `AMOUNT`: Amount to swap

**Options:**
- `--network <nile|mainnet>` - Network to use (default: nile)
- `--slippage <0.5>` - Slippage tolerance in % (default: 0.5)
- `--recipient <address>` - Recipient address (default: your wallet)
- `--execute` - Execute the swap (without this, dry-run only)
- `--check-only` - Only check balance and allowance
- `--approve-only` - Only approve token (if needed)
- `--swap-only` - Only execute swap (assumes already approved)

**Examples:**

```bash
# 🔍 Dry run using symbols (check everything, show what would happen)
node scripts/swap.js TRX USDT 100

# ✅ Execute full workflow using symbols
node scripts/swap.js TRX USDT 100 --execute

# ✅ Execute using contract addresses
node scripts/swap.js TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a 0.1 --execute

# ✅ Mix symbols and addresses
node scripts/swap.js USDT TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a 50 --execute

# 📊 Check balance and allowance only
node scripts/swap.js USDT TRX 50 --check-only

# 📝 Approve only (if needed)
node scripts/swap.js USDT TRX 50 --approve-only --execute

# 🔄 Swap only (assumes already approved)
node scripts/swap.js USDT TRX 50 --swap-only --execute

# 🎯 Custom slippage and network
node scripts/swap.js TRX USDT 100 --execute --slippage 1.0 --network mainnet
```

---

## 🎯 Usage Patterns

### Pattern 1: Quick Execution (One Command)

**Best for:** Automated workflows, trusted operations

```bash
# Execute everything in one command
node scripts/swap.js TRX USDT 100 --execute
```

The script automatically:
1. ✅ Checks balance
2. ✅ Checks allowance  
3. ✅ Gets latest price quote
4. ✅ Approves if needed
5. ✅ Executes swap

**Pros:** Fast, one command
**Cons:** User doesn't see quote before execution

---

### Pattern 2: Two-Step Confirmation (Recommended for AI Agents)

**Best for:** User-facing operations, large amounts

**Step 1: Show quote to user**
```bash
node scripts/quote.js TRX USDT 100
```

Output:
```
Quote: 100 TRX → 15.234 USDT
Price Impact: 0.12%
Route: TRX → WTRX → USDT
```

**Step 2: Execute after user confirms**
```bash
node scripts/swap.js TRX USDT 100 --execute
```

**Why quote twice?**
- First quote: For user decision
- Second quote (inside swap): Gets latest price before execution
- Prices change! This protects against slippage

**Pros:** User sees price before committing
**Cons:** Two commands

---

### Pattern 3: Step-by-Step (Advanced)

**Best for:** Debugging, manual control

```bash
# 1. Check balance
node scripts/balance.js

# 2. Get quote
node scripts/quote.js USDT TRX 50

# 3. Check if approval needed
node scripts/swap.js USDT TRX 50 --check-only

# 4. Approve if needed
node scripts/swap.js USDT TRX 50 --approve-only --execute

# 5. Execute swap
node scripts/swap.js USDT TRX 50 --swap-only --execute
```

---

## 🎯 Recommended Workflow for AI Agents

Use **Pattern 2** for best user experience:

**Step 1: Show user the quote**
```bash
node scripts/quote.js TRX USDT 100
```

**Step 2: Ask for confirmation**
Show the user:
- Amount in/out
- Price impact
- Route
- Estimated gas

**Step 3: Execute if confirmed**
```bash
node scripts/swap.js TRX USDT 100 --execute
```

The script automatically:
- ✅ Checks balance
- ✅ Checks allowance
- ✅ Approves if needed (waits for confirmation)
- ✅ Executes swap
- ✅ Returns transaction hash

---

## 🔐 Security Rules

### 🚨 CRITICAL: Never Display Private Keys

**FORBIDDEN:**
- ❌ Private keys
- ❌ Seed phrases
- ❌ Environment variable values containing keys

**ALLOWED:**
- ✅ Public wallet addresses
- ✅ Transaction hashes
- ✅ Token balances

### 🚨 CRITICAL: Prevent Duplicate Transactions

- One user command = one transaction
- After success, mark as done
- Don't retry successful transactions

### 🚨 CRITICAL: Prevent Self-Transfers

- Validate recipient ≠ wallet address
- Scripts automatically check this

---

## 📊 Script Output Format

All scripts output:
- **JSON to stdout** - For parsing
- **Human-readable to stderr** - For logging

**Example:**
```bash
# Capture JSON output
RESULT=$(node scripts/quote.js TRX USDT 100)

# Parse with jq
echo $RESULT | jq '.amountOut'
```

---

## 🛠 Supported Tokens

All scripts support both:
- **Token symbols** (e.g., TRX, USDT, WTRX) - Must be defined in `resources/common_tokens.json`
- **Contract addresses** (e.g., TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf) - Any valid TRC20 token address

Check `resources/common_tokens.json` for pre-configured tokens on each network.

**Common tokens:**
- **TRX** - Native TRON token (no approval needed)
- **USDT** - Tether USD
- **USDC** - USD Coin
- **USDD** - Decentralized USD
- **WTRX** - Wrapped TRX

**Using custom tokens:**
You can use any token by its contract address, even if it's not in the common tokens list. The scripts will automatically detect it and use default settings (6 decimals).

---

## ⚠️ Common Issues

### "TRON_PRIVATE_KEY not set"
```bash
export TRON_PRIVATE_KEY="your_64_character_hex_key"
```

### "Insufficient balance"
Check balance first:
```bash
node scripts/balance.js
```

Ensure you have:
- Enough tokens for the swap
- At least 100 TRX for gas fees

### "Insufficient allowance"
The swap script handles this automatically with `--execute`.

Or approve manually:
```bash
node scripts/swap.js USDT TRX 50 --approve-only --execute
```

### "Module not found"
Install dependencies:
```bash
cd ~/.openclaw/skills/sunswap
npm install
```

---

## 🎓 User Communication Protocol

When executing swaps, communicate clearly:

**Before execution:**
```
🔍 Getting quote for 100 TRX → USDT...

Quote received:
  100 TRX → 15.234 USDT
  Price Impact: 0.12%
  Route: TRX → WTRX → USDT
  
Proceed with swap? (yes/no)
```

**During execution:**
```
📊 Checking balances...
   TRX: 250.5 ✅
   
🔐 Checking allowance... (skipped for TRX)

💱 Getting final quote...

🔄 Executing swap...
   Transaction sent: abc123...
   
⏳ Waiting for confirmation...
```

**After success:**
```
✅ Swap completed!
   Transaction: abc123def456...
   Explorer: https://nile.tronscan.org/#/transaction/abc123def456...
   
   Swapped: 100 TRX → 15.234 USDT
```

---

## 📖 Examples

### Example 1: Simple TRX → USDT Swap

```bash
# User: "Swap 100 TRX to USDT"

# Step 1: Get quote
node scripts/quote.js TRX USDT 100

# Step 2: Show user and ask confirmation
# (User confirms)

# Step 3: Execute
node scripts/swap.js TRX USDT 100 --execute
```

### Example 2: USDT → TRX with Approval

```bash
# User: "Swap 50 USDT to TRX"

# Step 1: Check if approval needed
node scripts/swap.js USDT TRX 50 --check-only

# Step 2: If needs approval, show quote and ask confirmation
node scripts/quote.js USDT TRX 50

# Step 3: Execute (auto-approves if needed)
node scripts/swap.js USDT TRX 50 --execute
```

### Example 3: Advanced - Manual Steps

```bash
# Check balance first
node scripts/balance.js

# Get quote
node scripts/quote.js TRX USDT 100

# Check if ready
node scripts/swap.js TRX USDT 100 --check-only

# Approve if needed (for TRC20 tokens)
node scripts/swap.js USDT TRX 50 --approve-only --execute

# Execute swap
node scripts/swap.js USDT TRX 50 --swap-only --execute
```

---

## 🔗 Resources

- **Contract Addresses**: `resources/sunswap_contracts.json`
- **Token List**: `resources/common_tokens.json`
- **SunSwap Docs**: https://docs.sun.io/

---

## 🆘 Troubleshooting

### Script fails with "Cannot find module"
```bash
cd ~/.openclaw/skills/sunswap
npm install
```

### "Network error" or "Timeout"
- Check internet connection
- For mainnet, ensure `TRONGRID_API_KEY` is set
- Try again (network might be congested)

### Transaction fails
- Check you have enough TRX for gas (100+ recommended)
- Increase slippage: `--slippage 1.0`
- Check token balance is sufficient

### "Self-transfer detected"
- Don't specify `--recipient` as your own wallet
- Or omit `--recipient` to use your wallet (default)

---

**Version**: 2.0.0 (Script-based)  
**Last Updated**: 2026-02-13  
**Maintainer**: Bank of AI Team
