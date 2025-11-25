"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { initializeCollections, getRequiredIndexes } from "@/lib/firebase/init-collections"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function InitPage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  // Debug: Log user state
  console.log("InitPage - User:", user, "Loading:", authLoading)

  const handleInit = async () => {
    console.log("Init button clicked - User:", user, "UID:", user?.uid)
    
    if (authLoading) {
      setResult({ success: false, message: "Please wait, checking authentication..." })
      return
    }
    
    if (!user?.uid) {
      setResult({ success: false, message: "Please sign in first. You need to be authenticated to initialize collections." })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      console.log("Calling initializeCollections with userId:", user.uid)
      const response = await initializeCollections(user.uid)
      console.log("Initialize response:", response)
      
      if (response.success) {
        setResult({
          success: true,
          message: "Collections initialized successfully! Check console for details.",
        })
      } else {
        setResult({
          success: false,
          message: response.error || "Failed to initialize collections",
        })
      }
    } catch (error: any) {
      console.error("Init error:", error)
      setResult({
        success: false,
        message: error.message || "An error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  const indexes = getRequiredIndexes()

  return (
    <div className="min-h-screen wavy-gradient-bg p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl p-8 bg-card/80 backdrop-blur-xl border-2 shadow-2xl">
        <h1 className="text-3xl font-black mb-2 heatwave-text">Firestore Initialization</h1>
        <p className="text-muted-foreground mb-6">
          Initialize Firestore collections and view required indexes
        </p>

        {authLoading && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-6">
            <p className="text-primary font-semibold">Checking authentication...</p>
          </div>
        )}
        
        {!authLoading && !user && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-6">
            <p className="text-destructive font-semibold">Please sign in to initialize collections</p>
            <p className="text-sm text-destructive/80 mt-2">You need to be authenticated to create Firestore collections.</p>
          </div>
        )}
        
        {!authLoading && user && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 mb-6">
            <p className="text-primary font-semibold">✓ Signed in as: {user.email || user.displayName || user.uid}</p>
            <p className="text-sm text-primary/80 mt-1">User ID: {user.uid}</p>
            <p className="text-sm text-primary/80 mt-1">Ready to initialize collections</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <Button
            onClick={handleInit}
            disabled={loading || !user || authLoading}
            size="lg"
            className="w-full heatwave-gradient border-0 text-white font-bold disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Initializing...
              </>
            ) : (
              "Initialize Collections"
            )}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-lg border-2 ${
                result.success
                  ? "bg-primary/10 border-primary/20"
                  : "bg-destructive/10 border-destructive/20"
              }`}
            >
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-primary" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <p
                  className={`font-semibold ${
                    result.success ? "text-primary" : "text-destructive"
                  }`}
                >
                  {result.message}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Required Firestore Indexes</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Create these indexes in Firebase Console &gt; Firestore Database &gt; Indexes
          </p>

          <div className="space-y-3">
            {indexes.map((index, i) => (
              <Card key={i} className="p-4 bg-secondary/50 border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-sm mb-1">
                      {i + 1}. Collection: <span className="heatwave-text">{index.collection}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Fields: {index.fields.join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">{index.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm font-semibold mb-2">💡 Quick Setup:</p>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Go to Firebase Console &gt; Firestore Database &gt; Indexes</li>
              <li>Click "Create Index" for each index listed above</li>
              <li>Or import from <code className="bg-background px-1 rounded">firestore.indexes.json</code></li>
              <li>Deploy Firestore rules from <code className="bg-background px-1 rounded">firestore.rules</code></li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  )
}

