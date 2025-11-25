"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User } from "firebase/auth"
import { onAuthStateChange, getCurrentUser } from "@/lib/firebase/auth"
import { getUserProfile, UserProfile } from "@/lib/firebase/users"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  refreshProfile: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserProfile = async (uid: string) => {
    try {
      const profile = await getUserProfile(uid)
      setUserProfile(profile)
    } catch (error) {
      console.error("Error loading user profile:", error)
      setUserProfile(null)
    }
  }

  const refreshProfile = async () => {
    if (user?.uid) {
      await loadUserProfile(user.uid)
    }
  }

  useEffect(() => {
    let mounted = true
    
    // Check initial auth state immediately
    const currentUser = getCurrentUser()
    if (currentUser && mounted) {
      console.log("Initial user found:", currentUser.uid)
      setUser(currentUser)
      loadUserProfile(currentUser.uid).finally(() => {
        if (mounted) setLoading(false)
      })
    }
    
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange(async (authUser) => {
      if (!mounted) return
      
      console.log("Auth state changed:", authUser?.uid || "null")
      setUser(authUser)
      if (authUser) {
        await loadUserProfile(authUser.uid)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    // Set a timeout to stop loading if auth doesn't resolve
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Auth state change timeout - setting loading to false")
        setLoading(false)
      }
    }, 3000)

    return () => {
      mounted = false
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

