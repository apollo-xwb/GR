"use client"

import { GameDashboard } from "@/components/game-dashboard"
import { Onboarding } from "@/components/onboarding"
import { BottomNav } from "@/components/bottom-nav"
import { Auth } from "@/components/auth"
import { AuthProvider, useAuth } from "@/contexts/auth-context"
import { useState, useEffect } from "react"

function AppContent() {
  const { user, userProfile, loading: authLoading } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("home")

  useEffect(() => {
    if (authLoading) return

    const hasCompletedOnboarding = localStorage.getItem("onboardingComplete")
    const savedTheme = userProfile?.theme || localStorage.getItem("theme") || "sunset"
    const savedMode = userProfile?.darkMode !== undefined 
      ? userProfile.darkMode 
      : localStorage.getItem("darkMode")
    const isDark = savedMode === null ? true : savedMode === "true"

    document.documentElement.className = `theme-${savedTheme} ${isDark ? "dark" : ""}`

    if (hasCompletedOnboarding === "true" || userProfile) {
      setShowOnboarding(false)
    }
    setIsLoading(false)
  }, [authLoading, userProfile])

  if (isLoading || authLoading) {
    return (
      <main className="min-h-screen wavy-gradient-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-lg font-bold heatwave-text">Loading G Rescue...</p>
        </div>
      </main>
    )
  }

  // Show auth if not logged in
  if (!user) {
    return <Auth onSuccess={() => {}} />
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />
  }

  return (
    <main className="min-h-screen wavy-gradient-bg pb-20">
      <GameDashboard activeTab={activeTab} onTabChange={setActiveTab} />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
