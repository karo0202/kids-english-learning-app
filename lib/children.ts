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
  createdAt: string
  avatar?: string
}

type ChildrenSubscriber = (children: Child[]) => void

const childCache = new Map<string, Child[]>()
const childSubscribers = new Map<string, Set<ChildrenSubscriber>>()
const firestoreUnsubscribers = new Map<string, Unsubscribe>()

export async function getChildren(parentId: string): Promise<Child[]> {
  // Return cached data immediately for fast loading
  const cached = childCache.get(parentId)
  if (cached && cached.length > 0) {
    // Refresh from Firestore in background (non-blocking)
    if (typeof window !== 'undefined') {
      void refreshChildrenFromFirestore(parentId)
    }
    return cloneChildren(cached)
  }

  // Fallback to localStorage for instant display
  const local = loadLocalChildren(parentId)
  if (local.length > 0) {
    childCache.set(parentId, local)
    // Refresh from Firestore in background (non-blocking)
    if (typeof window !== 'undefined') {
      void refreshChildrenFromFirestore(parentId)
    }
    return cloneChildren(local)
  }

  // If no cached data, try Firestore (but don't block if it fails)
  if (typeof window !== 'undefined') {
    try {
      await refreshChildrenFromFirestore(parentId)
      const firestoreChildren = childCache.get(parentId)
      if (firestoreChildren && firestoreChildren.length > 0) {
        return cloneChildren(firestoreChildren)
      }
    } catch (error) {
      console.error('Error loading children from Firestore:', error)
      // Continue with empty array if Firestore fails
    }
  }

  return []
}

export function subscribeToChildren(parentId: string, callback: ChildrenSubscriber): () => void {
  const subscribers = childSubscribers.get(parentId) ?? new Set<ChildrenSubscriber>()
  subscribers.add(callback)
  childSubscribers.set(parentId, subscribers)

  callback(cloneChildren(childCache.get(parentId) ?? loadLocalChildren(parentId)))
  ensureFirestoreListener(parentId)

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

export async function addChild(parentId: string, name: string, age: number): Promise<Child> {
  const ageGroup = getAgeGroup(age)
  const newChild: Child = {
    id: `child-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    age,
    ageGroup,
    parentId,
    createdAt: new Date().toISOString(),
    avatar: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${encodeURIComponent(name)}`,
  }

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
    } catch (error) {
      console.error('Failed to save child to Firestore:', error)
    }
  }

  const currentChildren = childCache.get(parentId) ?? loadLocalChildren(parentId)
  const updatedChildren = [...currentChildren, newChild]
  updateChildrenCache(parentId, updatedChildren)

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

async function refreshChildrenFromFirestore(parentId: string) {
  const firestore = getFirestoreClient()
  if (!firestore) return

  try {
    const collectionRef = collection(firestore, 'parents', parentId, 'children')
    const snapshot = await getDocs(collectionRef)
    const children = snapshot.docs.map(docSnapshot => normalizeChild(docSnapshot.data()))
    updateChildrenCache(parentId, children)
  } catch (error) {
    console.error('Failed to fetch children from Firestore:', error)
  }
}

function ensureFirestoreListener(parentId: string) {
  if (firestoreUnsubscribers.has(parentId)) return

  const firestore = getFirestoreClient()
  if (!firestore) return

  const collectionRef = collection(firestore, 'parents', parentId, 'children')
  const unsubscribe = onSnapshot(
    collectionRef,
    snapshot => {
      const children = snapshot.docs.map(docSnapshot => normalizeChild(docSnapshot.data()))
      updateChildrenCache(parentId, children)
    },
    error => {
      console.error('Children snapshot listener error:', error)
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

function loadLocalChildren(parentId: string): Child[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem('children')
    if (!raw) return []
    const children: Child[] = JSON.parse(raw)
    return children.filter(child => child.parentId === parentId).map(normalizeChild)
  } catch (error) {
    console.error('Failed to load children from localStorage:', error)
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
