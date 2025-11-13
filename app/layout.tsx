import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { MainNav } from "@/components/main-nav"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Control de Ventas e Inventario",
  description: "Sistema de gestión para tienda de repuestos de motos",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <MainNav />
          <main className="pl-64 min-h-screen bg-background transition-all">
            {children}
          </main>
          <Toaster />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
