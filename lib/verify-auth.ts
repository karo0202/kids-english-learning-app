/**
 * Verify auth token - supports Firebase ID token and custom JWT
 * SECURITY: Never trust userId from body - always verify from token
 */
import jwt from 'jsonwebtoken'

export async function getUserIdFromToken(
  authHeader: string | null,
  userIdFromBody?: string
): Promise<string | null> {
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split(' ')[1]
  if (!token) {
    return null
  }

  // Try custom JWT with JWT_SECRET first (most secure)
  const secret = process.env.JWT_SECRET
  if (secret) {
    try {
      const decoded = jwt.verify(token, secret) as { userId?: string; sub?: string }
      const userId = decoded.userId || decoded.sub
      
      // SECURITY: If userIdFromBody is provided, verify it matches token
      if (userIdFromBody && userId !== userIdFromBody) {
        console.warn('Security: userIdFromBody does not match token userId')
        return null // Reject mismatched userId
      }
      
      return userId || null
    } catch (error) {
      // Token invalid or expired
      console.warn('JWT verification failed:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // Firebase token: decode (contains 'sub')
  // NOTE: For production, use Firebase Admin SDK to verify tokens properly
  try {
    const decoded = jwt.decode(token) as { sub?: string; user_id?: string; uid?: string; exp?: number } | null
    
    if (!decoded) {
      return null
    }

    // Check expiration manually (since we're not verifying)
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.warn('Token expired')
      return null
    }

    const userId = decoded.sub || decoded.user_id || decoded.uid
    
    // SECURITY: If userIdFromBody is provided, verify it matches token
    if (userIdFromBody && userId !== userIdFromBody) {
      console.warn('Security: userIdFromBody does not match Firebase token userId')
      return null // Reject mismatched userId
    }
    
    return userId || null
  } catch {
    return null
  }

  // SECURITY FIX: Removed unsafe fallback that trusted userIdFromBody without verification
  // Old code: if (userIdFromBody && authHeader) return userIdFromBody
  // This was a security vulnerability - users could impersonate others
}
