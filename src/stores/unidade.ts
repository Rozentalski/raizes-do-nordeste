import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { Unidade } from '@/features/unidades/types'

interface UnidadeState {
  unidadeAtual: Unidade | null
  setUnidade: (unidade: Unidade | null) => void
}

export const useUnidadeStore = create<UnidadeState>()(
  persist(
    (set) => ({
      unidadeAtual: null,
      setUnidade: (unidade) => set({ unidadeAtual: unidade }),
    }),
    {
      name: 'raizes_unidade',
    },
  ),
)
