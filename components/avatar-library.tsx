"use client"

import { useEffect, useMemo, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { AvatarRecord } from "@/lib/firebase/users"
import { getAvatarPreviewUrl } from "@/lib/firebase/users"

interface AvatarLibraryProps {
  open: boolean
  avatars: AvatarRecord[]
  activeUrl?: string | null
  onSelect: (url: string, previewUrl?: string | null) => void
  onClose: () => void
  allowCreateCallback?: () => void
}

export function AvatarLibrary({
  open,
  avatars,
  activeUrl,
  onSelect,
  onClose,
  allowCreateCallback,
}: AvatarLibraryProps) {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [themeId, setThemeId] = useState("sunset")

  useEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    const update = () => {
      setIsDarkMode(root.classList.contains("dark"))
      const themeClass = Array.from(root.classList).find((cls) => cls.startsWith("theme-"))
      if (themeClass) {
        setThemeId(themeClass.replace("theme-", ""))
      }
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  const panelGradient = useMemo(() => {
    if (isDarkMode) {
      switch (themeId) {
        case "ocean":
          return "linear-gradient(135deg, #020617 0%, #0ea5e9 35%, #22c1c3 100%)"
        case "aurora":
          return "linear-gradient(135deg, #020617 0%, #8b5cf6 35%, #ec4899 100%)"
        case "forest":
          return "linear-gradient(135deg, #020617 0%, #22c55e 35%, #16a34a 100%)"
        case "neon":
          return "linear-gradient(135deg, #020617 0%, #ec4899 35%, #a855f7 100%)"
        case "sunset":
        default:
          return "linear-gradient(135deg, #020617 0%, #f97316 40%, #facc15 100%)"
      }
    } else {
      switch (themeId) {
        case "ocean":
          return "linear-gradient(135deg, #e0f2fe 0%, #38bdf8 40%, #0f172a 100%)"
        case "aurora":
          return "linear-gradient(135deg, #f5f3ff 0%, #a855f7 40%, #4c1d95 100%)"
        case "forest":
          return "linear-gradient(135deg, #dcfce7 0%, #22c55e 40%, #064e3b 100%)"
        case "neon":
          return "linear-gradient(135deg, #fdf2ff 0%, #ec4899 40%, #1f2937 100%)"
        case "sunset":
        default:
          return "linear-gradient(135deg, #fff7ed 0%, #fb923c 40%, #7c2d12 100%)"
      }
    }
  }, [isDarkMode, themeId])

  const tileGradient = useMemo(() => {
    if (isDarkMode) {
      switch (themeId) {
        case "ocean":
          return "linear-gradient(145deg, #0f172a 0%, #0ea5e9 45%, #22c1c3 90%)"
        case "aurora":
          return "linear-gradient(145deg, #020617 0%, #8b5cf6 45%, #ec4899 95%)"
        case "forest":
          return "linear-gradient(145deg, #022c22 0%, #22c55e 45%, #bbf7d0 95%)"
        case "neon":
          return "linear-gradient(145deg, #111827 0%, #ec4899 45%, #a855f7 95%)"
        case "sunset":
        default:
          return "linear-gradient(145deg, #111827 0%, #f97316 45%, #facc15 95%)"
      }
    } else {
      switch (themeId) {
        case "ocean":
          return "linear-gradient(145deg, #e0f2fe 0%, #38bdf8 45%, #0f172a 95%)"
        case "aurora":
          return "linear-gradient(145deg, #ede9fe 0%, #a855f7 45%, #1e293b 95%)"
        case "forest":
          return "linear-gradient(145deg, #dcfce7 0%, #22c55e 45%, #052e16 95%)"
        case "neon":
          return "linear-gradient(145deg, #fdf2ff 0%, #ec4899 45%, #020617 95%)"
        case "sunset":
        default:
          return "linear-gradient(145deg, #fff7ed 0%, #fb923c 45%, #111827 95%)"
      }
    }
  }, [isDarkMode, themeId])
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl h-[80vh] rounded-3xl border-2 border-border shadow-2xl flex flex-col overflow-hidden bg-background dark:bg-black">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border/60">
          <div>
            <h3 className="text-lg font-bold">Avatar Library</h3>
            <p className="text-sm text-muted-foreground">
              Switch between your saved Ready Player Me avatars or create a new one.
            </p>
          </div>
          <Button size="sm" variant="ghost" className="gap-1" onClick={onClose}>
            <X className="h-4 w-4" />
            Close
          </Button>
        </div>

        {avatars.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
            <p className="text-muted-foreground text-sm">
              You haven't saved any avatars yet. Create one to see it listed here.
            </p>
            {allowCreateCallback && (
              <Button onClick={allowCreateCallback} className="heatwave-gradient text-white border-0 shadow-lg">
                Create Avatar
              </Button>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {avatars.map((avatar) => (
                <button
                  key={`${avatar.url}-${avatar.savedAt.toString()}`}
                  onClick={() => onSelect(avatar.url, avatar.previewUrl)}
                  className={`group relative rounded-2xl border ${
                    activeUrl === avatar.url ? "border-primary shadow-xl" : "border-border hover:border-primary"
                  } bg-background/90 dark:bg-black/90 backdrop-blur-md overflow-hidden text-left`}
                >
                  <div
                    className="aspect-square w-full overflow-hidden relative"
                    style={{ background: tileGradient }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
                    <model-viewer
                      src={`${avatar.url}?quality=medium`}
                      poster={avatar.previewUrl || getAvatarPreviewUrl(avatar.url)}
                      camera-controls
                      auto-rotate
                      interaction-prompt="none"
                      disable-zoom
                      shadow-intensity="0.8"
                      exposure="1"
                      animation-name="Idle"
                      autoplay
                      camera-target="0m 0.95m 0m"
                      camera-orbit="0deg 78deg 3.8m"
                      field-of-view="26deg"
                      auto-rotate-delay="6000"
                      auto-rotate-speed="0.18deg/s"
                      style={{ width: "100%", height: "100%", background: "transparent" }}
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {avatar.savedAt ? formatDistanceToNow(avatar.savedAt, { addSuffix: true }) : "Recently saved"}
                      </p>
                      {avatar.previewUrl && (
                        <p className="text-xs text-muted-foreground truncate">{new URL(avatar.url).hostname}</p>
                      )}
                    </div>
                    {activeUrl === avatar.url && (
                      <Badge className="heatwave-gradient text-white border-0 whitespace-nowrap px-3">Active</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6 border-t border-border/60 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-muted-foreground">
            Avatars are synced with Ready Player Me. Selecting one will immediately update your experience.
          </p>
          {allowCreateCallback && (
            <Button
              size="sm"
              className="gap-2 heatwave-gradient text-white border-0 shadow-lg"
              onClick={allowCreateCallback}
            >
              <span>Create new avatar</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

