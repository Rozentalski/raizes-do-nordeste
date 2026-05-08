import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import {
  tierPorPontos,
  VALOR_RECOMPENSA_REAIS,
  type MovimentacaoPontos,
  type Recompensa,
  type Tier,
} from '@/features/fidelidade/types'
import { useCarrinhoStore } from '@/stores/carrinho'
import type { Cupom } from '@/features/carrinho/types'

interface FidelidadeState {
  saldoPontos: number
  historico: MovimentacaoPontos[]
  creditarPontos: (pontos: number, motivo: string, pedidoId?: string) => void
  debitarPontos: (pontos: number, motivo: string, recompensaId?: string) => void
  resgatar: (recompensa: Recompensa) => Cupom | null
  calcularTier: () => Tier
  limpar: () => void
}

function gerarMovId(): string {
  return `mv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export const useFidelidadeStore = create<FidelidadeState>()(
  persist(
    (set, get) => ({
      saldoPontos: 0,
      historico: [],

      creditarPontos: (pontos, motivo, pedidoId) => {
        if (pontos <= 0) return
        const mov: MovimentacaoPontos = {
          id: gerarMovId(),
          tipo: 'credito',
          pontos,
          motivo,
          em: new Date().toISOString(),
          pedidoId,
        }
        set((s) => ({
          saldoPontos: s.saldoPontos + pontos,
          historico: [mov, ...s.historico],
        }))
      },

      debitarPontos: (pontos, motivo, recompensaId) => {
        if (pontos <= 0) return
        const saldo = get().saldoPontos
        if (saldo < pontos) return
        const mov: MovimentacaoPontos = {
          id: gerarMovId(),
          tipo: 'debito',
          pontos,
          motivo,
          em: new Date().toISOString(),
          recompensaId,
        }
        set((s) => ({
          saldoPontos: s.saldoPontos - pontos,
          historico: [mov, ...s.historico],
        }))
      },

      resgatar: (recompensa) => {
        const saldo = get().saldoPontos
        if (saldo < recompensa.custoPontos) return null

        const valor = VALOR_RECOMPENSA_REAIS[recompensa.id] ?? 10
        const cupom: Cupom = {
          codigo: `RES-${recompensa.id}`,
          descricao: `Resgate: ${recompensa.nome}`,
          tipo: 'fixo',
          valor,
          // Resgate vale 24h — em mock acadêmico tempo é simulado, marcamos amanhã
          validade: new Date(Date.now() + 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
          ativo: true,
        }

        get().debitarPontos(
          recompensa.custoPontos,
          `Resgate: ${recompensa.nome}`,
          recompensa.id,
        )
        useCarrinhoStore.getState().aplicarCupom(cupom)
        return cupom
      },

      calcularTier: () => tierPorPontos(get().saldoPontos),

      limpar: () => set({ saldoPontos: 0, historico: [] }),
    }),
    { name: 'raizes_fidelidade' },
  ),
)
