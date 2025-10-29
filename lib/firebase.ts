import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, OAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth'

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

export { app, auth, googleProvider, appleProvider }
