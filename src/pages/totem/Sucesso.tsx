import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock, Star } from 'lucide-react'

import { useStorePedidos } from '@/stores/pedidos'
import { useCarrinhoStore } from '@/stores/carrinho'
import { ROTULOS_METODO } from '@/features/pedidos/types'

const REDIRECT_MS = 10_000

export default function Sucesso() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pedidoId = searchParams.get('pedido')
  const pedido = useStorePedidos((s) =>
    pedidoId ? s.getPedido(pedidoId) : undefined,
  )
  const limparCarrinho = useCarrinhoStore((s) => s.limpar)

  const [segundos, setSegundos] = useState(REDIRECT_MS / 1000)

  useEffect(() => {
    // O pedido já foi finalizado — limpar carrinho ao montar (defesa).
    limparCarrinho()
  }, [limparCarrinho])

  useEffect(() => {
    if (!pedidoId || !pedido) {
      navigate('/totem', { replace: true })
      return
    }
    const intervalo = window.setInterval(
      () => setSegundos((s) => Math.max(0, s - 1)),
      1000,
    )
    const timeout = window.setTimeout(() => {
      navigate('/totem', { replace: true })
    }, REDIRECT_MS)
    return () => {
      window.clearInterval(intervalo)
      window.clearTimeout(timeout)
    }
  }, [pedidoId, pedido, navigate])

  if (!pedido) return null

  const totalItens = pedido.itens.reduce((acc, it) => acc + it.quantidade, 0)
  const pontos = Math.floor(pedido.total)

  return (
    <>
      {/* HEADER minimal — só logo */}
      <header className="flex h-[120px] flex-none items-center justify-center border-b border-[rgba(61,40,23,0.12)] bg-white">
        <div className="flex items-center gap-4">
          <div
            className="grid size-[72px] place-items-center rounded-2xl bg-primary text-primary-foreground"
            aria-hidden
          >
            <span style={{ fontFamily: '"Playfair Display", serif' }} className="text-5xl font-bold leading-none">
              R
            </span>
          </div>
          <div
            style={{ fontFamily: '"Playfair Display", serif' }}
            className="text-[32px] font-bold leading-none tracking-[-0.02em] text-foreground"
          >
            Raízes do Nordeste
          </div>
        </div>
      </header>

      {/* HERO 800px */}
      <section className="flex flex-none flex-col items-center justify-center gap-7 px-10 pb-8 pt-20">
        <div
          className="relative grid size-[300px] place-items-center"
          aria-hidden
        >
          <div className="absolute size-[300px] animate-ping rounded-full bg-[#4A6741]/20" />
          <div className="absolute size-[260px] rounded-full bg-[#4A6741]/30" />
          <div className="relative grid size-[220px] place-items-center rounded-full bg-[#4A6741] text-white shadow-[0_20px_60px_rgba(74,103,65,0.45)]">
            <CheckCircle2 className="size-32" strokeWidth={2.5} />
          </div>
        </div>

        <h1
          style={{ fontFamily: '"Playfair Display", serif' }}
          className="text-center text-[80px] font-bold leading-none tracking-[-0.02em] text-primary"
        >
          Pedido confirmado!
        </h1>
        <p className="text-[36px] font-medium text-[#4A6741]">
          Pagamento aprovado
        </p>
      </section>

      {/* CARD destaque senha */}
      <section className="flex flex-none justify-center px-10">
        <div className="flex h-[500px] w-[800px] flex-col items-center justify-center rounded-3xl border-4 border-primary bg-white px-12 py-10 text-center shadow-[0_12px_32px_rgba(61,40,23,0.12)]">
          <p className="text-[32px] font-medium text-muted-foreground">
            Sua senha de retirada
          </p>
          <p
            style={{ fontFamily: '"Playfair Display", serif' }}
            className="mt-4 text-[240px] font-extrabold leading-none tracking-[-0.04em] text-primary tabular-nums"
          >
            #{pedido.numero}
          </p>
          <p className="mt-4 text-[28px] text-foreground">
            Apresente este número no balcão
          </p>
        </div>
      </section>

      {/* CARD info 300px */}
      <section className="mt-7 flex flex-none justify-center px-10">
        <div className="flex w-[800px] flex-col gap-4 rounded-2xl bg-[#F2EBE0] px-10 py-7">
          <div className="flex items-center gap-3 text-[24px] text-foreground">
            <Clock className="size-7 text-primary" aria-hidden />
            <span>
              Pronto em <strong>12-15 minutos</strong>
            </span>
          </div>
          <div className="flex items-center justify-between text-[22px] text-foreground">
            <span className="text-muted-foreground">Itens</span>
            <span>
              {totalItens} {totalItens === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[22px] text-foreground">
            <span className="text-muted-foreground">Total pago</span>
            <span className="font-bold tabular-nums">
              R$ {pedido.total.toFixed(2).replace('.', ',')}
            </span>
          </div>
          <div className="flex items-center justify-between text-[22px] text-foreground">
            <span className="text-muted-foreground">Método</span>
            <span>{ROTULOS_METODO[pedido.metodoPagamento]}</span>
          </div>
          {pedido.cpfCliente && (
            <div className="flex items-center justify-between text-[22px]">
              <span className="text-muted-foreground">Pontos creditados</span>
              <span className="inline-flex items-center gap-2 font-bold text-[#4A6741]">
                <Star className="size-6 fill-[#4A6741]" aria-hidden />
                +{pontos} pts
              </span>
            </div>
          )}
        </div>
      </section>

      {/* BOTTOM 200px */}
      <section className="mt-auto flex h-[200px] flex-none flex-col items-center justify-center gap-4 px-10 pb-8">
        <p
          className="text-center text-[20px] text-muted-foreground"
          aria-live="polite"
        >
          Esta tela será fechada em <strong>{segundos}</strong> segundos…
        </p>
        <button
          type="button"
          onClick={() => navigate('/totem', { replace: true })}
          className="inline-flex h-[100px] w-[1000px] max-w-full items-center justify-center rounded-2xl border-[3px] border-primary bg-transparent text-[24px] font-bold uppercase tracking-[0.08em] text-primary transition-colors hover:bg-[rgba(200,75,49,0.06)] active:scale-[0.98]"
        >
          Fazer novo pedido
        </button>
        <p className="mt-2 text-[18px] italic text-muted-foreground">
          Obrigado pela preferência!
        </p>
      </section>
    </>
  )
}
