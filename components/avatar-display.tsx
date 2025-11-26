"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Settings, Loader2, X } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { saveAvatar } from "@/lib/firebase/users"

interface AvatarDisplayProps {
  tier: string
  xp: number
  onCustomize?: () => void
  emoteState?: "idle" | "happy" | "focused" | "excited"
  activeLoan?: boolean
  compact?: boolean
}

export function AvatarDisplay({
  tier,
  xp,
  onCustomize,
  emoteState = "idle",
  activeLoan = false,
  compact = false,
}: AvatarDisplayProps) {
  const { user } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [showAvatarCreator, setShowAvatarCreator] = useState(false)
  const avatarCreatorRef = useRef<HTMLIFrameElement | null>(null)
  const readyPlayerMeSubdomain = process.env.NEXT_PUBLIC_READY_PLAYER_ME_SUBDOMAIN || "demo"
  const readyPlayerMeUrl = `https://${readyPlayerMeSubdomain}.readyplayer.me/avatar?frameApi=1&clearCache=1&bodyType=fullbody`

  useEffect(() => {
    const loadAvatar = () => {
      const savedAvatar = localStorage.getItem("readyPlayerMeAvatar")
      if (savedAvatar) {
        setAvatarUrl(savedAvatar)
      }
      setIsLoading(false)
    }

    loadAvatar()

    // Listen for storage changes to update avatar in real-time
    const handleStorageChange = () => {
      loadAvatar()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  useEffect(() => {
    if (!showAvatarCreator) return

    let subscribed = false

    const isReadyPlayerMeEvent = (event: MessageEvent) =>
      typeof event.origin === "string" && event.origin.includes(".readyplayer.me")

    const subscribeToEvents = () => {
      if (!avatarCreatorRef.current?.contentWindow) return
      avatarCreatorRef.current.contentWindow.postMessage(
        {
          target: "readyplayerme",
          type: "subscribe",
          eventName: "v1.avatar.exported",
        },
        "*",
      )
    }

    const handleMessage = async (event: MessageEvent) => {
      if (!isReadyPlayerMeEvent(event)) return
      if (event.data?.source !== "readyplayerme") return

      if (event.data.eventName === "v1.frame.ready" && !subscribed) {
        subscribed = true
        subscribeToEvents()
        return
      }

      if (event.data.eventName === "v1.avatar.exported") {
        const newAvatarUrl = event.data.data?.url
        if (!newAvatarUrl) return

        console.log("[ReadyPlayerMe] Avatar exported:", newAvatarUrl)
        setAvatarUrl(newAvatarUrl)
        localStorage.setItem("readyPlayerMeAvatar", newAvatarUrl)
        window.dispatchEvent(new Event("storage"))
        setShowAvatarCreator(false)

        if (user?.uid) {
          try {
            await saveAvatar(user.uid, newAvatarUrl)
          } catch (error) {
            console.error("Error saving avatar to Firebase:", error)
          }
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [showAvatarCreator, user?.uid])

  const getTierGlow = () => {
    switch (tier.toLowerCase()) {
      case "bronze":
        return "shadow-[0_0_40px_rgba(205,127,50,0.6)]"
      case "silver":
        return "shadow-[0_0_40px_rgba(192,192,192,0.7)]"
      case "gold":
        return "shadow-[0_0_40px_rgba(255,215,0,0.8)]"
      case "platinum":
        return "shadow-[0_0_50px_rgba(229,228,226,0.9)]"
      case "diamond":
        return "shadow-[0_0_60px_rgba(185,242,255,1)]"
      default:
        return "shadow-[0_0_30px_rgba(255,255,255,0.5)]"
    }
  }

  const getEmoteDisplay = () => {
    switch (emoteState) {
      case "happy":
        return { emoji: "😊", text: "Great track record!", color: "text-green-500" }
      case "focused":
        return { emoji: "🎯", text: "Stay focused on repayment", color: "text-orange-500" }
      case "excited":
        return { emoji: "🎉", text: "Level up incoming!", color: "text-purple-500" }
      default:
        return { emoji: "😎", text: "Ready when you are", color: "text-blue-500" }
    }
  }

  const emote = getEmoteDisplay()

  const openAvatarCreator = () => {
    setShowAvatarCreator(true)
  }

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className={`relative h-24 w-24 rounded-2xl heatwave-gradient p-1 ${getTierGlow()} transition-all duration-300`}
            >
              <div className="h-full w-full rounded-xl bg-background flex items-center justify-center overflow-hidden">
                {isLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin heatwave-text" />
                ) : avatarUrl ? (
                  <img
                    src={`${avatarUrl}?scene=fullbody-portrait-v1&quality=high`}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-5xl animate-pulse">{emote.emoji}</div>
                )}
              </div>
            </div>
            <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 heatwave-gradient border-0 text-white font-bold text-xs px-2 shadow-lg">
              {tier}
            </Badge>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 heatwave-text" />
              <h3 className="font-bold">Your Avatar</h3>
            </div>
            <p className={`text-sm ${emote.color} font-medium`}>{emote.text}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {activeLoan ? "Active loan in progress" : "No active loans"}
            </p>
          </div>

          <Button size="sm" variant="outline" className="gap-2 bg-transparent" onClick={openAvatarCreator}>
            <Settings className="h-3 w-3" />
            {avatarUrl ? "Edit" : "Create"}
          </Button>
        </div>

        {showAvatarCreator && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
            <div className="relative w-full h-full md:w-[90vw] md:h-[85vh] md:max-w-3xl md:rounded-2xl bg-background overflow-hidden shadow-2xl border-0 md:border-4 heatwave-border flex flex-col">
              <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-background via-background to-transparent pointer-events-none">
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto bg-background/95 backdrop-blur-sm font-bold shadow-lg pointer-events-auto flex items-center gap-2"
                  onClick={() => setShowAvatarCreator(false)}
                >
                  <X className="h-4 w-4" />
                  Close
                </Button>
              </div>

              <iframe
                ref={avatarCreatorRef}
                src={readyPlayerMeUrl}
                className="w-full h-full"
                allow="camera *; microphone *"
              />
            </div>
          </div>
        )}
      </>
    )
  }

  // Full version for avatar tab
  return (
    <>
      <Card className="p-6 relative overflow-hidden bg-card/50 backdrop-blur-sm border-0">
        <div className="absolute inset-0 heatwave-gradient-soft" />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 heatwave-text" />
              <h3 className="font-bold">Your Avatar</h3>
            </div>
            <Badge variant="outline" className="gap-1">
              {tier} Tier
            </Badge>
          </div>

          <div
            className={`relative aspect-square rounded-2xl bg-gradient-to-br from-secondary to-muted mb-4 flex items-center justify-center border-4 heatwave-border overflow-hidden ${getTierGlow()}`}
          >
            {isLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-16 w-16 animate-spin heatwave-text" />
                <p className="text-sm text-muted-foreground">Loading Avatar...</p>
              </div>
            ) : avatarUrl ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-secondary/20 to-background">
                <img
                  src={`${avatarUrl}?scene=fullbody-portrait-v1&quality=high`}
                  alt="Ready Player Me Avatar"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="text-9xl animate-pulse">{emote.emoji}</div>
                <p className="text-sm text-muted-foreground">Create your 3D avatar</p>
              </div>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-background/90 backdrop-blur-sm rounded-full border border-border">
              <p className={`text-sm font-medium ${emote.color}`}>{emote.text}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="gap-2 bg-transparent" onClick={onCustomize}>
              <Settings className="h-4 w-4" />
              Customize
            </Button>
            <Button
              className="gap-2 heatwave-gradient border-0 text-white hover:opacity-90"
              onClick={openAvatarCreator}
            >
              <Sparkles className="h-4 w-4" />
              {avatarUrl ? "Edit Avatar" : "Create Avatar"}
            </Button>
          </div>

          <div className="mt-4 p-3 bg-secondary/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">Avatar Emotes:</p>
            <p className="text-sm">
              Your 3D avatar reacts to your loan activity - complete loans on time to see happy emotes!
            </p>
          </div>
        </div>
      </Card>

      {showAvatarCreator && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="relative w-full h-full md:w-[90vw] md:h-[85vh] md:max-w-3xl md:rounded-2xl bg-background overflow-hidden shadow-2xl border-0 md:border-4 heatwave-border flex flex-col">
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-background via-background to-transparent pointer-events-none">
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto bg-background/95 backdrop-blur-sm font-bold shadow-lg pointer-events-auto flex items-center gap-2"
                onClick={() => setShowAvatarCreator(false)}
              >
                <X className="h-4 w-4" />
                Close
              </Button>
            </div>

            <iframe
              ref={avatarCreatorRef}
              src={readyPlayerMeUrl}
              className="w-full h-full"
              allow="camera *; microphone *"
            />
          </div>
        </div>
      )}
    </>
  )
}
