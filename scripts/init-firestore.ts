/**
 * Firestore Initialization Script
 * 
 * This script creates the necessary Firestore collections and indexes.
 * Run with: npx tsx scripts/init-firestore.ts
 * 
 * Note: Indexes must be created manually in Firebase Console or via Firebase CLI
 */

import { initializeApp, cert, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import * as admin from "firebase-admin"

// Initialize Firebase Admin (requires service account)
// For local development, you can use Application Default Credentials
// or set GOOGLE_APPLICATION_CREDENTIALS environment variable

let db: admin.firestore.Firestore

try {
  if (getApps().length === 0) {
    // Try to initialize with service account if available
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      initializeApp({
        credential: cert(serviceAccount),
      })
    } else {
      // Use Application Default Credentials
      initializeApp()
    }
  }
  
  db = getFirestore()
  console.log("✅ Firebase Admin initialized")
} catch (error) {
  console.error("❌ Error initializing Firebase Admin:", error)
  console.log("ℹ️  Note: This script requires Firebase Admin SDK setup")
  console.log("ℹ️  Collections will be created automatically when first document is written")
  process.exit(1)
}

/**
 * Create initial collections with sample documents
 * This helps ensure collections exist and indexes can be created
 */
async function initializeCollections() {
  console.log("\n📦 Initializing Firestore collections...\n")

  try {
    // Create a test user document structure (will be deleted)
    const testUserId = "test_init_user"
    const usersRef = db.collection("users").doc(testUserId)
    
    const testUserData = {
      uid: testUserId,
      email: "test@example.com",
      displayName: "Test User",
      userName: "testuser",
      theme: "sunset",
      darkMode: true,
      xp: 0,
      tier: "Bronze",
      balance: 0,
      swopBalance: 0,
      loanLimit: 500,
      completedLoans: 0,
      activeLoan: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    await usersRef.set(testUserData)
    console.log("✅ Created 'users' collection structure")
    
    // Delete test document
    await usersRef.delete()
    console.log("✅ Cleaned up test user document")

    // Create a test loan document structure
    const loansRef = db.collection("loans").doc("test_init_loan")
    
    const testLoanData = {
      userId: testUserId,
      amount: 500,
      interestRate: 0.1,
      totalAmount: 550,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      dueDate: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 72 * 60 * 60 * 1000)
      ),
    }

    await loansRef.set(testLoanData)
    console.log("✅ Created 'loans' collection structure")
    
    // Delete test document
    await loansRef.delete()
    console.log("✅ Cleaned up test loan document")

    // Create a test transaction document structure
    const transactionsRef = db.collection("transactions").doc("test_init_transaction")
    
    const testTransactionData = {
      userId: testUserId,
      type: "loan",
      amount: 500,
      description: "Test transaction",
      status: "completed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    }

    await transactionsRef.set(testTransactionData)
    console.log("✅ Created 'transactions' collection structure")
    
    // Delete test document
    await transactionsRef.delete()
    console.log("✅ Cleaned up test transaction document")

    console.log("\n✅ All collections initialized successfully!")
    console.log("\n📋 Next steps:")
    console.log("1. Go to Firebase Console > Firestore Database > Indexes")
    console.log("2. Import indexes from firestore.indexes.json or create them manually")
    console.log("3. Deploy Firestore rules from firestore.rules")
    console.log("\n💡 Collections will be created automatically when first real document is written")

  } catch (error: any) {
    console.error("❌ Error initializing collections:", error.message)
    if (error.code === "permission-denied") {
      console.log("\nℹ️  Permission denied. Make sure:")
      console.log("   - Firestore rules allow writes")
      console.log("   - Firebase Admin SDK is properly configured")
      console.log("   - Service account has Firestore permissions")
    }
  }
}

/**
 * List required indexes
 */
function listRequiredIndexes() {
  console.log("\n📑 Required Firestore Indexes:\n")
  
  const indexes = [
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

  indexes.forEach((index, i) => {
    console.log(`${i + 1}. Collection: ${index.collection}`)
    console.log(`   Fields: ${index.fields.join(", ")}`)
    console.log(`   Purpose: ${index.description}\n`)
  })

  console.log("💡 Create these indexes in Firebase Console or use Firebase CLI:")
  console.log("   firebase deploy --only firestore:indexes\n")
}

// Run initialization
async function main() {
  console.log("🚀 Firestore Initialization Script\n")
  
  listRequiredIndexes()
  await initializeCollections()
  
  console.log("\n✨ Done!")
}

main().catch(console.error)

