"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Settings, Loader2, X, Layers } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { saveAvatar, setActiveAvatar, getAvatarPreviewUrl } from "@/lib/firebase/users"
import { toast } from "sonner"
import { AvatarLibrary } from "@/components/avatar-library"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string
        poster?: string
        "camera-controls"?: boolean | string
        "auto-rotate"?: boolean | string
        "shadow-intensity"?: string | number
        "interaction-prompt"?: string
        "disable-zoom"?: boolean | string
        "exposure"?: string | number
        "tone-mapping"?: "neutral" | "aces"
      }
    }
  }
}

interface AvatarDisplayProps {
  tier: string
  xp: number
  maxXp?: number
  onCustomize?: () => void
  emoteState?: "idle" | "happy" | "focused" | "excited"
  activeLoan?: boolean
  compact?: boolean
}

export function AvatarDisplay({
  tier,
  xp,
  maxXp = 5000,
  onCustomize,
  emoteState = "idle",
  activeLoan = false,
  compact = false,
}: AvatarDisplayProps) {
  const { user, userProfile, refreshProfile } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [showAvatarCreator, setShowAvatarCreator] = useState(false)
  const [showAvatarLibrary, setShowAvatarLibrary] = useState(false)
  const avatarCreatorRef = useRef<HTMLIFrameElement | null>(null)
  const readyPlayerMeSubdomain = process.env.NEXT_PUBLIC_READY_PLAYER_ME_SUBDOMAIN || "demo"
  const sanitizedSubdomain = useMemo(
    () => readyPlayerMeSubdomain.replace(/^https?:\/\//, "").replace(/\.readyplayer\.me.*$/i, ""),
    [readyPlayerMeSubdomain],
  )
  const readyPlayerMeUrl = useMemo(() => {
    const params = new URLSearchParams({
      frameApi: "1",
      clearCache: "1",
      bodyType: "fullbody",
      quickStart: "false",
      language: "en",
    })
    return `https://${sanitizedSubdomain}.readyplayer.me/avatar?${params.toString()}`
  }, [sanitizedSubdomain])
  const avatarHistory = userProfile?.readyPlayerMeAvatars ?? []

  useEffect(() => {
    const loadAvatar = () => {
      const savedAvatar = localStorage.getItem("readyPlayerMeAvatar")
      const savedPreview = localStorage.getItem("readyPlayerMeAvatarPreview")
      if (savedAvatar) {
        setAvatarUrl(savedAvatar)
      }
      if (savedPreview) {
        setAvatarPreview(savedPreview)
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
    if (!showAvatarCreator || typeof document === "undefined") return

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
  }, [showAvatarCreator])

  useEffect(() => {
    if (userProfile?.readyPlayerMeAvatar) {
      setAvatarUrl(userProfile.readyPlayerMeAvatar)
      localStorage.setItem("readyPlayerMeAvatar", userProfile.readyPlayerMeAvatar)
    }
    if (userProfile?.readyPlayerMeAvatarPreview) {
      setAvatarPreview(userProfile.readyPlayerMeAvatarPreview)
      localStorage.setItem("readyPlayerMeAvatarPreview", userProfile.readyPlayerMeAvatarPreview)
    }
  }, [userProfile?.readyPlayerMeAvatar, userProfile?.readyPlayerMeAvatarPreview])

  useEffect(() => {
    if (!showAvatarCreator && !showAvatarLibrary) return
    if (typeof document === "undefined") return

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
  }, [showAvatarCreator, showAvatarLibrary])

  useEffect(() => {
    if (!showAvatarCreator) return

    let subscribed = false

    const isReadyPlayerMeEvent = (event: MessageEvent) =>
      typeof event.origin === "string" && event.origin.includes(".readyplayer.me")

    const subscribeToEvents = () => {
      if (!avatarCreatorRef.current?.contentWindow) return
      const payload = JSON.stringify({
        target: "readyplayerme",
        type: "subscribe",
        eventName: "v1.avatar.exported",
      })
      avatarCreatorRef.current.contentWindow.postMessage(payload, "*")
    }

    const handleMessage = async (event: MessageEvent) => {
      if (!isReadyPlayerMeEvent(event)) return

      let data = event.data
      if (typeof data === "string") {
        try {
          data = JSON.parse(data)
        } catch {
          return
        }
      }

      if (data?.source !== "readyplayerme") return
      console.debug("[ReadyPlayerMe] message", data.eventName, data)
      console.debug("[ReadyPlayerMe] message", data.eventName, data)

      if (data.eventName === "v1.frame.ready" && !subscribed) {
        subscribed = true
        subscribeToEvents()
        return
      }

      if (data.eventName === "v1.avatar.exported") {
        const newAvatarUrl = data.data?.url
        if (!newAvatarUrl) return

        console.log("[ReadyPlayerMe] Avatar exported:", newAvatarUrl)
        setAvatarUrl(newAvatarUrl)
        const preview = getAvatarPreviewUrl(newAvatarUrl)
        setAvatarPreview(preview)
        localStorage.setItem("readyPlayerMeAvatar", newAvatarUrl)
        localStorage.setItem("readyPlayerMeAvatarPreview", preview)
        window.dispatchEvent(new Event("storage"))

        if (user?.uid) {
          try {
            await saveAvatar(user.uid, newAvatarUrl, preview)
            await refreshProfile()
            toast.success("Avatar saved to your profile")
          } catch (error) {
            console.error("Error saving avatar to Firebase:", error)
            toast.error("Failed to save avatar. Please try again.")
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

  const handleSelectExistingAvatar = async (url: string, previewUrl?: string | null) => {
    if (!user?.uid) {
      toast.error("Please sign in to manage avatars")
      return
    }

    try {
      setAvatarUrl(url)
      const resolvedPreview = previewUrl || getAvatarPreviewUrl(url)
      setAvatarPreview(resolvedPreview)
      localStorage.setItem("readyPlayerMeAvatar", url)
      localStorage.setItem("readyPlayerMeAvatarPreview", resolvedPreview)
      window.dispatchEvent(new Event("storage"))
      await setActiveAvatar(user.uid, url, resolvedPreview)
      await refreshProfile()
      toast.success("Avatar updated")
      setShowAvatarLibrary(false)
    } catch (error) {
      console.error("Error activating avatar:", error)
      toast.error("Unable to update avatar")
    }
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

          <div className="flex flex-col gap-2">
            <Button size="sm" variant="outline" className="gap-2 bg-transparent" onClick={openAvatarCreator}>
              <Settings className="h-3 w-3" />
              {avatarUrl ? "Edit" : "Create"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-2 bg-transparent"
              onClick={() => setShowAvatarLibrary(true)}
            >
              <Layers className="h-3 w-3" />
              Manage
            </Button>
          </div>
        </div>

        {showAvatarCreator && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
            <div className="relative w-full h-full md:w-[90vw] md:h-[85vh] md:max-w-3xl md:rounded-2xl bg-background overflow-hidden shadow-2xl border-0 md:border-4 heatwave-border flex flex-col">
              <button
                className="absolute top-3 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-1 rounded-full bg-black/60 text-white px-3 py-1 text-xs font-semibold shadow-lg"
                onClick={() => setShowAvatarCreator(false)}
              >
                <X className="h-3.5 w-3.5" />
                Close
              </button>

              <iframe
                ref={avatarCreatorRef}
                src={readyPlayerMeUrl}
                className="w-full h-full"
                allow="camera *; microphone *; clipboard-write"
              />
            </div>
          </div>
        )}
      </>
    )
  }

  // Full version for avatar tab
  const xpPercent = Math.min(100, Math.max(0, (xp / maxXp) * 100))

  return (
    <>
      <Card className="p-0 border-0 bg-transparent shadow-none">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-background/90 via-background/70 to-secondary/40 backdrop-blur-xl">
          <div className="absolute inset-0 heatwave-gradient-soft opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.12),transparent)]" />

          <div className="relative grid gap-8 p-6 lg:p-10 lg:grid-cols-2 items-center">
            <div className="order-2 lg:order-1 space-y-6 text-white">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <Badge className="heatwave-gradient border-0 text-white px-4 py-2 font-bold shadow-lg">
                  {tier} Tier
                </Badge>
                <div className="flex flex-wrap gap-2">
                  {onCustomize && (
                    <Button variant="outline" className="bg-white/10 border-white/30 text-white" onClick={onCustomize}>
                      <Settings className="h-4 w-4 mr-2" />
                      Customize
                    </Button>
                  )}
                  <Button variant="outline" className="bg-white/10 border-white/30 text-white" onClick={() => setShowAvatarLibrary(true)}>
                    <Layers className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                  <Button className="heatwave-gradient border-0 text-white" onClick={openAvatarCreator}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {avatarUrl ? "Create Again" : "Create Avatar"}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.4em] text-white/70">Operator Status</p>
                <h2 className="text-3xl sm:text-4xl font-black leading-tight">
                  Engage your avatar to unlock new loan power ups
                </h2>
              </div>

              <div className="bg-black/30 rounded-2xl border border-white/15 p-4 space-y-4 shadow-inner">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-sm font-semibold text-white/80">XP Progress</span>
                  <Badge variant="secondary" className="bg-white/15 text-white font-mono border-white/20">
                    {xp.toLocaleString()}/{maxXp.toLocaleString()}
                  </Badge>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full heatwave-gradient shadow-[0_0_12px_rgba(255,107,53,0.6)]"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>{emote.text}</span>
                  <span>{Math.max(0, maxXp - xp).toLocaleString()} XP until next tier</span>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className={`relative h-[320px] sm:h-[380px] lg:h-[420px] flex items-end justify-center ${getTierGlow()}`}>
                <div className="absolute inset-0 heatwave-gradient blur-3xl opacity-30" />
            {isLoading ? (
              <div className="flex flex-col items-center gap-3 text-white">
                <Loader2 className="h-16 w-16 animate-spin" />
                <p className="text-sm text-white/80">Loading avatar...</p>
              </div>
            ) : avatarUrl ? (
              <model-viewer
                src={`${avatarUrl}?quality=high&textureAtlas=1024`}
                poster={avatarPreview || "/placeholder-avatar.png"}
                camera-controls
                auto-rotate
                disable-zoom
                interaction-prompt="none"
                exposure="1"
                shadow-intensity="0.8"
                camera-target="0m 1.4m 0m"
                camera-orbit="0deg 90deg 2m"
                style={{ width: "100%", height: "100%", background: "transparent" }}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-white">
                <div className="text-9xl">{emote.emoji}</div>
                <p className="text-sm text-white/80">Create your 3D avatar</p>
              </div>
            )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {showAvatarCreator && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="relative w-full h-full md:w-[90vw] md:h-[85vh] md:max-w-3xl md:rounded-2xl bg-background overflow-hidden shadow-2xl border-0 md:border-4 heatwave-border flex flex-col">
            <button
              className="absolute top-4 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-1 rounded-full bg-black/60 text-white px-4 py-1.5 text-sm font-semibold shadow-lg"
              onClick={() => setShowAvatarCreator(false)}
            >
              <X className="h-4 w-4" />
              Close
            </button>

            <iframe
              ref={avatarCreatorRef}
              src={readyPlayerMeUrl}
              className="w-full h-full"
              allow="camera *; microphone *; clipboard-write"
            />
          </div>
        </div>
      )}

      <AvatarLibrary
        open={showAvatarLibrary}
        avatars={avatarHistory}
        activeUrl={avatarUrl}
        onSelect={handleSelectExistingAvatar}
        onClose={() => setShowAvatarLibrary(false)}
        allowCreateCallback={openAvatarCreator}
      />
    </>
  )
}
