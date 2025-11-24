# Cryptocurrency Payment Setup Guide

## Table of Contents
- [Overview](#overview)
- [Setup Instructions](#setup-instructions)
- [Payment Flow](#payment-flow)
- [Payment Verification](#payment-verification)
- [Network Information](#network-information)
- [Security Notes](#security-notes)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)
- [Premium Features](#premium-features)

## Overview
Your app now supports cryptocurrency payments for premium subscriptions. Users can pay with Bitcoin (BTC), Ethereum (ETH), USDT, or USDC.

**Supported Cryptocurrencies:**
- **Bitcoin (BTC)**: Native Bitcoin network
- **Ethereum (ETH)**: Native Ethereum network
- **USDT (Tether)**: ERC-20 token on Ethereum network
- **USDC (USD Coin)**: ERC-20 token on Ethereum network

## Setup Instructions

### 1. Add Your Wallet Addresses

Create a `.env.local` file in the `app` directory (if it doesn't exist) and add your wallet addresses:

```env
NEXT_PUBLIC_BTC_WALLET=your_bitcoin_wallet_address_here
NEXT_PUBLIC_ETH_WALLET=your_ethereum_wallet_address_here
NEXT_PUBLIC_USDT_WALLET=your_usdt_wallet_address_here
NEXT_PUBLIC_USDC_WALLET=your_usdc_wallet_address_here
```

**Important:** 
- Replace all placeholder addresses with your actual wallet addresses
- **Bitcoin addresses** can start with:
  - `1` (Legacy P2PKH)
  - `3` (P2SH)
  - `bc1` (Bech32/segwit)
- **Ethereum addresses** must start with `0x` and be 42 characters long
- **USDT and USDC** can use the same Ethereum address if they're ERC-20 tokens on the Ethereum network
- Always verify addresses before adding them to prevent loss of funds
- Test with small amounts first before accepting large payments

**FIB Payment QR Code (Optional):**
If you're using FIB (Fast Iraqi Bank) manual payments, you can add your QR code image:
- QR code image location: `app/public/images/FIB-payment-QR/fib-qr-code.jpg`
- To use it, set the `FIB_QR_IMAGE_URL` environment variable:
  ```env
  FIB_QR_IMAGE_URL=/images/FIB-payment-QR/fib-qr-code.jpg
  ```
  Or use a full URL if hosting externally:
  ```env
  FIB_QR_IMAGE_URL=https://your-domain.com/images/FIB-payment-QR/fib-qr-code.jpg
  ```

### 2. Update Payment Plans (Optional)

You can customize the payment plans in `app/lib/crypto-payment.ts`:

- Edit the `PAYMENT_PLANS` array to change prices, features, or add new plans
- Update `priceCrypto` values to match current cryptocurrency prices
- Modify `currency` to use different cryptocurrencies per plan
- Adjust `duration` for subscription periods
- Add or remove features from each plan tier

**Note:** When updating prices, ensure they reflect current exchange rates. Consider using a price API to keep rates updated automatically.

### 3. Payment Flow

The payment process follows these steps:

1. **User initiates upgrade**: User clicks "Upgrade Now" on the dashboard
2. **Plan selection**: User selects a plan (Monthly, Yearly, or Lifetime)
3. **Currency selection**: User selects payment currency (BTC, ETH, USDT, USDC)
4. **Payment details generated**: System displays:
   - QR code for easy scanning with mobile wallets
   - Wallet address for manual payment (copy-paste)
   - Exact amount to pay in selected cryptocurrency
   - Payment expiration time (if applicable)
5. **User sends payment**: User sends payment from their cryptocurrency wallet
6. **Transaction verification**: User enters transaction hash (TX ID) to verify payment
7. **Subscription activation**: Premium subscription is activated upon successful verification

**Payment Timeframes:**
- Bitcoin: Typically 10-60 minutes (depends on network congestion and fee)
- Ethereum: Typically 15 seconds - 5 minutes
- USDT/USDC: Same as Ethereum (ERC-20 tokens)

### 4. Payment Verification

Currently, the system uses **manual verification**:

**For Users:**
- After sending payment, copy the transaction hash (TX ID) from your wallet
- Enter the transaction hash in the verification form
- Wait for admin verification (usually within 24 hours)

**For Admins:**
- Verify transactions on blockchain explorers:
  - **Bitcoin**: 
    - [Blockchain.info](https://www.blockchain.com/explorer)
    - [Blockchair](https://blockchair.com/bitcoin)
    - [Blockstream Explorer](https://blockstream.info)
  - **Ethereum**: 
    - [Etherscan](https://etherscan.io)
    - [Blockscout](https://blockscout.com)
  - **USDT/USDC (ERC-20)**: 
    - [Etherscan](https://etherscan.io) (search by token contract address)
    - [Etherscan Token Tracker](https://etherscan.io/tokens)

**Verification Checklist:**
- ✅ Transaction hash is valid
- ✅ Payment amount matches the required amount
- ✅ Payment was sent to the correct wallet address
- ✅ Transaction has sufficient confirmations (at least 1 for ETH, 3+ for BTC)
- ✅ Transaction is not a double-spend attempt

### 5. Network Information

**Supported Networks:**
- **Bitcoin**: Mainnet (production) - Use mainnet addresses for real payments
- **Ethereum**: Mainnet (production) - Use mainnet addresses for real payments
- **USDT/USDC**: ERC-20 on Ethereum Mainnet

**Network Considerations:**
- All addresses must be on the mainnet (not testnet) for production
- Testnet addresses will result in lost funds if used in production
- Different networks (e.g., TRC-20 USDT) are not currently supported
- Always verify the network before accepting payments

**Transaction Fees:**
- **Bitcoin**: Fees vary based on network congestion (typically $1-10)
- **Ethereum**: Gas fees vary (typically $2-20 depending on network activity)
- **USDT/USDC**: Same gas fees as Ethereum (ERC-20 tokens require ETH for gas)
- Users are responsible for paying transaction fees
- Consider adjusting prices to account for fee variations

### 6. Testing

**Local Development Testing:**
1. Start your development server: `npm run dev`
2. Navigate to `/payment` or click "Upgrade Now" from dashboard
3. Test the QR code generation and display
4. Verify wallet addresses are displayed correctly
5. Test the transaction hash input form
6. Verify all currency options are available

**Test Checklist:**
- ✅ QR code generates correctly for each currency
- ✅ Wallet addresses display correctly from environment variables
- ✅ Payment amounts calculate correctly
- ✅ Transaction hash input accepts valid formats
- ✅ Error messages display for invalid inputs
- ✅ UI is responsive on mobile devices

**Important:** Use testnet addresses for testing, but remember to switch to mainnet addresses before production deployment.

## Security Notes

### Critical Security Practices

- ⚠️ **Never commit your `.env.local` file to git**
  - Add `.env.local` to your `.gitignore` file
  - Use environment variables in production hosting platforms
  - Never share wallet addresses in public repositories

- 🔒 **Keep your wallet private keys secure**
  - Never store private keys in code or configuration files
  - Use hardware wallets for large amounts
  - Enable two-factor authentication on wallet services
  - Use separate wallets for different purposes

- ✅ **Only share your public wallet addresses**
  - Public addresses are safe to share
  - Never share private keys or seed phrases
  - Verify addresses before sharing

- 📝 **Monitor your wallet regularly**
  - Set up wallet notifications for incoming payments
  - Check transactions daily
  - Use wallet monitoring tools or APIs
  - Keep records of all transactions

- 🔍 **Verify all transactions manually**
  - Always verify transaction hash on blockchain explorer
  - Check that payment amount matches exactly
  - Verify the correct wallet address received payment
  - Wait for sufficient confirmations before activating premium

- 🛡️ **Additional Security Measures**
  - Use a dedicated wallet for app payments (not your personal wallet)
  - Set up transaction limits if possible
  - Implement rate limiting on payment verification endpoints
  - Log all payment attempts for audit purposes
  - Consider implementing payment timeouts/expiration

## Troubleshooting

### Common Issues and Solutions

**Issue: Wallet addresses not displaying**
- ✅ Check that `.env.local` file exists in the `app` directory
- ✅ Verify environment variable names are correct (case-sensitive)
- ✅ Ensure variables start with `NEXT_PUBLIC_` prefix
- ✅ Restart the development server after changing `.env.local`
- ✅ Check that addresses are not wrapped in quotes in `.env.local`

**Issue: QR code not generating**
- ✅ Verify `qrcode.react` is installed: `npm install qrcode.react`
- ✅ Check browser console for JavaScript errors
- ✅ Ensure wallet address is valid and not empty
- ✅ Try clearing browser cache

**Issue: Payment page not loading**
- ✅ Verify the route `/payment` exists in your app
- ✅ Check that the payment component is properly imported
- ✅ Review server logs for errors
- ✅ Ensure all dependencies are installed: `npm install`

**Issue: Transaction verification failing**
- ✅ Verify transaction hash format is correct (64 characters for BTC/ETH)
- ✅ Check transaction on blockchain explorer to confirm it exists
- ✅ Ensure transaction has sufficient confirmations
- ✅ Verify payment was sent to the correct wallet address
- ✅ Check that payment amount matches exactly (cryptocurrency amounts are precise)

**Issue: Wrong payment amount calculated**
- ✅ Verify exchange rates are up to date
- ✅ Check that price conversion logic is correct
- ✅ Ensure currency symbols match correctly
- ✅ Review `crypto-payment.ts` for calculation errors

**Issue: Environment variables not working in production**
- ✅ Set environment variables in your hosting platform (Vercel, Netlify, etc.)
- ✅ Ensure variables are marked as "public" if they start with `NEXT_PUBLIC_`
- ✅ Redeploy application after adding environment variables
- ✅ Check hosting platform documentation for environment variable setup

### Getting Help

If you need additional help:
1. **Check Configuration**: Verify your wallet addresses in `.env.local`
2. **Verify Dependencies**: Ensure all packages are installed: `npm install`
3. **Check Documentation**: Review this guide and code comments
4. **Browser Console**: Check browser console (F12) for JavaScript errors
5. **Server Logs**: Review server logs for backend errors
6. **Blockchain Explorer**: Verify transactions on appropriate explorer

## Future Enhancements

### Automated Payment Verification

For automated verification, consider integrating:

**Blockchain APIs:**
- **BlockCypher API**: [https://www.blockcypher.com/dev/](https://www.blockcypher.com/dev/)
  - Supports Bitcoin, Ethereum, and multiple altcoins
  - Real-time transaction monitoring
  - Webhook support
  
- **Blockchair API**: [https://blockchair.com/api](https://blockchair.com/api)
  - Multi-blockchain support
  - Free tier available
  - Transaction search and monitoring

- **Etherscan API**: [https://etherscan.io/apis](https://etherscan.io/apis)
  - Ethereum-specific
  - Token transaction tracking
  - Free tier with rate limits

**Payment Processors:**
- **Coinbase Commerce**: [https://commerce.coinbase.com](https://commerce.coinbase.com)
  - Built-in payment UI
  - Automatic verification
  - Multiple cryptocurrency support

- **BTCPay Server**: [https://btcpayserver.org](https://btcpayserver.org)
  - Self-hosted solution
  - Privacy-focused
  - Multiple payment methods

- **NOWPayments**: [https://nowpayments.io](https://nowpayments.io)
  - Easy integration
  - Multiple cryptocurrencies
  - Automatic conversion

**Implementation Tips:**
- Use webhooks for real-time payment notifications
- Implement payment expiration (e.g., 15-30 minutes)
- Add automatic subscription renewal
- Create admin dashboard for payment management
- Implement payment history and receipts
- Add email notifications for successful payments

## Premium Features

Premium subscribers get access to:

**Core Features:**
- ✅ Unlimited access to all lessons
- ✅ Advanced AI personalization
- ✅ Priority support
- ✅ Ad-free experience
- ✅ Offline mode
- ✅ Detailed progress reports

**Exclusive Features (Yearly/Lifetime Plans):**
- 🎁 Exclusive content and bonus lessons
- 👨‍👩‍👧‍👦 Family plan (share with up to 5 family members)
- 📊 Advanced analytics and insights
- 🎯 Personalized learning paths
- 🏆 Achievement badges and rewards
- 📱 Multi-device synchronization

