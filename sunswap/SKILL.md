---
name: SunSwap DEX Trading
description: Execute token swaps on SunSwap DEX using Smart Router API and TRON blockchain
version: 2.0.5
dependencies:
  - mcp-server-tron
tags:
  - defi
  - dex
  - swap
  - tron
  - sunswap
  - trading
---

# SunSwap DEX Trading Skill

## 🚨 INTENT LOCK (MUST FOLLOW)

1.  **Strict Pair Adherence**: If user says "TRX -> USDT", you **MUST** execute a Native TRX to USDT swap.
    - **DO NOT** silently substitute "WTRX" as the input asset in your *explanation* or *final confirmation*, even if the protocol wraps it internally.
    - **User Intent > Protocol Detail**.
    - **DO NOT rewrite user requirement**: if user asks `TRX -> USDT`, never relabel it as `WTRX -> USDT` in intent, planning, execution summary, or result confirmation.
    - Wrapped/native conversion in router path is implementation detail only; user-facing pair must remain exactly the user request.
2.  **No Speculation**: **DO NOT** perform "check balance", "check allowance", or "probe liquidity" unless the user explicitly asks or the operation fails.
    - **One-Path Workflow**: `Quote -> Params -> Execute -> Receipt`.

---

## 🛠️ Strong Execution Constraints (The 7 Commandments)

You **MUST** follow these rules for every transaction. **NO EXCEPTIONS**.

1.  **Dynamic Deadline**: `deadline` **MUST** be `now + 300s` (calculated at runtime). **NEVER** hardcode or reuse old timestamps.
2.  **Raw Amount Units**: `amountIn` **MUST** be a **Raw Integer String** (e.g., `"20000000"` for 20 USDT), **NOT** a decimal (e.g., `20.0`).
3.  **Exact Fees**: `fees.length` **MUST** strictly equal `path.length`. **NEVER** truncate the fees array.
4.  **Exact Versions**: `sum(versionLen)` **MUST** strictly equal `path.length`. merge consecutive identical versions in `poolVersion`.
5.  **Nile ABI**: You **MUST** provide the full ABI for `read_contract` and `write_contract` calls on Nile Testnet. `unknown function` errors are unacceptable.

---

## ⚡️ Fail-Retry Protocol

| Error Type | Action |
| :--- | :--- |
| `unknown function` | **Auto-Retry**: Add missing ABI (e.g., `multicall`, `unwrapWTRX`) and retry immediately. |
| `REVERT` / `EXPIRED` | **Restart**: Re-quote API -> Generate New Deadline -> Re-sign. **DO NOT** reuse old params. **DO NOT** simplify route; execute from new `data[0]` only, with strict quote parity checks. |
| `INSUFFICIENT_OUTPUT` | **Adjust**: Increase slippage tolerance (e.g., 0.5% -> 1.0%) or check liquidity depth. |
| `TRANSFER_FAILED` | **Check**: Verify User Balance and Allowance (`approve`). |

---

## Nile ABI Quick Snippets (Copy First, Then Execute)

Use these minimal ABI fragments to avoid missing `abi` on Nile.

### Read: `balanceOf`

```json
[
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]
```

### Read: `allowance`

```json
[
  {
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]
```

### Write: `approve`

```json
[
  {
    "inputs": [
      {"name": "spender", "type": "address"},
      {"name": "amount", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
```

### Write: `swapExactInput`

```json
[
  {
    "inputs": [
      {"name": "path", "type": "address[]"},
      {"name": "poolVersion", "type": "string[]"},
      {"name": "versionLen", "type": "uint256[]"},
      {"name": "fees", "type": "uint24[]"},
      {
        "name": "data",
        "type": "tuple",
        "components": [
          {"name": "amountIn", "type": "uint256"},
          {"name": "amountOutMin", "type": "uint256"},
          {"name": "to", "type": "address"},
          {"name": "deadline", "type": "uint256"}
        ]
      }
    ],
    "name": "swapExactInput",
    "outputs": [{"name": "amountsOut", "type": "uint256[]"}],
    "stateMutability": "payable",
    "type": "function"
  }
]
```

---

## 🔍 Pre-Execution Response Template

Before executing ANY transaction, you **MUST** output this standardized block:

```text
**Intent**: [User's Exact Pair, e.g., TRX -> USDT]
**Action**: [Direct Swap / Multicall Swap]
**Input**: [Amount] [Symbol] (Raw: [RawAmount])
**Output**: ~[Amount] [Symbol] (Min: [RawMin])
**Constraint Check**:
- Deadline: [Dynamic Timestamp]
- Fees: [Length OK]
- Versions: [Sum OK]
- Nile ABI: [Present / N/A]
- Route Source: [API data[0] unchanged]
- Quote Parity: [path/fees/versions all matched]
```

---

## Overview

Execute token swaps on **SunSwap**, the leading DEX on TRON blockchain, using the **Smart Router** for optimal routing across V1/V2/V3/PSM pools.

**4-Step Workflow**:
1. 💰 **Price Quote** - Query Smart Router API for optimal path
2. 📊 **Balance Check** - Verify token balance and allowance  
3. ✅ **Approve** - Authorize Router to spend tokens (if needed)
4. 🔄 **Execute Swap** - Perform swap using API-provided path

---

## Prerequisites

- ✅ **mcp-server-tron** configured in your MCP client
- ✅ **TRON wallet** with `TRON_PRIVATE_KEY` environment variable
- ✅ **Sufficient TRX** for gas fees (10-50 TRX recommended)
- ✅ **Token balance** for the swap

---

## Key Contracts & APIs

### Smart Router Contracts

| Network | Contract Address | API Endpoint |
|---------|-----------------|--------------|
| **Mainnet** | `TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax` | `https://rot.endjgfsv.link/swap/router` |
| **Nile Testnet** | `TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3` | `https://tnrouter.endjgfsv.link/swap/router` |

### Common Tokens

**Mainnet**:
- USDT: `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` (6 decimals)
- WTRX: `TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR` (6 decimals)
- USDD: `TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn` (18 decimals)

**Nile Testnet**:
- USDT: `TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf` (6 decimals)
- WTRX: `TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a` (6 decimals)

> [!NOTE]
> See `resources/common_tokens.json` for complete token list.

---

## Step 1: Price Quote via Smart Router API

**Purpose**: Get optimal swap path and expected output amount.

### API Request

Use `curl` to query the Smart Router API:

```bash
# Mainnet example: 50 USDT → TRX
curl 'https://rot.endjgfsv.link/swap/router?fromToken=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&toToken=TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR&amountIn=50000000&typeList=PSM,CURVE,CURVE_COMBINATION,WTRX,SUNSWAP_V1,SUNSWAP_V2,SUNSWAP_V3'

# Nile testnet example: 20 USDT → TRX
curl 'https://tnrouter.endjgfsv.link/swap/router?fromToken=TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf&toToken=TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a&amountIn=20000000&typeList=PSM,CURVE,CURVE_COMBINATION,WTRX,SUNSWAP_V1,SUNSWAP_V2,SUNSWAP_V3'
```

### 1. 💰 Price Quote (Smart Router API)

**Endpoint**: `https://[tn]router.endjgfsv.link/swap/router`

**Parameters**:
- `fromToken`: Input token address
- `toToken`: Output token address
- `amountIn`: Input amount in raw integer units (smallest token unit). Example: 50 USDT (6 decimals) -> `50000000`, 10 TRX (6 decimals) -> `10000000`
- `typeList`: Pool types to search (use all for best results)

### Mandatory Quote Validation

Before continuing to Step 2 or Step 4, you MUST validate the quote response:

1. Check `code == 0` and `data[0]` exists.
2. Check `data[0].amountIn` matches intended human amount (for example `10.000000`).
3. If `amountIn` does not match intent, STOP and re-quote with corrected raw `amountIn`.
4. Never build swap params from a quote that fails this validation.

### API Response

```json
{
  "code": 0,
  "message": "SUCCESS",
  "data": [
    {
      "amountIn": "50.000000",
      "amountOut": "180.523456",
      "tokens": ["TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR"],
      "symbols": ["USDT", "WTRX"],
      "poolVersions": ["v2"],
      "poolFees": ["0", "0"],
      "impact": "-0.007728",
      "fee": "0.003000"
    }
  ]
}
```

**Key Fields**:
- `data[0]`: Best route (API returns top 3, use first one)
- `amountOut`: Expected output amount
- `tokens`: Token path for swap
- `poolVersions`: Pool versions to use
- `poolFees`: Fee tiers (⚠️ **has padding**, see Step 4)

---

## Step 2: Balance Check

### 2.1 Check Token Balance

Use `read_contract` with `balanceOf`:

```json
{
  "contractAddress": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  "functionName": "balanceOf",
  "args": ["YOUR_WALLET_ADDRESS"],
  "network": "mainnet"
}
```

**Result**: `"150000000"` = 150 USDT (150,000,000 / 10^6)

### 2.2 Check Allowance

Check if Router is approved to spend your tokens:

```json
{
  "contractAddress": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  "functionName": "allowance",
  "args": [
    "YOUR_WALLET_ADDRESS",
    "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax"
  ],
  "abi": [{
    "inputs": [
      {"name": "owner", "type": "address"},
      {"name": "spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }],
  "network": "mainnet"
}
```

**Decision**:
- If `allowance >= amountIn_sun`: Skip to Step 4
- If `allowance < amountIn_sun`: Proceed to Step 3

> [!NOTE]
> **Nile testnet requires ABI**: Always provide the `abi` parameter when calling contracts on Nile testnet.

---

## Step 3: Approve (If Needed)

**When to approve**:
- ✅ Token → TRX (e.g., USDT → TRX)
- ✅ Token → Token (e.g., USDT → USDD)
- ❌ TRX → Token (no approval needed, send TRX via transaction `value`)

> [!NOTE]
> TRX is native gas token. Router paths may internally include wrapped/native representations.
> Keep user intent as TRX if user asked for TRX, and pass TRX amount via `value` when swapping from TRX.

### Approve Example

```json
{
  "contractAddress": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
  "functionName": "approve",
  "args": [
    "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax",
    "100000000"
  ],
  "network": "mainnet"
}
```

**Parameters**:
- `args[0]`: Spender (Smart Router address)
- `args[1]`: Amount to approve (100 USDT = 100,000,000 with 6 decimals)

**Best Practice**: Approve 2x the swap amount for future use.

### Verify Approval

Wait 3-6 seconds, then check transaction:

```json
{
  "txHash": "0xabc123...",
  "network": "mainnet"
}
```

Verify: `"contractRet": "SUCCESS"`

> [!WARNING]
> **Security**: Only approve what you need. Avoid unlimited approvals unless you fully trust the contract.

---

## Step 4: Execute Swap

**Purpose**: Execute swap using the optimal path from API.

### 🚨 CRITICAL: Smart Router Multi-Hop Logic

**Rule: `path.length == sum(versionLen) == fees.length`**

1.  **poolVersion**: Merge consecutive identical versions (V1, V2, V3, etc.).
    *   API: `["v2", "v2", "v3", "v3"]` -> Contract: `["v2", "v3"]`

2.  **versionLen**: Represents the **Token Count** (nodes) for that version block.
    *   **Logic**: `length of segment tokens`
    *   Example: A -> B -> C -> D (3 hops, 4 tokens).
        *   If all V2: `versionLen` = `[4]` (Single merged block)
        *   If mixed: Sum of `versionLen` segments must equal `path.length`.

3.  **fees**: Do **NOT** truncate.
    *   Use the full array from API. Length must strictly equal `path.length`.

```javascript
// Example: A -> B -> C -> D (3 hops, 4 tokens)
// All pools are V2.

// 1. path (4 addresses)
path = ["T_A...", "T_B...", "T_C...", "T_D..."]

// 2. poolVersion (Merged)
poolVersion = ["v2"]

// 3. versionLen (Token count)
versionLen = [4]

// 4. fees (Full array, length 4)
fees = [3000, 3000, 3000, 0] // Keep ALL elements
```

> [!CAUTION]
> **Do not truncate fees!** The padding (0) is required for the last token node.

### Parameter Mapping (API → Contract)

Given API response:
```json
{
  "tokens": ["T_A", "T_B", "T_C", "T_D"],
  "poolVersions": ["v3", "v3", "v3"],
  "poolFees": ["3000", "3000", "3000", "0"]
}
```

Map to contract parameters:

```javascript
// 1. path - Use tokens directly
path = apiResponse.tokens

// 2. poolVersion - Merge consecutive identical versions
// ["v3", "v3", "v3"] -> ["v3"]
poolVersion = mergeConsecutive(apiResponse.poolVersions)

// 3. versionLen - Calculate TOKEN COUNT (nodes) for each version segment
// For single merged "v3": length is path.length (4)
versionLen = [path.length]

// 4. fees - Use ALL fees (do NOT truncate)
fees = apiResponse.poolFees.map(f => parseInt(f))


// 5. data - Convert amounts and add slippage
amountIn_sun = parseFloat(apiResponse.amountIn) * 1_000_000  // 50000000
amountOut_sun = parseFloat(apiResponse.amountOut) * 1_000_000  // 180523456
amountOutMin_sun = Math.floor(amountOut_sun * 0.95)  // 171497283 (5% slippage)
deadline = Math.floor(Date.now() / 1000) + 300  // 5 minutes from now

// IMPORTANT: `data` must be positional array, not object
data = [
  amountIn_sun.toString(),
  amountOutMin_sun.toString(),
  "YOUR_WALLET_ADDRESS",
  deadline.toString()
]
```

### Swap Example (Mainnet - Multi-Hop)

Scenario: 4 Tokens (A->B->C->D), all same pool version (e.g., V3 or V2).

```json
{
  "contractAddress": "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax",
  "functionName": "swapExactInput",
  "args": [
    ["T_A", "T_B", "T_C", "T_D"],
    ["v3"],
    [4],
    [3000, 3000, 3000, 0],
    ["50000000", "171497283", "YOUR_WALLET_ADDRESS", "1739000000"]
  ],
  "network": "mainnet"
}
```

**Analysis**:
- `poolVersion`: `["v3"]` (Merged from `["v3", "v3", "v3"]`)
- `versionLen`: `[4]` (Represents 4 tokens in this block)
- `fees`: `[..., 0]` (Full length 4, no truncation)

### Swap Example (Nile Testnet - Multi-Hop)

```json
{
  "contractAddress": "TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3",
  "functionName": "swapExactInput",
  "args": [
    ["T_A", "T_B", "T_C", "T_D"],
    ["v3"],
    [4],
    [3000, 3000, 3000, 0],
    ["20000000", "71000000", "YOUR_WALLET_ADDRESS", "1739000000"]
  ],
  "abi": [{
    "inputs": [
      {"name": "path", "type": "address[]"},
      {"name": "poolVersion", "type": "string[]"},
      {"name": "versionLen", "type": "uint256[]"},
      {"name": "fees", "type": "uint24[]"},
      {
        "components": [
          {"name": "amountIn", "type": "uint256"},
          {"name": "amountOutMin", "type": "uint256"},
          {"name": "to", "type": "address"},
          {"name": "deadline", "type": "uint256"}
        ],
        "name": "data",
        "type": "tuple"
      }
    ],
    "name": "swapExactInput",
    "outputs": [{"name": "amountsOut", "type": "uint256[]"}],
    "stateMutability": "payable",
    "type": "function"
  }],
  "network": "nile"
}
```

**Parameter Breakdown**:
- `args[0]` (path): Token addresses from API `tokens` (4 items)
- `args[1]` (poolVersion): `["v3"]` (Merged)
- `args[2]` (versionLen): `[4]` (Node count for this block)
- `args[3]` (fees): `[3000, 3000, 3000, 0]` (Full length 4)
- `args[4]` (data): `[amountIn, amountOutMin, recipient, deadline]` (positional tuple array; do not pass object)

### Verify Swap

Check transaction status:

```json
{
  "txHash": "0xdef456...",
  "network": "mainnet"
}
```

Verify: `"contractRet": "SUCCESS"`

---

## Best Practices

1. **Always use Smart Router API** for price quotes (not on-chain `getAmountsOut`)
2. **Do NOT truncate poolFees** before passing to contract
3. **Check allowance** before approving to avoid unnecessary transactions
4. **Start with small amounts** when testing
5. **Use 5-10% slippage** for testing, 0.5-2% for production
6. **Provide ABI** when calling Nile testnet contracts
