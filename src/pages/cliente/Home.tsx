import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Cake,
  ChevronLeft,
  ChevronRight,
  Coffee,
  CupSoda,
  Plus,
  Search,
  Soup,
  Sparkles,
  Wheat,
  type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useUsuarioStore } from '@/stores/usuario'
import { useUnidadeStore } from '@/stores/unidade'
import { useCarrinhoStore } from '@/stores/carrinho'
import { getCardapioPorUnidade } from '@/services/cardapioService'
import type { Categoria, Produto } from '@/features/cardapio/types'
import { formatarPreco, saudacao } from '@/lib/formatadores'
import { cn } from '@/lib/utils'

interface AtalhoCategoria {
  id: Categoria
  nome: string
  icon: LucideIcon
  acento: string
}

const CATEGORIAS_HOME: AtalhoCategoria[] = [
  { id: 'cafe-da-manha', nome: 'Café da manhã', icon: Coffee, acento: 'bg-card' },
  { id: 'tapiocas', nome: 'Tapiocas', icon: Wheat, acento: 'bg-card' },
  { id: 'cuscuz', nome: 'Cuscuz', icon: Soup, acento: 'bg-card' },
  { id: 'bolos', nome: 'Bolos', icon: Cake, acento: 'bg-card' },
  { id: 'bebidas', nome: 'Bebidas', icon: CupSoda, acento: 'bg-card' },
  {
    id: 'promocoes',
    nome: 'Promoções',
    icon: Sparkles,
    acento: 'bg-primary/10 ring-1 ring-primary/30',
  },
]

interface Promo {
  produtoId: string
  selo: string
  precoCheio?: number
  precoPromo: number
}

// Banners curados — referenciam produtos reais do mock pra ter título/descrição/imagem.
const PROMOS: Promo[] = [
  { produtoId: 'P06', selo: 'Mais pedido', precoCheio: 32, precoPromo: 28 },
  { produtoId: 'P30', selo: 'Combo', precoPromo: 22 },
  { produtoId: 'P19', selo: 'Tradição', precoPromo: 14 },
]

interface CarrosselProps {
  rotulo: string
  children: React.ReactNode
}

// Scroll horizontal com setas em desktop (mobile mantém swipe nativo).
function Carrossel({ rotulo, children }: CarrosselProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [podeAnt, setPodeAnt] = useState(false)
  const [podeProx, setPodeProx] = useState(true)

  const atualizarBordas = useCallback(() => {
    const el = ref.current
    if (!el) return
    setPodeAnt(el.scrollLeft > 4)
    setPodeProx(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    atualizarBordas()
    const el = ref.current
    if (!el) return
    el.addEventListener('scroll', atualizarBordas, { passive: true })
    window.addEventListener('resize', atualizarBordas)
    return () => {
      el.removeEventListener('scroll', atualizarBordas)
      window.removeEventListener('resize', atualizarBordas)
    }
  }, [atualizarBordas, children])

  function rolar(direcao: -1 | 1) {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: direcao * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <div className="group relative">
      <div
        ref={ref}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {podeAnt && (
        <button
          type="button"
          onClick={() => rolar(-1)}
          aria-label={`${rotulo}: voltar`}
          className="absolute left-1 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-card/95 text-foreground shadow-md backdrop-blur transition-opacity hover:bg-card md:grid"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
      )}
      {podeProx && (
        <button
          type="button"
          onClick={() => rolar(1)}
          aria-label={`${rotulo}: avançar`}
          className="absolute right-1 top-1/2 hidden size-10 -translate-y-1/2 place-items-center rounded-full border border-border bg-card/95 text-foreground shadow-md backdrop-blur transition-opacity hover:bg-card md:grid"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      )}
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const usuario = useUsuarioStore((s) => s.usuario)
  const unidadeAtual = useUnidadeStore((s) => s.unidadeAtual)
  const adicionar = useCarrinhoStore((s) => s.adicionar)

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!unidadeAtual) {
      navigate('/selecionar-unidade', { replace: true })
      return
    }
    setCarregando(true)
    getCardapioPorUnidade(unidadeAtual.id)
      .then(setProdutos)
      .finally(() => setCarregando(false))
  }, [unidadeAtual, navigate])

  const promosVisiveis = PROMOS
    .map((p) => ({
      promo: p,
      produto: produtos.find((pr) => pr.id === p.produtoId),
    }))
    .filter((x): x is { promo: Promo; produto: Produto } => Boolean(x.produto))

  const maisPedidos = produtos.filter((p) => p.tags.includes('mais-pedido'))

  function adicionarRapido(produto: Produto) {
    if (produto.customizacoes?.some((c) => c.obrigatoria)) {
      navigate(`/cardapio/produto/${produto.id}`)
      return
    }
    adicionar(produto, 1, {})
    toast.success(`${produto.nome} adicionado ao carrinho`, {
      action: { label: 'Ver carrinho', onClick: () => navigate('/carrinho') },
    })
  }

  const primeiroNome = usuario?.nome.split(' ')[0] ?? 'visitante'

  return (
    <section className="space-y-8 px-4 py-6 md:px-8">
      <div>
        <h2 className="font-serif text-3xl text-foreground md:text-4xl">
          {saudacao()}, {primeiroNome}!
        </h2>
        {unidadeAtual && (
          <p className="mt-1 text-sm text-muted-foreground">
            Cardápio de <strong>{unidadeAtual.nome}</strong>
            {!unidadeAtual.cozinhaCompleta && (
              <span className="ml-2 rounded-full bg-secondary/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-secondary-foreground">
                Cardápio reduzido
              </span>
            )}
          </p>
        )}
      </div>

      <BuscaCardapio produtos={produtos} />

      <section aria-label="Promoções">
        <Carrossel rotulo="Promoções">
          {carregando &&
            Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-44 w-72 shrink-0 animate-pulse rounded-2xl bg-muted md:w-80"
                aria-hidden
              />
            ))}

          {!carregando &&
            promosVisiveis.map(({ promo, produto }) => (
              <Link
                key={produto.id}
                to={`/cardapio/produto/${produto.id}`}
                className="snap-center w-72 shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md md:w-80"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-secondary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-secondary-foreground shadow-sm">
                    {promo.selo}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-2 p-4">
                  <div className="min-w-0">
                    <h3 className="truncate font-serif text-lg text-foreground">
                      {produto.nome}
                    </h3>
                    <p className="line-clamp-1 text-xs text-muted-foreground">
                      {produto.descricao}
                    </p>
                  </div>
                  <div className="text-right">
                    {promo.precoCheio && (
                      <span className="block text-xs text-muted-foreground line-through">
                        {formatarPreco(promo.precoCheio)}
                      </span>
                    )}
                    <span className="font-serif text-lg text-primary">
                      {formatarPreco(promo.precoPromo)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </Carrossel>
      </section>

      <section aria-label="Categorias">
        <h2 className="mb-4 font-serif text-xl text-foreground">Categorias</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {CATEGORIAS_HOME.map(({ id, nome, icon: Icon, acento }) => (
            <Link
              key={id}
              to={`/cardapio/${id}`}
              className={cn(
                'flex flex-col items-center justify-center gap-3 rounded-2xl border border-border p-4 shadow-sm transition-colors hover:bg-muted',
                acento,
              )}
            >
              <div className="grid size-12 place-items-center rounded-full bg-muted text-primary">
                <Icon className="size-6" aria-hidden />
              </div>
              <span className="text-center text-sm font-bold text-foreground">
                {nome}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Mais pedidos hoje">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-serif text-xl text-foreground">
            Mais pedidos hoje
          </h2>
          <Button asChild variant="link" size="sm" className="h-auto p-0">
            <Link to="/cardapio">Ver todos</Link>
          </Button>
        </div>

        <Carrossel rotulo="Mais pedidos hoje">
          {carregando &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-52 w-40 shrink-0 animate-pulse rounded-xl bg-muted"
                aria-hidden
              />
            ))}

          {!carregando && maisPedidos.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Sem destaques nesta unidade hoje.
            </p>
          )}

          {!carregando &&
            maisPedidos.map((produto) => (
              <article
                key={produto.id}
                className="flex w-40 shrink-0 snap-start flex-col rounded-xl border border-border bg-card p-3 shadow-sm"
              >
                <Link
                  to={`/cardapio/produto/${produto.id}`}
                  className="block aspect-square overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </Link>
                <Link
                  to={`/cardapio/produto/${produto.id}`}
                  className="mt-3 line-clamp-2 text-sm font-bold text-foreground hover:text-primary"
                >
                  {produto.nome}
                </Link>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="text-sm font-medium text-foreground">
                    {formatarPreco(produto.preco)}
                  </span>
                  <button
                    type="button"
                    onClick={() => adicionarRapido(produto)}
                    className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                    aria-label={`Adicionar ${produto.nome} ao carrinho`}
                  >
                    <Plus className="size-5" aria-hidden />
                  </button>
                </div>
              </article>
            ))}
        </Carrossel>
      </section>
    </section>
  )
}

interface BuscaProps {
  produtos: Produto[]
}

function highlightTermo(texto: string, termo: string) {
  if (!termo) return texto
  const idx = texto.toLowerCase().indexOf(termo.toLowerCase())
  if (idx === -1) return texto
  return (
    <>
      {texto.slice(0, idx)}
      <mark className="rounded bg-secondary/40 px-0.5 text-foreground">
        {texto.slice(idx, idx + termo.length)}
      </mark>
      {texto.slice(idx + termo.length)}
    </>
  )
}

function BuscaCardapio({ produtos }: BuscaProps) {
  const [termo, setTermo] = useState('')
  const termoNormalizado = termo.trim().toLowerCase()
  const ativo = termoNormalizado.length > 0

  const resultados = ativo
    ? produtos.filter((p) => {
        const blob = `${p.nome} ${p.descricao} ${p.tags.join(' ')}`.toLowerCase()
        return blob.includes(termoNormalizado)
      })
    : []

  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4 text-muted-foreground"
        aria-hidden
      />
      <label htmlFor="home-search" className="sr-only">
        Buscar no cardápio
      </label>
      <input
        id="home-search"
        type="search"
        placeholder="O que você procura hoje?"
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        className="h-12 w-full rounded-xl border border-input bg-card pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        aria-controls="home-search-resultados"
        aria-expanded={ativo}
      />

      {ativo && (
        <div
          id="home-search-resultados"
          role="region"
          aria-label="Resultados da busca"
          className="mt-3 overflow-hidden rounded-xl border border-border bg-card shadow-md"
        >
          {resultados.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Nada por aqui com{' '}
              <strong className="text-foreground">"{termo}"</strong>. Tente
              outro termo ou veja as categorias.
            </p>
          ) : (
            <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto">
              {resultados.slice(0, 12).map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/cardapio/produto/${p.id}`}
                    className="flex items-center gap-3 p-3 transition-colors hover:bg-muted"
                  >
                    <div className="size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                      <img
                        src={p.imagem}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-foreground">
                        {highlightTermo(p.nome, termo)}
                      </p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {highlightTermo(p.descricao, termo)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-primary">
                      {formatarPreco(p.preco)}
                    </span>
                  </Link>
                </li>
              ))}
              {resultados.length > 12 && (
                <li className="border-t border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  Mostrando 12 de {resultados.length} resultados — refine pra
                  ver mais.
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
