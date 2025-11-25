"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { CheckCircle2, Zap, AlertCircle, Sparkles, Shield, Clock, Trophy } from 'lucide-react'
import { cn } from "@/lib/utils"

interface LoanRequestFlowProps {
  maxLoanAmount: number
  userTier: string
  onComplete?: () => void
  onCancel?: () => void
}

export function LoanRequestFlow({ maxLoanAmount, userTier, onComplete, onCancel }: LoanRequestFlowProps) {
  const [step, setStep] = useState(1)
  const [loanAmount, setLoanAmount] = useState(maxLoanAmount)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isApproved, setIsApproved] = useState(false)

  const totalSteps = 3
  
  // Calculate fees based on South African model
  const initiationFee = 165 + (loanAmount * 0.1)
  const totalToPay = loanAmount
  const totalToReceive = loanAmount - initiationFee

  const handleLoanRequest = async () => {
    setIsProcessing(true)
    
    // Simulate loan processing
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    setIsApproved(true)
    setIsProcessing(false)
    
    // Auto-complete after showing success
    setTimeout(() => {
      if (onComplete) onComplete()
    }, 3000)
  }

  // Step 1: Choose Amount
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">1</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-lg font-bold text-muted-foreground">2</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-lg font-bold text-muted-foreground">3</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] mb-2">Choose Loan Amount</h2>
          <p className="text-sm text-muted-foreground">Select how much you need to borrow</p>
        </div>

        <Card className="glass-card p-6 bg-gradient-to-br from-primary/10 to-accent/5">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">Loan Amount</p>
            <h1 className="text-5xl font-bold font-[family-name:var(--font-orbitron)] text-primary">
              R{loanAmount}
            </h1>
          </div>

          <Slider
            value={[loanAmount]}
            onValueChange={(value) => setLoanAmount(value[0])}
            min={500}
            max={maxLoanAmount}
            step={100}
            className="mb-6"
          />

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">R500</span>
            <Badge variant="secondary">Max: R{maxLoanAmount}</Badge>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          {[500, 700, maxLoanAmount].map(amount => (
            <Button
              key={amount}
              variant={loanAmount === amount ? "default" : "outline"}
              onClick={() => setLoanAmount(amount)}
              className="font-semibold"
            >
              R{amount}
            </Button>
          ))}
        </div>

        <Card className="glass-card p-4 bg-secondary/30">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Initiation Fee</span>
              <span className="font-semibold">R{initiationFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">You'll Receive</span>
              <span className="font-bold text-primary">R{totalToReceive.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-muted-foreground">Repay in 72 Hours</span>
              <span className="font-bold">R{totalToPay}</span>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            className="flex-1 gap-2 bg-primary hover:bg-primary/90"
            onClick={() => setStep(2)}
          >
            Continue
            <Zap className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Step 2: Review & Confirm
  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">2</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <span className="text-lg font-bold text-muted-foreground">3</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] mb-2">Review Loan Details</h2>
          <p className="text-sm text-muted-foreground">Confirm your loan request</p>
        </div>

        <Card className="glass-card p-6 bg-gradient-to-br from-accent/10 to-accent/5">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <span className="text-muted-foreground">Loan Amount</span>
              <span className="text-2xl font-bold font-[family-name:var(--font-orbitron)]">R{loanAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Initiation Fee</span>
              <span className="font-semibold">R{initiationFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Subscription</span>
              <span className="font-semibold">R25 (Paid)</span>
            </div>
            <div className="flex justify-between text-primary">
              <span className="font-semibold">You'll Receive</span>
              <span className="text-xl font-bold font-[family-name:var(--font-orbitron)]">R{totalToReceive.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-4 border-t border-border">
              <span className="font-semibold">Repay in 72 Hours</span>
              <span className="text-xl font-bold font-[family-name:var(--font-orbitron)]">R{totalToPay}</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="glass-card p-4 text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Repayment Period</p>
            <p className="font-bold">72 Hours</p>
          </Card>
          <Card className="glass-card p-4 text-center">
            <Trophy className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="text-xs text-muted-foreground mb-1">Potential XP</p>
            <p className="font-bold text-accent">+250 XP</p>
          </Card>
        </div>

        <Card className="glass-card p-4 bg-muted/30">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Important Terms</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• No interest charged - repay only the capital</li>
                <li>• One active loan at a time</li>
                <li>• Late repayment affects your XP and tier</li>
                <li>• Early repayment earns bonus XP</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setStep(1)}
          >
            Back
          </Button>
          <Button
            className="flex-1 gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            onClick={() => setStep(3)}
          >
            Confirm Loan
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Step 3: Processing & Approval
  if (step === 3) {
    if (isProcessing) {
      return (
        <div className="space-y-6 text-center py-8">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto flex items-center justify-center">
            <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] mb-2">Processing Your Loan</h2>
            <p className="text-sm text-muted-foreground">Verifying details and preparing disbursement...</p>
          </div>
          <Progress value={66} className="h-2" />
        </div>
      )
    }

    if (isApproved) {
      return (
        <div className="space-y-6 text-center py-8">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-16 w-16 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] mb-2 text-primary">Loan Approved!</h2>
            <p className="text-muted-foreground mb-4">R{totalToReceive.toFixed(2)} has been disbursed to your account</p>
            <Badge variant="secondary" className="gap-2">
              <Sparkles className="h-4 w-4" />
              72-hour cycle started
            </Badge>
          </div>

          <Card className="glass-card p-6 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan ID</span>
                <span className="font-mono font-semibold">LOAN-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Received</span>
                <span className="font-bold text-primary">R{totalToReceive.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Repay By</span>
                <span className="font-semibold">{new Date(Date.now() + 72 * 60 * 60 * 1000).toLocaleDateString('en-ZA')}</span>
              </div>
            </div>
          </Card>

          <div className="bg-accent/10 rounded-lg p-4 border border-accent/30">
            <p className="text-sm font-semibold mb-2">Next Steps:</p>
            <ul className="text-sm text-muted-foreground space-y-1 text-left">
              <li>✓ Funds have been added to your balance</li>
              <li>✓ Repay R{totalToPay} within 72 hours</li>
              <li>✓ Earn up to 250 XP for on-time repayment</li>
            </ul>
          </div>

          <Button
            className="w-full gap-2"
            onClick={onComplete}
          >
            Done
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }

    // Initial state before processing
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-[family-name:var(--font-orbitron)] mb-2">Ready to Submit?</h2>
          <p className="text-sm text-muted-foreground">Your loan will be processed instantly</p>
        </div>

        <Card className="glass-card p-6 text-center bg-gradient-to-br from-primary/10 to-accent/5">
          <Zap className="h-16 w-16 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold font-[family-name:var(--font-orbitron)] mb-2">Instant Approval</h3>
          <p className="text-sm text-muted-foreground">
            Your {userTier} tier status qualifies you for instant loan approval
          </p>
        </Card>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setStep(2)}
          >
            Back
          </Button>
          <Button
            className="flex-1 gap-2 bg-primary hover:bg-primary/90 font-bold"
            onClick={handleLoanRequest}
          >
            Request Loan
            <Zap className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return null
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}
