import { useCallback, useRef, useState } from 'react'

import {
  solicitarPagamento,
  type DadosPagamento,
  type ResultadoPagamento,
} from '@/services/pagamento'
import type { MetodoPagamento } from '@/features/pedidos/types'

export type EstadoPagamento =
  | 'idle'
  | 'processando'
  | 'aprovado'
  | 'recusado'
  | 'erro'

const TIMEOUT_MS = 30_000

export interface UsePagamentoReturn {
  estado: EstadoPagamento
  resultado: ResultadoPagamento | null
  pagar: (
    metodo: MetodoPagamento,
    dados?: DadosPagamento,
  ) => Promise<ResultadoPagamento>
  resetar: () => void
}

export function usePagamento(): UsePagamentoReturn {
  const [estado, setEstado] = useState<EstadoPagamento>('idle')
  const [resultado, setResultado] = useState<ResultadoPagamento | null>(null)
  const cancelarTimeoutRef = useRef<number | null>(null)

  const limparTimeout = useCallback(() => {
    if (cancelarTimeoutRef.current !== null) {
      clearTimeout(cancelarTimeoutRef.current)
      cancelarTimeoutRef.current = null
    }
  }, [])

  const pagar = useCallback(
    async (metodo: MetodoPagamento, dados?: DadosPagamento) => {
      setEstado('processando')
      setResultado(null)

      const promessaTimeout = new Promise<ResultadoPagamento>((resolve) => {
        cancelarTimeoutRef.current = window.setTimeout(
          () =>
            resolve({
              status: 'erro',
              mensagem:
                'Tempo de resposta excedido. Tente novamente ou escolha outra forma de pagamento.',
            }),
          TIMEOUT_MS,
        )
      })

      const r = await Promise.race([
        solicitarPagamento(metodo, dados),
        promessaTimeout,
      ])
      limparTimeout()

      setResultado(r)
      if (r.status === 'aprovado') setEstado('aprovado')
      else if (r.status === 'recusado') setEstado('recusado')
      else setEstado('erro')

      return r
    },
    [limparTimeout],
  )

  const resetar = useCallback(() => {
    limparTimeout()
    setEstado('idle')
    setResultado(null)
  }, [limparTimeout])

  return { estado, resultado, pagar, resetar }
}
