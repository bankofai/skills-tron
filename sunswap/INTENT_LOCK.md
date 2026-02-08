# 🔴 INTENT LOCK - READ THIS FIRST

## Critical Rule: Respect User Token Choice

When a user specifies a token, you **MUST** use exactly that token. **DO NOT** make substitutions.

---

## TRX vs WTRX

This is the most common mistake. **Read carefully:**

### User says "TRX"
- ✅ Use address: `T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb`
- ✅ This is the native TRON token
- ✅ Send via `value` parameter in transaction
- ❌ **DO NOT** use WTRX address
- ❌ **DO NOT** assume user meant WTRX

### User says "WTRX"
- ✅ Use address: `TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a` (nile)
- ✅ This is a TRC20 wrapped token
- ✅ Requires approval before swap
- ❌ **DO NOT** use TRX address
- ❌ **DO NOT** assume user meant TRX

---

## Examples

### ✅ CORRECT Behavior

**User Request**: "swap 1 TRX to USDT on nile"

**Your Action**:
```
🔍 Step 0: Looking up token addresses
📝 Checking: TRX on nile

✅ Step 0 Complete
📊 Found: TRX at T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb
   • This is native TRX
   • Will use value parameter for swap

💰 Step 1: Getting price quote
📝 Querying: 1 TRX → USDT on nile
   • Using fromToken: T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb
```

---

### ❌ WRONG Behavior

**User Request**: "swap 1 TRX to USDT on nile"

**Your Action** (WRONG):
```
🔍 Step 0: Looking up token addresses
📝 Checking: TRX on nile

✅ Step 0 Complete
📊 Found: WTRX at TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a  ← WRONG!
   • Using wrapped TRX for better liquidity  ← WRONG!

💰 Step 1: Getting price quote
📝 Querying: 1 WTRX → USDT on nile  ← WRONG!
   • Using fromToken: TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a  ← WRONG!
```

**Why this is wrong**: User said "TRX", not "WTRX". You changed their intent.

---

## When in Doubt

If you're unsure whether the user meant TRX or WTRX:

**Ask the user:**
```
🤔 Clarification needed:
I found both TRX (native) and WTRX (wrapped) tokens.
Which one would you like to use?

• TRX (native): Direct swap, no approval needed
• WTRX (wrapped): TRC20 token, requires approval

Please specify: TRX or WTRX?
```

---

## Other Token Pairs

This rule applies to **ALL** tokens, not just TRX/WTRX:

- User says "USDT" → Use USDT address
- User says "USDC" → Use USDC address
- User says "SUN" → Use SUN address

**Never substitute similar tokens without explicit user permission.**

---

## Summary

1. ✅ Use the exact token the user specified
2. ❌ Never substitute TRX ↔ WTRX
3. ❌ Never substitute any token without asking
4. 🤔 When in doubt, ask the user to clarify

**This is non-negotiable. User intent is sacred.**
