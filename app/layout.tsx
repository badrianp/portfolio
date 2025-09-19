import type React from "react"
import type { Metadata } from "next"
import { about } from "@/data/about"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: `Home - ${about.nickname}`,
  description: "Full Stack Developer specializing in modern web technologies",
  icons: {
    icon: "/favicon.ico",                // default pentru browsere
    shortcut: "/favicon.ico",            // fallback
    apple: "/apple-touch-icon.png",      // iOS home screen
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
