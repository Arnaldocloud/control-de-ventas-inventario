import { RegistroForm } from "@/components/auth/registro-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Registrarse - Sistema de Ventas",
  description: "Crea tu cuenta y empieza a gestionar tu negocio",
}

export default function RegistroPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="absolute top-4 left-4">
        <Link
          href="/"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio
        </Link>
      </div>

      <div className="w-full max-w-lg space-y-8 py-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Crear Cuenta</h1>
          <p className="text-muted-foreground">Comienza tu prueba gratuita hoy</p>
        </div>

        <RegistroForm />
      </div>
    </div>
  )
}
