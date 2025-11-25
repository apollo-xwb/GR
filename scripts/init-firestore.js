/**
 * Firestore Initialization Script (JavaScript version)
 * 
 * Run with: node scripts/init-firestore.js
 * 
 * This script uses the Firebase Admin SDK to initialize collections.
 * Note: Indexes must be created manually in Firebase Console.
 */

const { initializeApp, cert, getApps } = require("firebase-admin/app")
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore")

let db

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
  console.error("❌ Error initializing Firebase Admin:", error.message)
  console.log("ℹ️  Note: This script requires Firebase Admin SDK setup")
  console.log("ℹ️  Collections will be created automatically when first document is written")
  process.exit(1)
}

/**
 * Create initial collections with sample documents
 */
async function initializeCollections() {
  console.log("\n📦 Initializing Firestore collections...\n")

  try {
    // Create a test user document structure
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
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }

    await usersRef.set(testUserData)
    console.log("✅ Created 'users' collection structure")
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
      createdAt: FieldValue.serverTimestamp(),
      dueDate: Timestamp.fromDate(new Date(Date.now() + 72 * 60 * 60 * 1000)),
    }

    await loansRef.set(testLoanData)
    console.log("✅ Created 'loans' collection structure")
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
      createdAt: FieldValue.serverTimestamp(),
    }

    await transactionsRef.set(testTransactionData)
    console.log("✅ Created 'transactions' collection structure")
    await transactionsRef.delete()
    console.log("✅ Cleaned up test transaction document")

    console.log("\n✅ All collections initialized successfully!")
    console.log("\n📋 Next steps:")
    console.log("1. Go to Firebase Console > Firestore Database > Indexes")
    console.log("2. Import indexes from firestore.indexes.json or create them manually")
    console.log("3. Deploy Firestore rules from firestore.rules")

  } catch (error) {
    console.error("❌ Error initializing collections:", error.message)
    if (error.code === "permission-denied") {
      console.log("\nℹ️  Permission denied. Make sure:")
      console.log("   - Firestore rules allow writes")
      console.log("   - Firebase Admin SDK is properly configured")
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
}

// Run initialization
async function main() {
  console.log("🚀 Firestore Initialization Script\n")
  
  listRequiredIndexes()
  await initializeCollections()
  
  console.log("\n✨ Done!")
}

main().catch(console.error)

