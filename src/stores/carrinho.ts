import { useMemo } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type {
  Cupom,
  ItemCarrinho,
} from '@/features/carrinho/types'
import type {
  OpcaoCustomizacao,
  Produto,
} from '@/features/cardapio/types'
import { calcularDesconto } from '@/services/cuponsService'

interface CarrinhoState {
  itens: ItemCarrinho[]
  cupom: Cupom | null
  adicionar: (
    produto: Produto,
    quantidade: number,
    selecoes: Record<string, OpcaoCustomizacao[]>,
    observacoes?: string,
  ) => void
  remover: (itemId: string) => void
  atualizarQuantidade: (itemId: string, quantidade: number) => void
  aplicarCupom: (cupom: Cupom) => void
  removerCupom: () => void
  limpar: () => void
}

// Chave determinística pra dedupe: mesmo produto + mesmas opções + mesma observação vira uma linha só.
function chaveItem(
  produto: Produto,
  selecoes: Record<string, OpcaoCustomizacao[]>,
  observacoes?: string,
): string {
  const partes = Object.entries(selecoes)
    .map(
      ([cId, opcoes]) =>
        `${cId}:${[...opcoes.map((o) => o.id)].sort().join('+')}`,
    )
    .sort()
    .join(';')
  return `${produto.id}|${partes}|${observacoes?.trim() ?? ''}`
}

function gerarItemId(): string {
  return `it_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export const useCarrinhoStore = create<CarrinhoState>()(
  persist(
    (set) => ({
      itens: [],
      cupom: null,

      adicionar: (produto, quantidade, selecoes, observacoes) =>
        set((state) => {
          if (quantidade <= 0) return state
          const chave = chaveItem(produto, selecoes, observacoes)
          const existente = state.itens.find(
            (it) => chaveItem(it.produto, it.selecoes, it.observacoes) === chave,
          )
          if (existente) {
            return {
              itens: state.itens.map((it) =>
                it.itemId === existente.itemId
                  ? { ...it, quantidade: it.quantidade + quantidade }
                  : it,
              ),
            }
          }
          const novo: ItemCarrinho = {
            itemId: gerarItemId(),
            produto,
            quantidade,
            selecoes,
            observacoes: observacoes?.trim() || undefined,
          }
          return { itens: [...state.itens, novo] }
        }),

      remover: (itemId) =>
        set((state) => ({
          itens: state.itens.filter((it) => it.itemId !== itemId),
        })),

      atualizarQuantidade: (itemId, quantidade) =>
        set((state) => {
          if (quantidade <= 0) {
            return { itens: state.itens.filter((it) => it.itemId !== itemId) }
          }
          return {
            itens: state.itens.map((it) =>
              it.itemId === itemId ? { ...it, quantidade } : it,
            ),
          }
        }),

      aplicarCupom: (cupom) => set({ cupom }),
      removerCupom: () => set({ cupom: null }),
      limpar: () => set({ itens: [], cupom: null }),
    }),
    { name: 'raizes_carrinho' },
  ),
)

export function precoUnitario(item: ItemCarrinho): number {
  const extras = Object.values(item.selecoes)
    .flat()
    .reduce((acc, o) => acc + o.precoExtra, 0)
  return item.produto.preco + extras
}

interface Totais {
  subtotal: number
  desconto: number
  total: number
  qtdItens: number
}

// Hook derivado memoizado — re-computa só quando itens ou cupom mudam.
export function useCarrinhoTotais(): Totais {
  const itens = useCarrinhoStore((s) => s.itens)
  const cupom = useCarrinhoStore((s) => s.cupom)
  return useMemo(() => {
    const subtotal = itens.reduce(
      (acc, it) => acc + precoUnitario(it) * it.quantidade,
      0,
    )
    const desconto = cupom ? calcularDesconto(cupom, subtotal) : 0
    const total = Math.max(0, subtotal - desconto)
    const qtdItens = itens.reduce((acc, it) => acc + it.quantidade, 0)
    return { subtotal, desconto, total, qtdItens }
  }, [itens, cupom])
}
