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

## 🔍 Step 1: Check Local Registry (PRIORITY)

**File**: This document serves as the registry.

### 🌐 Mainnet Tokens

| Symbol | Address | Decimals | Description |
| :--- | :--- | :--- | :--- |
| **TRX** | `T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb` | 6 | Native Token |
| **USDT** | `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` | 6 | Tether USD |
| **WTRX** | `TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR` | 6 | Wrapped TRX |
| **USDD** | `TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn` | 18 | Decentralized USD |
| **BTT** | `TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4` | 18 | BitTorrent |
| **JST** | `TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9` | 18 | JUST |
| **SUN** | `TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S` | 18 | SUN Token |

### 🧪 Nile Testnet Tokens

| Symbol | Address | Decimals | Description |
| :--- | :--- | :--- | :--- |
| **TRX** | `T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb` | 6 | Native Token |
| **USDT** | `TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf` | 6 | Test USDT |
| **WTRX** | `TYsbWxNnyTgsZaTFaue9hqpxkU3Fkco94a` | 6 | Test WTRX |
| **USDC** | `TWMCMCoJPqCGw5RR7eChF2HoY3a9B8eYA3` | 6 | Test USDC |
| **SUN** | `TWrZRHY9aKQZcyjpovdH6qeCEyYZrRQDZt` | 18 | Test SUN |
| **USDJ** | `TLBaRhANQoJFTqre9Nf1mjuwNWjCJeYqUL` | 18 | Test USDJ |
| **TUSD** | `TRz7J6dD2QWxBoumfYt4b3FaiRG23pXfop` | 18 | Test TUSD |
| **JST** | `TF17BgPaZYbz8oxbjhriubPDsA7ArKoLX3` | 18 | Test JST |

**Action**:
1.  Find your token in the tables above.
2.  **If found**: ✅ **USE THAT ADDRESS**.
3.  **If NOT found**: ❌ **Proceed to Step 2** (On-Chain Lookup).

---

## 🔍 Step 2: On-Chain Lookup (FALLBACK)

**Use this if the token is NOT in the tables above.**

1.  **Ask User**: "Please provide the contract address for [TOKEN]."
2.  **Verify**: Use `mcp-server-tron` to get decimals and symbol.

### Query Token Details

**Tool**: `read_contract`

### Query Token Details

**Tool**: `read_contract`

| Step | Function | Goal | Arguments |
| :--- | :--- | :--- | :--- |
| **1** | `decimals` | **CRITICAL**: Get decimals for formatting | `[]` (None) |
| **2** | `symbol` | Verify token identity | `[]` (None) |

**Instructions**:
1. Cal `decimals` first. You MUST know this to format the `amountIn` correctly in Step 1.
2. Call `symbol` to double-check it matches the user's request.

## Error Handling

**Token not found:**
```
❌ Error in Step 0
🔍 Issue: Token "[SYMBOL]" not found in registry
💡 Solution: Please provide the contract address or check blockchain explorer
```

---

## Next Step

→ [Step 1: Balance & Allowance Check](01_balance_check.md)
