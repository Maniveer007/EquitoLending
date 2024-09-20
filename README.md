# CrossChainLending

## Overview

The **CrossChainLending** platform is a decentralized application that enables users to borrow and lend tokens across multiple blockchain networks using the **Equito protocol**. This solution leverages cross-chain interoperability, allowing seamless lending and borrowing operations between different chains while ensuring transparency and security for all participants.

check out : [Visit Here]()

## Key Features

- **Cross-Chain Borrowing**: Users can borrow assets on a destination chain by locking collateral on a source chain.
- **Collateral Management**: Robust management of user collateral with set collateral and liquidation ratios to maintain system stability.
- **Automated Loan Liquidation**: Loans that exceed the liquidation ratio are automatically flagged and can be liquidated to prevent bad debt.
- **Repayment Across Chains**: Users can repay borrowed amounts across chains with automatic fee and interest calculations.
- **Multi-Chain Support**: Supports native and ERC-20 tokens across different chains by integrating the Equito protocol.
- **Security Focused**: Ensures the safe transfer of funds with strong security mechanisms to protect user assets.

## Important Parameters

- **Collateral Ratio**: Users can borrow up to **60%** of their collateral value.
- **Liquidation Ratio**: Loans exceeding a **90%** ratio can be liquidated.
- **Fees**: **1%** fee per 30 days, charged on the loan amount for the duration of the loan.
- **Supported Collateral**: Native Ethereum (NativeEth) is supported as collateral.
- **Supported Borrowing Assets**: NativeEth and ERC-20 tokens are supported for borrowing.

---

## User Flow

1. **Add Collateral on Source Chain**:
   - Users first provide collateral on their source chain.
2. **Select Destination Chain**:
   - Users choose the destination chain on which they want to receive the borrowed amount.
3. **Borrow Funds**:
   - Users can borrow up to **60%** of their collateral amount, as defined by the collateral ratio.
4. **Monitor Loan Health**:

   - Users are responsible for keeping track of their **loan health factor**, which can fluctuate with the price of tokens.

5. **Liquidation**:

   - If the health factor crosses **90%**, the loan becomes eligible for liquidation, potentially resulting in the loss of the user's collateral.

6. **Repay Loan**:
   - Users can repay the borrowed loan amount on the destination chain to reclaim their collateral.

---
