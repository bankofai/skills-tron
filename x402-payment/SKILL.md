---
name: x402-payment
description: "Pay for x402-enabled Agent endpoints using ERC20 tokens (USDT/USDC) on EVM or TRC20 tokens (USDT/USDD) on TRON."
version: 1.3.0
author: bankofai
homepage: https://x402.org
tags: [crypto, payments, x402, agents, api, usdt, usdd, usdc, tron, ethereum, evm, erc20, trc20]
dependencies:
  - mcp-server-tron
---

# x402 Payment Skill

Invoke x402-enabled AI agent endpoints with automatic token payments on both TRON (TRC20) and EVM-compatible (ERC20) chains.

## Overview

The `x402-payment` skill enables agents to interact with paid API endpoints. When an agent receives a `402 Payment Required` response, this skill handles the negotiation, signing, and execution of the payment using the `x402_invoke` tool.

## Prerequisites

- **Wallet Configuration**:
  - **TRON**: Set `TRON_PRIVATE_KEY` for TRC20 payments (USDT/USDD).
  - **EVM**: Set `EVM_PRIVATE_KEY` or `ETH_PRIVATE_KEY` for ERC20 payments (USDT/USDC).
- **Tool**: The `x402_invoke.js` script must be built and available in `dist/`.

## Usage Instructions

### 1. Verification
Before making payments, verify your wallet status:
```bash
node x402-payment/dist/x402_invoke.js --check
```

### 2. Invoking an Agent (v2)
Most modern x402 agents use the v2 "invoke" pattern:
```bash
node x402-payment/dist/x402_invoke.js \
  --url https://api.example.com \
  --entrypoint chat \
  --input '{"prompt": "Your query here"}' \
  --network nile
```

### 3. Cross-Chain Support
- **TRON (TRC20)**: Use `--network nile` (testnet) or `mainnet`.
- **BSC (ERC20)**: Use `--network bsc-testnet` (testnet) or `bsc` (mainnet).

## Supported Networks & Tokens

| Chain | Network Name | Common Tokens |
|-------|--------------|---------------|
| **TRON** | `mainnet`, `nile` | USDT, USDD |
| **BSC** | `bsc`, `bsc-testnet` | USDT, USDC, DHLU |

## Security Considerations

> [!CAUTION]
> **Private Key Safety**: NEVER output your private keys to the logs or console. The `x402_invoke` tool loads keys from environment variables internally.
> Use `node x402_invoke.js --check` to safely verify your address.

## Error Handling

### Insufficient Allowance
If you haven't approved the agent's contract to spend your tokens, the tool will automatically attempt an "infinite approval" transaction. Ensure you have enough native tokens (TRX or ETH) for gas fees.

### Insufficient Balance
Ensure you have enough USDT/USDC/USDD in your wallet on the specified network.

---
*Last Updated: 2026-02-11*
