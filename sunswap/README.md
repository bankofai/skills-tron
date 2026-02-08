# SunSwap Skill

Execute token swaps on SunSwap DEX using Smart Router for optimal routing across V1/V2/V3/PSM pools.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)
[![TRON](https://img.shields.io/badge/Blockchain-TRON-red)](https://tron.network/)

## Quick Start

**4-Step Workflow**:
1. 💰 **Price Quote** - Query Smart Router API
2. 📊 **Balance Check** - Verify balance and allowance
3. ✅ **Approve** - Authorize Router (if needed)
4. 🔄 **Execute Swap** - Perform swap

**Read**: [SKILL.md](SKILL.md) for complete instructions

## Key Features

- ✅ **Smart Router API** for optimal routing
- ✅ **Multi-pool support** (V1/V2/V3/PSM/Curve)
- ✅ **Mainnet & Nile testnet** support
- ✅ **Direct curl usage** (no local wrappers)
- ✅ **Complete ABI definitions** included

## Files

- **[SKILL.md](SKILL.md)** - Complete skill documentation
- **[examples/swap_usdt_to_trx.md](examples/swap_usdt_to_trx.md)** - Full swap example
- **[resources/sunswap_contracts.json](resources/sunswap_contracts.json)** - Contract addresses, API endpoints, ABIs
- **[resources/common_tokens.json](resources/common_tokens.json)** - Token addresses and decimals

## Networks

| Network | Smart Router | API Endpoint |
|---------|-------------|--------------|
| **Mainnet** | `TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax` | `https://rot.endjgfsv.link/swap/router` |
| **Nile** | `TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3` | `https://tnrouter.endjgfsv.link/swap/router` |

## Example: Query Price

```bash
# Mainnet: 50 USDT → TRX
curl 'https://rot.endjgfsv.link/swap/router?fromToken=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t&toToken=TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR&amountIn=50&typeList=PSM,CURVE,CURVE_COMBINATION,WTRX,SUNSWAP_V1,SUNSWAP_V2,SUNSWAP_V3'
```

## Critical Notes

> [!WARNING]
> **Version Merging**: Merge consecutive identical pool versions (e.g., `["v2", "v2"]` -> `["v2"]`).
> **Token Count**: `versionLen` must sum to `path.length` (token count).
> **Fee Length**: `fees` length must strictly equal `path.length` (do not truncate!).

```javascript
// ✅ Correct Logic:
const poolVersion = mergeConsecutive(response.poolVersions);
const versionLen = calculateTokenCounts(response.poolVersions);
const fees = response.poolFees.map(f => parseInt(f)); // Full length
```

> [!NOTE]
> **Nile Testnet**: Always provide `abi` parameter when calling contracts on Nile.

## Dependencies

- `mcp-server-tron` - TRON blockchain MCP server

## Version

2.0.0 (2026-02-08)

## License

MIT - see [LICENSE](../LICENSE) for details
