export interface ManualCryptoConfig {
  walletAddress: string
  network?: string
  qrCodeUrl?: string
  note?: string
  contactPhone?: string
}

export interface ManualFIBConfig {
  accountName?: string
  phoneNumber: string
  qrCodeUrl?: string
  note?: string
}

export function getManualCryptoConfig(): ManualCryptoConfig {
  const walletAddress = process.env.MANUAL_CRYPTO_WALLET_ADDRESS || ''

  if (!walletAddress) {
    throw new Error('Manual crypto wallet address is not configured. Set MANUAL_CRYPTO_WALLET_ADDRESS.')
  }

  return {
    walletAddress,
    network: process.env.MANUAL_CRYPTO_NETWORK,
    qrCodeUrl: process.env.MANUAL_CRYPTO_QR_URL,
    note: process.env.MANUAL_CRYPTO_NOTE,
    contactPhone: process.env.MANUAL_CRYPTO_CONTACT_PHONE,
  }
}

export function getManualFIBConfig(): ManualFIBConfig {
  const phoneNumber = process.env.FIB_PHONE_NUMBER || ''

  if (!phoneNumber) {
    throw new Error('FIB phone number is not configured. Set FIB_PHONE_NUMBER.')
  }

  return {
    accountName: process.env.FIB_ACCOUNT_NAME,
    phoneNumber,
    qrCodeUrl: process.env.FIB_QR_IMAGE_URL,
    note: process.env.FIB_MANUAL_NOTE,
  }
}

