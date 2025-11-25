"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Trophy,
  Wallet,
  Clock,
  Star,
  ChevronRight,
  Plus,
  ArrowRightLeft,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function GameDashboard() {
  const [balance] = useState(8700.46)
  const [xp] = useState(2450)
  const [tier] = useState("Silver")
  const [maxXP] = useState(5000)
  const [loanLimit] = useState(1000)
  const [activeLoan] = useState(true)
  const [completedLoans] = useState(12)
  const [showHistory, setShowHistory] = useState(false)
  const [currentTheme, setCurrentTheme] = useState("sunset")
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [userName, setUserName] = useState("Player One")

  useEffect(() => {
    const savedName = localStorage.getItem("userName")
    if (savedName) {
      setUserName(savedName)
    }

    // Load dark mode preference
    const savedMode = localStorage.getItem("darkMode")
    const isDark = savedMode === null ? true : savedMode === "true"
    setIsDarkMode(isDark)

    // Load theme preference
    const savedTheme = localStorage.getItem("theme") || "sunset"
    setCurrentTheme(savedTheme)

    // Apply both theme and dark mode together to prevent glitching
    document.documentElement.className = `theme-${savedTheme} ${isDark ? "dark" : ""}`
  }, [])

  const applyTheme = (themeId: string) => {
    setCurrentTheme(themeId)
    localStorage.setItem("theme", themeId)
    document.documentElement.className = `theme-${themeId} ${isDarkMode ? "dark" : ""}`
  }

  const toggleDarkMode = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem("darkMode", String(newMode))
    document.documentElement.className = `theme-${currentTheme} ${newMode ? "dark" : ""}`
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

  if (showHistory) {
    return (
      <div className="min-h-screen p-4 pb-20 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button size="icon" variant="ghost" onClick={() => setShowHistory(false)}>
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

  return (
    <div className="min-h-screen p-4 pb-20 max-w-2xl mx-auto">
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

      <Card className="p-6 mb-5 bg-gradient-to-br from-card via-card to-secondary/30 border-0 relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 heatwave-gradient-soft" />
        <div className="absolute top-0 right-0 w-48 h-48 heatwave-gradient blur-3xl opacity-20" />
        <div className="relative">
          <AvatarDisplay tier={tier} xp={xp} emoteState={getAvatarEmote()} activeLoan={activeLoan} compact={true} />
        </div>
      </Card>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6 bg-secondary/50">
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

          <Card className="p-6 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-xl heatwave-gradient shadow-md">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <span className="text-base font-bold">XP Progress</span>
              </div>
              <Badge variant="secondary" className="gap-1.5 font-mono px-3 py-1.5">
                <Star className="h-3.5 w-3.5 fill-current heatwave-text" />
                {xp.toLocaleString()}/{maxXP.toLocaleString()}
              </Badge>
            </div>
            <div className="relative h-4 bg-secondary rounded-full overflow-hidden shadow-inner">
              <div
                className="absolute inset-y-0 left-0 heatwave-gradient rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${(xp / maxXP) * 100}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-3 font-medium">
              {(maxXP - xp).toLocaleString()} XP until {tier === "Silver" ? "Gold" : "next"} tier
            </p>
          </Card>

          <Card className="p-7 bg-gradient-to-br from-card via-card to-secondary/40 border-0 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-72 h-72 heatwave-gradient blur-3xl opacity-25 rounded-full" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Your Balance
                </span>
                <Badge variant="outline" className="gap-1.5 font-mono border-2 px-2.5 py-1">
                  <Wallet className="h-3.5 w-3.5" />
                  ...8887
                </Badge>
              </div>
              <h1 className="text-6xl font-bold mb-7 tracking-tight">
                R{balance.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="gap-2 h-14 heatwave-gradient border-0 text-white font-bold hover:opacity-90 transition-opacity shadow-lg text-base"
                  size="lg"
                >
                  <Plus className="h-5 w-5" />
                  Add Money
                </Button>
                <Button variant="secondary" className="gap-2 h-14 font-semibold text-base shadow-md" size="lg">
                  <ArrowRightLeft className="h-5 w-5" />
                  Transfer
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-card to-secondary/30 backdrop-blur-sm border-0 shadow-lg">
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
