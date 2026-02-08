
# 4. 🔄 Execute Swap with Smart Router

## 🛠️ Helper Script: Format Swap Params

Before building your `write_contract` tool call, you **MUST** run the helper script to correctly format the parameters. This handles version merging, fee logic, and array construction.

### Option 1: Run Local Script (Recommended)

```bash
# Run the formatter with API quote data
node skills/sunswap/scripts/format_swap_params.js '<quote_json>' '<recipient_address>' '<network>' [slippage]

# Example:
node skills/sunswap/scripts/format_swap_params.js \
  '{"tokens":["T9yD14...","TWrZR...","TLBaR...","TWMCMCo..."],"poolVersions":["v1","v3","oldusdcpool"],"poolFees":["0","100","0","0"],"amountIn":"1.000000","amountOut":"65.086340"}' \
  'TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH' \
  'nile' \
  0.20
```

**Output (Ready for MCP):**
```json
{
  "abi": [...],
  "args": [
    ["T9yD14...", "TWrZR...", "TLBaR...", "TWMCMCo..."],
    ["v1", "v3", "oldusdcpool"],
    [2, 1, 1],
    [0, 100, 0, 0],
    ["1000000", "52069072", "TL9kq3Fvw7dSpjgn3rBB8aJS8zhW8GvqGH", "1770539800"]
  ],
  "contractAddress": "TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3",
  "functionName": "swapExactInput",
  "network": "nile",
  "value": "1000000"
}
```

**Then directly call MCP:**
```javascript
// Copy the output and use it directly
mcp_mcp_server_tron_write_contract(outputFromScript)
```

### Option 2: Mental Calculation (Fallback)

If you cannot execute the script, use this logic:

```javascript
/**
 * Formats Smart Router API quote into Contract Arguments
 * @param {Object} quoteData - The `data[0]` object from API response
 * @param {String} recipient - User's wallet address
 * @param {Number} deadline - Unix timestamp (seconds)
 * @returns {Array} args - The 5 arguments for swapExactInput
 */
function formatSwapParams(quoteData, recipient, deadline) {
  const { tokens: path, poolVersions, poolFees, amountIn, amountOut } = quoteData;

  // 1. Merge consecutive versions and calculate versionLen
  const mergedVersions = [];
  const versionLen = [];
  
  if (poolVersions.length > 0) {
    let currentVer = poolVersions[0];
    let poolCount = 1; // Count pools in current segment

    for (let i = 1; i < poolVersions.length; i++) {
        if (poolVersions[i] === currentVer) {
            poolCount++;
        } else {
            mergedVersions.push(currentVer);
            // Each pool connects 2 tokens, so N pools = N+1 tokens
            versionLen.push(poolCount + 1);
            currentVer = poolVersions[i];
            poolCount = 1;
        }
    }
    mergedVersions.push(currentVer);
    versionLen.push(poolCount + 1);

    // ⚠️ CRITICAL OVERRIDE for Single Version (Most Common)
    // If only 1 merged version exists, versionLen MUST equal path.length
    if (mergedVersions.length === 1) {
        versionLen[0] = path.length;
    } else {
        // For multiple segments: adjust for shared boundary tokens
        // First segment keeps its count, subsequent segments lose 1 (shared boundary)
        for (let i = 1; i < versionLen.length; i++) {
            versionLen[i] = versionLen[i] - 1;
        }
    }
  }

  // 2. Fees: Keep ALL elements (Rule 3)
  const fees = poolFees.map(f => parseInt(f));

  // 3. Amount Conversion (Raw String -> BigInt)
  // Ensure we use the raw input amount for precision
  const amountInSun = BigInt(amountIn.includes('.') ? parseFloat(amountIn) * 1e6 : amountIn).toString();
  
  // Calculate min output with 0.5% slippage
  const minOutSun = BigInt(Math.floor(parseFloat(amountOut) * 0.995 * 1e6)).toString();

  const dataTuple = [
      amountInSun,
      minOutSun,
      recipient,
      deadline.toString()
  ];

  return [
    path,                  // args[0]
    mergedVersions,        // args[1]
    versionLen,            // args[2]
    fees,                  // args[3]
    dataTuple              // args[4]
  ];
}
```

## 🚨 Parameter Constraints (The 7 Commandments)

You **MUST** follow these rules for every swap:

1.  **Dynamic Deadline**: `deadline` **MUST** be `now + 300s`. **NEVER** hardcode.
2.  **Raw Amount Units**: `amountIn` **MUST** be **Raw Integer String** (e.g., `"20000000"`).
3.  **Exact Fees**: `fees.length` **MUST** strictly equal `path.length`. **NEVER** truncate.
4.  **Exact Versions**: `sum(versionLen)` **MUST** strictly equal `path.length`.
5.  **ABI-First**: For **Every** call on Nile Testnet (and Mainnet preferably), you **MUST** include the `swapExactInput` ABI JSON snippet in your `write_contract` call.

### 📘 versionLen Calculation Examples

**Example 1: Single Merged Version**
```javascript
// API returns: poolVersions = ["v3", "v3", "v3"]
// 4 tokens: A -> B -> C -> D
mergedVersions = ["v3"]
versionLen = [4]  // All tokens in one block
// Sum: 4 = path.length ✓
```

**Example 2: Mixed Versions (Most Common)**
```javascript
// API returns: poolVersions = ["v1", "v3", "old3pool"]
// 4 tokens: TRX -> SUN -> USDJ -> USDT
mergedVersions = ["v1", "v3", "old3pool"]
versionLen = [2, 1, 1]
// Explanation:
// - v1 segment: TRX->SUN (2 tokens)
// - v3 segment: SUN->USDJ (+1 token, SUN already counted)
// - old3pool segment: USDJ->USDT (+1 token, USDJ already counted)
// Sum: 2+1+1 = 4 = path.length ✓
```

**Example 3: Partially Merged**
```javascript
// API returns: poolVersions = ["v2", "v2", "v3"]
// 4 tokens: A -> B -> C -> D
// 3 pools: A->B (v2), B->C (v2), C->D (v3)

// Step 1: Merge consecutive versions
mergedVersions = ["v2", "v3"]

// Step 2: Calculate token count per segment
// v2 segment has 2 pools -> 2+1 = 3 tokens [A, B, C]
// v3 segment has 1 pool -> 1+1 = 2 tokens [C, D]

// Step 3: Adjust for shared boundaries
// v2 segment: 3 tokens (no adjustment for first segment)
// v3 segment: 2-1 = 1 token (subtract 1 for shared token C)

versionLen = [3, 1]
// Sum: 3+1 = 4 = path.length ✓
```

## Execute Swap

**Tool**: `write_contract` -> `swapExactInput`

- **Contract**: Router Address (`TKzxd...` mainnet)
- **Args**: Construct using Helper Script above.
    - `path`: Array of Token Addresses
    - `poolVersion`: Array of Version Strings (Merged)
    - `versionLen`: Array of Integers (Node counts)
    - `fees`: Array of Integers (Full length)
    - `data`: Tuition Array `[amountIn, amountOutMin, to, deadline]`
- **Value**:
    - If input token is TRX: `value = amountIn` (Raw).
    - If input token is Token: `value = undefined` (or "0").

## ABI Snippet

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

## ⚡️ Troubleshooting (Fail-Retry Protocol)

| Error Type | Action |
| :--- | :--- |
| `unknown function` | **Missing ABI**: Add the ABI snippet above and retry. |
| `REVERT` / `EXPIRED` | **Restart**: Re-quote API -> Generate New Deadline -> Re-sign. |
| `INSUFFICIENT_OUTPUT` | **Slippage**: Increase slippage slightly or check liquidity. |
| `TRANSFER_FAILED` | **Balance/Allowance**: Go back to Step 2. |

---

## ✅ Step 4 Completion Checklist

After swap execution, confirm:

- [ ] Transaction hash received
- [ ] Transaction confirmed on blockchain
- [ ] Output amount received (check wallet balance)
- [ ] Output amount within expected range (considering slippage)
- [ ] No errors in transaction logs

**If all checked ✅, swap complete! 🎉**

---

## 🎉 Success Message Template

```
✅ Swap Complete!
📊 Summary:
   • Input: [AMOUNT_IN] [TOKEN_IN]
   • Output: [AMOUNT_OUT] [TOKEN_OUT]
   • Route: [TOKEN1] → [TOKEN2] → ... → [TOKEN_N]
   • Transaction: [TX_HASH]
   • View: https://[nile.]tronscan.org/#/transaction/[TX_HASH]
```
