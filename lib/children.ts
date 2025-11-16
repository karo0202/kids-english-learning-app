import { getFirestoreClient } from '@/lib/firebase'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Unsubscribe,
} from 'firebase/firestore'
import { AgeGroup, getAgeGroup } from './age-utils'

export interface Child {
  id: string
  name: string
  age: number
  ageGroup: AgeGroup
  parentId: string
  parentEmail?: string // Store email for migration purposes
  createdAt: string
  avatar?: string
}

type ChildrenSubscriber = (children: Child[]) => void

const childCache = new Map<string, Child[]>()
const childSubscribers = new Map<string, Set<ChildrenSubscriber>>()
const firestoreUnsubscribers = new Map<string, Unsubscribe>()

// Synchronous function for instant loading from localStorage
export function getChildrenSync(parentId: string, userEmail?: string): Child[] {
  if (typeof window === 'undefined') return []
  
  // Return cached data immediately
  const cached = childCache.get(parentId)
  if (cached && cached.length > 0) {
    return cloneChildren(cached)
  }

  // Load from localStorage immediately (synchronous)
  const local = loadLocalChildren(parentId, userEmail)
  
  // If we have local data, cache it and start Firestore sync
  if (local.length > 0) {
    childCache.set(parentId, local)
    // Start Firestore sync in background (non-blocking) - this will merge any new data
    if (typeof window !== 'undefined') {
      void refreshChildrenFromFirestore(parentId, userEmail)
    }
    return cloneChildren(local)
  }
  
  // If no local data, try to find children by email (for cross-device migration)
  if (userEmail) {
    const childrenByEmail = findChildrenByEmail(userEmail, parentId)
    if (childrenByEmail.length > 0) {
      childCache.set(parentId, childrenByEmail)
      // Start Firestore sync to get the latest data
      if (typeof window !== 'undefined') {
        void refreshChildrenFromFirestore(parentId, userEmail)
      }
      return cloneChildren(childrenByEmail)
    }
  }

  // No local data found - start Firestore sync immediately
  if (typeof window !== 'undefined') {
    void refreshChildrenFromFirestore(parentId, userEmail)
  }
  
  return []
}

// Async function for Firestore sync (use only when needed)
export async function getChildren(parentId: string, userEmail?: string): Promise<Child[]> {
  // Always return localStorage data immediately
  const local = getChildrenSync(parentId, userEmail)
  
  // Sync from Firestore in background (non-blocking)
  if (typeof window !== 'undefined') {
    void refreshChildrenFromFirestore(parentId)
  }
  
  return local
}

export function subscribeToChildren(parentId: string, callback: ChildrenSubscriber, userEmail?: string): () => void {
  const subscribers = childSubscribers.get(parentId) ?? new Set<ChildrenSubscriber>()
  subscribers.add(callback)
  childSubscribers.set(parentId, subscribers)

  callback(cloneChildren(childCache.get(parentId) ?? loadLocalChildren(parentId, userEmail)))
  ensureFirestoreListener(parentId, userEmail)
  
  // Immediately trigger Firestore refresh to sync across devices
  if (typeof window !== 'undefined') {
    void refreshChildrenFromFirestore(parentId, userEmail)
  }

  return () => {
    const current = childSubscribers.get(parentId)
    if (!current) return
    current.delete(callback)
    if (current.size === 0) {
      childSubscribers.delete(parentId)
      detachFirestoreListener(parentId)
    }
  }
}

export async function addChild(parentId: string, name: string, age: number, parentEmail?: string): Promise<Child> {
  const ageGroup = getAgeGroup(age)
  const newChild: Child = {
    id: `child-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    age,
    ageGroup,
    parentId,
    parentEmail, // Store email for migration
    createdAt: new Date().toISOString(),
    avatar: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(name)}`,
  }

  console.log('Adding child:', { parentId, childId: newChild.id, name, age, ageGroup: newChild.ageGroup })

  // Always save to localStorage first (immediate persistence)
  const currentChildren = childCache.get(parentId) ?? loadLocalChildren(parentId)
  const updatedChildren = [...currentChildren, newChild]
  
  // Update cache and localStorage immediately
  childCache.set(parentId, updatedChildren)
  persistLocalChildren(parentId, updatedChildren)
  console.log('Child saved to cache and localStorage. Total children:', updatedChildren.length)
  console.log('Saved child details:', { id: newChild.id, name: newChild.name, parentId: newChild.parentId, age: newChild.age })

  // Try to save to Firestore (non-blocking, but log errors)
  const firestore = getFirestoreClient()
  if (firestore) {
    try {
      const docRef = doc(firestore, 'parents', parentId, 'children', newChild.id)
      await setDoc(
        docRef,
        {
          ...newChild,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
      console.log('Child saved to Firestore successfully:', newChild.id)
    } catch (error) {
      console.error('Failed to save child to Firestore (but saved locally):', error)
      // Don't throw - child is already saved locally
    }
  } else {
    console.warn('Firestore not available, child saved to localStorage only')
  }

  // Notify subscribers
  notifySubscribers(parentId, updatedChildren)

  setCurrentChild(newChild)
  return newChild
}

export async function updateChild(parentId: string, childId: string, updates: Partial<Child>): Promise<Child | null> {
  const currentChildren = childCache.get(parentId) ?? loadLocalChildren(parentId)
  const targetIndex = currentChildren.findIndex(child => child.id === childId)

  if (targetIndex === -1) {
    await refreshChildrenFromFirestore(parentId)
    const refreshedChildren = childCache.get(parentId) ?? []
    const refreshedIndex = refreshedChildren.findIndex(child => child.id === childId)
    if (refreshedIndex === -1) return null
    return updateChild(parentId, childId, updates)
  }

  const existingChild = currentChildren[targetIndex]
  const updatedChild: Child = {
    ...existingChild,
    ...updates,
    ageGroup: updates.age !== undefined ? getAgeGroup(updates.age) : existingChild.ageGroup,
  }

  const firestore = getFirestoreClient()
  if (firestore) {
    try {
      const docRef = doc(firestore, 'parents', parentId, 'children', childId)
      await setDoc(
        docRef,
        {
          ...updatedChild,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    } catch (error) {
      console.error('Failed to update child in Firestore:', error)
    }
  }

  const updatedChildren = [...currentChildren]
  updatedChildren[targetIndex] = updatedChild
  updateChildrenCache(parentId, updatedChildren)

  const currentChild = getCurrentChild()
  if (currentChild && currentChild.id === childId) {
    setCurrentChild(updatedChild)
  }

  return updatedChild
}

export async function deleteChild(parentId: string, childId: string): Promise<boolean> {
  const firestore = getFirestoreClient()
  if (firestore) {
    try {
      const docRef = doc(firestore, 'parents', parentId, 'children', childId)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Failed to delete child from Firestore:', error)
    }
  }

  const currentChildren = childCache.get(parentId) ?? loadLocalChildren(parentId)
  const updatedChildren = currentChildren.filter(child => child.id !== childId)
  updateChildrenCache(parentId, updatedChildren)

  const currentChild = getCurrentChild()
  if (currentChild?.id === childId) {
    clearCurrentChild()
  }

  return true
}

export function setCurrentChild(child: Child): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('currentChild', JSON.stringify(child))
}

export function getCurrentChild(): Child | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem('currentChild')
    if (!raw) return null
    return JSON.parse(raw)
  } catch (error) {
    console.error('Error loading current child:', error)
    return null
  }
}

export function clearCurrentChild(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('currentChild')
}

async function refreshChildrenFromFirestore(parentId: string, userEmail?: string) {
  const firestore = getFirestoreClient()
  if (!firestore) {
    console.log('Firestore not available, skipping refresh for parentId:', parentId)
    return
  }

  try {
    console.log('Refreshing children from Firestore for parentId:', parentId, 'email:', userEmail)
    const collectionRef = collection(firestore, 'parents', parentId, 'children')
    const snapshot = await getDocs(collectionRef)
    const firestoreChildren = snapshot.docs.map(docSnapshot => normalizeChild(docSnapshot.data()))
    console.log(`Loaded ${firestoreChildren.length} children from Firestore for parentId: ${parentId}`)
    
    // If Firestore has children, prioritize them (they're the source of truth across devices)
    if (firestoreChildren.length > 0) {
      // Merge with localStorage - Firestore is source of truth, but keep local-only children too
      const localChildren = loadLocalChildren(parentId, userEmail)
      const firestoreIds = new Set(firestoreChildren.map(c => c.id))
      const localOnly = localChildren.filter(c => !firestoreIds.has(c.id))
      const merged = [...firestoreChildren, ...localOnly]
      console.log(`Merged: ${merged.length} (Firestore: ${firestoreChildren.length}, Local-only: ${localOnly.length})`)
      updateChildrenCache(parentId, merged)
    } else {
      // If Firestore is empty, check localStorage and try email-based migration
      const localChildren = loadLocalChildren(parentId, userEmail)
      if (localChildren.length > 0) {
        // We have local children but not in Firestore - save them to Firestore
        console.log(`Saving ${localChildren.length} local children to Firestore`)
        for (const child of localChildren) {
          try {
            const docRef = doc(firestore, 'parents', parentId, 'children', child.id)
            await setDoc(docRef, {
              ...child,
              parentId, // Ensure parentId is correct
              parentEmail: userEmail, // Store email for future migrations
              updatedAt: serverTimestamp(),
            }, { merge: true })
          } catch (error) {
            console.error(`Failed to save child ${child.id} to Firestore:`, error)
          }
        }
        updateChildrenCache(parentId, localChildren)
      } else if (userEmail) {
        // Try email-based migration
        const migrated = findChildrenByEmail(userEmail, parentId)
        if (migrated.length > 0) {
          console.log(`Migrated ${migrated.length} children by email to parentId: ${parentId}`)
          // Save migrated children to Firestore
          for (const child of migrated) {
            try {
              const docRef = doc(firestore, 'parents', parentId, 'children', child.id)
              await setDoc(docRef, {
                ...child,
                parentId,
                parentEmail: userEmail,
                updatedAt: serverTimestamp(),
              }, { merge: true })
            } catch (error) {
              console.error(`Failed to save migrated child ${child.id} to Firestore:`, error)
            }
          }
          updateChildrenCache(parentId, migrated)
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch children from Firestore:', error)
    // Fallback to localStorage
    const localChildren = loadLocalChildren(parentId, userEmail)
    if (localChildren.length > 0) {
      updateChildrenCache(parentId, localChildren)
    }
  }
}

function ensureFirestoreListener(parentId: string, userEmail?: string) {
  if (firestoreUnsubscribers.has(parentId)) return

  const firestore = getFirestoreClient()
  if (!firestore) return

  const collectionRef = collection(firestore, 'parents', parentId, 'children')
  const unsubscribe = onSnapshot(
    collectionRef,
    snapshot => {
      const firestoreChildren = snapshot.docs.map(docSnapshot => normalizeChild(docSnapshot.data()))
      console.log(`Firestore snapshot: ${firestoreChildren.length} children for parentId: ${parentId}`)
      
      // Prioritize Firestore data (source of truth across devices)
      const localChildren = loadLocalChildren(parentId, userEmail)
      
      if (firestoreChildren.length > 0) {
        // Firestore has data - use it as source of truth, but keep local-only children
        const firestoreIds = new Set(firestoreChildren.map(c => c.id))
        const localOnly = localChildren.filter(c => !firestoreIds.has(c.id))
        const mergedChildren = [...firestoreChildren, ...localOnly]
        console.log(`Merged children: ${mergedChildren.length} (Firestore: ${firestoreChildren.length}, Local-only: ${localOnly.length})`)
        updateChildrenCache(parentId, mergedChildren)
      } else if (localChildren.length > 0) {
        // Firestore is empty but we have local children - keep them
        console.log(`Using local children (${localChildren.length}) - Firestore is empty`)
        updateChildrenCache(parentId, localChildren)
      }
      // If both are empty, do nothing
    },
    error => {
      console.error('Children snapshot listener error:', error)
      // On error, keep using localStorage data - NEVER clear it
      const localChildren = loadLocalChildren(parentId, userEmail)
      if (localChildren.length > 0) {
        console.log('Using localStorage children due to Firestore error')
        updateChildrenCache(parentId, localChildren)
      }
    }
  )

  firestoreUnsubscribers.set(parentId, unsubscribe)
}

function detachFirestoreListener(parentId: string) {
  const unsubscribe = firestoreUnsubscribers.get(parentId)
  if (unsubscribe) {
    unsubscribe()
    firestoreUnsubscribers.delete(parentId)
  }
}

function updateChildrenCache(parentId: string, children: Child[]) {
  childCache.set(parentId, children)
  persistLocalChildren(parentId, children)
  notifySubscribers(parentId, children)
}

function notifySubscribers(parentId: string, children: Child[]) {
  const subscribers = childSubscribers.get(parentId)
  if (!subscribers) return

  const clonedChildren = cloneChildren(children)
  subscribers.forEach(callback => {
    try {
      callback(clonedChildren)
    } catch (error) {
      console.error('Child subscriber error:', error)
    }
  })
}

function loadLocalChildren(parentId: string, userEmail?: string): Child[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem('children')
    if (!raw) {
      console.log('No children found in localStorage for parentId:', parentId)
      return []
    }
    const children: Child[] = JSON.parse(raw)
    console.log(`Found ${children.length} total children in localStorage`)
    console.log('All children in localStorage:', children.map(c => ({ id: c.id, name: c.name, parentId: c.parentId, parentEmail: c.parentEmail })))
    
    // First, try to find children by parentId
    let filtered = children.filter(child => child.parentId === parentId).map(normalizeChild)
    
    console.log(`Found ${filtered.length} children by parentId: ${parentId}`)
    return filtered
  } catch (error) {
    console.error('Failed to load children from localStorage:', error)
    return []
  }
}

// Helper function to find children by email (for cross-device migration)
function findChildrenByEmail(userEmail: string, newParentId: string): Child[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem('children')
    if (!raw) return []
    
    const children: Child[] = JSON.parse(raw)
    const emailLower = userEmail.toLowerCase()
    
    // Find children that match this email
    const childrenByEmail = children
      .filter(child => {
        const childEmail = child.parentEmail?.toLowerCase() || ''
        return childEmail === emailLower
      })
      .map(normalizeChild)
    
    if (childrenByEmail.length > 0) {
      console.log(`Found ${childrenByEmail.length} children by email: ${userEmail}`)
      // Migrate children to new parentId
      const migrated = childrenByEmail.map(child => ({
        ...child,
        parentId: newParentId,
        parentEmail: userEmail
      }))
      
      // Update localStorage with migrated children
      const otherChildren = children.filter(c => 
        !childrenByEmail.some(mc => mc.id === c.id)
      )
      const updated = [...otherChildren, ...migrated]
      localStorage.setItem('children', JSON.stringify(updated))
      
      console.log(`Migrated ${migrated.length} children to parentId: ${newParentId}`)
      return migrated
    }
    
    return []
  } catch (error) {
    console.error('Failed to find children by email:', error)
    return []
  }
}

function persistLocalChildren(parentId: string, children: Child[]) {
  if (typeof window === 'undefined') return

  try {
    const raw = localStorage.getItem('children')
    const allChildren: Child[] = raw ? JSON.parse(raw) : []
    const filtered = allChildren.filter(child => child.parentId !== parentId)
    const updated = [...filtered, ...children]
    localStorage.setItem('children', JSON.stringify(updated))
    console.log(`Persisted ${children.length} children to localStorage for parentId: ${parentId}`)
  } catch (error) {
    console.error('Failed to persist children locally:', error)
  }
}

function normalizeChild(data: any): Child {
  const age = Number(data?.age ?? 0)
  const child: Child = {
    id: data?.id ?? `child-${Math.random().toString(36).slice(2)}`,
    name: data?.name ?? 'Learner',
    age,
    ageGroup: data?.ageGroup ?? getAgeGroup(age),
    parentId: data?.parentId ?? '',
    createdAt: data?.createdAt ?? new Date().toISOString(),
    avatar: data?.avatar,
  }

  return child
}

function cloneChildren(children: Child[]): Child[] {
  return children.map(child => ({ ...child }))
}
