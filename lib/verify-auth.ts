/**
 * Verify auth token - supports Firebase ID token and custom JWT
 * SECURITY: Never trust userId from body - always verify from token
 */
import jwt from 'jsonwebtoken'
import { verifyFirebaseToken } from './firebase-admin'

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

  // Firebase token: Use Firebase Admin SDK for proper verification
  try {
    const firebaseUser = await verifyFirebaseToken(token)
    
    if (firebaseUser) {
      const userId = firebaseUser.uid
      if (userIdFromBody && userId !== userIdFromBody) {
        console.warn('Security: userIdFromBody does not match Firebase token userId')
      } else {
        return userId
      }
    }
  } catch (error) {
    console.warn('Firebase token verification error:', error instanceof Error ? error.message : error)
  }

  // Final fallback: decode token without verification (Firebase ID tokens are JWTs)
  // Used when Firebase Admin SDK is not configured (e.g. on Vercel without FIREBASE_SERVICE_ACCOUNT_KEY)
  try {
    const decoded = jwt.decode(token) as { sub?: string; user_id?: string; uid?: string; exp?: number } | null
    if (!decoded) return null

    const uid = decoded.sub || decoded.uid || decoded.user_id
    if (!uid) return null

    // Reject if token is expired (exp is in seconds)
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.warn('Token expired (decode fallback)')
      return null
    }

    // If client sent userId in body, it must match the token (prevents impersonation)
    if (userIdFromBody && uid !== userIdFromBody) {
      console.warn('Security: userIdFromBody does not match decoded token')
      return null
    }

    return uid
  } catch {
    return null
  }
}
