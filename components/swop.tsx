"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Send,
  ArrowDown,
  CreditCard,
  Wallet,
  Search,
  User,
  ArrowRightLeft,
  QrCode,
  History,
  Plus,
  Minus,
  Check,
  X,
} from "lucide-react"

export function Swop() {
  const [activeView, setActiveView] = useState<"send" | "receive" | "add" | "withdraw">("send")
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [balance] = useState(8700.46)
  const [cardBalance] = useState(2500.0)

  const recentContacts = [
    { id: 1, name: "Alex Johnson", username: "@alexj", avatar: "👤" },
    { id: 2, name: "Sarah Chen", username: "@sarahc", avatar: "👤" },
    { id: 3, name: "Mike Davis", username: "@miked", avatar: "👤" },
  ]

  const recentTransactions = [
    { id: 1, name: "Alex Johnson", amount: 500, type: "sent", time: "2h ago" },
    { id: 2, name: "Sarah Chen", amount: 1200, type: "received", time: "1d ago" },
    { id: 3, name: "Mike Davis", amount: 300, type: "sent", time: "2d ago" },
  ]

  const handleSend = () => {
    // Handle send logic
    console.log("Sending", amount, "to", recipient)
  }

  const handleAddMoney = () => {
    // Handle add money logic
    console.log("Adding money")
  }

  const handleWithdraw = () => {
    // Handle withdraw logic
    console.log("Withdrawing", amount)
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 pb-24 max-w-2xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6">
        <Badge className="heatwave-gradient border-0 text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold mb-3 sm:mb-4">
          $SWOP
        </Badge>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">Peer-to-Peer Payments</h1>
        <p className="text-sm sm:text-base text-muted-foreground font-medium">Send and receive money instantly</p>
      </div>

      {/* Balance Card */}
      <Card className="p-6 bg-gradient-to-br from-card via-card to-secondary/40 border-0 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 heatwave-gradient blur-3xl opacity-25 rounded-full" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              $SWOP Balance
            </span>
            <Badge variant="outline" className="gap-1.5 font-mono border-2 px-2.5 py-1">
              <Wallet className="h-3.5 w-3.5" />
              Active
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-2 tracking-tight">
            R{balance.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h1>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Card Balance</p>
              <p className="text-lg font-bold">R{cardBalance.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 font-semibold"
              onClick={() => setActiveView("add")}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <Button
          size="lg"
          className="h-16 sm:h-20 gap-2 sm:gap-3 heatwave-gradient border-0 text-white font-bold hover:opacity-90 transition-opacity shadow-lg"
          onClick={() => setActiveView("send")}
        >
          <Send className="h-5 w-5 sm:h-6 sm:w-6" />
          <div className="text-left">
            <div className="text-xs sm:text-sm font-semibold">Send</div>
            <div className="text-[10px] sm:text-xs opacity-90">Money</div>
          </div>
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="h-16 sm:h-20 gap-2 sm:gap-3 font-bold shadow-md"
          onClick={() => setActiveView("receive")}
        >
          <ArrowDown className="h-5 w-5 sm:h-6 sm:w-6" />
          <div className="text-left">
            <div className="text-xs sm:text-sm font-semibold">Receive</div>
            <div className="text-[10px] sm:text-xs opacity-70">Payment</div>
          </div>
        </Button>
      </div>

      {/* Send View */}
      {activeView === "send" && (
        <Card className="p-4 sm:p-6 bg-card/80 backdrop-blur-xl border-2 shadow-2xl space-y-4 sm:space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-base font-bold">
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                  R
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-14 sm:h-16 text-2xl sm:text-3xl font-black pl-10 sm:pl-12 border-2"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient" className="text-base font-bold">
                Send To
              </Label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="recipient"
                  placeholder="Username, phone, or email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="h-14 pl-12 border-2 text-base"
                />
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {[100, 500, 1000, 2000].map((val) => (
                <Button
                  key={val}
                  variant="outline"
                  size="sm"
                  className="font-semibold text-xs sm:text-sm"
                  onClick={() => setAmount(val.toString())}
                >
                  R{val}
                </Button>
              ))}
            </div>

            {/* Recent Contacts */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-muted-foreground">Recent Contacts</Label>
              <div className="space-y-2">
                {recentContacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => setRecipient(contact.username)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full heatwave-gradient flex items-center justify-center text-white font-bold">
                      {contact.avatar}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-sm">{contact.name}</p>
                      <p className="text-xs text-muted-foreground">{contact.username}</p>
                    </div>
                    <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-14 gap-2 heatwave-gradient border-0 text-white font-bold hover:opacity-90 shadow-xl"
              onClick={handleSend}
              disabled={!amount || !recipient || parseFloat(amount) <= 0}
            >
              <Send className="h-5 w-5" />
              Send R{amount || "0.00"}
            </Button>
          </div>
        </Card>
      )}

      {/* Receive View */}
      {activeView === "receive" && (
        <Card className="p-4 sm:p-6 bg-card/80 backdrop-blur-xl border-2 shadow-2xl space-y-4 sm:space-y-6">
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="mx-auto w-48 h-48 sm:w-64 sm:h-64 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-4 heatwave-border">
              <QrCode className="h-24 w-24 sm:h-32 sm:w-32 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2 font-semibold">Your $SWOP Username</p>
              <p className="text-2xl font-black heatwave-text">@playerone</p>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="w-full h-14 gap-2 font-bold"
            >
              <QrCode className="h-5 w-5" />
              Share QR Code
            </Button>
          </div>
        </Card>
      )}

      {/* Add Money View */}
      {activeView === "add" && (
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-2 shadow-2xl space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="addAmount" className="text-base font-bold">
                Amount to Add
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                  R
                </span>
                <Input
                  id="addAmount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-16 text-3xl font-black pl-12 border-2"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold">Payment Method</Label>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary border-2 border-transparent hover:border-primary transition-all">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <div className="flex-1 text-left">
                    <p className="font-bold">Card ending in 8887</p>
                    <p className="text-xs text-muted-foreground">Expires 12/25</p>
                  </div>
                  <Check className="h-5 w-5 text-primary" />
                </button>
                <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary border-2 border-transparent hover:border-primary transition-all">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                  <div className="flex-1 text-left">
                    <p className="font-bold">Add New Card</p>
                    <p className="text-xs text-muted-foreground">Link a debit or credit card</p>
                  </div>
                </button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-14 gap-2 heatwave-gradient border-0 text-white font-bold hover:opacity-90 shadow-xl"
              onClick={handleAddMoney}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              <Plus className="h-5 w-5" />
              Add R{amount || "0.00"} to $SWOP
            </Button>
          </div>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-2 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-xl">Recent Activity</h3>
          <Button variant="ghost" size="sm" className="gap-1.5 h-9 font-bold">
            View All
            <History className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {recentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border-0"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-xl ${
                    tx.type === "sent" ? "bg-destructive/20" : "bg-primary/20"
                  }`}
                >
                  {tx.type === "sent" ? (
                    <Send className="h-5 w-5 text-destructive" />
                  ) : (
                    <ArrowDown className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-sm">{tx.name}</p>
                  <p className="text-xs text-muted-foreground">{tx.time}</p>
                </div>
              </div>
              <div
                className={`font-black text-lg ${
                  tx.type === "sent" ? "text-destructive" : "text-primary"
                }`}
              >
                {tx.type === "sent" ? "-" : "+"}R{tx.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

