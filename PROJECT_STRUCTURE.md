# Skills Project Structure

**Last Updated**: 2026-02-07  
**Version**: 1.0.0  
**Repository**: [open-aibank/skills-tron](https://github.com/open-aibank/skills-tron)

---

## Project Overview

This repository contains reusable AI Agent skills for TRON blockchain operations. Each skill is a self-contained module with documentation, examples, and resources.

---

## Directory Structure

```
skills-tron/
├── README.md                    # Project overview and quick start
├── LICENSE                      # MIT License
├── CONTRIBUTING.md              # Contribution guidelines
├── AGENTS.md                    # Developer guide for creating skills
├── PROJECT_STRUCTURE.md         # This file - Project structure overview
│
├── sunswap/                     # ✅ SunSwap V2 Router (Mainnet)
│   ├── README.md                # Skill overview
│   ├── SKILL.md                 # Main instruction file for AI agents
│   ├── HOW_TO_USE_IN_KIRO.md    # Kiro-specific usage guide
│   ├── TEST_RESULTS_MAINNET.md  # Mainnet test results
│   ├── examples/
│   │   ├── get_price_quote.md
│   │   ├── mainnet_swap_execution.md
│   │   └── swap_usdt_to_trx.md
│   ├── resources/
│   │   ├── common_tokens.json   # Mainnet token addresses
│   │   └── sunswap_contracts.json
│   └── scripts/
│       └── validate_swap.py
│

```

---

## Available Skills

### 1. SunSwap Smart Router (Mainnet & Nile)

**Path**: `skills/sunswap/`  
**Status**: ✅ Production Ready  
**Networks**: TRON Mainnet & Nile Testnet  

**Contracts**:
- Mainnet: `TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax`
- Nile Testnet: `TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3`

**Features**:
- Query token swap prices via Smart Router API
- Execute token swaps on V1/V2/V3/PSM pools
- Slippage protection
- Support for common tokens (USDT, USDC, TRX, etc.)

**Dependencies**:
- `mcp-server-tron` (standard version)

**Test Results**:
- ✅ Price queries: Working
- ✅ Token swaps: Working
- ✅ Slippage protection: Working

**Key Files**:
- `SKILL.md` - Main AI agent instructions
- `resources/sunswap_contracts.json` - Contract addresses and ABIs
- `examples/swap_usdt_to_trx.md` - Full swap example

---

## Skill File Structure

Each skill follows this standard structure:

### Required Files

1. **README.md**
   - Quick overview
   - Prerequisites
   - Quick start guide

2. **SKILL.md**
   - YAML frontmatter (metadata)
   - Detailed instructions for AI agents
   - Step-by-step workflows
   - Error handling
   - Examples

### Optional but Recommended

3. **examples/**
   - Usage examples
   - Common scenarios
   - Edge cases

4. **resources/**
   - Configuration files
   - Contract addresses
   - Token lists
   - ABIs

5. **scripts/**
   - Helper scripts
   - Validation tools
   - Testing utilities

6. **TEST_RESULTS.md**
   - Test results
   - Known issues
   - Performance metrics

---

## SKILL.md Format

Every SKILL.md must include:

### 1. YAML Frontmatter

```yaml
---
name: Skill Name
description: What this skill does
version: 1.0.0
network: mainnet | nile | shasta
dependencies:
  - mcp-server-tron
tags:
  - defi
  - dex
  - swap
---
```

### 2. Main Content

- **Overview**: What the skill does
- **Prerequisites**: Required setup
- **Contract Addresses**: Relevant contracts
- **Core Concepts**: Key concepts explained
- **Usage Instructions**: Step-by-step workflows
- **Helper Functions**: Utility functions
- **Error Handling**: Common errors and solutions
- **Security Notes**: Important warnings
- **Resources**: Links to additional resources

---

## MCP Tool Integration

### Standard MCP Tools (No ABI Required)

Used by: `sunswap/` (V2 Router on Mainnet)

```json
{
  "contractAddress": "TMn1qrmYUMSTXo9babrJLzepKZoPC7M6Sy",
  "functionName": "getAmountsOut",
  "args": ["100000000", ["USDT_ADDRESS", "TRX_ADDRESS"]],
  "network": "mainnet"
}
```

### MCP Tools with ABI Parameter

Used by: `sunswap-smart-router-nile/` (Smart Router on Nile)

```json
{
  "contractAddress": "TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3",
  "functionName": "WTRX",
  "network": "nile",
  "abi": [
    {
      "outputs": [{"type": "address"}],
      "name": "WTRX",
      "stateMutability": "View",
      "type": "Function"
    }
  ]
}
```

**Why ABI is needed**:
- Smart Router's on-chain ABI is incomplete
- Missing `tuple` components in function definitions
- TronWeb cannot parse incomplete ABI
- Solution: Provide custom ABI in MCP calls

---

## Development Workflow

### Creating a New Skill

1. **Create directory structure**
   ```bash
   mkdir -p my-skill/{examples,resources,scripts}
   ```

2. **Create SKILL.md with frontmatter**
   ```bash
   cat > my-skill/SKILL.md << 'EOF'
   ---
   name: My Skill
   description: What it does
   version: 1.0.0
   dependencies:
     - mcp-server-tron
   tags:
     - category
   ---
   
   # My Skill
   [Content]
   EOF
   ```

3. **Add examples and resources**

4. **Test with AI agent**

5. **Document test results**

6. **Submit PR**

### Testing a Skill

1. **Read SKILL.md**
   ```
   Please read skills/my-skill/SKILL.md
   ```

2. **Test basic functionality**
   - Query operations
   - Write operations
   - Error handling

3. **Document results**
   - Create TEST_RESULTS.md
   - Include success and failure cases
   - Document parameter rules

4. **Update examples**
   - Add working examples
   - Include edge cases

---

## Version History

### v1.0.0 (2026-02-07)

**Added**:
- ✅ SunSwap V2 Router skill (mainnet)
- ✅ SunSwap Smart Router skill (Nile testnet)
- ✅ MCP ABI parameter support
- ✅ Complete test results documentation
- ✅ Parameter rules documentation

**Tested**:
- ✅ V2 Router swaps on mainnet
- ✅ Smart Router queries on Nile
- ✅ Smart Router swaps on Nile
- ✅ MCP tools with custom ABI

**Known Issues**:
- None

---

## Future Skills (Planned)

### High Priority

1. **SunSwap Smart Router (Mainnet)**
   - Adapt Nile skill for mainnet
   - Test with real tokens
   - Document gas costs

2. **JustLend Protocol**
   - Lending and borrowing
   - Interest rate queries
   - Collateral management

3. **JustStables**
   - Stablecoin swaps
   - Low slippage trades

### Medium Priority

4. **AAVE on TRON**
   - Cross-chain lending

5. **SUN Token Staking**
   - Stake SUN tokens
   - Claim rewards

6. **NFT Trading**
   - APENFT marketplace
   - NFT transfers

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

**Quick Checklist**:
- ✅ SKILL.md with valid YAML frontmatter
- ✅ README.md with quick start
- ✅ Working examples
- ✅ Test results documented
- ✅ All dependencies listed
- ✅ Security considerations noted

---

## Resources

- **Main Repository**: https://github.com/open-aibank/skills-tron
- **MCP Server**: https://github.com/open-aibank/mcp-server-tron
- **TRC-8004 Project**: https://github.com/open-aibank/trc-8004
- **TRON Documentation**: https://developers.tron.network/

---

## License

MIT License - see [LICENSE](LICENSE) file

---

**Maintained by**: Open AI Bank Team  
**Last Updated**: 2026-02-07  
**Version**: 1.0.0
