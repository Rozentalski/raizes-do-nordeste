export type Tier = 'bronze' | 'prata' | 'ouro'

export interface Recompensa {
  id: string
  nome: string
  descricao: string
  custoPontos: number
  imagem: string
  ativa: boolean
}

export interface MovimentacaoPontos {
  id: string
  tipo: 'credito' | 'debito'
  pontos: number
  motivo: string
  em: string
  pedidoId?: string
  recompensaId?: string
}

/** Faixas de pontos por tier (referência da regra de negócio do programa). */
export const FAIXAS_TIER: { tier: Tier; minPontos: number; rotulo: string }[] = [
  { tier: 'bronze', minPontos: 0, rotulo: 'Bronze' },
  { tier: 'prata', minPontos: 500, rotulo: 'Prata' },
  { tier: 'ouro', minPontos: 1000, rotulo: 'Ouro' },
]

export function tierPorPontos(pontos: number): Tier {
  if (pontos >= 1000) return 'ouro'
  if (pontos >= 500) return 'prata'
  return 'bronze'
}

/** Pontos faltando até o próximo tier. Retorna null se já é ouro. */
export function pontosParaProximoTier(pontos: number): {
  proximo: Tier
  faltam: number
  progresso: number
} | null {
  if (pontos >= 1000) return null
  if (pontos >= 500) {
    return {
      proximo: 'ouro',
      faltam: 1000 - pontos,
      progresso: (pontos - 500) / (1000 - 500),
    }
  }
  return {
    proximo: 'prata',
    faltam: 500 - pontos,
    progresso: pontos / 500,
  }
}

/**
 * Mapeamento Recompensa → desconto em reais quando resgatada.
 * Em produção viria do catálogo; mock simplificado pra demonstração.
 */
export const VALOR_RECOMPENSA_REAIS: Record<string, number> = {
  R01: 8.0,
  R02: 12.0,
  R03: 8.5,
  R04: 14.0,
  R05: 22.0,
  R06: 16.0,
}
