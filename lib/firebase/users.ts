import { doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore"
import { db } from "./config"
import { User } from "firebase/auth"

export interface AvatarRecord {
  url: string
  savedAt: Date
}

export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  userName: string
  avatarUrl: string | null
  readyPlayerMeAvatar: string | null
  readyPlayerMeAvatars?: AvatarRecord[]
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
      const readyPlayerMeAvatars = Array.isArray(data.readyPlayerMeAvatars)
        ? data.readyPlayerMeAvatars
            .map((entry: any) => ({
            url: entry?.url,
            savedAt: entry?.savedAt?.toDate
              ? entry.savedAt.toDate()
              : entry?.savedAt
              ? new Date(entry.savedAt)
              : new Date(),
          }))
            .sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime())
        : []

      return {
        ...data,
        readyPlayerMeAvatars,
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
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  try {
    const userRef = doc(db, "users", uid)
    const avatarEntry = {
      url: avatarUrl,
      savedAt: new Date(),
    }

    await setDoc(
      userRef,
      {
        readyPlayerMeAvatar: avatarUrl,
        avatarUrl: avatarUrl,
        readyPlayerMeAvatars: arrayUnion(avatarEntry),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  } catch (error) {
    console.error("Error saving avatar:", error)
    throw error
  }
}

export const setActiveAvatar = async (uid: string, avatarUrl: string) => {
  if (!db) {
    throw new Error("Firestore not initialized")
  }

  try {
    const userRef = doc(db, "users", uid)
    await setDoc(
      userRef,
      {
        readyPlayerMeAvatar: avatarUrl,
        avatarUrl: avatarUrl,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
  } catch (error) {
    console.error("Error setting active avatar:", error)
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

