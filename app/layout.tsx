import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import { Space_Grotesk, Outfit } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

// Ensure environment variables are available
if (typeof window === "undefined") {
  // Server-side: validate env vars exist
  const requiredEnvVars = [
    "NEXT_PUBLIC_API_KEY",
    "NEXT_PUBLIC_AUTH_DOMAIN",
    "NEXT_PUBLIC_PROJECT_ID",
    "NEXT_PUBLIC_STORAGE_BUCKET",
    "NEXT_PUBLIC_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_APP_ID",
  ]
  
  const missing = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  )
  
  if (missing.length > 0) {
    console.warn(`Missing Firebase environment variables: ${missing.join(", ")}`)
  }
}

// Power Grotesk Font - Primary font for headings
// Using actual file names: Regular, Medium, Large (as SemiBold), Small (as Bold)
const powerGrotesk = localFont({
  src: [
    {
      path: "../fonts/PowerGrotesk-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/PowerGrotesk-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/PowerGrotesk-Large.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/PowerGrotesk-Small.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-power-grotesk",
  display: "swap",
  fallback: ["Space Grotesk", "system-ui", "sans-serif"],
})

// BaseNeue Font - UI elements font
// Using actual file names with "Trial" suffix
const baseNeue = localFont({
  src: [
    {
      path: "../fonts/BaseNeueTrial-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/BaseNeueTrial-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/BaseNeueTrial-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/BaseNeueTrial-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-base-neue",
  display: "swap",
  fallback: ["Space Grotesk", "system-ui", "sans-serif"],
})

// Fallback fonts
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
})

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "Rescue Finance - Level Up Your Lending",
  description: "The first gamified blockchain lending platform with 72-hour cycles",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${powerGrotesk.variable} ${baseNeue.variable} ${outfit.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
