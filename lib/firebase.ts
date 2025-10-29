import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, OAuthProvider, setPersistence, browserLocalPersistence, signInWithRedirect, getRedirectResult, signInWithPopup } from 'firebase/auth'

// Read public env vars (Next.js: NEXT_PUBLIC_*)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate Firebase config
function validateFirebaseConfig() {
  if (typeof window === 'undefined') return false
  
  const missing = []
  if (!firebaseConfig.apiKey) missing.push('NEXT_PUBLIC_FIREBASE_API_KEY')
  if (!firebaseConfig.authDomain) missing.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN')
  if (!firebaseConfig.projectId) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID')
  if (!firebaseConfig.appId) missing.push('NEXT_PUBLIC_FIREBASE_APP_ID')
  
  if (missing.length > 0) {
    console.error('Firebase config missing:', missing.join(', '))
    return false
  }
  
  return true
}

let app: any = null
let auth: any = null
let googleProvider: any = null
let appleProvider: any = null

export function getAuthClient() {
  if (typeof window === 'undefined') return null
  
  if (!validateFirebaseConfig()) {
    console.error('Firebase configuration is incomplete. Please check your environment variables.')
    return null
  }
  
  if (!app) {
    try {
      app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig)
      auth = getAuth(app)
      setPersistence(auth, browserLocalPersistence)
      googleProvider = new GoogleAuthProvider()
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      })
      appleProvider = new OAuthProvider('apple.com')
      console.log('Firebase initialized successfully')
    } catch (error) {
      console.error('Firebase initialization error:', error)
      return null
    }
  }
  return { auth, googleProvider, appleProvider }
}

// Google Sign In - Use redirect method to avoid COOP issues
export const signInWithGoogle = async () => {
  try {
    const client = getAuthClient()
    if (!client) {
      throw new Error('Firebase not initialized. Please check your environment variables.')
    }
    
    const { auth, googleProvider } = client
    
    console.log('Starting Google sign-in redirect...')
    console.log('Current URL:', window.location.href)
    console.log('Auth domain:', auth.app.options.authDomain)
    
    // Set the redirect URL to the current page
    const redirectUrl = window.location.origin + '/login'
    console.log('Redirect URL will be:', redirectUrl)
    
    // Use redirect method to avoid COOP and popup blocking issues
    await signInWithRedirect(auth, googleProvider)
    return null // Redirect will happen
  } catch (error: any) {
    console.error('Google sign-in error:', error)
    throw new Error(error?.message || 'Failed to start Google sign-in. Please check your Firebase configuration.')
  }
}

// Handle Google redirect result
export const handleGoogleRedirect = async () => {
  try {
    const client = getAuthClient()
    if (!client) {
      console.warn('Auth client not available')
      return null
    }
    
    const { auth } = client
    console.log('Checking for redirect result...')
    const result = await getRedirectResult(auth)
    
    if (result) {
      console.log('Google redirect successful:', result.user?.email)
      console.log('User UID:', result.user?.uid)
      return result
    } else {
      console.log('No redirect result found - this is normal on page load')
      return null
    }
  } catch (error: any) {
    console.error('Google redirect error:', error)
    if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('An account already exists with this email. Please sign in with email/password.')
    }
    throw error
  }
}

export { app, auth, googleProvider, appleProvider }
