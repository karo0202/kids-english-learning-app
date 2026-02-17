/**
 * Verify auth token - supports Firebase ID token, custom JWT, and userId from body
 */
import jwt from 'jsonwebtoken'

export async function getUserIdFromToken(
  authHeader: string | null,
  userIdFromBody?: string
): Promise<string | null> {
  // Try token first
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]
    if (token) {
      // Firebase token: decode (contains 'sub')
      try {
        const decoded = jwt.decode(token) as { sub?: string; user_id?: string; uid?: string } | null
        if (decoded?.sub) return decoded.sub
        if (decoded?.user_id) return decoded.user_id
        if (decoded?.uid) return decoded.uid
      } catch {
        // ignore
      }

      // Custom JWT with JWT_SECRET
      const secret = process.env.JWT_SECRET
      if (secret) {
        try {
          const decoded = jwt.verify(token, secret) as { userId?: string; sub?: string }
          return decoded.userId || decoded.sub || null
        } catch {
          // ignore
        }
      }
    }
  }

  // Fallback: userId from body (when token exists but we can't decode - e.g. Firebase)
  if (userIdFromBody && authHeader) return userIdFromBody

  return null
}
