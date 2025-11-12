"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Scan, X } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  placeholder?: string
  label?: string
}

export function BarcodeScanner({ onScan, placeholder = "Escanea o ingresa código de barras", label }: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus en el input cuando se monta el componente
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && barcode.trim()) {
      handleScan()
    }
  }

  const handleScan = () => {
    if (barcode.trim()) {
      onScan(barcode.trim())
      setBarcode("")
      // Re-focus después de escanear
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 100)
    }
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="pr-10"
          />
          <Scan className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button type="button" onClick={handleScan} disabled={!barcode.trim()}>
          Buscar
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Escanea el código de barras con un lector o ingrésalo manualmente
      </p>
    </div>
  )
}

// Componente con cámara (opcional, para usar la cámara del dispositivo)
interface BarcodeScannerCameraProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScannerCamera({ onScan, onClose }: BarcodeScannerCameraProps) {
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Usar cámara trasera en móviles
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error("Error accediendo a la cámara:", err)
      setError("No se pudo acceder a la cámara. Por favor, verifica los permisos.")
      toast.error("Error al acceder a la cámara")
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Escanear Código de Barras</DialogTitle>
          <DialogDescription>Apunta la cámara al código de barras</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {error ? (
            <div className="text-center py-8 text-destructive">{error}</div>
          ) : (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
          )}
          <Button onClick={handleClose} variant="outline" className="w-full">
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
