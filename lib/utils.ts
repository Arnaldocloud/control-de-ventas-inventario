import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatearNumero(numero: number, decimales = 2): string {
  return numero.toLocaleString("es-VE", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

export function formatearPrecio(precio: number, moneda: "BS" | "USD" = "USD"): string {
  const simbolo = moneda === "BS" ? "Bs." : "$"
  return `${simbolo} ${formatearNumero(precio, 2)}`
}
