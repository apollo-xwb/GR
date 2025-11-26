"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, Rocket, Shield, Trophy, Sparkles, ArrowRight, Wallet, Target, TrendingUp, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { saveAvatar, updateUserPreferences, updateUserStats } from "@/lib/firebase/users"

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { user, userProfile } = useAuth()
  const [step, setStep] = useState(0)
  const [name, setName] = useState(userProfile?.userName || "")
  const [selectedTheme, setSelectedTheme] = useState(userProfile?.theme || "sunset")
  const [showAvatarCreator, setShowAvatarCreator] = useState(false)
  const [avatarCreated, setAvatarCreated] = useState(!!userProfile?.readyPlayerMeAvatar)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userProfile?.readyPlayerMeAvatar || null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [avatarPersisted, setAvatarPersisted] = useState(!!userProfile?.readyPlayerMeAvatar)
  const avatarCreatorRef = useRef<HTMLIFrameElement | null>(null)
  const readyPlayerMeSubdomain = process.env.NEXT_PUBLIC_READY_PLAYER_ME_SUBDOMAIN || "demo"
  const readyPlayerMeUrl = `https://${readyPlayerMeSubdomain}.readyplayer.me/avatar?frameApi=1&clearCache=1&bodyType=fullbody`
  
  // Handle body scroll lock when modal is open
  useEffect(() => {
    if (showAvatarCreator) {
      // Lock body scroll
      document.body.classList.add('modal-open')
      
      return () => {
        // Restore body scroll
        document.body.classList.remove('modal-open')
      }
    }
  }, [showAvatarCreator])

  const themes = [
    { id: "sunset", name: "Sunset", colors: ["#FF6B35", "#F7931E", "#E94823"] },
    { id: "ocean", name: "Ocean", colors: ["#00D9FF", "#00A8CC", "#0891B2"] },
    { id: "aurora", name: "Aurora", colors: ["#A78BFA", "#8B5CF6", "#7C3AED"] },
    { id: "forest", name: "Forest", colors: ["#34D399", "#10B981", "#059669"] },
    { id: "neon", name: "Neon", colors: ["#F472B6", "#EC4899", "#DB2777"] },
  ]

  const features = [
    {
      icon: Zap,
      title: "72-Hour Cycles",
      description: "Fast, short-term loans with quick turnaround times",
    },
    {
      icon: Trophy,
      title: "Earn XP, Level Up",
      description: "Build your credit score through gamified progression",
    },
    {
      icon: Shield,
      title: "Blockchain Secured",
      description: "Transparent, immutable records on the blockchain",
    },
    {
      icon: Sparkles,
      title: "Unlock Rewards",
      description: "Progress through tiers for better rates and cashback",
    },
  ]

  useEffect(() => {
    if (!showAvatarCreator) return

    let subscribed = false

    const isReadyPlayerMeEvent = (event: MessageEvent) =>
      typeof event.origin === "string" && event.origin.includes(".readyplayer.me")

    const subscribeToEvents = () => {
      if (!avatarCreatorRef.current?.contentWindow) return
      ;[
        "v1.avatar.exported",
        "v1.avatar.generated",
        "v1.avatar.updated",
        "v1.avatar.template.selected",
      ].forEach((eventName) => {
        avatarCreatorRef.current?.contentWindow?.postMessage(
          {
            target: "readyplayerme",
            type: "subscribe",
            eventName,
          },
          "*",
        )
      })
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

      if (data.eventName === "v1.frame.ready" && !subscribed) {
        subscribed = true
        subscribeToEvents()
        return
      }

      if (data.eventName === "v1.avatar.exported") {
        const newAvatarUrl = data.data?.url
        if (!newAvatarUrl) return

        console.log("[ReadyPlayerMe] Avatar exported:", newAvatarUrl)
        localStorage.setItem("readyPlayerMeAvatar", newAvatarUrl)
        window.dispatchEvent(new Event("storage"))

        setAvatarUrl(newAvatarUrl)
        setAvatarCreated(true)
        setShowAvatarCreator(false)
        setShowSuccess(true)

        if (user?.uid) {
          setSaving(true)
          try {
            await saveAvatar(user.uid, newAvatarUrl)
            setAvatarPersisted(true)
          } catch (error) {
            console.error("Error saving avatar to Firebase:", error)
          } finally {
            setSaving(false)
          }
        }

        return
      }

      if (data.eventName === "v1.avatar.generated" || data.eventName === "v1.avatar.updated") {
        if (data.data?.url && user?.uid) {
          try {
            await saveAvatar(user.uid, data.data.url)
            if (data.data?.templateId || data.data?.template) {
              await updateUserPreferences(user.uid, {
                selectedTemplate: data.data.templateId || data.data.template,
              })
            }
          } catch (error) {
            console.error("Error saving template to Firebase:", error)
          }
        }
      }

      if (
        data.eventName === "v1.avatar.template.selected" ||
        (data.eventName === "v1.frame.ready" && data.data?.template)
      ) {
        if (user?.uid && data.data?.template) {
          try {
            await updateUserPreferences(user.uid, {
              selectedTemplate: data.data.template,
            })
          } catch (error) {
            console.error("Error saving template to Firebase:", error)
          }
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [showAvatarCreator, user?.uid])

  const applyTheme = async (themeId: string) => {
    setSelectedTheme(themeId)
    const savedMode = localStorage.getItem("darkMode")
    const isDark = savedMode === null ? true : savedMode === "true"
    document.documentElement.className = `theme-${themeId} ${isDark ? "dark" : ""}`
    
    // Save to Firebase if user is authenticated
    if (user?.uid) {
      try {
        await updateUserPreferences(user.uid, { theme: themeId })
      } catch (error) {
        console.error("Error saving theme to Firebase:", error)
      }
    }
  }

  const handleComplete = async () => {
    localStorage.setItem("onboardingComplete", "true")
    localStorage.setItem("userName", name)
    localStorage.setItem("theme", selectedTheme)
    
    // Save to Firebase if user is authenticated
    if (user?.uid) {
      try {
        await updateUserPreferences(user.uid, {
          userName: name,
          theme: selectedTheme,
        })
      } catch (error) {
        console.error("Error saving onboarding data to Firebase:", error)
      }
    }
    
    onComplete()
  }

  return (
    <div className="min-h-screen wavy-gradient-bg relative overflow-hidden onboarding">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 wavy-animated opacity-40" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-lg">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="space-y-4">
                <div className="inline-block p-6 rounded-3xl heatwave-gradient shadow-2xl animate-in zoom-in duration-500">
                  <Rocket className="h-16 w-16 text-white" />
                </div>
                <h1 className="text-6xl font-black tracking-tight">
                  <span className="heatwave-text">G Rescue</span>
                </h1>
                <p className="text-xl text-muted-foreground font-semibold">The future of lending is here</p>
              </div>

              <Card className="p-8 bg-card/80 backdrop-blur-xl border-2 shadow-2xl">
                <p className="text-lg mb-6 leading-relaxed font-medium">
                  Welcome to the world's first gamified lending platform. Earn XP, unlock tiers, and revolutionize how
                  you access short-term loans.
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center">
                    <div className="text-3xl font-black heatwave-text mb-1">72hr</div>
                    <div className="text-xs text-muted-foreground font-semibold">Fast Cycles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black heatwave-text mb-1">5</div>
                    <div className="text-xs text-muted-foreground font-semibold">Tiers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black heatwave-text mb-1">20%</div>
                    <div className="text-xs text-muted-foreground font-semibold">Cashback</div>
                  </div>
                </div>
                <Button
                  onClick={() => setStep(1)}
                  size="lg"
                  className="w-full h-14 text-lg font-bold heatwave-gradient border-0 text-white hover:opacity-90 transition-all shadow-xl"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Card>

              <p className="text-sm text-muted-foreground font-medium">
                Industry-shattering. Metaverse-ready. Blockchain-powered.
              </p>
            </div>
          )}

          {/* Step 1: Features */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
              <div className="text-center mb-8">
                <Badge className="heatwave-gradient border-0 text-white px-4 py-2 text-sm font-bold mb-4">
                  How It Works
                </Badge>
                <h2 className="text-4xl font-black mb-3">Level Up Your Lending</h2>
                <p className="text-muted-foreground text-lg font-medium">Experience finance like never before</p>
              </div>

              <div className="space-y-4">
                {features.map((feature, i) => {
                  const Icon = feature.icon
                  return (
                    <Card
                      key={i}
                      className="p-6 bg-card/80 backdrop-blur-xl border-2 hover:border-primary transition-all hover:scale-105 shadow-xl"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl heatwave-gradient shadow-lg flex-shrink-0">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-black text-lg mb-1">{feature.title}</h3>
                          <p className="text-muted-foreground font-medium">{feature.description}</p>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>

              <Button
                onClick={() => setStep(2)}
                size="lg"
                className="w-full h-14 text-lg font-bold heatwave-gradient border-0 text-white hover:opacity-90 transition-all shadow-xl"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Step 2: Theme Selection */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
              <div className="text-center mb-8">
                <Badge className="heatwave-gradient border-0 text-white px-4 py-2 text-sm font-bold mb-4">
                  Choose Your Style
                </Badge>
                <h2 className="text-4xl font-black mb-3">Pick Your Vibe</h2>
                <p className="text-muted-foreground text-lg font-medium">Fluid branding - never locked to one color</p>
              </div>

              <Card className="p-8 bg-card/80 backdrop-blur-xl border-2 shadow-2xl">
                <div className="grid grid-cols-5 gap-4 mb-8">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => applyTheme(theme.id)}
                      className={`aspect-square rounded-2xl overflow-hidden border-4 transition-all hover:scale-110 ${
                        selectedTheme === theme.id
                          ? "border-white scale-110 shadow-2xl"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors[0]} 0%, ${theme.colors[1]} 50%, ${theme.colors[2]} 100%)`,
                        }}
                        className="w-full h-full relative"
                      >
                        {selectedTheme === theme.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="h-6 w-6 rounded-full bg-white shadow-xl" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground mb-6 font-medium">
                  Selected:{" "}
                  <span className="font-bold heatwave-text">{themes.find((t) => t.id === selectedTheme)?.name}</span>
                </p>
              </Card>

              <Button
                onClick={() => setStep(3)}
                size="lg"
                className="w-full h-14 text-lg font-bold heatwave-gradient border-0 text-white hover:opacity-90 transition-all shadow-xl"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Step 3: Avatar Creation */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
              <div className="text-center mb-8">
                <Badge className="heatwave-gradient border-0 text-white px-4 py-2 text-sm font-bold mb-4">
                  Create Your Avatar
                </Badge>
                <h2 className="text-4xl font-black mb-3">Design Your 3D Character</h2>
                <p className="text-muted-foreground text-lg font-medium">
                  Your avatar reflects your progress in the game
                </p>
              </div>

              <Card className="p-8 bg-card/80 backdrop-blur-xl border-2 shadow-2xl space-y-6">
                {showSuccess ? (
                  // Success state with save button
                  <div className="space-y-6">
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-4 heatwave-border overflow-hidden">
                      <div className="text-center space-y-4 p-6">
                        <div className="text-6xl animate-bounce">✓</div>
                        <p className="text-2xl font-black heatwave-text">Avatar Created!</p>
                        <p className="text-sm text-muted-foreground font-medium">
                          {avatarPersisted ? "Saved to your profile" : "Your 3D character is ready"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <Button
                        type="button"
                        size="lg"
                        className="w-full h-14 gap-2 font-bold heatwave-gradient border-0 text-white hover:opacity-90 shadow-xl"
                        onClick={async () => {
                          if (!avatarUrl) return

                          if (avatarPersisted) {
                            setShowSuccess(false)
                            setStep(4)
                            return
                          }

                          setSaving(true)
                          try {
                            if (user?.uid) {
                              await saveAvatar(user.uid, avatarUrl)
                              setAvatarPersisted(true)
                            }
                            setShowSuccess(false)
                            setStep(4)
                          } catch (error) {
                            console.error("Error saving avatar to Firebase:", error)
                            setShowSuccess(false)
                            setStep(4)
                          } finally {
                            setSaving(false)
                          }
                        }}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Sparkles className="h-5 w-5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5" />
                            {avatarPersisted ? "Continue" : "Save & Continue"}
                          </>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full h-12 font-semibold"
                        onClick={() => {
                          setShowSuccess(false)
                          setShowAvatarCreator(true)
                          setAvatarPersisted(false)
                        }}
                        disabled={saving}
                      >
                        Create Another
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Default state
                  <>
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center border-4 heatwave-border overflow-hidden">
                      {avatarCreated && avatarUrl ? (
                        <div className="text-center space-y-4 p-6">
                          <div className="text-6xl">✓</div>
                          <p className="text-lg font-bold heatwave-text">Avatar Created!</p>
                          <p className="text-sm text-muted-foreground">
                            {avatarPersisted ? "Saved to your profile" : "Your 3D character is ready"}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center space-y-4 p-6">
                          <Sparkles className="h-16 w-16 heatwave-text mx-auto" />
                          <p className="text-lg font-bold">No Avatar Yet</p>
                          <p className="text-sm text-muted-foreground">Create your 3D character with Ready Player Me</p>
                        </div>
                      )}
                    </div>

                    <Button
                      type="button"
                      size="lg"
                      className="w-full h-14 gap-2 font-bold heatwave-gradient border-0 text-white hover:opacity-90"
                      onClick={() => setShowAvatarCreator(true)}
                      disabled={avatarCreated && !showSuccess}
                    >
                      <Sparkles className="h-5 w-5" />
                      {avatarCreated ? "Avatar Created ✓" : "Create 3D Avatar"}
                    </Button>
                  </>
                )}

                {!showSuccess && (
                  <div className="p-4 rounded-xl bg-secondary/50 border-2">
                    <p className="text-xs text-muted-foreground text-center font-medium">
                      Your avatar will react with different emotes based on your loan activity and progress!
                    </p>
                  </div>
                )}
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 font-bold bg-transparent"
                  onClick={() => setStep(4)}
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={!avatarCreated}
                  size="lg"
                  className="flex-1 h-14 text-lg font-bold heatwave-gradient border-0 text-white hover:opacity-90 transition-all shadow-xl disabled:opacity-50"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Name Input */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
              <div className="text-center mb-8">
                <Badge className="heatwave-gradient border-0 text-white px-4 py-2 text-sm font-bold mb-4">
                  Final Step
                </Badge>
                <h2 className="text-4xl font-black mb-3">What's Your Name?</h2>
                <p className="text-muted-foreground text-lg font-medium">Let's personalize your experience</p>
              </div>

              <Card className="p-8 bg-card/80 backdrop-blur-xl border-2 shadow-2xl space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-base font-bold">
                    Player Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-14 text-lg font-semibold border-2"
                  />
                </div>

                <div className="p-6 rounded-2xl bg-secondary/50 border-2 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg heatwave-gradient">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-bold text-sm">You'll start as Bronze Tier</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg heatwave-gradient">
                      <Wallet className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-bold text-sm">Initial loan limit: R500</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg heatwave-gradient">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <p className="font-bold text-sm">Earn XP with every successful loan</p>
                  </div>
                </div>
              </Card>

              <Button
                onClick={handleComplete}
                disabled={!name.trim()}
                size="lg"
                className="w-full h-14 text-lg font-bold heatwave-gradient border-0 text-white hover:opacity-90 transition-all shadow-xl disabled:opacity-50"
              >
                Launch Into G Rescue
                <Rocket className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${i === step ? "w-8 heatwave-gradient" : "w-2 bg-muted"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {showAvatarCreator && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            maxWidth: '100vw',
            maxHeight: '100vh',
            overflow: 'hidden',
          }}
          onClick={(e) => {
            // Close on backdrop click (but not on iframe)
            if (e.target === e.currentTarget) {
              setShowAvatarCreator(false)
            }
          }}
        >
          {/* Mobile: Full screen, Desktop: Centered modal */}
          <div 
            className="relative bg-background overflow-hidden shadow-2xl flex flex-col h-full w-full md:h-[85vh] md:w-[90vw] md:max-w-4xl md:rounded-2xl md:m-auto md:border-4 heatwave-border"
            style={{
              height: '100%',
              width: '100%',
            }}
          >
            {/* Close button */}
            <div className="absolute top-0 left-0 right-0 z-20 p-2 sm:p-3 md:p-4 bg-gradient-to-b from-background via-background/95 to-transparent pointer-events-none">
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto bg-background/95 backdrop-blur-sm font-bold shadow-lg pointer-events-auto flex items-center gap-2"
                onClick={() => setShowAvatarCreator(false)}
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Close</span>
              </Button>
            </div>

            {/* Iframe container - takes full remaining space */}
            <div 
              className="flex-1 relative w-full h-full"
              style={{
                flex: '1 1 auto',
                minHeight: 0,
                width: '100%',
                height: '100%',
              }}
            >
              <iframe
                ref={avatarCreatorRef}
                src={readyPlayerMeUrl}
                className="border-0 w-full h-full"
                allow="camera *; microphone *"
                style={{ 
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
