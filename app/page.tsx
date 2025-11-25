"use client"

import { GameDashboard } from "@/components/game-dashboard"
import { Onboarding } from "@/components/onboarding"
import { useState, useEffect } from "react"

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("onboardingComplete")
    const savedTheme = localStorage.getItem("theme") || "sunset"
    const savedMode = localStorage.getItem("darkMode")
    const isDark = savedMode === null ? true : savedMode === "true"

    document.documentElement.className = `theme-${savedTheme} ${isDark ? "dark" : ""}`

    if (hasCompletedOnboarding === "true") {
      setShowOnboarding(false)
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <main className="min-h-screen wavy-gradient-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-lg font-bold heatwave-text">Loading G Rescue...</p>
        </div>
      </main>
    )
  }

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />
  }

  return (
    <main className="min-h-screen wavy-gradient-bg">
      <GameDashboard />
    </main>
  )
}
