import { useNavigate } from 'react-router-dom'
import { Hand } from 'lucide-react'

import { useCarrinhoStore } from '@/stores/carrinho'
import { CordelDivider } from '@/components/molecules/CordelDivider'

/**
 * Tela ociosa — não havia code.html no design original; estilo inferido
 * para casar com Identificação/Cardápio/Pagamento (Playfair Display, paleta
 * terracota+mostarda, padrão de header 100-120px). Toque em qualquer lugar
 * da tela inicia o fluxo.
 */
export default function Ocioso() {
  const navigate = useNavigate()
  const limparCarrinho = useCarrinhoStore((s) => s.limpar)

  function comecar() {
    limparCarrinho()
    navigate('/totem/identificacao')
  }

  return (
    <button
      type="button"
      onClick={comecar}
      aria-label="Toque para começar seu pedido"
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#FAF6F1] via-[#F2EBE0] to-[#FFE9E5] px-20 py-24 text-center"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_2px_2px,_#3D2817_2px,_transparent_0)] [background-size:40px_40px]"
      />

      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* Logo gigante terracota */}
        <div
          className="grid size-56 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_20px_60px_rgba(200,75,49,0.35)]"
          aria-hidden
        >
          <span style={{ fontFamily: '"Playfair Display", serif' }} className="text-[180px] font-bold leading-none">
            R
          </span>
        </div>

        <div className="space-y-4">
          <h1
            style={{ fontFamily: '"Playfair Display", serif' }}
            className="text-[88px] font-bold leading-[1.05] tracking-tight text-primary"
          >
            Raízes do Nordeste
          </h1>
          <p className="text-[36px] leading-[1.35] text-muted-foreground">
            Sabores do nordeste,
            <br />
            do nosso jeito, no seu tempo.
          </p>
        </div>

        <CordelDivider className="my-4 max-w-[640px]" />

        {/* CTA pulsante */}
        <div className="mt-6 flex flex-col items-center gap-8">
          <div
            className="grid size-40 animate-pulse place-items-center rounded-full bg-primary/15"
            aria-hidden
          >
            <Hand className="size-20 text-primary" aria-hidden />
          </div>
          <span
            className="rounded-2xl bg-primary px-16 py-7 text-[36px] font-extrabold uppercase tracking-[0.1em] text-primary-foreground shadow-[0_6px_0_0_#8a3520,0_12px_32px_rgba(61,40,23,0.12)] animate-[pulse_2.4s_ease-in-out_infinite]"
          >
            Toque para começar
          </span>
        </div>

        <p className="mt-12 max-w-[640px] text-[24px] leading-[1.5] text-muted-foreground">
          Pedidos rápidos, retirada no balcão. Acumule pontos no programa
          <strong className="text-primary"> Raízes</strong> informando seu CPF.
        </p>
      </div>
    </button>
  )
}
