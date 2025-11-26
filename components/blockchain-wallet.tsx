"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Link2, CheckCircle2, AlertCircle, Copy, ExternalLink, Shield } from 'lucide-react'
import { cn } from "@/lib/utils"

interface WalletConnectionProps {
  onConnect?: (address: string) => void
}

export function BlockchainWallet({ onConnect }: WalletConnectionProps) {
  const { userProfile } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)

  // Simulate wallet connection (in production, use Web3 providers)
  const connectWallet = async () => {
    setIsConnecting(true)
    
    try {
      // In production: Use ethers.js, wagmi, or thirdweb
      // const provider = new ethers.providers.Web3Provider(window.ethereum)
      // const signer = provider.getSigner()
      // const address = await signer.getAddress()
      
      // Simulation
      await new Promise(resolve => setTimeout(resolve, 1500))
      const mockAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
      const mockChainId = 137 // Polygon
      
      setWalletAddress(mockAddress)
      setChainId(mockChainId)
      setIsConnected(true)
      
      if (onConnect) {
        onConnect(mockAddress)
      }
    } catch (error) {
      console.error("[v0] Wallet connection error:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress("")
    setChainId(null)
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getChainName = (id: number | null) => {
    const chains: Record<number, string> = {
      1: "Ethereum",
      137: "Polygon",
      56: "BSC",
      43114: "Avalanche"
    }
    return id ? chains[id] || "Unknown" : ""
  }

  if (isConnected && walletAddress) {
    return (
      <div className="space-y-4">
        {/* Connected Wallet Card */}
        <Card className="glass-card p-6 bg-gradient-to-br from-primary/20 to-primary/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 text-9xl opacity-5">
            <Wallet />
          </div>
          
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <h3 className="font-bold font-[family-name:var(--font-orbitron)]">Wallet Connected</h3>
              <Badge variant="secondary" className="ml-auto">
                {getChainName(chainId)}
              </Badge>
            </div>

            <div className="p-4 bg-background/50 rounded-lg mb-4">
              <p className="text-xs text-muted-foreground mb-2">Wallet Address</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-lg font-bold flex-1">
                  {shortenAddress(walletAddress)}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={copyAddress}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => window.open(`https://polygonscan.com/address/${walletAddress}`, '_blank')}
                  className="h-8 w-8"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Network</p>
                <p className="font-bold text-sm">{getChainName(chainId)}</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="font-bold text-sm text-primary">Active</p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={disconnectWallet}
            >
              Disconnect Wallet
            </Button>
          </div>
        </Card>

        {/* Blockchain Benefits */}
        <Card className="glass-card p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Blockchain Benefits
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>All transactions recorded on blockchain for transparency</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Earn crypto rewards for completing loans</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Access to exclusive DeFi features</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Your lending history becomes portable NFT credentials</span>
            </li>
          </ul>
        </Card>

        {/* Token Balance (placeholder) */}
        <Card className="glass-card p-4 bg-gradient-to-br from-accent/10 to-accent/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">RESCUE Tokens</p>
              <p className="text-2xl font-bold font-[family-name:var(--font-orbitron)] text-accent">
                1,250
              </p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Earn tokens by completing loans and referring friends
          </p>
        </Card>
      </div>
    )
  }

  return (
    <Card className="glass-card p-6 space-y-6">
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/20 via-secondary/10 to-accent/20 border border-border/60">
        <div className="h-16 w-16 rounded-2xl bg-black/60 flex items-center justify-center overflow-hidden">
          {userProfile?.readyPlayerMeAvatarPreview ? (
            <img
              src={userProfile.readyPlayerMeAvatarPreview}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-primary/40 flex items-center justify-center text-lg font-bold text-primary-foreground">
              {userProfile?.userName?.slice(0, 2).toUpperCase() || "P1"}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Player streak</p>
          <p className="text-sm font-bold">
            {userProfile?.loanStreak ?? 0} perfect {userProfile?.loanStreak === 1 ? "cycle" : "cycles"} in a row
          </p>
          <p className="text-[11px] text-muted-foreground">
            Keep closing loans within 72 hours to boost your reputation and unlock more Web3 perks.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">XP</p>
          <p className="text-lg font-bold">
            {(userProfile?.xp ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="text-center">
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-4 flex items-center justify-center">
          <Wallet className="h-10 w-10 text-primary" />
        </div>
        
        <h3 className="font-bold text-xl mb-2 font-[family-name:var(--font-orbitron)]">
          Connect Your Wallet
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          Link your blockchain wallet to unlock Web3 features, earn crypto rewards, and access decentralized lending.
        </p>

        <Button
          className="gap-2 mb-4 w-full max-w-xs mx-auto bg-primary hover:bg-primary/90"
          onClick={connectWallet}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              Connect Wallet
            </>
          )}
        </Button>

        <div className="space-y-3 mt-6">
          <p className="text-xs text-muted-foreground font-semibold">Supported Wallets</p>
          <div className="grid grid-cols-3 gap-3">
            {['MetaMask', 'WalletConnect', 'Coinbase'].map((wallet) => (
              <div
                key={wallet}
                className="p-3 bg-secondary/50 rounded-lg text-xs font-medium hover:bg-secondary cursor-pointer transition-colors"
              >
                {wallet}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground text-left">
              Your wallet connection is secure and encrypted. We never store your private keys.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
