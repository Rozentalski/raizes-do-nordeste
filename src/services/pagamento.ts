import type { MetodoPagamento } from '@/features/pedidos/types'

export interface DadosCartao {
  numero: string
  nome?: string
  validade?: string
  cvv?: string
}

export interface DadosPix {
  cpf?: string
}

export interface DadosVR {
  operadora?: string
}

export type DadosPagamento = DadosCartao | DadosPix | DadosVR | undefined

export type ResultadoPagamento =
  | { status: 'aprovado'; transacaoId: string; metodo: MetodoPagamento }
  | { status: 'recusado'; motivo: string }
  | { status: 'erro'; mensagem: string }

const CARTAO_RECUSADO = '4000000000000002'
const CARTAO_ERRO = '4000000000000119'

function normalizarCartao(numero?: string): string {
  return (numero ?? '').replace(/\s|-/g, '')
}

function aleatorioEntre(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/**
 * Simula chamada ao gateway externo. Latência 2-4s. Os números abaixo são
 * cartões de teste determinísticos pra reproduzir recusa e erro de comunicação
 * sem depender de aleatoriedade.
 */
export async function solicitarPagamento(
  metodo: MetodoPagamento,
  dados: DadosPagamento = undefined,
): Promise<ResultadoPagamento> {
  const latencia = aleatorioEntre(2000, 4000)
  await new Promise((r) => setTimeout(r, latencia))

  // Cartões de teste — cobrem cenários determinísticos
  if (metodo === 'credito' || metodo === 'debito') {
    const numero = normalizarCartao((dados as DadosCartao | undefined)?.numero)
    if (numero === CARTAO_RECUSADO) {
      return {
        status: 'recusado',
        motivo:
          'Seu cartão foi recusado pelo banco emissor. Pode ser saldo insuficiente ou bloqueio temporário.',
      }
    }
    if (numero === CARTAO_ERRO) {
      return {
        status: 'erro',
        mensagem:
          'Falha de comunicação com o gateway de pagamento. Tente novamente em instantes.',
      }
    }
  }

  // PIX sempre aprova — UX feliz pra demonstração
  if (metodo === 'pix') {
    return {
      status: 'aprovado',
      metodo,
      transacaoId: `pix_${Date.now()}`,
    }
  }

  // VR e cartões fora dos códigos de teste: 90% aprova, 10% recusa
  if (Math.random() < 0.9) {
    return {
      status: 'aprovado',
      metodo,
      transacaoId: `${metodo}_${Date.now()}`,
    }
  }
  return {
    status: 'recusado',
    motivo: 'Pagamento não autorizado.',
  }
}
