"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, ShoppingCart, Settings, Wallet, Users, FolderTree, Truck, ShoppingBag, BarChart3 } from "lucide-react"

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
      href: "/categorias",
      label: "Categorías",
      icon: FolderTree,
      active: pathname?.startsWith("/categorias"),
    },
    {
      href: "/ventas",
      label: "Ventas",
      icon: ShoppingCart,
      active: pathname?.startsWith("/ventas"),
    },
    {
      href: "/clientes",
      label: "Clientes",
      icon: Users,
      active: pathname?.startsWith("/clientes"),
    },
    {
      href: "/proveedores",
      label: "Proveedores",
      icon: Truck,
      active: pathname?.startsWith("/proveedores"),
    },
    {
      href: "/compras",
      label: "Compras",
      icon: ShoppingBag,
      active: pathname?.startsWith("/compras"),
    },
    {
      href: "/reportes",
      label: "Reportes",
      icon: BarChart3,
      active: pathname?.startsWith("/reportes"),
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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card shadow-lg z-50 flex flex-col border-r">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2">
          <Package className="h-6 w-6 text-white" />
        </div>
        <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
          ComercioApp
        </span>
      </div>
      <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-base font-bold rounded-lg transition-all",
              route.active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-black hover:bg-accent hover:text-black",
            )}
          >
            <route.icon className="h-5 w-5" />
            <span
              className={cn(
                route.active ? "text-white" : "text-black"
              )}
            >
              {route.label}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
