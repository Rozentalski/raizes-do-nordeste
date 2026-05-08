import cuponsMock from '@/mocks/cupons.json'
import { comLatencia } from '@/lib/latencia'
import type { Cupom } from '@/features/carrinho/types'

const CUPONS = cuponsMock as Cupom[]

export type MotivoInvalidacao = 'inexistente' | 'inativo' | 'expirado'

export type ResultadoValidacao =
  | { valido: true; cupom: Cupom }
  | { valido: false; motivo: MotivoInvalidacao }

export async function validarCupom(
  codigo: string,
): Promise<ResultadoValidacao> {
  const codigoNormalizado = codigo.trim().toUpperCase()
  const cupom = CUPONS.find((c) => c.codigo === codigoNormalizado)

  if (!cupom) {
    return comLatencia<ResultadoValidacao>({
      valido: false,
      motivo: 'inexistente',
    })
  }
  if (!cupom.ativo) {
    return comLatencia<ResultadoValidacao>({
      valido: false,
      motivo: 'inativo',
    })
  }

  const hoje = new Date().toISOString().slice(0, 10)
  if (cupom.validade < hoje) {
    return comLatencia<ResultadoValidacao>({
      valido: false,
      motivo: 'expirado',
    })
  }

  return comLatencia<ResultadoValidacao>({ valido: true, cupom })
}

/**
 * Aplica o desconto do cupom sobre um subtotal, retornando o desconto em reais (>= 0).
 * Chama-se apenas após `validarCupom()` ter retornado `{ valido: true }`.
 */
export function calcularDesconto(cupom: Cupom, subtotal: number): number {
  if (cupom.tipo === 'percentual') {
    return Math.max(0, (subtotal * cupom.valor) / 100)
  }
  return Math.min(subtotal, cupom.valor)
}
