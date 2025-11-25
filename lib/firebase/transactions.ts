import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "./config"

export interface Transaction {
  id: string
  userId: string
  type: "loan" | "repayment" | "swop_send" | "swop_receive" | "swop_add" | "swop_withdraw" | "xp_reward"
  amount: number
  description: string
  status: "pending" | "completed" | "failed"
  createdAt: Date
  metadata?: {
    loanId?: string
    recipientId?: string
    senderId?: string
    xpEarned?: number
  }
}

// Create a transaction
export const createTransaction = async (transactionData: Omit<Transaction, "id" | "createdAt">) => {
  try {
    const transactionRef = await addDoc(collection(db, "transactions"), {
      ...transactionData,
      createdAt: serverTimestamp(),
    })
    return transactionRef.id
  } catch (error) {
    console.error("Error creating transaction:", error)
    throw error
  }
}

// Get user transactions
export const getUserTransactions = async (userId: string, limit?: number): Promise<Transaction[]> => {
  try {
    let transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
    
    if (limit) {
      // Note: Firestore doesn't support limit in query builder directly with where
      // You'd need to use startAfter for pagination
      const snapshot = await getDocs(transactionsQuery)
      const transactions = snapshot.docs.slice(0, limit).map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Transaction[]
      return transactions
    }
    
    const snapshot = await getDocs(transactionsQuery)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Transaction[]
  } catch (error) {
    console.error("Error getting user transactions:", error)
    return []
  }
}

// Get SWOP transactions
export const getSwopTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      where("type", "in", ["swop_send", "swop_receive", "swop_add", "swop_withdraw"]),
      orderBy("createdAt", "desc")
    )
    const snapshot = await getDocs(transactionsQuery)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    })) as Transaction[]
  } catch (error) {
    console.error("Error getting SWOP transactions:", error)
    return []
  }
}

