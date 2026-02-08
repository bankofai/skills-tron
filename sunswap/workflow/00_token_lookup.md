# 0. 🔍 Token Address Lookup

## User Communication

**Before starting:**
```
🔍 Step 0: Looking up token addresses
📝 Checking: [TOKEN_SYMBOL] on [NETWORK]
```

**After completion:**
```
✅ Step 0 Complete
📊 Found: [TOKEN_SYMBOL] at [ADDRESS]
   • Decimals: [DECIMALS]
➡️ Next: Getting price quote
```

---

## Step 1: Check Local Registry

**File**: `skills/sunswap/resources/common_tokens.json`

**Common tokens available:**
- **Mainnet**: USDT, WTRX, TRX, USDD, BTT, JST, SUN
- **Nile**: USDT, WTRX, TRX, USDC, SUN, USDJ, TUSD, JST

**If found**: Use the address and proceed to Step 1 (Price Quote).

---

## Step 2: Query Contract (If Not Found)

Use MCP `read_contract` to query the token contract.

### Query Symbol

```javascript
mcp_mcp_server_tron_read_contract({
  contractAddress: "TOKEN_ADDRESS",
  functionName: "symbol",
  args: [],
  network: "nile"
})
// Returns: "USDC"
```

### Query Decimals

```javascript
mcp_mcp_server_tron_read_contract({
  contractAddress: "TOKEN_ADDRESS",
  functionName: "decimals",
  args: [],
  network: "nile"
})
// Returns: 6
```

---

## Common Token Reference

### Nile Testnet

| Symbol | Address | Decimals |
|--------|---------|----------|
| TRX | `T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb` | 6 |
| USDT | `TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf` | 6 |
| USDC | `TWMCMCoJPqCGw5RR7eChF2HoY3a9B8eYA3` | 6 |
| WTRX | `TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a` | 6 |

---

## Error Handling

**Token not found:**
```
❌ Error in Step 0
🔍 Issue: Token "[SYMBOL]" not found in registry
💡 Solution: Please provide the contract address or check blockchain explorer
```

---

## Next Step

→ [Step 1: Price Quote](01_price_quote.md)
