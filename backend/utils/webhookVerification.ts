import crypto from 'crypto'

/**
 * Verify CoinGate webhook signature
 */
export function verifyCoinGateSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(payload)
    const calculatedSignature = hmac.digest('hex')
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    )
  } catch (error) {
    console.error('CoinGate signature verification error:', error)
    return false
  }
}

/**
 * Verify NOWPayments webhook signature
 */
export function verifyNOWPaymentsSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = crypto.createHmac('sha512', secret)
    hmac.update(payload)
    const calculatedSignature = hmac.digest('hex')
    return signature === calculatedSignature
  } catch (error) {
    console.error('NOWPayments signature verification error:', error)
    return false
  }
}

/**
 * Verify ZainCash webhook signature
 */
export function verifyZainCashSignature(
  data: Record<string, any>,
  receivedHash: string,
  secret: string
): boolean {
  try {
    // ZainCash uses MD5 hash of sorted parameters + secret
    const sortedKeys = Object.keys(data).sort()
    const hashString = sortedKeys
      .map((key) => `${key}=${data[key]}`)
      .join('&')
    const hash = crypto.createHash('md5').update(hashString + secret).digest('hex')
    return hash.toLowerCase() === receivedHash.toLowerCase()
  } catch (error) {
    console.error('ZainCash signature verification error:', error)
    return false
  }
}

/**
 * Verify FastPay webhook HMAC signature
 */
export function verifyFastPaySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(payload)
    const calculatedSignature = hmac.digest('hex')
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    )
  } catch (error) {
    console.error('FastPay signature verification error:', error)
    return false
  }
}

/**
 * Verify NassPay webhook signature
 */
export function verifyNassPaySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(payload)
    const calculatedSignature = hmac.digest('hex')
    return signature === calculatedSignature
  } catch (error) {
    console.error('NassPay signature verification error:', error)
    return false
  }
}

/**
 * Verify FIB payment callback signature
 */
export function verifyFIBSignature(
  data: Record<string, any>,
  receivedSignature: string,
  secret: string
): boolean {
  try {
    // FIB typically uses SHA256 of sorted parameters
    const sortedKeys = Object.keys(data).sort()
    const hashString = sortedKeys
      .map((key) => `${key}=${data[key]}`)
      .join('&')
    const hash = crypto.createHash('sha256').update(hashString + secret).digest('hex')
    return hash.toLowerCase() === receivedSignature.toLowerCase()
  } catch (error) {
    console.error('FIB signature verification error:', error)
    return false
  }
}

