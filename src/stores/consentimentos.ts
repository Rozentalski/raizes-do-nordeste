import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { ChaveConsentimento } from '@/features/lgpd/types'

interface ConsentimentosState {
  cookiesAnaliticos: boolean
  marketing: boolean
  geolocalizacao: boolean
  perfilConsumo: boolean
  /** ISO 8601 — null = ainda não decidiu (primeira visita) */
  dataAtualizacao: string | null
  atualizar: (chave: ChaveConsentimento, valor: boolean) => void
  aceitarTodos: () => void
  apenasEssenciais: () => void
  /** Reset usado no fluxo de exclusão de conta */
  limpar: () => void
}

const PADRAO_ESSENCIAIS = {
  cookiesAnaliticos: false,
  marketing: false,
  geolocalizacao: false,
  perfilConsumo: false,
}

const PADRAO_ACEITA_TUDO = {
  cookiesAnaliticos: true,
  marketing: true,
  geolocalizacao: true,
  perfilConsumo: true,
}

export const useConsentimentosStore = create<ConsentimentosState>()(
  persist(
    (set) => ({
      ...PADRAO_ESSENCIAIS,
      dataAtualizacao: null,

      atualizar: (chave, valor) =>
        set({
          [chave]: valor,
          dataAtualizacao: new Date().toISOString(),
        } as Partial<ConsentimentosState>),

      aceitarTodos: () =>
        set({ ...PADRAO_ACEITA_TUDO, dataAtualizacao: new Date().toISOString() }),

      apenasEssenciais: () =>
        set({ ...PADRAO_ESSENCIAIS, dataAtualizacao: new Date().toISOString() }),

      limpar: () => set({ ...PADRAO_ESSENCIAIS, dataAtualizacao: null }),
    }),
    { name: 'raizes_consentimentos' },
  ),
)

export function decidiu(state: ConsentimentosState): boolean {
  return state.dataAtualizacao !== null
}
