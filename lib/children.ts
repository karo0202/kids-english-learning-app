import { getFirestoreClient } from '@/lib/firebase'
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Unsubscribe,
  where,
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
const deletedChildren = new Set<string>() // Track deleted child IDs to prevent restoration

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
  
  // NOTE: We removed automatic email migration here to prevent deleted children from being restored
  // Email migration only happens in forceMigrateChildrenByEmail (explicit migration)
  // This ensures that when a child is deleted, it stays deleted even after refresh
  
  // If we have local data, cache it and start Firestore sync
  if (local.length > 0) {
    childCache.set(parentId, local)
    // Start Firestore sync in background (non-blocking) - this will merge any new data
    if (typeof window !== 'undefined') {
      void refreshChildrenFromFirestore(parentId, userEmail)
    }
    return cloneChildren(local)
  }

  // No local data found - start Firestore sync immediately (will notify subscribers when done)
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

  // Load from cache or localStorage scoped to this parentId/email
  const initialChildren: Child[] =
    childCache.get(parentId) ?? loadLocalChildren(parentId, userEmail)
  
  callback(cloneChildren(initialChildren))
  ensureFirestoreListener(parentId, userEmail)
  
  // Immediately trigger Firestore refresh to sync across devices
  // This will also search Firestore by email and consolidate
  if (typeof window !== 'undefined') {
    console.log(`Starting Firestore sync for parentId: ${parentId}, email: ${userEmail}`)
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
  console.log(`🗑️ deleteChild called: parentId=${parentId}, childId=${childId}`)
  
  // Mark as deleted FIRST to prevent any restoration
  deletedChildren.add(childId)
  console.log(`🚫 Marked child ${childId} as deleted (preventing restoration)`)
  
  // Save deleted children list to localStorage for persistence across refreshes
  try {
    const deletedList = Array.from(deletedChildren)
    localStorage.setItem('deleted_children', JSON.stringify(deletedList))
    console.log(`💾 Saved ${deletedList.length} deleted child IDs to localStorage`)
  } catch (error) {
    console.error('Failed to save deleted children list:', error)
  }
  
  // FIRST: Delete from Firestore (source of truth)
  const firestore = getFirestoreClient()
  if (firestore) {
    try {
      console.log(`🔥 Deleting from Firestore: parents/${parentId}/children/${childId}`)
      const docRef = doc(firestore, 'parents', parentId, 'children', childId)
      await deleteDoc(docRef)
      console.log(`✅ Successfully deleted from Firestore`)
    } catch (error) {
      console.error('❌ Failed to delete child from Firestore:', error)
      // Continue with local deletion even if Firestore fails
    }
  } else {
    console.log('⚠️ Firestore not available, deleting from localStorage only')
  }

  // SECOND: Remove from localStorage (permanent removal)
  try {
    const raw = localStorage.getItem('children')
    if (raw) {
      const allChildren: Child[] = JSON.parse(raw)
      const beforeCount = allChildren.length
      // Filter out the deleted child
      const filtered = allChildren.filter(child => child.id !== childId)
      const afterCount = filtered.length
      
      if (beforeCount !== afterCount) {
        localStorage.setItem('children', JSON.stringify(filtered))
        console.log(`💾 Removed from localStorage: ${beforeCount} → ${afterCount} children`)
      } else {
        console.warn(`⚠️ Child ${childId} not found in localStorage`)
      }
    }
  } catch (error) {
    console.error('❌ Failed to update localStorage:', error)
  }

  // THIRD: Update cache
  const currentChildren = childCache.get(parentId) ?? loadLocalChildren(parentId)
  console.log(`📋 Current children before delete: ${currentChildren.length}`)
  console.log('Current children:', currentChildren.map(c => ({ id: c.id, name: c.name })))
  
  // Filter out deleted child
  const updatedChildren = currentChildren.filter(child => child.id !== childId)
  console.log(`📋 Children after filter: ${updatedChildren.length}`)
  
  if (updatedChildren.length === currentChildren.length) {
    console.warn(`⚠️ Child ${childId} not found in current children list!`)
  } else {
    console.log(`✅ Child removed from list`)
  }
  
  // Update cache
  childCache.set(parentId, updatedChildren)
  
  // Persist to localStorage (this will also filter out deleted children)
  persistLocalChildren(parentId, updatedChildren)
  console.log(`💾 Cache and localStorage updated with ${updatedChildren.length} children`)

  // Clear current child if it's the one being deleted
  const currentChild = getCurrentChild()
  if (currentChild?.id === childId) {
    console.log('🧹 Clearing current child selection')
    clearCurrentChild()
  }

  // Notify subscribers
  notifySubscribers(parentId, updatedChildren)

  console.log(`✅ deleteChild completed successfully`)
  return true
}

// Load deleted children list from localStorage on initialization
function loadDeletedChildren(): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('deleted_children')
    if (raw) {
      const deleted: string[] = JSON.parse(raw)
      deleted.forEach(id => deletedChildren.add(id))
      console.log(`🚫 Loaded ${deleted.length} deleted child IDs from localStorage`)
    }
  } catch (error) {
    console.error('Failed to load deleted children list:', error)
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  loadDeletedChildren()
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

// Force migration function - can be called manually to consolidate children
export async function forceMigrateChildrenByEmail(parentId: string, userEmail: string): Promise<Child[]> {
  console.log(`🔍 SYNC: Starting for email: ${userEmail}, parentId: ${parentId}`)
  
  loadDeletedChildren()
  const emailLower = userEmail.toLowerCase()
  const childMap = new Map<string, Child>()
  
  // 1. Get ALL children from localStorage (any parentId, any email)
  try {
    const raw = localStorage.getItem('children')
    console.log(`📦 localStorage 'children' raw:`, raw ? `${raw.length} chars` : 'null')
    if (raw) {
      const allLocal: Child[] = JSON.parse(raw)
      console.log(`📦 Parsed ${allLocal.length} children from localStorage`)
      allLocal.forEach((c, i) => console.log(`  ${i}: ${c.name} (id: ${c.id?.substring(0,10)}..., parentId: ${c.parentId?.substring(0,10)}...)`))
      
      for (const child of allLocal) {
        if (deletedChildren.has(child.id)) {
          console.log(`🚫 Skipping deleted child: ${child.name}`)
          continue
        }
        // Add ALL local children to map with updated parentId and email
        childMap.set(child.id, normalizeChild({
          ...child,
          parentId: parentId,
          parentEmail: userEmail
        }, userEmail))
      }
      console.log(`📦 Added ${childMap.size} local children to sync`)
    } else {
      console.log(`⚠️ No children in localStorage`)
    }
  } catch (error) {
    console.error('Error reading localStorage:', error)
  }
  
  // Also check for children stored with 'currentChild' key
  try {
    const currentChildRaw = localStorage.getItem('currentChild')
    if (currentChildRaw) {
      const currentChild = JSON.parse(currentChildRaw)
      if (currentChild?.id && !childMap.has(currentChild.id) && !deletedChildren.has(currentChild.id)) {
        console.log(`📦 Found currentChild not in main list: ${currentChild.name}`)
        childMap.set(currentChild.id, normalizeChild({
          ...currentChild,
          parentId: parentId,
          parentEmail: userEmail
        }, userEmail))
      }
    }
  } catch (error) {
    console.error('Error reading currentChild:', error)
  }
  
  const firestore = getFirestoreClient()
  if (firestore) {
    // 2. Upload local children to Firestore first
    if (childMap.size > 0) {
      console.log(`📤 Uploading ${childMap.size} local children to cloud...`)
      const uploadPromises = Array.from(childMap.values()).map(child => {
        const docRef = doc(firestore, 'parents', parentId, 'children', child.id)
        return setDoc(docRef, {
          ...child,
          parentId,
          parentEmail: userEmail,
          updatedAt: serverTimestamp(),
        }, { merge: true }).catch(err => console.error(`Upload failed:`, err))
      })
      await Promise.all(uploadPromises)
      console.log(`✅ Upload complete`)
    }
    
    // 3. Search ALL children collections by email using collectionGroup (FAST!)
    try {
      console.log(`🔍 Searching cloud for children with email: ${userEmail}`)
      const childrenGroupRef = collectionGroup(firestore, 'children')
      
      // Search with exact email
      const emailQuery = query(childrenGroupRef, where('parentEmail', '==', userEmail))
      let snapshot = await getDocs(emailQuery)
      console.log(`📥 Found ${snapshot.docs.length} children with exact email match`)
      
      // Also try lowercase email (in case stored differently)
      if (snapshot.docs.length === 0 && userEmail !== emailLower) {
        const lowerQuery = query(childrenGroupRef, where('parentEmail', '==', emailLower))
        snapshot = await getDocs(lowerQuery)
        console.log(`📥 Found ${snapshot.docs.length} children with lowercase email match`)
      }
      
      console.log(`📥 Total found in cloud: ${snapshot.docs.length} children`)
      
      for (const childDoc of snapshot.docs) {
        if (deletedChildren.has(childDoc.id)) continue
        const childData = childDoc.data()
        const child = normalizeChild({
          ...childData,
          id: childDoc.id,
          parentId: parentId,
          parentEmail: userEmail
        }, userEmail)
        childMap.set(child.id, child)
        
        // Move to correct parentId if needed
        const oldParentId = childData.parentId
        if (oldParentId && oldParentId !== parentId) {
          try {
            // Copy to new location
            const newDocRef = doc(firestore, 'parents', parentId, 'children', child.id)
            await setDoc(newDocRef, {
              ...child,
              updatedAt: serverTimestamp(),
            }, { merge: true })
            // Delete from old location
            const oldDocRef = doc(firestore, 'parents', oldParentId, 'children', childDoc.id)
            await deleteDoc(oldDocRef)
            console.log(`🚚 Moved ${child.name} to current account`)
          } catch (err) {
            console.error(`Failed to move child:`, err)
          }
        }
      }
    } catch (error) {
      console.error('Cloud search failed:', error)
    }
    
    // 4. Also directly check current parentId's children (in case collectionGroup failed or missed some)
    try {
      console.log(`📂 Also checking direct parentId collection...`)
      const directRef = collection(firestore, 'parents', parentId, 'children')
      const directSnapshot = await getDocs(directRef)
      console.log(`📂 Found ${directSnapshot.docs.length} children under current parentId`)
      
      for (const childDoc of directSnapshot.docs) {
        if (deletedChildren.has(childDoc.id)) continue
        if (childMap.has(childDoc.id)) continue // Already have it
        const childData = childDoc.data()
        childMap.set(childDoc.id, normalizeChild({
          ...childData,
          id: childDoc.id,
          parentId,
          parentEmail: userEmail
        }, userEmail))
      }
    } catch (error) {
      console.error('Direct collection check failed:', error)
    }
    
    const allChildren = Array.from(childMap.values())
    console.log(`🎯 SYNC COMPLETE: ${allChildren.length} total children`)
    allChildren.forEach(c => console.log(`  - ${c.name} (${c.age} years)`))
    
    updateChildrenCache(parentId, allChildren)
    return allChildren
  }
  
  const allChildren = Array.from(childMap.values())
  console.log(`🎯 SYNC COMPLETE (local only): ${allChildren.length} children`)
  updateChildrenCache(parentId, allChildren)
  return allChildren
}

// Fast function to get children from Firestore (just current parentId)
async function getChildrenFromFirestore(parentId: string, userEmail: string): Promise<Child[]> {
  const firestore = getFirestoreClient()
  if (!firestore) return []

  try {
    loadDeletedChildren()
    const children: Child[] = []
    
    // Get children under current parentId (fast - single query)
    const directRef = collection(firestore, 'parents', parentId, 'children')
    const snapshot = await getDocs(directRef)
    
    for (const childDoc of snapshot.docs) {
      if (deletedChildren.has(childDoc.id)) continue
      const childData = childDoc.data()
      children.push(normalizeChild({
        ...childData,
        id: childDoc.id,
        parentId: parentId,
        parentEmail: userEmail
      }, userEmail))
    }
    
    console.log(`📂 Found ${children.length} children in Firestore`)
    return children
  } catch (error) {
    console.error('Failed to get children from Firestore:', error)
    return []
  }
}

async function refreshChildrenFromFirestore(parentId: string, userEmail?: string) {
  const firestore = getFirestoreClient()
  if (!firestore) {
    console.log('Firestore not available')
    return
  }

  try {
    console.log('Quick refresh for parentId:', parentId)
    
    // Fast: just get children under current parentId
    const collectionRef = collection(firestore, 'parents', parentId, 'children')
    const snapshot = await getDocs(collectionRef)
    const firestoreChildren = snapshot.docs
      .map(docSnapshot => normalizeChild(docSnapshot.data(), userEmail))
      .filter(child => !deletedChildren.has(child.id))
    
    console.log(`Found ${firestoreChildren.length} children in Firestore`)
    
    // Merge with local children
    const localChildren = loadLocalChildren(parentId, userEmail)
    const firestoreIds = new Set(firestoreChildren.map(c => c.id))
    const localOnly = localChildren.filter(c => !firestoreIds.has(c.id))
    const merged = [...firestoreChildren, ...localOnly]
    
    // Upload local-only children to Firestore (in parallel, non-blocking)
    if (localOnly.length > 0 && userEmail) {
      console.log(`Uploading ${localOnly.length} local children to Firestore`)
      Promise.all(localOnly.map(child => {
        const docRef = doc(firestore, 'parents', parentId, 'children', child.id)
        return setDoc(docRef, {
          ...child,
          parentId,
          parentEmail: userEmail,
          updatedAt: serverTimestamp(),
        }, { merge: true }).catch(() => {})
      }))
    }
    
    updateChildrenCache(parentId, merged)
  } catch (error) {
    console.error('Refresh failed:', error)
    const localChildren = loadLocalChildren(parentId, userEmail)
    if (localChildren.length > 0) {
      updateChildrenCache(parentId, localChildren)
    }
  }
}

// Search Firestore for children by email across all parent collections
async function findChildrenInFirestoreByEmail(userEmail: string, targetParentId: string): Promise<Child[]> {
  const firestore = getFirestoreClient()
  if (!firestore) return []

  try {
    // Load deleted children list first
    loadDeletedChildren()
    
    console.log(`Searching Firestore for children with email: ${userEmail}`)
    const emailLower = userEmail.toLowerCase()
    const allChildren: Child[] = []

    // Get all parent documents
    const parentsRef = collection(firestore, 'parents')
    const parentsSnapshot = await getDocs(parentsRef)
    
    // Search through each parent's children collection
    for (const parentDoc of parentsSnapshot.docs) {
      const parentId = parentDoc.id
      const childrenRef = collection(firestore, 'parents', parentId, 'children')
      const childrenSnapshot = await getDocs(childrenRef)
      
      for (const childDoc of childrenSnapshot.docs) {
        const childData = childDoc.data()
        const childEmail = (childData.parentEmail || '').toLowerCase()
        
        // Skip deleted children
        if (deletedChildren.has(childDoc.id)) {
          console.log(`🚫 Skipping deleted child in Firestore: ${childDoc.id}`)
          continue
        }
        
        if (childEmail === emailLower) {
          const child = normalizeChild({
            ...childData,
            id: childDoc.id,
            parentId: targetParentId, // Update to target parentId
            parentEmail: userEmail
          }, userEmail)
          allChildren.push(child)
          
          // Update the child in Firestore to use the correct parentId
          try {
            const targetDocRef = doc(firestore, 'parents', targetParentId, 'children', child.id)
            await setDoc(targetDocRef, {
              ...child,
              parentId: targetParentId,
              parentEmail: userEmail,
              updatedAt: serverTimestamp(),
            }, { merge: true })
            
            // Delete from old location if different
            if (parentId !== targetParentId) {
              try {
                const oldDocRef = doc(firestore, 'parents', parentId, 'children', childDoc.id)
                await deleteDoc(oldDocRef)
                console.log(`Moved child ${child.id} from parentId ${parentId} to ${targetParentId}`)
              } catch (error) {
                console.error(`Failed to delete child from old location:`, error)
              }
            }
          } catch (error) {
            console.error(`Failed to update child ${child.id} in Firestore:`, error)
          }
        }
      }
    }
    
    console.log(`Found ${allChildren.length} children in Firestore by email: ${userEmail}`)
    return allChildren
  } catch (error) {
    console.error('Failed to search Firestore by email:', error)
    return []
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
      const firestoreChildren = snapshot.docs
        .map(docSnapshot => normalizeChild(docSnapshot.data(), userEmail))
        .filter(child => !deletedChildren.has(child.id)) // EXCLUDE deleted children
      console.log(`Firestore snapshot: ${firestoreChildren.length} children for parentId: ${parentId} (after filtering deleted)`)
      
      // Prioritize Firestore data (source of truth across devices)
      const localChildren = loadLocalChildren(parentId, userEmail)
      
      if (firestoreChildren.length > 0) {
        // Firestore has data - use it as source of truth, but keep local-only children
        // IMPORTANT: Only keep local children that are NOT in Firestore
        // This prevents deleted children (removed from Firestore) from being restored
        const firestoreIds = new Set(firestoreChildren.map(c => c.id))
        const localOnly = localChildren.filter(c => !firestoreIds.has(c.id))
        const mergedChildren = [...firestoreChildren, ...localOnly]
        console.log(`Merged children: ${mergedChildren.length} (Firestore: ${firestoreChildren.length}, Local-only: ${localOnly.length})`)
        console.log('Firestore children IDs:', Array.from(firestoreIds))
        console.log('Local-only children:', localOnly.map(c => ({ id: c.id, name: c.name })))
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
  console.log(`🔄 Updating cache for parentId ${parentId}: ${children.length} children`)
  childCache.set(parentId, children)
  persistLocalChildren(parentId, children)
  console.log(`📢 Notifying ${childSubscribers.get(parentId)?.size || 0} subscribers`)
  notifySubscribers(parentId, children)
  console.log(`✅ Cache update complete`)
}

function notifySubscribers(parentId: string, children: Child[]) {
  const subscribers = childSubscribers.get(parentId)
  if (!subscribers) {
    console.log(`⚠️ No subscribers for parentId: ${parentId}`)
    return
  }

  console.log(`📢 Notifying ${subscribers.size} subscriber(s) with ${children.length} children`)
  const clonedChildren = cloneChildren(children)
  let notifiedCount = 0
  subscribers.forEach(callback => {
    try {
      callback(clonedChildren)
      notifiedCount++
      console.log(`✅ Subscriber ${notifiedCount} notified`)
    } catch (error) {
      console.error('❌ Child subscriber error:', error)
    }
  })
  console.log(`✅ All ${notifiedCount} subscribers notified`)
}

function loadLocalChildren(parentId: string, userEmail?: string): Child[] {
  if (typeof window === 'undefined') return []

  try {
    // Load deleted children list first
    loadDeletedChildren()
    
    const raw = localStorage.getItem('children')
    if (!raw) {
      console.log('No children found in localStorage for parentId:', parentId)
      return []
    }
    const children: Child[] = JSON.parse(raw)
    const emailLower = userEmail ? userEmail.toLowerCase() : null
    console.log(`Found ${children.length} total children in localStorage`)
    console.log('All children in localStorage:', children.map(c => ({ id: c.id, name: c.name, parentId: c.parentId, parentEmail: c.parentEmail })))
    
    // First, try to find children by parentId (and, if available, matching parentEmail)
    let filtered = children
      .filter(child => child.parentId === parentId)
      .filter(child => !deletedChildren.has(child.id)) // EXCLUDE deleted children
      .filter(child => {
        if (!emailLower) return true
        const childEmail = (child.parentEmail || '').toLowerCase()
        return childEmail === emailLower
      })
      .map(child => normalizeChild(child, userEmail))
    
    if (filtered.length < children.filter(c => c.parentId === parentId).length) {
      const removedCount = children.filter(c => c.parentId === parentId).length - filtered.length
      console.log(`🚫 Filtered out ${removedCount} deleted child(ren)`)
    }
    
    console.log(`Found ${filtered.length} children by parentId: ${parentId} (after filtering deleted)`)
    return filtered
  } catch (error) {
    console.error('Failed to load children from localStorage:', error)
    return []
  }
}

// Helper function to find children by email (for cross-device migration)
// This searches ALL children in localStorage, not just those with matching parentId
function findChildrenByEmail(userEmail: string, newParentId: string): Child[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = localStorage.getItem('children')
    if (!raw) {
      console.log('No children in localStorage to search by email')
      return []
    }
    
    const children: Child[] = JSON.parse(raw)
    const emailLower = userEmail.toLowerCase()
    
    console.log(`Searching ${children.length} total children in localStorage for email: ${userEmail}`)
    
    // Load deleted children list first
    loadDeletedChildren()
    
    // Find children that match this email OR have no parentEmail (might be orphaned)
    // Also check if parentId doesn't match (might be from different device)
    // BUT EXCLUDE deleted children
    const childrenByEmail = children
      .filter(child => {
        // First check: Is this child deleted?
        if (deletedChildren.has(child.id)) {
          return false // Skip deleted children
        }
        
        const childEmail = (child.parentEmail || '').toLowerCase()
        const matchesEmail = childEmail === emailLower
        const hasDifferentParentId = child.parentId && child.parentId !== newParentId
        
        // Include if:
        // 1. Email matches exactly, OR
        // 2. No email but parentId is different (might be orphaned from this user)
        return matchesEmail || (hasDifferentParentId && !childEmail)
      })
      .map(child => normalizeChild(child, userEmail))
    
    if (childrenByEmail.length > 0) {
      console.log(`Found ${childrenByEmail.length} children by email or different parentId: ${userEmail}`)
      console.log('Children found:', childrenByEmail.map(c => ({ id: c.id, name: c.name, oldParentId: c.parentId, email: c.parentEmail })))
      
      // Migrate children to new parentId
      const migrated = childrenByEmail.map(child => ({
        ...child,
        parentId: newParentId,
        parentEmail: userEmail // Always set email
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
    
    // Remove all children for this parentId first
    const filtered = allChildren.filter(child => child.parentId !== parentId)
    
    // Then add the updated children
    const updated = [...filtered, ...children]
    localStorage.setItem('children', JSON.stringify(updated))
    console.log(`💾 Persisted ${children.length} children to localStorage for parentId: ${parentId}`)
    console.log(`💾 Total children in localStorage: ${updated.length}`)
    
    // Verify the save worked
    const verify = localStorage.getItem('children')
    if (verify) {
      const verified = JSON.parse(verify)
      const parentChildren = verified.filter((c: Child) => c.parentId === parentId)
      if (parentChildren.length !== children.length) {
        console.error(`❌ Verification failed! Expected ${children.length}, found ${parentChildren.length}`)
        // Force save again
        localStorage.setItem('children', JSON.stringify(updated))
      } else {
        console.log(`✅ Verification passed: ${parentChildren.length} children for parentId ${parentId}`)
      }
    }
  } catch (error) {
    console.error('❌ Failed to persist children locally:', error)
  }
}

function normalizeChild(data: any, defaultEmail?: string): Child {
  const age = Number(data?.age ?? 0)
  const child: Child = {
    id: data?.id ?? `child-${Math.random().toString(36).slice(2)}`,
    name: data?.name ?? 'Learner',
    age,
    ageGroup: data?.ageGroup ?? getAgeGroup(age),
    parentId: data?.parentId ?? '',
    parentEmail: data?.parentEmail || defaultEmail, // Always set email if missing
    createdAt: data?.createdAt ?? new Date().toISOString(),
    avatar: data?.avatar,
  }

  return child
}

function cloneChildren(children: Child[]): Child[] {
  return children.map(child => ({ ...child }))
}
