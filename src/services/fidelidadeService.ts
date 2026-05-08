import recompensasMock from '@/mocks/recompensas.json'
import { comLatencia } from '@/lib/latencia'
import type { Recompensa } from '@/features/fidelidade/types'

const RECOMPENSAS = recompensasMock as Recompensa[]

export async function listarRecompensas(
  somenteAtivas = true,
): Promise<Recompensa[]> {
  const lista = somenteAtivas
    ? RECOMPENSAS.filter((r) => r.ativa)
    : RECOMPENSAS
  return comLatencia(lista)
}
