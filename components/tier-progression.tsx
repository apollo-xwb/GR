"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Lock, CheckCircle2, Coins, Zap, Crown, Gem } from 'lucide-react'
import { cn } from "@/lib/utils"

interface TierData {
  name: string
  minXP: number
  maxXP: number
  loanLimit: number
  color: string
  icon: any
  perks: string[]
  unlocked: boolean
}

interface TierProgressionProps {
  currentXP: number
  currentTier: string
}

export function TierProgression({ currentXP, currentTier }: TierProgressionProps) {
  const tiers: TierData[] = [
    {
      name: "Bronze",
      minXP: 0,
      maxXP: 1000,
      loanLimit: 500,
      color: "oklch(0.60_0.15_40)",
      icon: Trophy,
      perks: ["R500 loan limit", "Basic avatar items", "Standard support"],
      unlocked: true
    },
    {
      name: "Silver",
      minXP: 1000,
      maxXP: 5000,
      loanLimit: 1000,
      color: "oklch(0.85_0.05_240)",
      icon: Coins,
      perks: ["R1,000 loan limit", "Silver avatar items", "Priority support", "5% cashback on fees"],
      unlocked: currentXP >= 1000
    },
    {
      name: "Gold",
      minXP: 5000,
      maxXP: 15000,
      loanLimit: 1500,
      color: "oklch(0.80_0.20_85)",
      icon: Zap,
      perks: ["R1,500 loan limit", "Gold avatar items", "VIP support", "10% cashback on fees", "Extended repayment options"],
      unlocked: currentXP >= 5000
    },
    {
      name: "Platinum",
      minXP: 15000,
      maxXP: 35000,
      loanLimit: 2500,
      color: "oklch(0.75_0.15_260)",
      icon: Crown,
      perks: ["R2,500 loan limit", "Platinum avatar items", "Dedicated account manager", "15% cashback on fees", "Flexible repayment", "Early access to features"],
      unlocked: currentXP >= 15000
    },
    {
      name: "Diamond",
      minXP: 35000,
      maxXP: 100000,
      loanLimit: 5000,
      color: "oklch(0.70_0.25_220)",
      icon: Gem,
      perks: ["R5,000+ loan limit", "Exclusive diamond items", "White glove service", "20% cashback on fees", "Custom repayment plans", "Beta features", "Referral bonuses"],
      unlocked: currentXP >= 35000
    }
  ]

  const currentTierIndex = tiers.findIndex(t => t.name === currentTier)
  const currentTierData = tiers[currentTierIndex]
  const nextTierData = tiers[currentTierIndex + 1]

  const progressToNextTier = nextTierData
    ? ((currentXP - currentTierData.minXP) / (nextTierData.minXP - currentTierData.minXP)) * 100
    : 100

  return (
    <div className="space-y-6">
      {/* Current Tier Progress */}
      <Card className="glass-card p-6 bg-gradient-to-br from-primary/20 to-accent/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 text-[200px] opacity-5">
          {currentTierData.icon && <currentTierData.icon />}
        </div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Current Tier</p>
              <h2 className="text-3xl font-bold font-[family-name:var(--font-orbitron)]" style={{ color: currentTierData.color }}>
                {currentTier}
              </h2>
            </div>
            <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{
              background: `${currentTierData.color}20`,
              boxShadow: `0 0 30px ${currentTierData.color}`
            }}>
              {currentTierData.icon && <currentTierData.icon className="h-8 w-8" style={{ color: currentTierData.color }} />}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total XP</span>
              <span className="font-bold font-[family-name:var(--font-orbitron)]">
                {currentXP.toLocaleString()}
              </span>
            </div>
            
            {nextTierData && (
              <>
                <Progress value={progressToNextTier} className="h-3 mb-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{nextTierData.minXP - currentXP} XP to {nextTierData.name}</span>
                  <span>{progressToNextTier.toFixed(0)}%</span>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Loan Limit</p>
              <p className="text-xl font-bold font-[family-name:var(--font-orbitron)]">
                R{currentTierData.loanLimit}
              </p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Level</p>
              <p className="text-xl font-bold font-[family-name:var(--font-orbitron)]">
                {Math.floor(currentXP / 500)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* All Tiers */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg font-[family-name:var(--font-orbitron)]">All Tiers</h3>
        {tiers.map((tier, index) => {
          const TierIcon = tier.icon
          const isCurrent = tier.name === currentTier
          
          return (
            <Card
              key={tier.name}
              className={cn(
                "glass-card p-4 relative overflow-hidden transition-all",
                isCurrent && "ring-2 ring-primary"
              )}
            >
              {!tier.unlocked && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-semibold">Locked</p>
                    <p className="text-xs text-muted-foreground">{tier.minXP - currentXP} XP needed</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-4">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: `${tier.color}20`,
                    boxShadow: tier.unlocked ? `0 0 20px ${tier.color}50` : 'none'
                  }}
                >
                  {tier.unlocked ? (
                    <TierIcon className="h-6 w-6" style={{ color: tier.color }} />
                  ) : (
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold font-[family-name:var(--font-orbitron)]" style={{ color: tier.unlocked ? tier.color : undefined }}>
                      {tier.name}
                    </h4>
                    {isCurrent && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                    {tier.unlocked && !isCurrent && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {tier.minXP.toLocaleString()} - {tier.maxXP.toLocaleString()} XP
                  </p>
                  
                  <div className="space-y-1">
                    {tier.perks.slice(0, 3).map((perk, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="h-1 w-1 rounded-full bg-primary" />
                        <span className={tier.unlocked ? 'text-foreground' : 'text-muted-foreground'}>
                          {perk}
                        </span>
                      </div>
                    ))}
                    {tier.perks.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{tier.perks.length - 3} more perks
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* XP Earning Guide */}
      <Card className="glass-card p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-[oklch(0.80_0.20_85)]" />
          How to Earn XP
        </h4>
        <div className="space-y-2">
          {[
            { action: "Complete loan on time", xp: "150-250 XP" },
            { action: "Early repayment", xp: "Bonus +50 XP" },
            { action: "First loan", xp: "500 XP" },
            { action: "Refer a friend", xp: "300 XP" },
            { action: "Perfect month (4+ loans)", xp: "1000 XP" }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
              <span className="text-sm">{item.action}</span>
              <span className="text-sm font-bold text-[oklch(0.80_0.20_85)]">{item.xp}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
