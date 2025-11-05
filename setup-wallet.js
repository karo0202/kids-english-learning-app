// Setup script to create .env.local with wallet address
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = `# Cryptocurrency Wallet Addresses
NEXT_PUBLIC_BTC_WALLET=bc1pmrfhve3caywuskqwpymc8a0vj3vj5vwn6c9dpfcucy9n5tn788dq994r6t

# Add other wallet addresses when available:
# NEXT_PUBLIC_ETH_WALLET=your_ethereum_wallet_address_here
# NEXT_PUBLIC_USDT_WALLET=your_usdt_wallet_address_here
# NEXT_PUBLIC_USDC_WALLET=your_usdc_wallet_address_here
`;

try {
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Successfully created/updated .env.local with Bitcoin wallet address!');
  console.log('📝 Wallet address: bc1pmrfhve3caywuskqwpymc8a0vj3vj5vwn6c9dpfcucy9n5tn788dq994r6t');
  console.log('\n🚀 Next steps:');
  console.log('1. Restart your development server (npm run dev)');
  console.log('2. For Vercel: Add NEXT_PUBLIC_BTC_WALLET environment variable in Vercel dashboard');
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  process.exit(1);
}

