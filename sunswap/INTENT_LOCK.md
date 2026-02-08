# 🔴 INTENT LOCK - READ THIS FIRST

## 🚨 ABSOLUTE CRITICAL RULE: USE EXACTLY THE TOKEN USER SPECIFIED

**When a user specifies a token, you MUST use EXACTLY that token for:**
1. ✅ Price quote API call
2. ✅ Swap execution
3. ✅ All intermediate steps

**NEVER EVER make substitutions, assumptions, or "helpful" changes!**

---

## TRX vs WTRX - Most Common Mistake

**These are TWO COMPLETELY DIFFERENT tokens. Read carefully:**

### User says "TRX"
- ✅ Use address: `T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb` (same on all networks)
- ✅ This is the native TRON token
- ✅ Send via `value` parameter in transaction
- ✅ **Get price quote using TRX address**
- ✅ **Execute swap using TRX address**
- ❌ **DO NOT** use WTRX address for price quote
- ❌ **DO NOT** use WTRX address for swap
- ❌ **DO NOT** assume user meant WTRX

### User says "WTRX"
- ✅ Use network-specific address:
  - **Mainnet**: `TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR`
  - **Nile**: `TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a`
- ✅ This is a TRC20 wrapped token
- ✅ Requires approval before swap
- ✅ **Get price quote using WTRX address**
- ✅ **Execute swap using WTRX address**
- ❌ **DO NOT** use TRX address for price quote
- ❌ **DO NOT** use TRX address for swap
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
   • Using fromToken: T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb (TRX address)
   • API call: curl '...?fromToken=T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb&...'

✅ Step 1 Complete
📊 Price quote received for TRX → USDT
   • Expected output: X USDT

[Continue with TRX for all remaining steps...]
```

**Key Point**: Used TRX address in BOTH price quote AND swap execution.

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
   • API call: curl '...?fromToken=TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a&...'  ← WRONG!
```

**Why this is COMPLETELY WRONG**: 
- User said "TRX", not "WTRX"
- You changed their intent without permission
- Price quote is for WRONG token
- Swap will execute with WRONG token
- User will get unexpected results

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

## Summary - The Golden Rules

1. ✅ **Use the EXACT token the user specified in their request**
2. ✅ **Use that EXACT token for price quote API call**
3. ✅ **Use that EXACT token for swap execution**
4. ❌ **NEVER substitute TRX ↔ WTRX**
5. ❌ **NEVER substitute any token without explicit user confirmation**
6. ❌ **NEVER make "helpful" assumptions about what user "really meant"**
7. 🤔 **When in doubt, STOP and ASK the user to clarify**

**This is non-negotiable. User intent is sacred. What they say is what you use.**
