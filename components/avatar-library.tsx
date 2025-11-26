"use client"

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
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl h-[80vh] rounded-3xl bg-background border-2 border-border shadow-2xl flex flex-col overflow-hidden">
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
                  } bg-card/80 backdrop-blur-md overflow-hidden text-left`}
                >
                  <div className="aspect-square w-full overflow-hidden bg-secondary">
                    <img
                      src={avatar.previewUrl || getAvatarPreviewUrl(avatar.url)}
                      alt="Saved avatar"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        {avatar.savedAt ? formatDistanceToNow(avatar.savedAt, { addSuffix: true }) : "Recently saved"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{avatar.url}</p>
                    </div>
                    {activeUrl === avatar.url && (
                      <Badge className="heatwave-gradient text-white border-0">Active</Badge>
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
            <Button variant="outline" size="sm" className="gap-2" onClick={allowCreateCallback}>
              <span>Create new avatar</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

