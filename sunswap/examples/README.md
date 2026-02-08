# SunSwap Examples

This directory contains complete, working examples of token swaps on SunSwap DEX.

## Available Examples

### 1. [Complete Swap Example](complete_swap_example.md)
**Scenario**: Swap 1 TRX to USDJ on Nile Testnet

A full walkthrough showing:
- API price quote request and response
- Parameter conversion using the formatter script
- MCP tool execution
- Transaction verification

**Use this as a reference** when swapping native TRX (no approve needed).

---

### 2. [Swap with Approve Example](swap_with_approve.md)
**Scenario**: Swap 10 USDT to TRX on Nile Testnet

A complete walkthrough showing:
- Balance and allowance checking
- Token approval process
- Parameter conversion
- Swap execution
- Key differences from TRX input

**Use this as a reference** when swapping TRC20 tokens (approve required).

---

## How to Use These Examples

1. **Read the example** to understand the complete flow
2. **Copy the commands** and adapt them to your use case
3. **Follow the checklist** at each step to ensure correctness
4. **Verify results** on TronScan

---

## Common Patterns

### Pattern 1: Native TRX as Input
```bash
# TRX → Any Token
# No approval needed, use value parameter
fromToken=T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb
```

### Pattern 2: TRC20 Token as Input
```bash
# USDT → Any Token
# Approval required before swap
fromToken=TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf
```

### Pattern 3: Multi-hop Swap
```bash
# Token A → Token B → Token C
# Router automatically finds best path
# Example: TRX → ETH → SUN → USDJ
```

---

## Tips for Success

✅ **Always get a fresh quote** - Prices change constantly
✅ **Use appropriate slippage** - 10% for testnet, 0.5-2% for mainnet
✅ **Check gas balance** - Keep at least 100 TRX
✅ **Verify token addresses** - TRX ≠ WTRX
✅ **Use the formatter script** - Don't construct parameters manually

---

## Need Help?

- Check the [main SKILL.md](../SKILL.md) for workflow details
- Review [workflow files](../workflow/) for step-by-step instructions
- Use [lookup_token.js](../scripts/lookup_token.js) to find token addresses
- Use [format_swap_params.js](../scripts/format_swap_params.js) to convert parameters
