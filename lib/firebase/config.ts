import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"
import { getStorage, FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY || process.env.API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN || process.env.AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID || process.env.PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET || process.env.STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID || process.env.MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_APP_ID || process.env.APP_ID || "",
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID || process.env.MEASUREMENT_ID || "",
}

// Validate required config
const hasRequiredConfig = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain

if (!hasRequiredConfig) {
  console.warn("Firebase configuration is missing required fields. Please check your environment variables.")
  console.warn("Required: API_KEY, PROJECT_ID, AUTH_DOMAIN")
  console.warn("Current config:", {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    hasAuthDomain: !!firebaseConfig.authDomain,
  })
}

// Initialize Firebase
let app: FirebaseApp | null = null
try {
  if (hasRequiredConfig) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
      console.log("✅ Firebase initialized successfully")
    } else {
      app = getApps()[0]
      console.log("✅ Using existing Firebase app")
    }
  } else {
    console.error("❌ Cannot initialize Firebase - missing required configuration")
  }
} catch (error) {
  console.error("Error initializing Firebase:", error)
}

// Initialize services only if app is initialized
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null
let storageInstance: FirebaseStorage | null = null

if (app) {
  try {
    authInstance = getAuth(app)
    dbInstance = getFirestore(app)
    storageInstance = getStorage(app)
  } catch (error) {
    console.error("Error initializing Firebase services:", error)
  }
}

export const auth = authInstance as Auth
export const db = dbInstance as Firestore
export const storage = storageInstance as FirebaseStorage

export default app

