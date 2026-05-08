import unidadesMock from '@/mocks/unidades.json'
import { comLatencia } from '@/lib/latencia'
import type { Unidade } from '@/features/unidades/types'

const UNIDADES = unidadesMock as Unidade[]

export async function listarUnidades(): Promise<Unidade[]> {
  return comLatencia(UNIDADES)
}

export async function getUnidade(unidadeId: string): Promise<Unidade | null> {
  const unidade = UNIDADES.find((u) => u.id === unidadeId) ?? null
  return comLatencia(unidade)
}

/** Distância em km entre duas coordenadas (Haversine). Útil pra ordenar unidades por proximidade. */
export function distanciaKm(
  origem: { lat: number; lng: number },
  destino: { lat: number; lng: number },
): number {
  const R = 6371
  const toRad = (g: number) => (g * Math.PI) / 180
  const dLat = toRad(destino.lat - origem.lat)
  const dLng = toRad(destino.lng - origem.lng)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(origem.lat)) *
      Math.cos(toRad(destino.lat)) *
      Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}
