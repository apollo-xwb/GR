import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore"
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

// Update user profile - automatically creates document/collection if it doesn't exist
export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }
  
  try {
    const userRef = doc(db, "users", uid)
    const userDoc = await getDoc(userRef)
    const now = serverTimestamp()
    
    if (userDoc.exists()) {
      // Document exists, update it
      await updateDoc(userRef, {
        ...updates,
        updatedAt: now,
      })
    } else {
      // Document doesn't exist, create it with merge
      await setDoc(userRef, {
        uid: uid,
        userName: "Player",
        theme: "sunset",
        darkMode: true,
        xp: 0,
        tier: "Bronze",
        balance: 0,
        swopBalance: 0,
        loanLimit: 500,
        completedLoans: 0,
        activeLoan: false,
        createdAt: now,
        ...updates,
        updatedAt: now,
      }, { merge: true })
    }
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Save avatar URL - automatically creates document/collection if it doesn't exist
export const saveAvatar = async (uid: string, avatarUrl: string) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }
  
  console.log("[Firebase] 🎨 Saving avatar to Firestore...")
  console.log("[Firebase] 📍 Collection: users (will be created automatically if needed)")
  console.log("[Firebase] 📍 Document ID:", uid)
  console.log("[Firebase] 📍 Avatar URL:", avatarUrl)
  
  try {
    const userRef = doc(db, "users", uid)
    
    // Check if document exists
    const userDoc = await getDoc(userRef)
    const now = serverTimestamp()
    
    if (userDoc.exists()) {
      // Document exists, update it
      console.log("[Firebase] 📝 Document exists, updating...")
      await updateDoc(userRef, {
        readyPlayerMeAvatar: avatarUrl,
        avatarUrl: avatarUrl,
        updatedAt: now,
      })
    } else {
      // Document doesn't exist, create it with merge
      console.log("[Firebase] 📝 Document doesn't exist, creating with merge...")
      await setDoc(userRef, {
        uid: uid,
        readyPlayerMeAvatar: avatarUrl,
        avatarUrl: avatarUrl,
        userName: "Player",
        theme: "sunset",
        darkMode: true,
        xp: 0,
        tier: "Bronze",
        balance: 0,
        swopBalance: 0,
        loanLimit: 500,
        completedLoans: 0,
        activeLoan: false,
        createdAt: now,
        updatedAt: now,
      }, { merge: true })
    }
    
    console.log("[Firebase] ✅ Avatar saved successfully!")
    console.log("[Firebase] 📊 Document: users/" + uid)
    console.log("[Firebase] 🔍 Fields: readyPlayerMeAvatar, avatarUrl, updatedAt")
    
    return { success: true }
  } catch (error: any) {
    console.error("[Firebase] ❌ Error saving avatar:", error)
    console.error("[Firebase] 📋 Error code:", error.code)
    console.error("[Firebase] 📋 Error message:", error.message)
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

