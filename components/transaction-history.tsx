"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight, TrendingUp, TrendingDown, Zap, Trophy, Clock, CheckCircle2 } from 'lucide-react'
import { cn } from "@/lib/utils"

interface Transaction {
  id: string
  type: 'loan_disbursed' | 'loan_repaid' | 'xp_earned' | 'fee_paid' | 'tier_unlocked'
  amount: number
  currency: 'ZAR' | 'XP' | 'RESCUE'
  date: Date
  status: 'completed' | 'pending' | 'failed'
  description: string
  icon: string
}

export function TransactionHistory() {
  const [transactions] = useState<Transaction[]>([
    {
      id: 'TXN-001',
      type: 'loan_repaid',
      amount: -500,
      currency: 'ZAR',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'completed',
      description: 'Loan Repayment - LOAN-001',
      icon: '🎯'
    },
    {
      id: 'TXN-002',
      type: 'xp_earned',
      amount: 250,
      currency: 'XP',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'completed',
      description: 'Early Repayment Bonus',
      icon: '⚡'
    },
    {
      id: 'TXN-003',
      type: 'loan_disbursed',
      amount: 500,
      currency: 'ZAR',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'completed',
      description: 'Loan Disbursement',
      icon: '💰'
    },
    {
      id: 'TXN-004',
      type: 'fee_paid',
      amount: -215,
      currency: 'ZAR',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'completed',
      description: 'Initiation Fee (R165 + 10%)',
      icon: '📝'
    },
    {
      id: 'TXN-005',
      type: 'tier_unlocked',
      amount: 0,
      currency: 'XP',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      status: 'completed',
      description: 'Silver Tier Unlocked!',
      icon: '🏆'
    },
    {
      id: 'TXN-006',
      type: 'loan_repaid',
      amount: -500,
      currency: 'ZAR',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'completed',
      description: 'Loan Repayment - LOAN-002',
      icon: '🎯'
    },
    {
      id: 'TXN-007',
      type: 'xp_earned',
      amount: 150,
      currency: 'XP',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'completed',
      description: 'On-Time Repayment',
      icon: '⚡'
    }
  ])

  const groupTransactionsByDate = (txs: Transaction[]) => {
    const groups: Record<string, Transaction[]> = {}
    
    txs.forEach(tx => {
      const date = tx.date
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
      
      let label = 'Older'
      if (diffDays === 0) label = 'Today'
      else if (diffDays === 1) label = 'Yesterday'
      else if (diffDays < 7) label = 'This Week'
      else if (diffDays < 30) label = 'This Month'
      
      if (!groups[label]) groups[label] = []
      groups[label].push(tx)
    })
    
    return groups
  }

  const groupedTransactions = groupTransactionsByDate(transactions)
  const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older']

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="text-xs">Completed</Badge>
      case 'pending':
        return <Badge variant="outline" className="text-xs">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive" className="text-xs">Failed</Badge>
      default:
        return null
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const prefix = amount > 0 ? '+' : ''
    const abs = Math.abs(amount)
    
    switch (currency) {
      case 'ZAR':
        return `${prefix}R${abs}`
      case 'XP':
        return `${prefix}${abs} XP`
      case 'RESCUE':
        return `${prefix}${abs} RESCUE`
      default:
        return `${prefix}${abs}`
    }
  }

  const getAmountColor = (amount: number, currency: string) => {
    if (currency === 'XP' || currency === 'RESCUE') return 'text-primary'
    return amount > 0 ? 'text-primary' : 'text-foreground'
  }

  // Calculate stats
  const totalLoansCompleted = transactions.filter(t => t.type === 'loan_repaid').length
  const totalXPEarned = transactions
    .filter(t => t.currency === 'XP')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalBorrowed = transactions
    .filter(t => t.type === 'loan_disbursed')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalFees = Math.abs(transactions
    .filter(t => t.type === 'fee_paid')
    .reduce((sum, t) => sum + t.amount, 0))

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="glass-card p-4 bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Loans</span>
          </div>
          <p className="text-2xl font-bold font-[family-name:var(--font-orbitron)]">
            {totalLoansCompleted}
          </p>
        </Card>
        
        <Card className="glass-card p-4 bg-gradient-to-br from-secondary/10 via-background to-background border border-secondary/20">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-[oklch(0.80_0.20_85)]" />
            <span className="text-xs text-muted-foreground">Total XP</span>
          </div>
          <p className="text-2xl font-bold font-[family-name:var(--font-orbitron)] text-[oklch(0.80_0.20_85)]">
            {totalXPEarned}
          </p>
        </Card>
        
        <Card className="glass-card p-4 bg-gradient-to-br from-emerald-500/10 via-background to-background border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="text-xs text-muted-foreground">Total Borrowed</span>
          </div>
          <p className="text-2xl font-bold font-[family-name:var(--font-orbitron)]">
            R{totalBorrowed}
          </p>
        </Card>
        
        <Card className="glass-card p-4 bg-gradient-to-br from-amber-500/10 via-background to-background border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Fees Paid</span>
          </div>
          <p className="text-2xl font-bold font-[family-name:var(--font-orbitron)]">
            R{totalFees}
          </p>
        </Card>
      </div>

      {/* Transaction Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-secondary/40 rounded-2xl p-1">
          <TabsTrigger
            value="all"
            className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="loans"
            className="text-xs data-[state=active]:bg-emerald-500/90 data-[state=active]:text-white rounded-xl"
          >
            Loans
          </TabsTrigger>
          <TabsTrigger
            value="xp"
            className="text-xs data-[state=active]:bg-violet-500/90 data-[state=active]:text-white rounded-xl"
          >
            XP
          </TabsTrigger>
          <TabsTrigger
            value="fees"
            className="text-xs data-[state=active]:bg-amber-500/90 data-[state=active]:text-black rounded-xl"
          >
            Fees
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {groupOrder.map(group => {
            const groupTxs = groupedTransactions[group]
            if (!groupTxs || groupTxs.length === 0) return null
            
            return (
              <div key={group}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center rounded-full bg-secondary/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground">
                    {group}
                  </span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="space-y-2">
                  {groupTxs.map(tx => (
                    <Card key={tx.id} className="glass-card p-4 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{tx.icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx.date.toLocaleString('en-ZA', { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "font-bold font-[family-name:var(--font-orbitron)]",
                            getAmountColor(tx.amount, tx.currency)
                          )}>
                            {formatCurrency(tx.amount, tx.currency)}
                          </p>
                          {getStatusBadge(tx.status)}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </TabsContent>

        <TabsContent value="loans" className="space-y-2 mt-4">
          {transactions
            .filter(t => t.type === 'loan_disbursed' || t.type === 'loan_repaid')
            .map(tx => (
              <Card key={tx.id} className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{tx.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.date.toLocaleString('en-ZA', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <p className={cn(
                    "font-bold font-[family-name:var(--font-orbitron)]",
                    getAmountColor(tx.amount, tx.currency)
                  )}>
                    {formatCurrency(tx.amount, tx.currency)}
                  </p>
                </div>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="xp" className="space-y-2 mt-4">
          {transactions
            .filter(t => t.currency === 'XP' || t.type === 'tier_unlocked')
            .map(tx => (
              <Card key={tx.id} className="glass-card p-4 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{tx.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.date.toLocaleString('en-ZA', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  {tx.amount !== 0 && (
                    <p className="font-bold font-[family-name:var(--font-orbitron)] text-primary">
                      {formatCurrency(tx.amount, tx.currency)}
                    </p>
                  )}
                </div>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="fees" className="space-y-2 mt-4">
          {transactions
            .filter(t => t.type === 'fee_paid')
            .map(tx => (
              <Card key={tx.id} className="glass-card p-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{tx.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.date.toLocaleString('en-ZA', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <p className="font-bold font-[family-name:var(--font-orbitron)]">
                    {formatCurrency(tx.amount, tx.currency)}
                  </p>
                </div>
              </Card>
            ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
