"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, ShoppingCart, Settings, Wallet } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      href: "/productos",
      label: "Productos",
      icon: Package,
      active: pathname?.startsWith("/productos"),
    },
    {
      href: "/ventas",
      label: "Ventas",
      icon: ShoppingCart,
      active: pathname?.startsWith("/ventas"),
    },
    {
      href: "/caja",
      label: "Caja",
      icon: Wallet,
      active: pathname?.startsWith("/caja"),
    },
    {
      href: "/configuracion",
      label: "Configuración",
      icon: Settings,
      active: pathname === "/configuracion",
    },
  ]

  return (
    <nav className="border-b bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2 group-hover:scale-105 transition-transform">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                MotoRepuestos
              </span>
            </Link>
            <div className="flex gap-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
                    route.active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <route.icon className="h-4 w-4" />
                  {route.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
