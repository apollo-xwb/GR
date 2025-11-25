import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./config"
import { User } from "firebase/auth"

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  userName: string
  avatarUrl: string | null
  readyPlayerMeAvatar: string | null
  selectedTemplate?: string // Track which template was selected
  theme: string
  darkMode: boolean
  xp: number
  tier: string
  balance: number
  swopBalance: number
  loanLimit: number
  completedLoans: number
  activeLoan: boolean
  createdAt: Date
  updatedAt: Date
}

// Get user profile
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!db) {
    console.warn("Firestore not initialized")
    return null
  }
  
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      const data = userDoc.data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as UserProfile
    }
    return null
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }
  
  try {
    const userRef = doc(db, "users", uid)
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Save avatar URL
export const saveAvatar = async (uid: string, avatarUrl: string) => {
  try {
    await updateUserProfile(uid, {
      readyPlayerMeAvatar: avatarUrl,
      avatarUrl: avatarUrl,
    })
  } catch (error) {
    console.error("Error saving avatar:", error)
    throw error
  }
}

// Update user preferences
export const updateUserPreferences = async (
  uid: string,
  preferences: { theme?: string; darkMode?: boolean; userName?: string }
) => {
  try {
    await updateUserProfile(uid, preferences)
  } catch (error) {
    console.error("Error updating preferences:", error)
    throw error
  }
}

// Update user game stats
export const updateUserStats = async (
  uid: string,
  stats: {
    xp?: number
    tier?: string
    balance?: number
    swopBalance?: number
    loanLimit?: number
    completedLoans?: number
    activeLoan?: boolean
  }
) => {
  try {
    await updateUserProfile(uid, stats)
  } catch (error) {
    console.error("Error updating user stats:", error)
    throw error
  }
}

