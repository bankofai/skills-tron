# SunSwap Skill

Execute token swaps on SunSwap DEX using Smart Router for optimal routing across V1/V2/V3/PSM pools.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)
[![TRON](https://img.shields.io/badge/Blockchain-TRON-red)](https://tron.network/)

## Quick Start

**Instructions**: Read [SKILL.md](SKILL.md) for complete usage instructions.

## Approach

This skill uses **script-based execution** instead of direct MCP tool calls. Scripts handle complex parameter formatting, ABI management, and multi-step workflows, reducing AI errors and ensuring reliable execution.

## Files

- **[SKILL.md](SKILL.md)** - Complete skill documentation
- **[scripts/balance.js](scripts/balance.js)** - Check token balances
- **[scripts/quote.js](scripts/quote.js)** - Get price quotes
- **[scripts/swap.js](scripts/swap.js)** - Execute swaps (with flexible workflow options)
- **[resources/sunswap_contracts.json](resources/sunswap_contracts.json)** - Contract addresses and API endpoints
- **[resources/common_tokens.json](resources/common_tokens.json)** - Token addresses and decimals

## Networks

| Network | Smart Router | API Endpoint |
|---------|-------------|--------------|
| **Mainnet** | `TGnC7LMji8hBpyvZt1TTEJhVpAZ5HFyJ3r` | `https://rot.endjgfsv.link/swap/router` |
| **Nile** | `TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3` | `https://tnrouter.endjgfsv.link/swap/router` |

## Installation

```bash
cd skills/sunswap
npm install
```

## Usage Examples

### Check Balance
```bash
node scripts/balance.js USDT nile
```

### Get Quote
```bash
node scripts/quote.js TRX USDT 100 nile
```

### Execute Swap (Full Workflow)
```bash
node scripts/swap.js TRX USDT 100 nile --execute
```

### Execute Swap (Step-by-Step)
```bash
# 1. Check only (balance + allowance)
node scripts/swap.js TRX USDT 100 nile --check-only

# 2. Approve only (if needed)
node scripts/swap.js TRX USDT 100 nile --approve-only

# 3. Swap only (assumes already approved)
node scripts/swap.js TRX USDT 100 nile --swap-only
```

## Dependencies

- Node.js 14+
- tronweb
- axios

## Version

2.0.0 (2026-02-13) - Script-based approach

See [CHANGELOG.md](CHANGELOG.md) for migration notes.

## License

MIT - see [LICENSE](../../LICENSE) for details
