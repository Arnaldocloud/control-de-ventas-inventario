import { requireAuth } from "@/lib/supabase/auth-helpers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap } from "lucide-react"
import { VentaRapidaBarcode } from "@/components/venta-rapida-barcode"

export default async function VentaRapidaPage() {
  await requireAuth()

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="rounded-lg bg-primary/10 p-3">
          <Zap className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Venta Rápida con Escáner</h1>
          <p className="text-muted-foreground mt-1">Escanea productos para agregarlos automáticamente</p>
        </div>
      </div>

      <VentaRapidaBarcode />
    </div>
  )
}
