# 1. 💰 Price Quote

## API Call Template

**Use this exact format:**

```bash
curl 'https://tnrouter.endjgfsv.link/swap/router?fromToken=<FROM_ADDRESS>&toToken=<TO_ADDRESS>&amountIn=<RAW_AMOUNT>&typeList=PSM,CURVE,CURVE_COMBINATION,WTRX,SUNSWAP_V1,SUNSWAP_V2,SUNSWAP_V3'
```

**Replace placeholders:**
- `<FROM_ADDRESS>`: Input token address
- `<TO_ADDRESS>`: Output token address  
- `<RAW_AMOUNT>`: Raw integer (e.g., 1000000 for 1 TRX)

---

## User Communication

**Before starting:**
```
💰 Step 1: Getting price quote
📝 Querying: [AMOUNT] [FROM_TOKEN] → [TO_TOKEN] on [NETWORK]
```

**After completion:**
```
✅ Step 1 Complete
📊 Best route found:
   • Path: [TOKEN1] → [TOKEN2] → ... → [TOKEN_N]
   • Expected output: [AMOUNT_OUT] [TO_TOKEN]
   • Price impact: [IMPACT]%
   • Fee: [FEE]%
➡️ Next: Checking balance and allowance
```

---

## API Endpoint

**GET** `https://[tn]router.endjgfsv.link/swap/router`

- **Mainnet**: `https://rot.endjgfsv.link/swap/router`
- **Nile**: `https://tnrouter.endjgfsv.link/swap/router`

---

## Parameters

| Param | Description | Example |
| :--- | :--- | :--- |
| `fromToken` | Input Token Address | `T9yD14...` (TRX) |
| `toToken` | Output Token Address | `TWMC...` (USDC) |
| `amountIn` | **Raw Integer** Amount | `1000000` (1 TRX with 6 decimals) |
| `typeList` | Pool Types (Use All) | `PSM,CURVE,CURVE_COMBINATION,WTRX,SUNSWAP_V1,SUNSWAP_V2,SUNSWAP_V3` |

---

## Example Request

```bash
curl 'https://tnrouter.endjgfsv.link/swap/router?fromToken=T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb&toToken=TWMCMCoJPqCGw5RR7eChF2HoY3a9B8eYA3&amountIn=1000000&typeList=PSM,CURVE,CURVE_COMBINATION,WTRX,SUNSWAP_V1,SUNSWAP_V2,SUNSWAP_V3'
```

---

## Response Structure

```json
{
  "code": 0,
  "message": "SUCCESS",
  "data": [
    {
      "amountIn": "1.000000",
      "amountOut": "65.081913",
      "tokens": ["T9yD14...", "TWrZR...", "TLBaR...", "TWMC..."],
      "symbols": ["TRX", "SUN", "USDJ", "USDC"],
      "poolVersions": ["v1", "v3", "oldusdcpool"],
      "poolFees": ["0", "100", "0", "0"],
      "impact": "-0.000521",
      "fee": "0.003497"
    }
  ]
}
```

---

## 🔍 Validation Checklist

Before using the quote, you **MUST** validate:

1. ✅ **Code**: `code == 0` (Success)
2. ✅ **Data**: `data` array is not empty
3. ✅ **Routes**: At least one route exists in `data`
4. ✅ **Amount Match**: `data[0].amountIn` matches your intended input amount

**If validation fails:**
```
❌ Error in Step 1
🔍 Issue: [Specific validation failure]
💡 Solution: [How to fix - e.g., "Re-quote with corrected amountIn"]
```

---

## 🚨 Common Errors & Solutions

**Only consult this section if the API call fails.**

| Error | Solution |
|-------|----------|
| 400 Bad Request | Verify you're using the exact API format from the template above |
| Empty `data` array | Check token addresses are correct for the network |
| `amountIn` mismatch | Ensure using raw integer units (e.g., 1000000 for 1 TRX) |

---

## 🔴 CRITICAL: TRX vs WTRX

**Before making the API call, verify the token address:**

- If user said **"TRX"** → Use `T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb`
- If user said **"WTRX"** → Use `TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a` (mainnet) or `TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a` (nile)

**NEVER substitute one for the other based on assumptions!**

---

## Save Quote Data

Extract and save `data[0]` for the next steps:

```javascript
const quoteData = response.data[0];
// Save: tokens, poolVersions, poolFees, amountIn, amountOut
```

---

## ✅ Step 1 Completion Checklist

Before proceeding to Step 2, confirm:

- [ ] API returned `code == 0`
- [ ] `data[0]` exists and is valid
- [ ] `data[0].amountIn` matches your intended input
- [ ] `data[0].tokens` array has at least 2 addresses
- [ ] `data[0].poolVersions` and `data[0].poolFees` are present
- [ ] Quote data saved for next step

**If all checked ✅, proceed to Step 2**

---

## Next Step

→ [Step 2: Balance & Allowance Check](02_balance_check.md)
