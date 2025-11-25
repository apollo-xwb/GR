import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { db } from "./config"

export interface Loan {
  id: string
  userId: string
  amount: number
  interestRate: number
  totalAmount: number
  status: "pending" | "active" | "completed" | "defaulted"
  createdAt: Date
  dueDate: Date
  completedAt?: Date
  repaidAmount?: number
}

// Create a new loan
export const createLoan = async (loanData: Omit<Loan, "id" | "createdAt">) => {
  try {
    const loanRef = await addDoc(collection(db, "loans"), {
      ...loanData,
      createdAt: serverTimestamp(),
      dueDate: Timestamp.fromDate(loanData.dueDate),
    })
    return loanRef.id
  } catch (error) {
    console.error("Error creating loan:", error)
    throw error
  }
}

// Get user's loans
export const getUserLoans = async (userId: string): Promise<Loan[]> => {
  try {
    const loansQuery = query(
      collection(db, "loans"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
    const snapshot = await getDocs(loansQuery)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      dueDate: doc.data().dueDate?.toDate() || new Date(),
      completedAt: doc.data().completedAt?.toDate(),
    })) as Loan[]
  } catch (error) {
    console.error("Error getting user loans:", error)
    return []
  }
}

// Get active loan
export const getActiveLoan = async (userId: string): Promise<Loan | null> => {
  try {
    const loansQuery = query(
      collection(db, "loans"),
      where("userId", "==", userId),
      where("status", "==", "active")
    )
    const snapshot = await getDocs(loansQuery)
    if (snapshot.empty) return null
    
    const loanDoc = snapshot.docs[0]
    return {
      id: loanDoc.id,
      ...loanDoc.data(),
      createdAt: loanDoc.data().createdAt?.toDate() || new Date(),
      dueDate: loanDoc.data().dueDate?.toDate() || new Date(),
      completedAt: loanDoc.data().completedAt?.toDate(),
    } as Loan
  } catch (error) {
    console.error("Error getting active loan:", error)
    return null
  }
}

// Update loan status
export const updateLoanStatus = async (loanId: string, status: Loan["status"], repaidAmount?: number) => {
  try {
    const loanRef = doc(db, "loans", loanId)
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    }
    if (status === "completed" && repaidAmount) {
      updateData.completedAt = serverTimestamp()
      updateData.repaidAmount = repaidAmount
    }
    await updateDoc(loanRef, updateData)
  } catch (error) {
    console.error("Error updating loan status:", error)
    throw error
  }
}

