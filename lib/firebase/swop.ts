import { doc, getDoc, updateDoc, serverTimestamp, runTransaction } from "firebase/firestore"
import { db } from "./config"
import { createTransaction } from "./transactions"

// Send money via SWOP
export const sendSwop = async (
  senderId: string,
  recipientId: string,
  amount: number,
  recipientUsername: string
) => {
  try {
    await runTransaction(db, async (transaction) => {
      // Get sender and recipient documents
      const senderRef = doc(db, "users", senderId)
      const recipientRef = doc(db, "users", recipientId)
      
      const senderDoc = await transaction.get(senderRef)
      const recipientDoc = await transaction.get(recipientRef)
      
      if (!senderDoc.exists() || !recipientDoc.exists()) {
        throw new Error("User not found")
      }
      
      const senderData = senderDoc.data()
      const recipientData = recipientDoc.data()
      
      // Check if sender has enough balance
      if (senderData.swopBalance < amount) {
        throw new Error("Insufficient balance")
      }
      
      // Update balances
      transaction.update(senderRef, {
        swopBalance: senderData.swopBalance - amount,
        updatedAt: serverTimestamp(),
      })
      
      transaction.update(recipientRef, {
        swopBalance: (recipientData.swopBalance || 0) + amount,
        updatedAt: serverTimestamp(),
      })
    })
    
    // Create transaction records
    await createTransaction({
      userId: senderId,
      type: "swop_send",
      amount: -amount,
      description: `Sent R${amount} to ${recipientUsername}`,
      status: "completed",
      metadata: {
        recipientId,
      },
    })
    
    await createTransaction({
      userId: recipientId,
      type: "swop_receive",
      amount: amount,
      description: `Received R${amount} from ${senderId}`,
      status: "completed",
      metadata: {
        senderId,
      },
    })
    
    return { success: true }
  } catch (error) {
    console.error("Error sending SWOP:", error)
    throw error
  }
}

// Add money to SWOP balance
export const addSwopBalance = async (userId: string, amount: number) => {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      throw new Error("User not found")
    }
    
    const userData = userDoc.data()
    
    await updateDoc(userRef, {
      swopBalance: (userData.swopBalance || 0) + amount,
      updatedAt: serverTimestamp(),
    })
    
    await createTransaction({
      userId,
      type: "swop_add",
      amount: amount,
      description: `Added R${amount} to SWOP balance`,
      status: "completed",
    })
    
    return { success: true }
  } catch (error) {
    console.error("Error adding SWOP balance:", error)
    throw error
  }
}

// Withdraw from SWOP balance
export const withdrawSwopBalance = async (userId: string, amount: number) => {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      throw new Error("User not found")
    }
    
    const userData = userDoc.data()
    
    if (userData.swopBalance < amount) {
      throw new Error("Insufficient balance")
    }
    
    await updateDoc(userRef, {
      swopBalance: userData.swopBalance - amount,
      updatedAt: serverTimestamp(),
    })
    
    await createTransaction({
      userId,
      type: "swop_withdraw",
      amount: -amount,
      description: `Withdrew R${amount} from SWOP balance`,
      status: "completed",
    })
    
    return { success: true }
  } catch (error) {
    console.error("Error withdrawing SWOP balance:", error)
    throw error
  }
}

// Find user by username for SWOP
export const findUserByUsername = async (username: string) => {
  try {
    // Note: This requires a Firestore index on userName field
    // You'll need to create this index in Firebase Console
    const { collection, query, where, getDocs } = await import("firebase/firestore")
    const usersQuery = query(collection(db, "users"), where("userName", "==", username))
    const snapshot = await getDocs(usersQuery)
    
    if (snapshot.empty) {
      return null
    }
    
    const userDoc = snapshot.docs[0]
    return {
      uid: userDoc.id,
      ...userDoc.data(),
    }
  } catch (error) {
    console.error("Error finding user by username:", error)
    return null
  }
}

