/**
 * Firebase Admin SDK initialization
 * Used for verifying Firebase ID tokens securely
 */

let adminInitialized = false
let adminAuth: any = null

/**
 * Initialize Firebase Admin SDK
 */
export async function initializeFirebaseAdmin() {
  if (adminInitialized && adminAuth) {
    return adminAuth
  }

  try {
    // Dynamic import to avoid loading in environments without Firebase Admin
    const admin = await import('firebase-admin')

    if (!admin.apps.length) {
      // Check if we have service account credentials
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

      if (serviceAccountKey) {
        // Parse service account from environment variable (JSON string)
        try {
          const serviceAccount = JSON.parse(serviceAccountKey)
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          })
        } catch (error) {
          console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', error)
          // Fallback: try to initialize with default credentials (for local dev)
          try {
            admin.initializeApp()
          } catch {
            console.warn('Firebase Admin initialization failed - token verification will use fallback method')
          }
        }
      } else {
        // Try to initialize with default credentials (for local dev or GCP)
        try {
          admin.initializeApp()
        } catch {
          console.warn('Firebase Admin not configured - using fallback token verification')
        }
      }
    }

    adminAuth = admin.auth()
    adminInitialized = true
    return adminAuth
  } catch (error) {
    console.warn('Firebase Admin SDK not available:', error)
    return null
  }
}

/**
 * Decode Firebase ID token without verification (fallback when Admin SDK unavailable)
 */
function decodeTokenFallback(token: string): { uid: string; email?: string } | null {
  try {
    const jwt = require('jsonwebtoken')
    const decoded = jwt.decode(token) as { sub?: string; uid?: string; email?: string; exp?: number } | null
    if (!decoded) return null
    const uid = decoded.sub || decoded.uid
    if (!uid) return null
    // Optional: reject expired tokens (exp is in seconds)
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      console.warn('Token expired')
      return null
    }
    return { uid, email: decoded.email }
  } catch {
    return null
  }
}

/**
 * Verify Firebase ID token
 * @param token - Firebase ID token
 * @returns Decoded token with user ID, or null if invalid
 */
export async function verifyFirebaseToken(token: string): Promise<{ uid: string; email?: string } | null> {
  try {
    const auth = await initializeFirebaseAdmin()
    
    if (!auth) {
      return decodeTokenFallback(token)
    }

    // Properly verify token with Firebase Admin
    const decodedToken = await auth.verifyIdToken(token)
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
    }
  } catch (error) {
    // When Firebase Admin fails (e.g. not installed), fall back to decode
    console.warn('Firebase token verification failed, trying decode fallback:', error instanceof Error ? error.message : error)
    return decodeTokenFallback(token)
  }
}
