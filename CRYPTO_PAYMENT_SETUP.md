# Cryptocurrency Payment Setup Guide

## Overview
Your app now supports cryptocurrency payments for premium subscriptions. Users can pay with Bitcoin (BTC), Ethereum (ETH), USDT, or USDC.

## Setup Instructions

### 1. Add Your Wallet Addresses

Create a `.env.local` file in the `app` directory (if it doesn't exist) and add your wallet addresses:

```env
NEXT_PUBLIC_BTC_WALLET=bc1pmrfhve3caywuskqwpymc8a0vj3vj5vwn6c9dpfcucy9n5tn788dq994r6t
NEXT_PUBLIC_ETH_WALLET=your_ethereum_wallet_address_here
NEXT_PUBLIC_USDT_WALLET=your_usdt_wallet_address_here
NEXT_PUBLIC_USDC_WALLET=your_usdc_wallet_address_here
```

**Important:** 
- Replace `your_bitcoin_wallet_address_here` with your actual Bitcoin wallet address
- Replace `your_ethereum_wallet_address_here` with your actual Ethereum wallet address
- USDT and USDC can use the same Ethereum address if they're on the Ethereum network
- Make sure addresses start with the correct prefix (e.g., `1` or `3` for BTC, `0x` for ETH)

### 2. Update Payment Plans (Optional)

You can customize the payment plans in `app/lib/crypto-payment.ts`:

- Edit the `PAYMENT_PLANS` array to change prices, features, or add new plans
- Update `priceCrypto` values to match current cryptocurrency prices
- Modify `currency` to use different cryptocurrencies per plan

### 3. Payment Flow

1. User clicks "Upgrade Now" on the dashboard
2. User selects a plan (Monthly, Yearly, or Lifetime)
3. User selects payment currency (BTC, ETH, USDT, USDC)
4. System generates:
   - QR code for easy scanning
   - Wallet address for manual payment
   - Exact amount to pay
5. User sends payment from their wallet
6. User enters transaction hash (TX ID) to verify
7. Premium subscription is activated

### 4. Payment Verification

Currently, the system uses manual verification:
- User enters their transaction hash after payment
- You can verify transactions on blockchain explorers:
  - Bitcoin: https://blockchain.info
  - Ethereum: https://etherscan.io
  - USDT/USDC: https://etherscan.io (if on Ethereum network)

### 5. Future Enhancements (Optional)

For automated verification, you can integrate:
- **Blockchain APIs**: BlockCypher, Blockchair, or Etherscan API
- **Payment Processors**: Coinbase Commerce, BTCPay Server, or NOWPayments
- **Webhooks**: For automatic payment confirmation

### 6. Testing

1. Start your development server: `npm run dev`
2. Navigate to `/payment` or click "Upgrade Now" from dashboard
3. Test the QR code generation
4. Verify wallet addresses are displayed correctly

## Security Notes

- ⚠️ Never commit your `.env.local` file to git
- 🔒 Keep your wallet private keys secure
- ✅ Only share your public wallet addresses
- 📝 Monitor your wallet regularly for incoming payments
- 🔍 Verify all transactions manually before activating premium features

## Support

If you need help:
1. Check that your wallet addresses are correct in `.env.local`
2. Ensure the QR code library is installed: `npm install qrcode.react`
3. Verify the payment page loads at `/payment`
4. Check browser console for any errors

## Premium Features

Premium subscribers get access to:
- Unlimited access to all lessons
- Advanced AI personalization
- Priority support
- Ad-free experience
- Offline mode
- Progress reports
- Exclusive content (yearly/lifetime)
- Family plan (yearly/lifetime)

