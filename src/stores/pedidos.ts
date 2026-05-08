import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'

import type {
  CanalPedido,
  EventoStatus,
  MetodoPagamento,
  ModoRetirada,
  Pedido,
  StatusPedido,
} from '@/features/pedidos/types'
import type { Cupom, ItemCarrinho } from '@/features/carrinho/types'
import { useFidelidadeStore } from '@/stores/fidelidade'

export interface DadosCriacaoPedido {
  unidadeId: string
  unidadeNome: string
  itens: ItemCarrinho[]
  cupom: Cupom | null
  subtotal: number
  desconto: number
  total: number
  metodoPagamento: MetodoPagamento
  modoRetirada: ModoRetirada
  canal: CanalPedido
  cpfCliente?: string
  transacaoId: string
}

interface PedidosState {
  pedidos: Pedido[]
  criarPedido: (dados: DadosCriacaoPedido) => Pedido
  atualizarStatus: (pedidoId: string, status: StatusPedido) => void
  getPedido: (id: string) => Pedido | undefined
  limpar: () => void
}

function gerarId(): string {
  return `pd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

function gerarNumero(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}

// Schedulers ficam fora do store — Zustand não persiste timers, e quem reabre o app
// não precisa de progressão "fantasma" continuando do nada. Pra simplicidade do mock
// acadêmico, o cliente só vê progressão na sessão em que confirmou o pedido.
function agendarProgresso(pedidoId: string, numero: string) {
  setTimeout(() => {
    useStorePedidos.getState().atualizarStatus(pedidoId, 'preparo')
  }, 5000)
  setTimeout(() => {
    const atual = useStorePedidos.getState().getPedido(pedidoId)
    if (!atual || atual.status === 'cancelado' || atual.status === 'retirado') return
    useStorePedidos.getState().atualizarStatus(pedidoId, 'pronto')
    toast.success(`Pedido #${numero} pronto pra retirada!`, {
      description: 'Vá até o balcão e mostre seu número.',
      duration: 8000,
    })
  }, 30000)
}

export const useStorePedidos = create<PedidosState>()(
  persist(
    (set, get) => ({
      pedidos: [],

      criarPedido: (dados) => {
        const agora = new Date().toISOString()
        const evento: EventoStatus = { status: 'recebido', em: agora }
        const pedido: Pedido = {
          id: gerarId(),
          numero: gerarNumero(),
          ...dados,
          status: 'recebido',
          historico: [evento],
          criadoEm: agora,
        }
        set((state) => ({ pedidos: [pedido, ...state.pedidos] }))
        agendarProgresso(pedido.id, pedido.numero)
        return pedido
      },

      atualizarStatus: (pedidoId, status) => {
        let pedidoCreditavel: Pedido | null = null
        set((state) => ({
          pedidos: state.pedidos.map((p) => {
            if (p.id !== pedidoId) return p
            // Idempotência: não retrocede status nem reaplica o mesmo
            if (p.status === status) return p
            if (p.status === 'cancelado' || p.status === 'retirado') return p
            const atualizado: Pedido = {
              ...p,
              status,
              historico: [
                ...p.historico,
                { status, em: new Date().toISOString() },
              ],
            }
            // Marca pra creditar pontos fora do reducer (efeito colateral)
            if (status === 'retirado') pedidoCreditavel = atualizado
            return atualizado
          }),
        }))
        if (pedidoCreditavel) {
          const p = pedidoCreditavel as Pedido
          const pontos = Math.floor(p.total)
          if (pontos > 0) {
            useFidelidadeStore
              .getState()
              .creditarPontos(pontos, `Pedido #${p.numero}`, p.id)
          }
        }
      },

      getPedido: (id) => get().pedidos.find((p) => p.id === id),

      limpar: () => set({ pedidos: [] }),
    }),
    { name: 'raizes_pedidos' },
  ),
)
