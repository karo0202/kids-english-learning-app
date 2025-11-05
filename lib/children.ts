// Children management system
import { AgeGroup, getAgeGroup } from './age-utils'

export interface Child {
  id: string
  name: string
  age: number
  ageGroup: AgeGroup // Automatically determined from age
  parentId: string
  createdAt: string
  avatar?: string
}

export function getChildren(parentId: string): Child[] {
  if (typeof window === 'undefined') return []
  
  try {
    const childrenData = localStorage.getItem('children')
    if (!childrenData) return []
    
    const allChildren: Child[] = JSON.parse(childrenData)
    return allChildren.filter(child => child.parentId === parentId)
  } catch (error) {
    console.error('Error loading children:', error)
    return []
  }
}

export function addChild(parentId: string, name: string, age: number): Child {
  // Automatically determine age group from age
  const ageGroup = getAgeGroup(age)
  
  const newChild: Child = {
    id: `child-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    age,
    ageGroup, // Automatically assigned based on age
    parentId,
    createdAt: new Date().toISOString(),
    avatar: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${name}`
  }
  
  if (typeof window !== 'undefined') {
    try {
      const existingChildren = JSON.parse(localStorage.getItem('children') || '[]')
      const updatedChildren = [...existingChildren, newChild]
      localStorage.setItem('children', JSON.stringify(updatedChildren))
    } catch (error) {
      console.error('Error saving child:', error)
    }
  }
  
  return newChild
}

export function updateChild(parentId: string, childId: string, updates: Partial<Child>): Child | null {
  if (typeof window === 'undefined') return null
  
  try {
    const existingChildren = JSON.parse(localStorage.getItem('children') || '[]')
    const childIndex = existingChildren.findIndex((child: Child) => 
      child.id === childId && child.parentId === parentId
    )
    
    if (childIndex === -1) return null
    
    const updatedChild = { ...existingChildren[childIndex], ...updates }
    existingChildren[childIndex] = updatedChild
    localStorage.setItem('children', JSON.stringify(existingChildren))
    
    return updatedChild
  } catch (error) {
    console.error('Error updating child:', error)
    return null
  }
}

export function deleteChild(parentId: string, childId: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    const existingChildren = JSON.parse(localStorage.getItem('children') || '[]')
    const filteredChildren = existingChildren.filter((child: Child) => 
      !(child.id === childId && child.parentId === parentId)
    )
    
    localStorage.setItem('children', JSON.stringify(filteredChildren))
    
    // Also clear current child if it was deleted
    const currentChild = JSON.parse(localStorage.getItem('currentChild') || 'null')
    if (currentChild && currentChild.id === childId) {
      localStorage.removeItem('currentChild')
    }
    
    return true
  } catch (error) {
    console.error('Error deleting child:', error)
    return false
  }
}

export function setCurrentChild(child: Child): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentChild', JSON.stringify(child))
  }
}

export function getCurrentChild(): Child | null {
  if (typeof window === 'undefined') return null
  
  try {
    const currentChildData = localStorage.getItem('currentChild')
    if (!currentChildData) return null
    
    return JSON.parse(currentChildData)
  } catch (error) {
    console.error('Error loading current child:', error)
    return null
  }
}

export function clearCurrentChild(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentChild')
  }
}
