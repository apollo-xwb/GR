import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { auth } from "./config"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "./config"

if (!auth) {
  console.error("Firebase Auth is not initialized. Please check your Firebase configuration.")
}

const googleProvider = new GoogleAuthProvider()

export interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  createdAt: Date
  updatedAt: Date
}

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const authInstance = checkAuth()
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password)
    return userCredential.user
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign in")
  }
}

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  try {
    const authInstance = checkAuth()
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password)
    const user = userCredential.user
    
    // Update profile
    await updateProfile(user, { displayName })
    
    // Create user document in Firestore
    await createUserDocument(user.uid, {
      email: user.email,
      displayName,
      photoURL: user.photoURL,
    })
    
    return user
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign up")
  }
}

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const authInstance = checkAuth()
    const result = await signInWithPopup(authInstance, googleProvider)
    const user = result.user
    
    // Check if user document exists, create if not
    if (db) {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (!userDoc.exists()) {
        await createUserDocument(user.uid, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        })
      }
    }
    
    return user
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign in with Google")
  }
}

// Sign out
export const signOutUser = async () => {
  try {
    const authInstance = checkAuth()
    await signOut(authInstance)
  } catch (error: any) {
    throw new Error(error.message || "Failed to sign out")
  }
}

// Get current user
export const getCurrentUser = (): User | null => {
  if (!auth) return null
  return auth.currentUser
}

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    console.warn("Firebase Auth not initialized - calling callback with null")
    // Call callback immediately with null if auth isn't initialized
    callback(null)
    return () => {}
  }
  
  try {
    return onAuthStateChanged(auth, (user) => {
      console.log("onAuthStateChanged fired:", user?.uid || "null")
      callback(user)
    })
  } catch (error) {
    console.error("Error setting up auth state listener:", error)
    callback(null)
    return () => {}
  }
}

// Create user document in Firestore
const createUserDocument = async (uid: string, userData: Partial<UserData>) => {
  if (!db) {
    console.warn("Firestore not initialized, skipping user document creation")
    return
  }
  
  const userDoc = {
    uid,
    email: userData.email || null,
    displayName: userData.displayName || null,
    photoURL: userData.photoURL || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Game-specific fields
    userName: userData.displayName || "Player",
    avatarUrl: userData.photoURL || null,
    readyPlayerMeAvatar: null,
    theme: "sunset",
    darkMode: true,
    xp: 0,
    tier: "Bronze",
    balance: 0,
    swopBalance: 0,
    loanLimit: 500,
    completedLoans: 0,
    activeLoan: false,
  }
  
  await setDoc(doc(db, "users", uid), userDoc, { merge: true })
}

