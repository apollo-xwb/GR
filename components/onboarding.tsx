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
  const { user, userProfile, refreshProfile } = useAuth()
  const [step, setStep] = useState(0)
  const [name, setName] = useState(userProfile?.userName || "")
  const [selectedTheme, setSelectedTheme] = useState(userProfile?.theme || "sunset")
  const [showAvatarCreator, setShowAvatarCreator] = useState(false)
  const [avatarCreated, setAvatarCreated] = useState(!!userProfile?.readyPlayerMeAvatar)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userProfile?.readyPlayerMeAvatar || null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const lastCheckedAvatarRef = useRef<string>("")
  
  // Debug: Log state changes
  useEffect(() => {
    console.log("[Onboarding] 🔍 State update - showSuccess:", showSuccess, "avatarUrl:", avatarUrl, "step:", step)
  }, [showSuccess, avatarUrl, step])
  
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
    const handleMessage = async (event: MessageEvent) => {
      // Note: 403 errors from Ready Player Me API are expected in demo mode
      // The avatar is still created and we capture it via message events or localStorage
      
      // Log ALL messages for debugging - including non-object messages
      if (event.origin.includes("readyplayer.me") || event.data?.source) {
        console.log("[Onboarding] 📨 Received message from:", event.origin, {
          data: event.data,
          dataType: typeof event.data,
          source: event.data?.source,
          eventName: event.data?.eventName,
          hasData: !!event.data?.data,
          dataKeys: event.data?.data && typeof event.data.data === 'object' ? Object.keys(event.data.data) : []
        })
      }
      
      // Log ALL messages for debugging (we'll filter later)
      if (event.data && typeof event.data === 'object') {
        // Already logged above, but keep for structure
      }
      
      // Check for Ready Player Me messages - be more lenient with origin checking
      const isReadyPlayerMe = event.origin.includes("readyplayer.me") || 
                              event.data?.source === "readyplayerme" ||
                              event.data?.source === "ready-player-me"
      
      if (isReadyPlayerMe) {
        console.log("[Onboarding] ✅ Ready Player Me message detected!")
        
        if (event.data?.source === "readyplayerme" || event.data?.source === "ready-player-me") {
        // Handle avatar export - this is the main event when avatar is created
        if (event.data.eventName === "v1.avatar.exported") {
          const newAvatarUrl = event.data.data?.url
          console.log("[Onboarding] ✅ Avatar exported event received!")
          console.log("[Onboarding] 📝 Avatar URL:", newAvatarUrl)
          
          if (!newAvatarUrl) {
            console.error("[Onboarding] ❌ No avatar URL in export event:", event.data)
            return
          }
          
          // Save to localStorage for immediate use
          localStorage.setItem("readyPlayerMeAvatar", newAvatarUrl)
          console.log("[Onboarding] 💾 Saved to localStorage")
          
          // Set avatar URL and show success message
          setAvatarUrl(newAvatarUrl)
          setAvatarCreated(true)
          console.log("[Onboarding] 📊 State updated: avatarUrl and avatarCreated set")
          
          // Auto-save to Firebase immediately
          if (user?.uid) {
            console.log("[Onboarding] 🔥 Starting Firebase save process...")
            console.log("[Onboarding] 👤 User UID:", user.uid)
            console.log("[Onboarding] 📝 Avatar URL:", newAvatarUrl)
            
            saveAvatar(user.uid, newAvatarUrl)
              .then(() => {
                console.log("[Onboarding] ✅✅✅ Avatar saved to Firebase successfully! ✅✅✅")
                if (refreshProfile) {
                  refreshProfile().then(() => {
                    console.log("[Onboarding] ✅ Profile refreshed")
                  })
                }
              })
              .catch((error) => {
                console.error("[Onboarding] ❌❌❌ Firebase save error:", error)
              })
          } else {
            console.log("[Onboarding] ⚠️ No user UID - skipping Firebase save")
          }
          
          // Close modal first
          setShowAvatarCreator(false)
          console.log("[Onboarding] 🚪 Modal closed")
          
          // Show save popup after modal closes
          setTimeout(() => {
            console.log("[Onboarding] 🎉 Showing save popup now!")
            console.log("[Onboarding] 📊 Current state - showSuccess will be set to true")
            setShowSuccess(true)
            console.log("[Onboarding] ✅ showSuccess set to true")
          }, 500)
        }
        
        // Also handle other possible event names
        if (event.data.eventName === "v1.avatar.created" || 
            event.data.eventName === "avatar.exported" ||
            (event.data.eventName === "v1.avatar.updated" && event.data.data?.url)) {
          const newAvatarUrl = event.data.data?.url
          if (newAvatarUrl) {
            console.log("[Onboarding] ✅ Avatar created/updated via alternative event:", event.data.eventName)
            console.log("[Onboarding] 📝 Avatar URL:", newAvatarUrl)
            
            localStorage.setItem("readyPlayerMeAvatar", newAvatarUrl)
            setAvatarUrl(newAvatarUrl)
            setAvatarCreated(true)
            setShowAvatarCreator(false)
            
            setTimeout(() => {
              console.log("[Onboarding] 🎉 Showing save popup (alternative event)!")
              setShowSuccess(true)
            }, 500)
          }
        }
        
        // Handle template selection
        if (event.data.eventName === "v1.frame.ready") {
          console.log("Ready Player Me frame is ready")
        }
        
        // Handle any template selection events
        if (event.data.eventName === "v1.avatar.generated" || event.data.eventName === "v1.avatar.updated") {
          console.log("Avatar template/update event:", event.data)
          // Save template selection if available
          if (event.data.data?.url && user?.uid) {
            try {
              await saveAvatar(user.uid, event.data.data.url)
              // Also save template info if available
              if (event.data.data?.templateId || event.data.data?.template) {
                await updateUserPreferences(user.uid, {
                  selectedTemplate: event.data.data.templateId || event.data.data.template,
                })
              }
              console.log("Template selection saved to Firebase")
            } catch (error) {
              console.error("Error saving template to Firebase:", error)
            }
          }
        }
        
        // Handle template selection specifically
        if (event.data.eventName === "v1.avatar.template.selected" || 
            (event.data.eventName === "v1.frame.ready" && event.data.data?.template)) {
          console.log("Template selected:", event.data)
          if (user?.uid && event.data.data?.template) {
            try {
              await updateUserPreferences(user.uid, {
                selectedTemplate: event.data.data.template,
              })
              console.log("Template saved to Firebase")
            } catch (error) {
              console.error("Error saving template to Firebase:", error)
            }
          }
        }
        } // Close the if (event.data?.source === "readyplayerme" || event.data?.source === "ready-player-me") block
      }
    }

    // Listen to ALL messages - we'll filter in the handler
    console.log("[Onboarding] 👂 Setting up message listener for Ready Player Me")
    console.log("[Onboarding] 📊 Current state - showAvatarCreator:", showAvatarCreator)
    window.addEventListener("message", handleMessage)
    
    // Also check localStorage periodically in case message event doesn't fire
    // This is a fallback for when Ready Player Me doesn't send the message event properly
    // Check MORE FREQUENTLY on mobile (every 300ms)
    let checkCount = 0
    console.log("[Onboarding] 🚀 Starting avatar detection interval (every 300ms)")
    const checkLocalStorage = setInterval(async () => {
      if (showAvatarCreator) {
        checkCount++
        // Log more frequently for debugging
        if (checkCount % 5 === 0) { // Log every 5 checks (every 1.5 seconds)
          console.log("[Onboarding] 🔄 Detection check #" + checkCount + " - still looking for avatar...")
          const iframe = document.getElementById('ready-player-me-iframe') as HTMLIFrameElement
          if (iframe) {
            console.log("[Onboarding]   Iframe exists, src:", iframe.src?.substring(0, 100))
          } else {
            console.log("[Onboarding]   ⚠️ Iframe not found!")
          }
        }
        // Check multiple possible localStorage keys
        const savedAvatar = localStorage.getItem("readyPlayerMeAvatar") || 
                          localStorage.getItem("rpm-avatar-url") ||
                          localStorage.getItem("avatarUrl")
        
        // Also check if iframe URL contains an avatar ID (means avatar was created)
        // NOTE: The iframe src attribute doesn't change, but we can try to detect it
        const iframe = document.getElementById('ready-player-me-iframe') as HTMLIFrameElement
        let avatarIdFromUrl = null
        
        // Method 1: Check iframe src attribute (usually doesn't change, but worth checking)
        if (iframe?.src) {
          console.log("[Onboarding] 🔍 Method 1: Checking iframe src:", iframe.src)
          // Try multiple patterns - Ready Player Me uses different URL formats
          const urlMatch = iframe.src.match(/avatar\?id=([^&]+)/) || 
                          iframe.src.match(/avatar.*id=([^&\s]+)/) ||
                          iframe.src.match(/id=([a-f0-9]+)/)
          if (urlMatch) {
            avatarIdFromUrl = urlMatch[1]
            console.log("[Onboarding] ✅✅✅ Method 1: Detected avatar ID in iframe src:", avatarIdFromUrl)
          } else {
            // Log what we're seeing for debugging
            if (checkCount % 5 === 0) {
              console.log("[Onboarding]   No avatar ID pattern found in src. Full URL:", iframe.src)
            }
          }
        }
        
        // Method 2: Try to access iframe content URL (may fail due to CORS)
        if (!avatarIdFromUrl && iframe?.contentWindow) {
          try {
            const iframeUrl = iframe.contentWindow.location.href
            const urlMatch = iframeUrl.match(/avatar\?id=([^&]+)/)
            if (urlMatch) {
              avatarIdFromUrl = urlMatch[1]
              console.log("[Onboarding] 🔍 Method 2: Detected avatar ID in iframe content URL:", avatarIdFromUrl)
            }
          } catch (error) {
            // CORS - can't access iframe content, this is expected
            // console.log("[Onboarding] ⚠️ Cannot access iframe content (CORS):", error)
          }
        }
        
        // Method 3: Check if we can extract from the browser's address bar (if visible)
        // This won't work, but we'll log what we can see
        
        // If we found an avatar ID, process it
        if (avatarIdFromUrl) {
          // Ready Player Me avatar URL format: https://models.readyplayer.me/{avatarId}.glb
          const constructedUrl = `https://models.readyplayer.me/${avatarIdFromUrl}.glb`
          
              // Check if this is a NEW avatar (different from what we've seen)
              if (constructedUrl !== lastCheckedAvatarRef.current && constructedUrl !== (avatarUrl || "")) {
                console.log("[Onboarding] ✅✅✅ NEW AVATAR DETECTED AUTOMATICALLY! ✅✅✅")
                console.log("[Onboarding] 📝 Avatar ID:", avatarIdFromUrl)
                console.log("[Onboarding] 🎨 Constructed avatar URL:", constructedUrl)
                console.log("[Onboarding] 💾 Saving to localStorage...")
                
                // Save to localStorage
                localStorage.setItem("readyPlayerMeAvatar", constructedUrl)
                lastCheckedAvatarRef.current = constructedUrl
                
                console.log("[Onboarding] 📊 Updating state...")
                setAvatarUrl(constructedUrl)
                setAvatarCreated(true)
                
                console.log("[Onboarding] 🚪 Closing avatar creator modal...")
                setShowAvatarCreator(false)
                
                // Auto-save to Firebase immediately
                if (user?.uid) {
                  console.log("[Onboarding] 🔥🔥🔥 Auto-saving to Firebase...")
                  console.log("[Onboarding] 👤 User UID:", user.uid)
                  console.log("[Onboarding] 📝 Avatar URL to save:", constructedUrl)
                  
                  try {
                    await saveAvatar(user.uid, constructedUrl)
                    console.log("[Onboarding] ✅✅✅ Avatar saved to Firebase successfully! ✅✅✅")
                    if (refreshProfile) {
                      await refreshProfile()
                      console.log("[Onboarding] ✅ Profile refreshed")
                    }
                    
                    // Automatically proceed to next step after save
                    setTimeout(() => {
                      console.log("[Onboarding] 🎉🎉🎉 Showing success popup! 🎉🎉🎉")
                      setShowSuccess(true)
                      // Auto-advance after 2 seconds
                      setTimeout(() => {
                        console.log("[Onboarding] ➡️ Auto-advancing to next step...")
                        setShowSuccess(false)
                        setStep(4) // Move to name input step
                      }, 2000)
                    }, 500)
                  } catch (error) {
                    console.error("[Onboarding] ❌❌❌ Error saving to Firebase:", error)
                    // Still show success popup even if save fails
                    setTimeout(() => {
                      setShowSuccess(true)
                    }, 500)
                  }
                } else {
                  console.log("[Onboarding] ⚠️ No user UID - cannot save to Firebase")
                  // Still show success popup
                  setTimeout(() => {
                    setShowSuccess(true)
                  }, 500)
                }
                
                return
              } else {
                console.log("[Onboarding] ℹ️ Avatar ID already processed:", avatarIdFromUrl)
              }
        } else {
          // Log that we're checking but not finding avatar ID
          if (Math.random() < 0.05) { // Log occasionally to avoid spam
            console.log("[Onboarding] 🔍 Checking for avatar ID in iframe... (not found yet)")
            if (iframe?.src) {
              console.log("[Onboarding]   Iframe src:", iframe.src)
            }
          }
        }
        
        // Also check localStorage for saved avatar
        const currentAvatar = avatarUrl || ""
        if (savedAvatar && savedAvatar !== lastCheckedAvatarRef.current && savedAvatar !== currentAvatar) {
          console.log("[Onboarding] ✅✅✅ Found new avatar in localStorage (automatic detection)! ✅✅✅")
          console.log("[Onboarding] 📊 Previous avatar:", lastCheckedAvatarRef.current, "New avatar:", savedAvatar)
          lastCheckedAvatarRef.current = savedAvatar
          setAvatarUrl(savedAvatar)
          setAvatarCreated(true)
          setShowAvatarCreator(false)
          
          // Auto-save to Firebase
          if (user?.uid) {
            console.log("[Onboarding] 🔥🔥🔥 Auto-saving to Firebase from localStorage...")
            console.log("[Onboarding] 👤 User UID:", user.uid)
            console.log("[Onboarding] 📝 Avatar URL:", savedAvatar)
            
            saveAvatar(user.uid, savedAvatar)
              .then(async () => {
                console.log("[Onboarding] ✅✅✅ Avatar saved to Firebase! ✅✅✅")
                if (refreshProfile) {
                  await refreshProfile()
                  console.log("[Onboarding] ✅ Profile refreshed")
                }
                
                // Automatically proceed to next step after save
                setTimeout(() => {
                  console.log("[Onboarding] 🎉🎉🎉 Showing success popup! 🎉🎉🎉")
                  setShowSuccess(true)
                  // Auto-advance after 2 seconds
                  setTimeout(() => {
                    console.log("[Onboarding] ➡️ Auto-advancing to next step...")
                    setShowSuccess(false)
                    setStep(4) // Move to name input step
                  }, 2000)
                }, 500)
              })
              .catch((error) => {
                console.error("[Onboarding] ❌❌❌ Error:", error)
                // Still show success popup
                setTimeout(() => {
                  setShowSuccess(true)
                }, 500)
              })
          } else {
            console.log("[Onboarding] ⚠️ No user UID - cannot save to Firebase")
            setTimeout(() => {
              setShowSuccess(true)
            }, 500)
          }
        }
        
        // Debug: Log all localStorage keys that might contain avatar data
        if (showAvatarCreator && Math.random() < 0.1) { // Log occasionally to avoid spam
          const allKeys = Object.keys(localStorage)
          const avatarKeys = allKeys.filter(key => 
            key.toLowerCase().includes('avatar') || 
            key.toLowerCase().includes('readyplayer') ||
            key.toLowerCase().includes('rpm')
          )
          if (avatarKeys.length > 0) {
            console.log("[Onboarding] 🔍 Found potential avatar keys in localStorage:", avatarKeys)
            avatarKeys.forEach(key => {
              console.log(`[Onboarding]   ${key}:`, localStorage.getItem(key)?.substring(0, 100))
            })
          }
        }
      }
    }, 300) // Check every 300ms when modal is open (faster on mobile)
    
    // Initialize the ref with current avatar URL
    lastCheckedAvatarRef.current = avatarUrl || ""
    
    return () => {
      console.log("[Onboarding] 🧹 Cleaning up message listener")
      window.removeEventListener("message", handleMessage)
      clearInterval(checkLocalStorage)
    }
  }, [user, avatarUrl, showAvatarCreator])

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
                    <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-4 heatwave-border overflow-hidden relative">
                      {avatarUrl ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-secondary/20 to-background">
                          <img
                            src={`${avatarUrl}?scene=fullbody-portrait-v1&quality=high`}
                            alt="Your Avatar"
                            className="w-full h-full object-cover"
                            onLoad={() => console.log("[Onboarding] ✅ Avatar preview loaded successfully")}
                            onError={(e) => {
                              console.error("[Onboarding] ❌ Error loading avatar preview:", e)
                              // Fallback to success message
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="text-center space-y-2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-lg border-2 border-primary/50">
                              <div className="text-3xl animate-bounce">✓</div>
                              <p className="text-lg font-black heatwave-text">Avatar Created!</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-4 p-6">
                          <div className="text-6xl animate-bounce">✓</div>
                          <p className="text-2xl font-black heatwave-text">Avatar Created!</p>
                          <p className="text-sm text-muted-foreground font-medium">Your 3D character is ready</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <Button
                        type="button"
                        size="lg"
                        className="w-full h-14 gap-2 font-bold heatwave-gradient border-0 text-white hover:opacity-90 shadow-xl"
                        onClick={async () => {
                          if (!avatarUrl) {
                            console.error("[Onboarding] No avatar URL to save")
                            return
                          }
                          
                          setSaving(true)
                          setSaveError(null)
                          setSaveSuccess(false)
                          
                          console.log("[Onboarding] 🔄 Starting avatar save process...")
                          console.log("[Onboarding] 📝 Avatar URL:", avatarUrl)
                          console.log("[Onboarding] 👤 User UID:", user?.uid)
                          
                          try {
                            // Save to Firebase if user is authenticated
                            if (user?.uid) {
                              console.log("[Onboarding] 💾 Saving to Firebase...")
                              console.log("[Onboarding] 📍 Collection: users")
                              console.log("[Onboarding] 📍 Document ID:", user.uid)
                              console.log("[Onboarding] 📍 Fields to update: readyPlayerMeAvatar, avatarUrl")
                              
                              await saveAvatar(user.uid, avatarUrl)
                              
                              console.log("[Onboarding] ✅ Avatar saved successfully to Firebase!")
                              console.log("[Onboarding] 📊 Document path: users/" + user.uid)
                              setSaveSuccess(true)
                              
                              // Refresh profile to get updated avatar
                              console.log("[Onboarding] 🔄 Refreshing user profile...")
                              if (refreshProfile) {
                                await refreshProfile()
                                console.log("[Onboarding] ✅ Profile refreshed, avatar should now display in app")
                              }
                              
                              // Show success for 2 seconds, then proceed
                              setTimeout(() => {
                                setShowSuccess(false)
                                setStep(4) // Proceed to next step
                              }, 2000)
                            } else {
                              console.warn("[Onboarding] ⚠️ No user UID, cannot save to Firebase")
                              setSaveError("Not authenticated. Please sign in to save your avatar.")
                            }
                          } catch (error: any) {
                            console.error("[Onboarding] ❌ Error saving avatar to Firebase:", error)
                            console.error("[Onboarding] 📋 Error details:", {
                              code: error.code,
                              message: error.message,
                              stack: error.stack
                            })
                            setSaveError(error.message || "Failed to save avatar. Please try again.")
                          } finally {
                            setSaving(false)
                          }
                        }}
                        disabled={saving || saveSuccess}
                      >
                        {saving ? (
                          <>
                            <Sparkles className="h-5 w-5 animate-spin" />
                            Saving to Firebase...
                          </>
                        ) : saveSuccess ? (
                          <>
                            <Sparkles className="h-5 w-5" />
                            Saved Successfully! ✓
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5" />
                            Save to Firebase & Continue
                          </>
                        )}
                      </Button>
                      
                      {saveError && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                          <p className="text-sm text-destructive font-semibold">{saveError}</p>
                        </div>
                      )}
                      
                      {saveSuccess && (
                        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 animate-in fade-in">
                          <p className="text-sm text-primary font-semibold flex items-center gap-2">
                            <span className="text-lg">✓</span>
                            Avatar saved to Firebase! It will now display throughout the app.
                          </p>
                        </div>
                      )}
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="w-full h-12 font-semibold"
                        onClick={() => {
                          setShowSuccess(false)
                          setShowAvatarCreator(true)
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
                          <p className="text-sm text-muted-foreground">Your 3D character is ready</p>
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

      {/* DONE BUTTON - RENDERED OUTSIDE MODAL SO IT'S ALWAYS VISIBLE - HIGHEST Z-INDEX */}
      {showAvatarCreator && (
        <div 
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2"
          style={{ 
            zIndex: 99999999, // HIGHEST POSSIBLE
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 40px)',
            maxWidth: '500px',
            pointerEvents: 'auto', // Changed to auto so button is clickable
          }}
        >
          <Button
            onClick={async (e) => {
              e.preventDefault()
              e.stopPropagation()
              console.log("[Onboarding] ✅✅✅ DONE BUTTON CLICKED! ✅✅✅")
              console.log("[Onboarding] 🔍 Starting avatar detection...")
              
              const iframe = document.getElementById('ready-player-me-iframe') as HTMLIFrameElement
              let foundAvatar = false
              let avatarUrlToUse = null
              let avatarId = null
              
              // Method 1: Try to extract from iframe src
              if (iframe?.src) {
                console.log("[Onboarding] 🔗 Iframe src:", iframe.src)
                const urlMatch = iframe.src.match(/avatar\?id=([^&]+)/)
                if (urlMatch) {
                  avatarId = urlMatch[1]
                  avatarUrlToUse = `https://models.readyplayer.me/${avatarId}.glb`
                  foundAvatar = true
                  console.log("[Onboarding] 🎨 Method 1: Found avatar ID in src:", avatarId)
                }
              }
              
              // Method 2: Try to access iframe content (may fail due to CORS)
              if (!foundAvatar && iframe?.contentWindow) {
                try {
                  const iframeUrl = iframe.contentWindow.location.href
                  console.log("[Onboarding] 🔗 Iframe content URL:", iframeUrl)
                  const urlMatch = iframeUrl.match(/avatar\?id=([^&]+)/)
                  if (urlMatch) {
                    avatarId = urlMatch[1]
                    avatarUrlToUse = `https://models.readyplayer.me/${avatarId}.glb`
                    foundAvatar = true
                    console.log("[Onboarding] 🎨 Method 2: Found avatar ID in content URL:", avatarId)
                  }
                } catch (error) {
                  console.log("[Onboarding] ⚠️ Cannot access iframe content (CORS):", error)
                }
              }
              
              // Method 3: Check localStorage
              if (!foundAvatar) {
                console.log("[Onboarding] 🔍 Method 3: Checking localStorage...")
                const allKeys = Object.keys(localStorage)
                console.log("[Onboarding] 📋 All localStorage keys:", allKeys)
                
                for (const key of allKeys) {
                  if (key.toLowerCase().includes('avatar') || key.toLowerCase().includes('rpm')) {
                    const value = localStorage.getItem(key)
                    console.log(`[Onboarding]   Checking key "${key}":`, value?.substring(0, 100))
                    if (value && value.startsWith('http')) {
                      avatarUrlToUse = value
                      foundAvatar = true
                      console.log("[Onboarding] 🎨 Method 3: Found avatar URL in localStorage:", key)
                      break
                    }
                  }
                }
              }
              
              // Method 4: If still not found, prompt user to enter avatar ID from console
              // The console URL shows: demo.readyplayer.me/avatar?id=692627f8786317131c4f82f9
              if (!foundAvatar) {
                console.log("[Onboarding] ⚠️ Avatar not automatically detected")
                console.log("[Onboarding] 💡 Check the browser console - you should see a URL like:")
                console.log("[Onboarding]    demo.readyplayer.me/avatar?id=XXXXX")
                console.log("[Onboarding] 💡 Copy the ID (the part after 'id=') and paste it below")
                
                // On mobile, just use placeholder. On desktop, try to prompt
                const isMobile = window.innerWidth < 768
                if (!isMobile) {
                  const avatarIdInput = prompt(
                    "Avatar ID not automatically detected.\n\n" +
                    "Please check the browser console - you should see a URL like:\n" +
                    "demo.readyplayer.me/avatar?id=XXXXX\n\n" +
                    "Copy the ID (the part after 'id=') and paste it here:\n\n" +
                    "Or click Cancel to use a placeholder."
                  )
                  
                  if (avatarIdInput && avatarIdInput.trim()) {
                    const cleanId = avatarIdInput.trim()
                    avatarUrlToUse = `https://models.readyplayer.me/${cleanId}.glb`
                    foundAvatar = true
                    console.log("[Onboarding] 🎨 Using user-provided avatar ID:", cleanId)
                  } else {
                    avatarUrlToUse = `https://models.readyplayer.me/placeholder-${Date.now()}.glb`
                    foundAvatar = true
                    console.log("[Onboarding] 💡 Using placeholder - you can update it later")
                  }
                } else {
                  // On mobile, just use placeholder
                  avatarUrlToUse = `https://models.readyplayer.me/placeholder-${Date.now()}.glb`
                  foundAvatar = true
                  console.log("[Onboarding] 💡 Mobile: Using placeholder - you can update it later")
                }
              }
              
              if (foundAvatar && avatarUrlToUse) {
                console.log("[Onboarding] 💾 Saving avatar URL:", avatarUrlToUse)
                localStorage.setItem("readyPlayerMeAvatar", avatarUrlToUse)
                setAvatarUrl(avatarUrlToUse)
                setAvatarCreated(true)
                setShowAvatarCreator(false)
                
                if (user?.uid) {
                  console.log("[Onboarding] 🔥🔥🔥 Saving to Firebase...")
                  console.log("[Onboarding] 👤 User UID:", user.uid)
                  console.log("[Onboarding] 📝 Avatar URL:", avatarUrlToUse)
                  
                  try {
                    await saveAvatar(user.uid, avatarUrlToUse)
                    console.log("[Onboarding] ✅✅✅ Avatar saved to Firebase! ✅✅✅")
                    if (refreshProfile) {
                      await refreshProfile()
                      console.log("[Onboarding] ✅ Profile refreshed")
                    }
                  } catch (error) {
                    console.error("[Onboarding] ❌❌❌ Firebase save error:", error)
                  }
                } else {
                  console.log("[Onboarding] ⚠️ No user UID - cannot save to Firebase")
                }
                
                setTimeout(() => {
                  console.log("[Onboarding] 🎉🎉🎉 Showing success popup! 🎉🎉🎉")
                  setShowSuccess(true)
                }, 500)
              }
            }}
            className="pointer-events-auto bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white font-black shadow-2xl px-8 py-6 rounded-full text-xl w-full border-4 border-white/50 animate-pulse"
            style={{
              pointerEvents: 'auto',
              cursor: 'pointer',
              zIndex: 99999999,
            }}
            style={{ 
              zIndex: 10000000,
              boxShadow: '0 25px 70px rgba(0,0,0,1), 0 0 50px rgba(255,165,0,1), inset 0 2px 15px rgba(255,255,255,0.4)',
              fontSize: '20px',
              fontWeight: '900',
              letterSpacing: '1px',
            }}
          >
            ✓✓✓ TAP HERE - I'M DONE CREATING AVATAR ✓✓✓
          </Button>
        </div>
      )}

      {showAvatarCreator && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm"
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
            touchAction: 'none',
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
            className="relative bg-background overflow-visible shadow-2xl flex flex-col h-full w-full md:h-[85vh] md:w-[90vw] md:max-w-4xl md:rounded-2xl md:m-auto md:border-4 heatwave-border"
            style={{
              height: '100%',
              width: '100%',
              maxWidth: '100vw',
              maxHeight: '100vh',
              overflow: 'visible', // Changed to visible so button can be seen
              touchAction: 'none',
            }}
          >
            {/* Close button - Very high z-index to be above iframe */}
            <div 
              className="absolute top-2 right-2 sm:top-3 sm:right-3 pointer-events-none"
              style={{ zIndex: 999999 }}
            >
              <Button
                size="sm"
                variant="ghost"
                className="bg-background/95 backdrop-blur-sm font-bold shadow-2xl pointer-events-auto flex items-center justify-center gap-1 sm:gap-2 h-9 w-9 sm:h-10 sm:w-auto sm:px-3 rounded-full sm:rounded-lg hover:bg-background border-2 border-border/50"
                style={{ zIndex: 1000000, position: 'relative' }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log("[Onboarding] 🚪 Close button clicked")
                  setShowAvatarCreator(false)
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline text-xs font-bold">Close</span>
              </Button>
            </div>

            {/* Iframe container - takes full remaining space, no scrolling */}
            <div 
              className="flex-1 relative w-full h-full overflow-hidden"
              style={{
                flex: '1 1 auto',
                minHeight: 0,
                width: '100%',
                height: '100%',
                maxWidth: '100vw',
                maxHeight: '100vh',
                overflow: 'hidden',
                touchAction: 'none',
                zIndex: 1, // Lower than close button and done button
              }}
            >
              <iframe
                id="ready-player-me-iframe"
                src={`https://demo.readyplayer.me/avatar?frameApi&clearCache`}
                className="border-0 w-full h-full"
                allow="camera *; microphone *"
                title="Ready Player Me Avatar Creator"
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
                  maxWidth: '100vw',
                  maxHeight: '100vh',
                  overflow: 'hidden',
                  zIndex: 1, // Lower than buttons
                  pointerEvents: 'auto', // Allow iframe to receive events
                }}
                onLoad={() => {
                  console.log("[Onboarding] 📦 Iframe loaded")
                  
                  // Set up a MutationObserver to watch for URL changes in the iframe
                  // This will detect when Ready Player Me navigates to the final screen
                  const iframe = document.getElementById('ready-player-me-iframe') as HTMLIFrameElement
                  
                  // Check URL periodically to catch when avatar is created
                  const urlCheckInterval = setInterval(() => {
                    if (iframe?.src) {
                      const urlMatch = iframe.src.match(/avatar\?id=([^&]+)/)
                      if (urlMatch) {
                        const avatarId = urlMatch[1]
                        const constructedUrl = `https://models.readyplayer.me/${avatarId}.glb`
                        
                        // Only trigger if this is a new avatar
                        if (constructedUrl !== lastCheckedAvatarRef.current && constructedUrl !== (avatarUrl || "")) {
                          console.log("[Onboarding] 🎯 AVATAR CREATION DETECTED via iframe URL!")
                          console.log("[Onboarding] 📝 Avatar ID:", avatarId)
                          console.log("[Onboarding] 🎨 Avatar URL:", constructedUrl)
                          
                          clearInterval(urlCheckInterval) // Stop checking
                          
                          // Save and proceed
                          localStorage.setItem("readyPlayerMeAvatar", constructedUrl)
                          lastCheckedAvatarRef.current = constructedUrl
                          setAvatarUrl(constructedUrl)
                          setAvatarCreated(true)
                          setShowAvatarCreator(false)
                          
                          // Auto-save to Firebase
                          if (user?.uid) {
                            console.log("[Onboarding] 🔥 Saving to Firebase...")
                            saveAvatar(user.uid, constructedUrl)
                              .then(() => {
                                console.log("[Onboarding] ✅ Firebase save complete!")
                                if (refreshProfile) refreshProfile()
                              })
                              .catch((error) => {
                                console.error("[Onboarding] ❌ Firebase error:", error)
                              })
                          }
                          
                          setTimeout(() => {
                            console.log("[Onboarding] 🎉 Showing success popup!")
                            setShowSuccess(true)
                          }, 500)
                        }
                      }
                    }
                  }, 500) // Check every 500ms
                  
                  // Clean up interval when modal closes
                  return () => {
                    clearInterval(urlCheckInterval)
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
