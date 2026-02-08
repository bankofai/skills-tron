
# 2. 📊 Balance & Allowance Check

## Overview
Confirm you have enough tokens for the swap and that the Router is authorized to spend them.

## 2.1 Check Balance
**Tool**: `read_contract` -> `balanceOf`

- **Input**: User Wallet Address
- **Output**: Token Balance (Raw Integer)
- **Check**: `balance >= amountIn`
    - *If insufficient*: **STOP**. Notify user.

## 2.2 Check Allowance
**Tool**: `read_contract` -> `allowance`

- **Owner**: User Wallet Address
- **Spender**: Smart Router Address (`TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax` / `TMEkn7zwGJvJsRoEkiTKfGRGZS2yMdVmu3`)
- **Output**: Allowed Amount (Raw Integer)
- **Decision**:
    - If `allowance >= amountIn`: **Proceed to Step 4** (Skip Step 3).
    - If `allowance < amountIn`: **Proceed to Step 3** (Approve).
    - If input token is TRX (Native): **Skip Step 3**. (No approval needed).

## ⚠️ Important Note
**Nile Testnet**: You **MUST** include the `abi` parameter for `balanceOf` and `allowance`.

### ABI Snippets
See `04_execute_swap.md` or `SKILL.md` for ABI JSON.
