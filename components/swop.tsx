"use client"

import { useEffect, useRef, useState } from "react"
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
  ArrowRightLeft,
  QrCode,
  History,
  Plus,
  Minus,
  Check,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { BrowserQRCodeReader } from "@zxing/browser"

const PaymentAnimation = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center gap-4 py-6">
    <div className="payment-orbit relative h-28 w-28 flex items-center justify-center">
      <div className="payment-orbit-ring" />
      <div className="payment-orbit-core heatwave-gradient text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-black shadow-2xl">
        ⚡
      </div>
    </div>
    <p className="text-sm font-semibold text-muted-foreground">{label}</p>
  </div>
)

export function Swop() {
  const [activeView, setActiveView] = useState<"send" | "receive" | "add" | "withdraw">("send")
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [walletBalance, setWalletBalance] = useState(8700.46)
  const [cardBalance] = useState(2500)
  const [showQrModal, setShowQrModal] = useState(false)
  const [qrContext, setQrContext] = useState<"send" | "receive">("send")
  const [qrMode, setQrMode] = useState<"upload" | "scan">("upload")
  const [qrPayload, setQrPayload] = useState("")
  const [qrPreview, setQrPreview] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const [paymentSummary, setPaymentSummary] = useState<{ recipient: string; amount: number } | null>(null)
  const [confirmationStage, setConfirmationStage] = useState<"idle" | "summary" | "processing" | "success">("idle")
  const [incomingSummary, setIncomingSummary] = useState<{ sender: string; amount: number } | null>(null)
  const [incomingStage, setIncomingStage] = useState<"idle" | "summary" | "processing" | "success">("idle")
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null)
  const processingTimeout = useRef<NodeJS.Timeout | null>(null)
  const [lastScanValue, setLastScanValue] = useState<string | null>(null)

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

  const updateWalletBalance = (delta: number) => {
    setWalletBalance((prev) => Number(prev) + delta)
  }

  const resetProcessingTimeout = () => {
    if (processingTimeout.current) {
      clearTimeout(processingTimeout.current)
      processingTimeout.current = null
    }
  }

  const parsePayload = (raw: string) => {
    if (!raw) return null
    const [target, rawAmount] = raw.split("|").map((part) => part.trim())
    if (!target && !rawAmount) return null
    const parsedAmount = rawAmount ? Number(rawAmount) : undefined
    if (rawAmount && Number.isNaN(parsedAmount)) return null
    return {
      target: target || "",
      amount: parsedAmount,
    }
  }

  const handleDecodedPayload = (raw: string) => {
    if (!raw || raw === lastScanValue) return
    setLastScanValue(raw)
    const parsed = parsePayload(raw)
    if (!parsed) {
      toast.error("Unsupported QR payload")
      return
    }
    if (parsed.target) {
      if (qrContext === "send") {
        setRecipient(parsed.target)
      }
    }
    if (parsed.amount !== undefined) {
      if (qrContext === "send") {
        setAmount(parsed.amount.toString())
      }
    }

    if (qrContext === "send") {
      const amountNumber = (parsed.amount ?? Number(amount)) || 0
      setPaymentSummary({
        recipient: parsed.target || recipient || "@unknown",
        amount: amountNumber,
      })
      setConfirmationStage("summary")
    } else {
      const amountNumber = parsed.amount ?? 0
      setIncomingSummary({
        sender: parsed.target || "Someone",
        amount: amountNumber,
      })
      setIncomingStage("summary")
      if (amountNumber > 0) {
        updateWalletBalance(amountNumber)
      }
    }

    toast.success("QR details captured")
    setShowQrModal(false)
    stopScanner()
  }

  const startScanner = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setScanError("Camera access is not supported in this browser.")
      return
    }
    setScanError(null)
    setIsScanning(true)

    if (!codeReaderRef.current) {
      codeReaderRef.current = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: 400,
        delayBetweenScanSuccess: 800,
      })
    }

    try {
      await codeReaderRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, err) => {
          if (result) {
            handleDecodedPayload(result.getText())
          }
          if (err && err.name !== "NotFoundException") {
            setScanError(err.message)
          }
        },
      )
    } catch (error: any) {
      setScanError(error?.message || "Unable to access camera")
      setIsScanning(false)
    }
  }

  const stopScanner = () => {
    setIsScanning(false)
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset()
      } catch {
        // ignore reset errors
      }
    }
    const stream = videoRef.current?.srcObject as MediaStream | null
    stream?.getTracks().forEach((track) => track.stop())
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const handleSend = () => {
    if (!recipient || !amount) {
      toast.error("Enter an amount and recipient first")
      return
    }
    const numericAmount = Number(amount)
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Enter a valid amount")
      return
    }
    setPaymentSummary({ recipient, amount: numericAmount })
    setConfirmationStage("summary")
  }

  const handleAddMoney = () => {
    toast.success("Card linked top-up coming soon")
  }

  const handleWithdraw = () => {
    toast.success("Withdrawals will be available soon")
  }

  const confirmPayment = () => {
    if (!paymentSummary || confirmationStage === "processing") return
    setConfirmationStage("processing")
    resetProcessingTimeout()
    processingTimeout.current = setTimeout(() => {
      updateWalletBalance(-paymentSummary.amount)
      setConfirmationStage("success")
      toast.success(`Sent R${paymentSummary.amount.toFixed(2)} to ${paymentSummary.recipient}`)
      processingTimeout.current = setTimeout(() => {
        setConfirmationStage("idle")
        setPaymentSummary(null)
        setAmount("")
        setRecipient("")
      }, 1600)
    }, 1500)
  }

  const acknowledgeIncoming = () => {
    if (!incomingSummary) return
    setIncomingStage("processing")
    resetProcessingTimeout()
    processingTimeout.current = setTimeout(() => {
      setIncomingStage("success")
      toast.success(`Received R${incomingSummary.amount.toFixed(2)} from ${incomingSummary.sender}`)
      processingTimeout.current = setTimeout(() => {
        setIncomingStage("idle")
        setIncomingSummary(null)
      }, 1600)
    }, 1400)
  }

  useEffect(() => {
    if (!showQrModal || typeof document === "undefined") return
    const body = document.body
    const current = Number(body.dataset.modalCount || "0") + 1
    body.dataset.modalCount = `${current}`
    body.classList.add("modal-open")
    return () => {
      const next = Math.max(0, Number(body.dataset.modalCount || "1") - 1)
      if (next === 0) {
        body.classList.remove("modal-open")
        delete body.dataset.modalCount
      } else {
        body.dataset.modalCount = `${next}`
      }
    }
  }, [showQrModal])

  useEffect(() => {
    if (showQrModal && qrMode === "scan") {
      startScanner()
    } else {
      stopScanner()
    }
    return () => {
      stopScanner()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showQrModal, qrMode])

  useEffect(() => {
    return () => {
      resetProcessingTimeout()
      stopScanner()
    }
  }, [])

  useEffect(() => {
    if (showQrModal) {
      setLastScanValue(null)
    }
  }, [showQrModal])

  const handleQrFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      setQrPreview(dataUrl)
      try {
        const readerInstance = new BrowserQRCodeReader()
        const result = await readerInstance.decodeFromImageUrl(dataUrl)
        handleDecodedPayload(result.getText())
      } catch (error: any) {
        setScanError(error?.message || "Couldn't read QR from image. Paste the payload instead.")
      }
    }
    reader.readAsDataURL(file)
  }

  const applyQrPayload = () => {
    if (!qrPayload.trim()) {
      toast.error("Paste a QR payload first")
      return
    }
    handleDecodedPayload(qrPayload.trim())
  }

  return (
    <>
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
            R{walletBalance.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 font-semibold"
              onClick={() => {
                setQrContext("send")
                setQrMode("scan")
                setShowQrModal(true)
              }}
            >
              <QrCode className="h-5 w-5" />
              Pay using QR Code
            </Button>

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

            {paymentSummary && confirmationStage !== "idle" && (
              <div className="rounded-2xl border-2 border-border/80 bg-background/80 p-4 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">Ready to send</p>
                    <p className="text-xl font-black">@{paymentSummary.recipient.replace("@", "")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-semibold">Amount</p>
                    <p className="text-2xl font-black">
                      R{paymentSummary.amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {confirmationStage === "summary" && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Both devices will show this summary. Confirm to trigger the animated payout.
                    </p>
                    <div className="flex gap-3">
                      <Button className="flex-1 h-12 font-bold heatwave-gradient text-white border-0" onClick={confirmPayment}>
                        Confirm & Send
                      </Button>
                      <Button
                        className="h-12 font-semibold"
                        variant="outline"
                        onClick={() => {
                          setConfirmationStage("idle")
                          setPaymentSummary(null)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {confirmationStage === "processing" && <PaymentAnimation label="Processing payment securely..." />}

                {confirmationStage === "success" && (
                  <div className="text-center space-y-2">
                    <div className="text-4xl">✅</div>
                    <p className="font-semibold">Payment sent!</p>
                    <p className="text-sm text-muted-foreground">Wallet updated instantly.</p>
                  </div>
                )}
              </div>
            )}

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
            <Button
              size="lg"
              className="w-full h-14 gap-2 heatwave-gradient text-white border-0 font-bold"
              onClick={() => {
                setQrContext("receive")
                setQrMode("scan")
                setShowQrModal(true)
                setIncomingStage("idle")
                setIncomingSummary(null)
              }}
            >
              <ArrowRightLeft className="h-5 w-5" />
              Scan Incoming Payment
            </Button>
          </div>

          {incomingSummary && incomingStage !== "idle" && (
            <div className="rounded-2xl border-2 border-border/80 bg-background/80 p-4 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Incoming from</p>
                  <p className="text-xl font-black">{incomingSummary.sender}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground font-semibold">Amount</p>
                  <p className="text-2xl font-black">
                    R{incomingSummary.amount.toLocaleString("en-ZA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              {incomingStage === "summary" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    We instantly bumped your balance so you can keep it moving while the sender confirms.
                  </p>
                  <Button className="w-full h-12 font-bold heatwave-gradient text-white border-0" onClick={acknowledgeIncoming}>
                    Confirm Receipt
                  </Button>
                </div>
              )}

              {incomingStage === "processing" && <PaymentAnimation label="Syncing both devices..." />}

              {incomingStage === "success" && (
                <div className="text-center space-y-2">
                  <div className="text-4xl">🎉</div>
                  <p className="font-semibold">Payment received!</p>
                  <p className="text-sm text-muted-foreground">Wallet already updated.</p>
                </div>
              )}
            </div>
          )}
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

      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card/95 border-2 shadow-2xl space-y-4 p-6 relative">
            <button
              className="absolute top-3 right-3 rounded-full bg-black/40 text-white p-1"
              onClick={() => setShowQrModal(false)}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Scan or Upload QR</h3>
              <p className="text-sm text-muted-foreground">
                Point your camera at a payment QR or paste the payload below. We'll pre-fill the recipient and amount.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={qrMode === "scan" ? "default" : "outline"}
                className="h-12 font-semibold"
                onClick={() => setQrMode("scan")}
              >
                Live Camera
              </Button>
              <Button
                variant={qrMode === "upload" ? "default" : "outline"}
                className="h-12 font-semibold"
                onClick={() => setQrMode("upload")}
              >
                Upload / Paste
              </Button>
            </div>

            {qrMode === "scan" ? (
              <div className="space-y-3">
                <div className="rounded-2xl border-2 border-dashed border-border overflow-hidden relative h-64">
                  <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />
                  {!isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-muted-foreground">
                      Initializing camera...
                    </div>
                  )}
                  <div className="absolute inset-6 border-2 border-white/60 rounded-2xl animate-pulse pointer-events-none" />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {scanError
                    ? scanError
                    : "Align the QR inside the frame. We'll capture it instantly and close this window."}
                </p>
              </div>
            ) : (
              <>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-6 cursor-pointer text-center gap-3 hover:border-primary transition">
                  <QrCode className="h-10 w-10 text-primary" />
                  <span className="text-sm font-semibold">Upload QR Image</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleQrFile} />
                </label>
                {qrPreview && (
                  <div className="rounded-2xl overflow-hidden border border-border">
                    <img src={qrPreview} alt="QR preview" className="w-full h-48 object-cover" />
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">QR Payload</Label>
                  <textarea
                    rows={4}
                    className="w-full rounded-xl border border-border bg-background/70 p-3 text-sm"
                    placeholder="Example: @alexj|250"
                    value={qrPayload}
                    onChange={(e) => setQrPayload(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    We currently support payloads formatted as <strong>username|amount</strong>. Amount is optional.
                  </p>
                </div>
                <Button className="w-full heatwave-gradient border-0 text-white font-bold" onClick={applyQrPayload}>
                  Apply QR Details
                </Button>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  )
}

