import type React from "react"
import type { Metadata, Viewport } from "next"
import { about } from "@/data/about"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Navbar } from "@/components/navbar"
import ChatWidget from "@/components/chat/ChatWidget"
import { Footer } from "@/components/footer"
import { Suspense } from "react"
import ThemeScript from "@/components/ThemeScript"
import "./globals.css"

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#111111" },
    { media: "(prefers-color-scheme: dark)",  color: "#111111" },
  ],
};

export const metadata: Metadata = {
  title: `Home - ${about.nickname}`,
  description: "Full Stack Developer specializing in modern web technologies",
  icons: {
    icon: [
      { url: "/icons/logo-glyph-light.svg?v=1", type: "image/svg+xml", media: "(prefers-color-scheme: light)" },
      { url: "/icons/logo-glyph-dark.svg?v=1",  type: "image/svg+xml", media: "(prefers-color-scheme: dark)"  },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#111111",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript></ThemeScript>
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <ChatWidget />
          <Footer />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}