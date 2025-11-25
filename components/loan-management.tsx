"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, Zap, TrendingUp, AlertCircle, CheckCircle2, Flame } from 'lucide-react'
import { cn } from "@/lib/utils"
import { LoanRequestFlow } from "./loan-request-flow"

interface LoanData {
  id: string
  amount: number
  initiationFee: number
  totalDue: number
  startTime: Date
  endTime: Date
  status: 'active' | 'completed' | 'overdue'
}

export function LoanManagement() {
  const [activeLoan, setActiveLoan] = useState<LoanData | null>({
    id: "LOAN-001",
    amount: 500,
    initiationFee: 215,
    totalDue: 500,
    startTime: new Date(Date.now() - (24 * 60 * 60 * 1000)),
    endTime: new Date(Date.now() + (48 * 60 * 60 * 1000)),
    status: 'active'
  })

  const [timeRemaining, setTimeRemaining] = useState<string>("")
  const [urgency, setUrgency] = useState<'safe' | 'warning' | 'critical'>('safe')
  const [showRequestFlow, setShowRequestFlow] = useState(false)

  useEffect(() => {
    if (!activeLoan) return

    const interval = setInterval(() => {
      const now = new Date()
      const remaining = activeLoan.endTime.getTime() - now.getTime()
      
      if (remaining <= 0) {
        setTimeRemaining("OVERDUE")
        setUrgency('critical')
        return
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      
      setTimeRemaining(`${hours}h ${minutes}m`)
      
      if (hours < 12) {
        setUrgency('critical')
      } else if (hours < 24) {
        setUrgency('warning')
      } else {
        setUrgency('safe')
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [activeLoan])

  const progressPercentage = activeLoan 
    ? ((activeLoan.endTime.getTime() - Date.now()) / (72 * 60 * 60 * 1000)) * 100 
    : 0

  const urgencyColors = {
    safe: 'text-primary',
    warning: 'text-[oklch(0.80_0.20_85)]',
    critical: 'text-destructive'
  }

  const urgencyBg = {
    safe: 'from-primary/20 to-primary/5',
    warning: 'from-[oklch(0.80_0.20_85)]/20 to-[oklch(0.80_0.20_85)]/5',
    critical: 'from-destructive/20 to-destructive/5'
  }

  // Show loan request flow
  if (showRequestFlow) {
    return (
      <div className="space-y-4">
        <LoanRequestFlow
          maxLoanAmount={1000}
          userTier="Silver"
          onComplete={() => setShowRequestFlow(false)}
          onCancel={() => setShowRequestFlow(false)}
        />
      </div>
    )
  }

  if (!activeLoan) {
    return (
      <Card className="glass-card p-6">
        <div className="text-center py-8">
          <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-lg mb-2 font-[family-name:var(--font-orbitron)]">
            No Active Loan
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ready to level up? Request your next loan now!
          </p>
          <Button 
            className="gap-2 bg-primary hover:bg-primary/90"
            onClick={() => setShowRequestFlow(true)}
          >
            <Zap className="h-4 w-4" />
            Request Loan
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Active Loan Card */}
      <Card className={cn(
        "glass-card p-6 bg-gradient-to-br relative overflow-hidden",
        urgencyBg[urgency]
      )}>
        {urgency === 'critical' && (
          <div className="absolute inset-0 bg-destructive/10 animate-pulse" />
        )}
        
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {urgency === 'critical' ? (
                <AlertCircle className="h-5 w-5 text-destructive animate-pulse" />
              ) : urgency === 'warning' ? (
                <Clock className="h-5 w-5 text-[oklch(0.80_0.20_85)]" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              )}
              <h3 className="font-bold font-[family-name:var(--font-orbitron)]">Active Loan</h3>
            </div>
            <Badge variant={urgency === 'critical' ? 'destructive' : 'secondary'}>
              {activeLoan.id}
            </Badge>
          </div>

          {/* Countdown Timer */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Time Remaining</span>
              <span className={cn(
                "text-2xl font-bold font-[family-name:var(--font-orbitron)]",
                urgencyColors[urgency]
              )}>
                {timeRemaining}
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className={cn(
                "h-3",
                urgency === 'critical' && "animate-pulse"
              )}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {urgency === 'critical' ? 'URGENT: Repay now to avoid penalties!' : 
               urgency === 'warning' ? 'Warning: Less than 24 hours remaining' :
               'You\'re on track!'}
            </p>
          </div>

          {/* Loan Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Loan Amount</span>
              <span className="font-bold font-[family-name:var(--font-orbitron)]">
                R{activeLoan.amount}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
              <span className="text-sm text-muted-foreground">Initiation Fee (Paid)</span>
              <span className="font-bold font-[family-name:var(--font-orbitron)] text-muted-foreground line-through">
                R{activeLoan.initiationFee}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/20 rounded-lg border border-primary/30">
              <span className="text-sm font-semibold">Amount Due</span>
              <span className="text-2xl font-bold font-[family-name:var(--font-orbitron)] text-primary">
                R{activeLoan.totalDue}
              </span>
            </div>
          </div>

          {/* Repay Button */}
          <Button 
            className={cn(
              "w-full gap-2 font-bold text-lg h-12",
              urgency === 'critical' 
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-pulse" 
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            {urgency === 'critical' ? (
              <>
                <AlertCircle className="h-5 w-5" />
                REPAY NOW
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                Repay R{activeLoan.totalDue}
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Loan Info Card */}
      <Card className="glass-card p-4">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" />
          72-Hour Cycle Rules
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Repay within 72 hours to maintain your tier status</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Early repayment earns bonus XP</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>No interest charged - only repay the capital</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary mt-0.5">•</span>
            <span>Late payment affects your XP and tier progression</span>
          </li>
        </ul>
      </Card>

      {/* XP Rewards Preview */}
      <Card className="glass-card p-4 bg-gradient-to-br from-accent/10 to-accent/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Potential XP Reward</p>
            <p className="text-2xl font-bold font-[family-name:var(--font-orbitron)] text-accent">
              +{urgency === 'safe' ? '250' : urgency === 'warning' ? '150' : '50'} XP
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-accent" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {urgency === 'safe' ? 'Repay early for maximum XP!' : 
           urgency === 'warning' ? 'Repay soon for bonus XP' :
           'Limited XP for late repayment'}
        </p>
      </Card>
    </div>
  )
}
