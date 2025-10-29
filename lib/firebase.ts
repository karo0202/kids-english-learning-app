import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, OAuthProvider, setPersistence, browserLocalPersistence, signInWithRedirect, getRedirectResult } from 'firebase/auth'

// Read public env vars (Next.js: NEXT_PUBLIC_*)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: any = null
let auth: any = null
let googleProvider: any = null
let appleProvider: any = null

export function getAuthClient() {
  if (typeof window === 'undefined') return null
  if (!app) {
    app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig)
    auth = getAuth(app)
    setPersistence(auth, browserLocalPersistence)
    googleProvider = new GoogleAuthProvider()
    appleProvider = new OAuthProvider('apple.com')
  }
  return { auth, googleProvider, appleProvider }
}

// Google Sign In with Redirect (avoids COOP errors)
export const signInWithGoogleRedirect = async () => {
  try {
    const client = getAuthClient()
    if (!client) throw new Error('Auth not initialized')
    
    const { auth, googleProvider } = client
    await signInWithRedirect(auth, googleProvider)
  } catch (error) {
    console.error('Google sign-in error:', error)
    throw error
  }
}

// Handle Google redirect result
export const handleGoogleRedirect = async () => {
  try {
    const client = getAuthClient()
    if (!client) throw new Error('Auth not initialized')
    
    const { auth } = client
    const result = await getRedirectResult(auth)
    return result
  } catch (error) {
    console.error('Google redirect error:', error)
    throw error
  }
}

export { app, auth, googleProvider, appleProvider }
