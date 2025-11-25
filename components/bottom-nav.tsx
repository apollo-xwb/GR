"use client"

import { useState, useEffect } from "react"
import { Home, Wallet, Send, History, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export function BottomNav({ activeTab = "home", onTabChange }: BottomNavProps) {
  const [currentTab, setCurrentTab] = useState(activeTab)

  // Sync internal state with external prop
  useEffect(() => {
    if (activeTab) {
      setCurrentTab(activeTab)
    }
  }, [activeTab])

  const handleTabClick = (tab: string) => {
    setCurrentTab(tab)
    onTabChange?.(tab)
  }

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "swop", label: "$SWOP", icon: Send },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "history", label: "History", icon: History },
    { id: "profile", label: "Profile", icon: User },
  ]

  // Use external activeTab if provided, otherwise use internal state
  const displayTab = activeTab || currentTab

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t-2 border-border shadow-2xl safe-area-inset-bottom">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-around px-1 sm:px-2 py-2 sm:py-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = displayTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 relative group min-w-[50px] sm:min-w-[60px]",
                  isActive
                    ? "text-primary scale-105"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {/* Active indicator background */}
                {isActive && (
                  <div className="absolute inset-0 heatwave-gradient rounded-2xl opacity-20 blur-sm" />
                )}
                
                {/* Icon with animated background on active */}
                <div
                  className={cn(
                    "relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-300",
                    isActive
                      ? "heatwave-gradient shadow-lg scale-110"
                      : "bg-secondary/50 group-hover:bg-secondary"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300",
                      isActive ? "text-white" : "text-current"
                    )}
                  />
                  {/* Glow effect on active */}
                  {isActive && (
                    <div className="absolute inset-0 heatwave-gradient rounded-xl opacity-50 blur-md -z-10" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all duration-300",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>

                {/* Active dot indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full heatwave-gradient" />
                )}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Gradient accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] heatwave-gradient opacity-60" />
    </nav>
  )
}

