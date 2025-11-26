"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Trophy,
  Clock,
  ChevronRight,
  Coins,
  Target,
  History,
  TrendingUp,
  Sparkles,
  Palette,
  Sun,
  Moon,
} from "lucide-react"
import { AvatarDisplay } from "./avatar-display"
import { LoanManagement } from "./loan-management"
import { TierProgression } from "./tier-progression"
import { BlockchainWallet } from "./blockchain-wallet"
import { TransactionHistory } from "./transaction-history"
import { Swop } from "./swop"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { updateUserPreferences } from "@/lib/firebase/users"

interface GameDashboardProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function GameDashboard({ activeTab: externalActiveTab, onTabChange }: GameDashboardProps) {
  const { user, userProfile } = useAuth()
  
  // Use Firebase data if available, otherwise use defaults
  const xp = userProfile?.xp || 2450
  const tier = userProfile?.tier || "Silver"
  const maxXP = 5000
  const loanLimit = userProfile?.loanLimit || 1000
  const activeLoan = userProfile?.activeLoan || false
  const completedLoans = userProfile?.completedLoans || 12
  const [showHistory, setShowHistory] = useState(false)
  const currentTheme = userProfile?.theme || "sunset"
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const isDarkMode = userProfile?.darkMode !== undefined ? userProfile.darkMode : true
  const userName = userProfile?.userName || "Player One"
  const [internalTab, setInternalTab] = useState("dashboard")
  
  // Use external tab if provided, otherwise use internal state
  const activeTab = externalActiveTab || internalTab
  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab)
    } else {
      setInternalTab(tab)
    }
  }

  useEffect(() => {
    // Apply theme and dark mode from user profile or localStorage
    const theme = userProfile?.theme || localStorage.getItem("theme") || "sunset"
    const darkMode = userProfile?.darkMode !== undefined 
      ? userProfile.darkMode 
      : localStorage.getItem("darkMode") === "true"
    
    document.documentElement.className = `theme-${theme} ${darkMode ? "dark" : ""}`
  }, [userProfile])

  const applyTheme = async (themeId: string) => {
    localStorage.setItem("theme", themeId)
    document.documentElement.className = `theme-${themeId} ${isDarkMode ? "dark" : ""}`
    
    // Save to Firebase if user is authenticated
    if (user?.uid) {
      try {
        await updateUserPreferences(user.uid, { theme: themeId })
      } catch (error) {
        console.error("Error saving theme to Firebase:", error)
      }
    }
  }

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode
    localStorage.setItem("darkMode", String(newMode))
    document.documentElement.className = `theme-${currentTheme} ${newMode ? "dark" : ""}`
    
    // Save to Firebase if user is authenticated
    if (user?.uid) {
      try {
        await updateUserPreferences(user.uid, { darkMode: newMode })
      } catch (error) {
        console.error("Error saving dark mode to Firebase:", error)
      }
    }
  }

  const getAvatarEmote = () => {
    if (!activeLoan) return "idle" // No loan - neutral
    if (activeLoan && completedLoans > 10) return "happy" // Active loan, good history
    if (activeLoan) return "focused" // Active loan - focused on repayment
    return "idle"
  }

  const stats = [
    { icon: Trophy, label: "Completed", value: completedLoans, color: "text-primary" },
    { icon: Target, label: "Success Rate", value: "100%", color: "text-primary" },
    { icon: Coins, label: "Total Volume", value: "R12,000", color: "text-accent" },
    { icon: TrendingUp, label: "Streak", value: "12", color: "text-accent" },
  ]

  const themes = [
    { id: "sunset", name: "Sunset", colors: ["#FF6B35", "#F7931E", "#E94823"] },
    { id: "ocean", name: "Ocean", colors: ["#00D9FF", "#00A8CC", "#0891B2"] },
    { id: "aurora", name: "Aurora", colors: ["#A78BFA", "#8B5CF6", "#7C3AED"] },
    { id: "forest", name: "Forest", colors: ["#34D399", "#10B981", "#059669"] },
    { id: "neon", name: "Neon", colors: ["#F472B6", "#EC4899", "#DB2777"] },
  ]

  // Handle bottom nav tab changes
  useEffect(() => {
    if (activeTab === "swop") {
      // $SWOP view is handled in main render
    } else if (activeTab === "wallet") {
      handleTabChange("wallet")
    } else if (activeTab === "history") {
      setShowHistory(true)
    } else if (activeTab === "home") {
      handleTabChange("dashboard")
      setShowHistory(false)
    } else if (activeTab === "profile") {
      // Profile view - can be implemented later
      handleTabChange("dashboard")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  if (showHistory) {
    return (
      <div className="min-h-screen p-4 pb-20 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button size="icon" variant="ghost" onClick={() => {
            setShowHistory(false)
            handleTabChange("home")
          }}>
            <ChevronRight className="h-5 w-5 rotate-180" />
          </Button>
          <div>
            <h2 className="text-xl font-bold">Transaction History</h2>
            <p className="text-sm text-muted-foreground">View all your activity</p>
          </div>
        </div>
        <TransactionHistory />
      </div>
    )
  }

  // Show $SWOP view
  if (activeTab === "swop") {
    return <Swop />
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 pb-20 sm:pb-24 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Badge className="heatwave-gradient border-0 px-3 py-1 font-bold text-white shadow-lg">
            Level {Math.floor(xp / 500)}
          </Badge>
          <div>
            <p className="text-sm text-muted-foreground font-semibold">Welcome back</p>
            <h2 className="text-lg font-bold">{userName}</h2>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="rounded-full" onClick={toggleDarkMode}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full"
            onClick={() => setShowThemeSelector(!showThemeSelector)}
          >
            <Palette className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setShowHistory(true)}>
            <History className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {showThemeSelector && (
        <Card className="p-5 mb-4 bg-card backdrop-blur-sm border shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg heatwave-gradient">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">Choose Your Style</h3>
              <p className="text-xs text-muted-foreground">Fluid branding - not locked to one color</p>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  applyTheme(theme.id)
                  setShowThemeSelector(false)
                }}
                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  currentTheme === theme.id
                    ? "border-primary scale-105 shadow-xl"
                    : "border-border hover:border-muted-foreground hover:scale-105"
                }`}
              >
                <div
                  style={{
                    background: `linear-gradient(135deg, ${theme.colors[0]} 0%, ${theme.colors[1]} 50%, ${theme.colors[2]} 100%)`,
                  }}
                  className="absolute inset-0"
                />
                {currentTheme === theme.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="h-5 w-5 rounded-full bg-white shadow-lg" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </Card>
      )}

      <AvatarDisplay tier={tier} xp={xp} maxXp={maxXP} emoteState={getAvatarEmote()} activeLoan={activeLoan} />

      <Card className="p-6 mt-6 mb-5 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm border-0 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-2 font-medium">Available Loan Limit</p>
            <p className="text-5xl font-bold tracking-tight heatwave-text">R{loanLimit.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-2xl heatwave-gradient shadow-lg">
            <Trophy className="h-10 w-10 text-white" />
          </div>
        </div>
        {!activeLoan ? (
          <Button
            className="w-full gap-2 heatwave-gradient border-0 text-white font-bold h-14 hover:opacity-90 transition-opacity shadow-lg text-base"
            size="lg"
          >
            <Zap className="h-5 w-5" />
            Request Loan Now
          </Button>
        ) : (
          <div className="flex items-center gap-3 p-5 bg-secondary/50 rounded-2xl border-2 border-border shadow-inner">
            <Clock className="h-6 w-6 heatwave-text flex-shrink-0" />
            <div className="flex-1">
              <p className="text-base font-bold">Active Loan</p>
              <p className="text-sm text-muted-foreground">48 hours remaining</p>
            </div>
            <Badge className="heatwave-gradient border-0 text-white px-3 py-1.5 font-semibold">Active</Badge>
          </div>
        )}
      </Card>

      <Tabs value={activeTab === "wallet" ? "wallet" : activeTab === "dashboard" ? "dashboard" : "dashboard"} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-secondary/50 hidden md:grid">
          <TabsTrigger value="dashboard">Home</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="progression">Tiers</TabsTrigger>
          <TabsTrigger value="wallet">Web3</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
            <Card className="min-w-[170px] flex-shrink-0 p-5 text-center bg-gradient-to-br from-card to-secondary/50 border-0 relative overflow-hidden snap-center shadow-md">
              <div className="absolute inset-0 heatwave-gradient-soft" />
              <div className="relative">
                <p className="text-base font-bold mb-0.5">Up to 20%</p>
                <p className="text-xs text-muted-foreground">cashback rewards</p>
              </div>
            </Card>
            <Card className="min-w-[170px] flex-shrink-0 p-5 text-center bg-gradient-to-br from-card to-secondary/50 border-0 relative overflow-hidden snap-center shadow-md">
              <div className="absolute inset-0 heatwave-gradient-soft" />
              <div className="relative">
                <p className="text-base font-bold mb-0.5">72hr Cycles</p>
                <p className="text-xs text-muted-foreground">fast turnaround</p>
              </div>
            </Card>
            <Card className="min-w-[170px] flex-shrink-0 p-5 text-center bg-gradient-to-br from-card to-secondary/50 border-0 relative overflow-hidden snap-center shadow-md">
              <div className="absolute inset-0 heatwave-gradient-soft" />
              <div className="relative">
                <p className="text-base font-bold mb-0.5">Blockchain</p>
                <p className="text-xs text-muted-foreground">transparent & secure</p>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <Card key={i} className="relative p-6 border-0 shadow-xl overflow-hidden">
                  {/* Full heatwave gradient background */}
                  <div className="absolute inset-0 heatwave-gradient opacity-90" />

                  {/* Content with white text on gradient */}
                  <div className="relative z-10">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm shadow-md">
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs text-white/90 font-bold uppercase tracking-wide">{stat.label}</span>
                    </div>
                    <p className="text-4xl font-black tracking-tight text-white drop-shadow-lg">{stat.value}</p>
                  </div>
                </Card>
              )
            })}
          </div>

          <Card className="p-6 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-xl">Recent Activity</h3>
              <Button variant="ghost" size="sm" className="gap-1.5 h-9 font-bold" onClick={() => setShowHistory(true)}>
                View All
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {[
                {
                  name: "Loan Repayment",
                  type: "Success",
                  amount: -500,
                  icon: Trophy,
                  time: "2h ago",
                },
                { name: "XP Reward", type: "Bonus", amount: 150, icon: Zap, time: "2h ago" },
              ].map((tx, i) => {
                const Icon = tx.icon
                return (
                  <div
                    key={i}
                    className="relative flex items-center justify-between p-5 rounded-2xl backdrop-blur-sm border-0 shadow-xl overflow-hidden"
                  >
                    {/* Full heatwave gradient background for activity cards */}
                    <div className="absolute inset-0 heatwave-gradient opacity-85" />

                    {/* Content */}
                    <div className="relative z-10 flex items-center gap-4 flex-1">
                      <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm shadow-md">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base text-white">{tx.name}</p>
                        <p className="text-sm text-white/80 font-semibold">{tx.time}</p>
                      </div>
                    </div>
                    <div className="relative z-10 font-black text-xl tabular-nums text-white drop-shadow-lg">
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount} {tx.name.includes("XP") ? "XP" : "R"}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <LoanManagement />
        </TabsContent>

        <TabsContent value="progression">
          <TierProgression currentXP={xp} currentTier={tier} />
        </TabsContent>

        <TabsContent value="wallet">
          <BlockchainWallet />
        </TabsContent>
      </Tabs>
    </div>
  )
}
