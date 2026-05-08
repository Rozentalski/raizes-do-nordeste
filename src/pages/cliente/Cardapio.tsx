import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { toast } from 'sonner'

import { Skeleton } from '@/components/ui/skeleton'
import { useUnidadeStore } from '@/stores/unidade'
import { useCarrinhoStore } from '@/stores/carrinho'
import {
  getCardapioComStatus,
  type ProdutoComStatus,
} from '@/services/cardapioService'
import {
  CATEGORIAS,
  ROTULOS_TAG,
  type Categoria,
  type Produto,
  type Tag,
} from '@/features/cardapio/types'
import { formatarPreco } from '@/lib/formatadores'
import { cn } from '@/lib/utils'

type FiltroId = 'todos' | Tag

interface FiltroExtra {
  id: FiltroId
  nome: string
}

const FILTROS_EXTRA: FiltroExtra[] = [
  { id: 'todos', nome: 'Todos' },
  { id: 'salgado', nome: 'Salgadas' },
  { id: 'doce', nome: 'Doces' },
  { id: 'sem-gluten', nome: 'Sem glúten' },
  { id: 'vegetariano', nome: 'Vegetariano' },
  { id: 'mais-pedido', nome: 'Mais pedidos' },
]

function ehCategoriaValida(v: string | undefined): v is Categoria {
  if (!v) return false
  return CATEGORIAS.some((c) => c.id === v)
}

export default function Cardapio() {
  const { categoria } = useParams<{ categoria: string }>()
  const navigate = useNavigate()
  const unidadeAtual = useUnidadeStore((s) => s.unidadeAtual)
  const adicionar = useCarrinhoStore((s) => s.adicionar)

  const [lista, setLista] = useState<ProdutoComStatus[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<FiltroId>('todos')

  const categoriaAtiva = ehCategoriaValida(categoria) ? categoria : null
  const tituloCategoria =
    CATEGORIAS.find((c) => c.id === categoriaAtiva)?.nome ?? 'Cardápio'

  useEffect(() => {
    if (!unidadeAtual) {
      navigate('/selecionar-unidade', { replace: true })
      return
    }
    setCarregando(true)
    getCardapioComStatus(unidadeAtual.id)
      .then(setLista)
      .finally(() => setCarregando(false))
  }, [unidadeAtual, navigate])

  // Reset filtro ao mudar categoria — outras categorias podem não ter "doces" etc.
  useEffect(() => {
    setFiltro('todos')
  }, [categoriaAtiva])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return lista.filter(({ produto }) => {
      if (categoriaAtiva && produto.categoria !== categoriaAtiva) return false
      if (filtro !== 'todos' && !produto.tags.includes(filtro)) return false
      if (termo) {
        const blob = `${produto.nome} ${produto.descricao}`.toLowerCase()
        if (!blob.includes(termo)) return false
      }
      return true
    })
  }, [lista, categoriaAtiva, filtro, busca])

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

  return (
    <section className="space-y-5 px-4 py-6 md:px-8">
      <header className="space-y-2">
        <nav className="text-xs text-muted-foreground" aria-label="Trilha">
          <Link to="/home" className="hover:text-foreground">
            Início
          </Link>
          <span aria-hidden> / </span>
          <Link to="/cardapio" className="hover:text-foreground">
            Cardápio
          </Link>
          {categoriaAtiva && (
            <>
              <span aria-hidden> / </span>
              <span className="text-foreground">{tituloCategoria}</span>
            </>
          )}
        </nav>
        <h1 className="font-serif text-3xl text-foreground md:text-4xl">
          {tituloCategoria}
        </h1>
        {!categoriaAtiva && (
          <div className="flex flex-wrap gap-2 pt-1">
            {CATEGORIAS.map((c) => (
              <Link
                key={c.id}
                to={`/cardapio/${c.id}`}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {c.nome}
              </Link>
            ))}
          </div>
        )}
      </header>

      <div className="relative">
        <Search
          className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4 text-muted-foreground"
          aria-hidden
        />
        <label htmlFor="cardapio-busca" className="sr-only">
          Buscar em {tituloCategoria}
        </label>
        <input
          id="cardapio-busca"
          type="search"
          placeholder={`Buscar em ${tituloCategoria.toLowerCase()}...`}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="h-11 w-full rounded-xl border border-input bg-card pl-11 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Filtros rápidos"
      >
        {FILTROS_EXTRA.map((f) => {
          const ativo = filtro === f.id
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={ativo}
              onClick={() => setFiltro(f.id)}
              className={cn(
                'h-9 shrink-0 rounded-full border px-4 text-xs font-bold uppercase tracking-wide transition-colors',
                ativo
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {f.nome}
            </button>
          )
        })}
      </div>

      <ul className="space-y-3" aria-busy={carregando}>
        {carregando &&
          Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <article className="flex items-stretch gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
                <Skeleton className="size-20 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <div className="flex w-24 shrink-0 flex-col items-end justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="size-9 rounded-full" />
                </div>
              </article>
            </li>
          ))}

        {!carregando && filtrados.length === 0 && (
          <li className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nada por aqui com esse filtro. Tente afrouxar os critérios.
          </li>
        )}

        {!carregando &&
          filtrados.map(({ produto, disponivel }) => (
            <li key={produto.id}>
              <article
                className={cn(
                  'flex items-stretch gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow',
                  disponivel
                    ? 'hover:shadow-md'
                    : 'opacity-60 saturate-50',
                )}
              >
                <Link
                  to={
                    disponivel
                      ? `/cardapio/produto/${produto.id}`
                      : '#'
                  }
                  onClick={(e) => !disponivel && e.preventDefault()}
                  aria-disabled={!disponivel}
                  className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className={cn(
                      'h-full w-full object-cover',
                      !disponivel && 'grayscale',
                    )}
                    loading="lazy"
                  />
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    to={
                      disponivel
                        ? `/cardapio/produto/${produto.id}`
                        : '#'
                    }
                    onClick={(e) => !disponivel && e.preventDefault()}
                    className="block min-w-0"
                    aria-disabled={!disponivel}
                  >
                    <h3 className="truncate font-serif text-base text-foreground">
                      {produto.nome}
                    </h3>
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {produto.descricao}
                    </p>
                  </Link>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {produto.tags
                      .filter((t) => t === 'mais-pedido' || t === 'sazonal-junino')
                      .slice(0, 1)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-secondary/40 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                        >
                          {ROTULOS_TAG[tag]}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="flex w-24 shrink-0 flex-col items-end justify-between">
                  <span className="text-sm font-bold text-primary">
                    {formatarPreco(produto.preco)}
                  </span>
                  {disponivel ? (
                    <button
                      type="button"
                      onClick={() => adicionarRapido(produto)}
                      className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                      aria-label={`Adicionar ${produto.nome}`}
                    >
                      <Plus className="size-5" aria-hidden />
                    </button>
                  ) : (
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      Indisponível
                    </span>
                  )}
                </div>
              </article>
            </li>
          ))}
      </ul>
    </section>
  )
}
