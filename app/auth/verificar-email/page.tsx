import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Verifica tu Email - Sistema de Ventas",
  description: "Verifica tu correo electrónico para activar tu cuenta",
}

export default function VerificarEmailPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="absolute top-4 left-4">
        <Link
          href="/auth/login"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al inicio de sesión
        </Link>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-4">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verifica tu correo</CardTitle>
          <CardDescription>Revisa tu bandeja de entrada y haz clic en el enlace de verificación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Hemos enviado un correo electrónico de verificación a tu dirección de email. Por favor, verifica tu correo
            para activar tu cuenta y poder iniciar sesión.
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">¿No recibiste el correo?</div>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Revisa tu carpeta de spam</li>
              <li>Espera unos minutos, puede tardar</li>
              <li>Verifica que escribiste bien tu email</li>
            </ul>
          </div>

          <Link href="/auth/login" className="block">
            <Button className="w-full">Ir a Iniciar Sesión</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
