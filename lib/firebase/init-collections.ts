/**
 * Client-side Firestore Collection Initialization
 * 
 * This helper ensures collections exist by creating placeholder documents.
 * Run this once after setting up Firebase to initialize collections.
 * 
 * Usage: Call initializeCollections() from browser console or on app startup
 */

import { collection, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "./config"

/**
 * Initialize Firestore collections by creating and deleting test documents
 * This ensures collections exist for indexing
 */
export async function initializeCollections(userId: string) {
  console.log("🚀 Initializing Firestore collections...")

  if (!db) {
    const error = "Firestore is not initialized. Please check your Firebase configuration."
    console.error("❌", error)
    return { success: false, error }
  }

  try {
    // Initialize users collection (should already exist, but ensure structure)
    const testUserId = `init_${Date.now()}`
    const usersRef = doc(collection(db, "users"), testUserId)

    await setDoc(usersRef, {
      uid: testUserId,
      email: "init@example.com",
      displayName: "Init User",
      userName: "inituser",
      theme: "sunset",
      darkMode: true,
      xp: 0,
      tier: "Bronze",
      balance: 0,
      swopBalance: 0,
      loanLimit: 500,
      completedLoans: 0,
      activeLoan: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    console.log("✅ Users collection initialized")
    await deleteDoc(usersRef)

    // Initialize loans collection
    const loansRef = doc(collection(db, "loans"), `init_${Date.now()}`)
    await setDoc(loansRef, {
      userId: userId || testUserId,
      amount: 500,
      interestRate: 0.1,
      totalAmount: 550,
      status: "pending",
      createdAt: serverTimestamp(),
      dueDate: serverTimestamp(),
    })
    console.log("✅ Loans collection initialized")
    await deleteDoc(loansRef)

    // Initialize transactions collection
    const transactionsRef = doc(collection(db, "transactions"), `init_${Date.now()}`)
    await setDoc(transactionsRef, {
      userId: userId || testUserId,
      type: "loan",
      amount: 500,
      description: "Init transaction",
      status: "completed",
      createdAt: serverTimestamp(),
    })
    console.log("✅ Transactions collection initialized")
    await deleteDoc(transactionsRef)

    console.log("✨ All collections initialized!")
    console.log("📋 Next: Create indexes in Firebase Console using firestore.indexes.json")

    return { success: true }
  } catch (error: any) {
    console.error("❌ Error initializing collections:", error)
    let errorMessage = error.message || "Unknown error occurred"
    
    if (error.code === "permission-denied") {
      errorMessage = "Permission denied. Make sure Firestore rules allow writes. Check firestore.rules and ensure you're authenticated."
      console.log("ℹ️  Permission denied. Make sure Firestore rules allow writes.")
    } else if (error.code === "unavailable") {
      errorMessage = "Firestore is unavailable. Check your internet connection and Firebase project status."
    } else if (error.code === "failed-precondition") {
      errorMessage = "Firestore operation failed. The database might not be initialized. Check Firebase Console."
    } else if (error.message?.includes("Missing or insufficient permissions")) {
      errorMessage = "Missing permissions. Update Firestore rules to allow authenticated users to write."
    }
    
    return { success: false, error: errorMessage }
  }
}

/**
 * List required indexes for reference
 */
export function getRequiredIndexes() {
  return [
    {
      collection: "loans",
      fields: ["userId (Ascending)", "createdAt (Descending)"],
      description: "For getUserLoans query",
    },
    {
      collection: "loans",
      fields: ["userId (Ascending)", "status (Ascending)"],
      description: "For getActiveLoan query",
    },
    {
      collection: "transactions",
      fields: ["userId (Ascending)", "createdAt (Descending)"],
      description: "For getUserTransactions query",
    },
    {
      collection: "transactions",
      fields: ["userId (Ascending)", "type (Ascending)", "createdAt (Descending)"],
      description: "For getSwopTransactions query",
    },
    {
      collection: "users",
      fields: ["userName (Ascending)"],
      description: "For findUserByUsername query",
    },
  ]
}

