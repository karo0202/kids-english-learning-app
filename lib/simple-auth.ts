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

export function validateCredentials(email: string, password: string): User | null {
  // Demo mode: accept any email/password combination
  if (email && password && email.length > 0 && password.length >= 4) {
    return {
      id: `user-${Date.now()}`,
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

export function clearUserSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
    localStorage.removeItem('children')
    localStorage.removeItem('currentChild')
    localStorage.removeItem('progress')
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
