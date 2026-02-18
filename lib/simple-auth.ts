// Simple authentication without NextAuth
export interface User {
  id: string
  email: string
  name: string
  accountType: string
}

export function createDemoUser(): User {
  return {
    id: 'demo-user-1',
    email: 'john@doe.com',
    name: 'John Doe',
    accountType: 'parent'
  }
}

// Generate consistent user ID from email
function generateUserIdFromEmail(email: string): string {
  // Create a simple hash from email to ensure consistent user ID
  let hash = 0
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `user-${Math.abs(hash)}`
}

export function validateCredentials(email: string, password: string): User | null {
  // Demo mode: accept any email/password combination
  if (email && password && email.length > 0 && password.length >= 4) {
    return {
      id: generateUserIdFromEmail(email), // Consistent ID based on email
      email: email,
      name: email.split('@')[0], // Use email prefix as name
      accountType: 'parent'
    }
  }
  return null
}

export function setUserSession(user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

export function getUserSession(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
  }
  return null
}

export async function clearUserSession() {
  if (typeof window !== 'undefined') {
    // Sign out from Firebase if available
    try {
      const { getAuthClient } = await import('@/lib/firebase')
      const client = getAuthClient()
      if (client?.auth) {
        const { signOut } = await import('firebase/auth')
        await signOut(client.auth)
        console.log('Signed out from Firebase')
      }
    } catch (error) {
      console.error('Error signing out from Firebase:', error)
    }
    
    // Clear localStorage session
    localStorage.removeItem('user')
    localStorage.removeItem('currentChild')
    // Don't clear children and progress - they should persist across sessions
  }
}

export function hasStoredData(): boolean {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user')
    const children = localStorage.getItem('children')
    return !!(user || children)
  }
  return false
}

/**
 * Get authentication token for API requests
 * Tries Firebase ID token first (fresh), then localStorage
 * @param forceRefresh - If true, force Firebase to issue a new token (use for payments)
 */
export async function getAuthToken(forceRefresh = false): Promise<string | null> {
  if (typeof window === 'undefined') return null
  
  // Try Firebase ID token first (so we get a fresh token when needed)
  try {
    const { getAuthClient } = await import('@/lib/firebase')
    const client = getAuthClient()
    if (client?.auth?.currentUser) {
      const { getIdToken } = await import('firebase/auth')
      const token = await getIdToken(client.auth.currentUser, forceRefresh)
      if (token) {
        localStorage.setItem('accessToken', token)
        return token
      }
    }
  } catch (error) {
    console.error('Error getting Firebase token:', error)
  }
  
  // Fallback: use stored token (e.g. if Firebase not used)
  const storedToken = localStorage.getItem('accessToken')
  if (storedToken) {
    return storedToken
  }
  
  return null
}
