import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, OAuthProvider, setPersistence, browserLocalPersistence, signInWithRedirect, getRedirectResult, signInWithPopup, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

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
let firestore: Firestore | null = null
let authStateListenerSet = false

function ensureFirebaseApp() {
  if (typeof window === 'undefined') return null

  if (!validateFirebaseConfig()) {
    console.error('Firebase configuration is incomplete. Please check your environment variables.')
    return null
  }

  if (!app) {
    try {
      app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig)
      console.log('Firebase initialized successfully')
    } catch (error) {
      console.error('Firebase initialization error:', error)
      return null
    }
  }

  return app
}

export function getAuthClient() {
  const firebaseApp = ensureFirebaseApp()
  if (!firebaseApp) return null

  if (!auth) {
    try {
      auth = getAuth(firebaseApp)
      setPersistence(auth, browserLocalPersistence)
      googleProvider = new GoogleAuthProvider()
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      })
      appleProvider = new OAuthProvider('apple.com')
      
      // Sync Firebase auth state with localStorage (only set up once)
      if (typeof window !== 'undefined' && !authStateListenerSet) {
        authStateListenerSet = true
        onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            // Sync Firebase user to localStorage
            const userSession = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              accountType: 'parent'
            }
            localStorage.setItem('user', JSON.stringify(userSession))
            console.log('Firebase auth state synced to localStorage:', userSession)
          } else {
            // User signed out - clear session
            localStorage.removeItem('user')
            localStorage.removeItem('currentChild')
            console.log('Firebase auth state cleared from localStorage')
          }
        })
      }
    } catch (error) {
      console.error('Failed to initialize Firebase Auth:', error)
      return null
    }
  }

  return { auth, googleProvider, appleProvider }
}

export function getFirestoreClient(): Firestore | null {
  const firebaseApp = ensureFirebaseApp()
  if (!firebaseApp) return null

  if (!firestore) {
    try {
      firestore = getFirestore(firebaseApp)
    } catch (error) {
      console.error('Failed to initialize Firestore:', error)
      return null
    }
  }

  return firestore
}

// Google Sign In - Use popup method (more reliable)
export const signInWithGoogle = async () => {
  try {
    const client = getAuthClient()
    if (!client) {
      throw new Error('Firebase not initialized. Please check your environment variables.')
    }
    
    const { auth, googleProvider } = client
    
    console.log('Starting Google sign-in with popup...')
    console.log('Current URL:', window.location.href)
    console.log('Auth domain:', auth.app.options.authDomain)
    
    // Use popup method - more reliable than redirect
    const result = await signInWithPopup(auth, googleProvider)
    console.log('Google sign-in successful:', result.user?.email)
    return result
  } catch (error: any) {
    console.error('Google sign-in error:', error)
    
    // If popup is blocked, try redirect as fallback
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      console.log('Popup blocked, trying redirect method...')
      try {
        const client = getAuthClient()
        if (!client) throw error
        
        const { auth, googleProvider } = client
        await signInWithRedirect(auth, googleProvider)
        return null // Redirect will happen
      } catch (redirectError: any) {
        console.error('Redirect fallback failed:', redirectError)
        throw error // Throw original popup error
      }
    }
    
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
