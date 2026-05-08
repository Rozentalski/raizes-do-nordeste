import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import {
  Award,
  Home,
  MapPin,
  Receipt,
  ShoppingCart,
  User,
  UtensilsCrossed,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useUnidadeStore } from '@/stores/unidade'
import { useCarrinhoTotais } from '@/stores/carrinho'
import { listarUnidades } from '@/services/unidadesService'
import type { Unidade } from '@/features/unidades/types'
import { CookieBanner } from '@/features/lgpd/CookieBanner'
import { SkipLink } from '@/components/atoms/SkipLink'
import { cn } from '@/lib/utils'

function SeletorUnidade() {
  const unidadeAtual = useUnidadeStore((s) => s.unidadeAtual)
  const setUnidade = useUnidadeStore((s) => s.setUnidade)
  const [open, setOpen] = useState(false)
  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!open || unidades.length) return
    setCarregando(true)
    listarUnidades()
      .then(setUnidades)
      .finally(() => setCarregando(false))
  }, [open, unidades.length])

  function selecionar(u: Unidade) {
    setUnidade(u)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <MapPin className="size-4 text-primary" aria-hidden />
          <span className="text-left">
            {unidadeAtual ? (
              <span className="font-medium">{unidadeAtual.nome}</span>
            ) : (
              <span className="text-muted-foreground">Selecionar unidade</span>
            )}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif">Escolher unidade</SheetTitle>
          <SheetDescription>
            O cardápio e as promoções variam por unidade.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-2">
          {carregando && (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          )}
          {!carregando &&
            unidades.map((u) => {
              const ativa = unidadeAtual?.id === u.id
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => selecionar(u)}
                  className={cn(
                    'w-full rounded-lg border p-4 text-left transition-colors',
                    ativa
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted',
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif text-lg text-foreground">
                      {u.nome}
                    </span>
                    {!u.cozinhaCompleta && (
                      <span className="rounded-full bg-secondary/40 px-2 py-0.5 text-xs text-secondary-foreground">
                        Cardápio reduzido
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {u.endereco}
                  </p>
                </button>
              )
            })}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function CarrinhoButton() {
  const { qtdItens } = useCarrinhoTotais()
  const aria =
    qtdItens > 0
      ? `Carrinho com ${qtdItens} ite${qtdItens === 1 ? 'm' : 'ns'}`
      : 'Carrinho'
  return (
    <Button asChild variant="ghost" size="icon" aria-label={aria}>
      <Link to="/carrinho" className="relative">
        <ShoppingCart />
        {qtdItens > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 grid min-h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-card"
            aria-hidden
          >
            {qtdItens > 9 ? '9+' : qtdItens}
          </span>
        )}
      </Link>
    </Button>
  )
}

const itensNavInferior = [
  { to: '/home', label: 'Início', icon: Home, end: true },
  { to: '/cardapio', label: 'Cardápio', icon: UtensilsCrossed, end: false },
  { to: '/fidelidade', label: 'Fidelidade', icon: Award, end: false },
  { to: '/pedidos', label: 'Pedidos', icon: Receipt, end: false },
  { to: '/conta', label: 'Conta', icon: User, end: false },
]

export default function ClienteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SkipLink />
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-3">
          <Link to="/home" className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-primary" aria-hidden />
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-lg text-foreground">Raízes</span>
              <span className="-mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                do Nordeste
              </span>
            </div>
          </Link>
          <nav
            aria-label="Navegação principal"
            className="ml-6 hidden flex-1 items-center gap-1 md:flex"
          >
            {itensNavInferior.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )
                }
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <SeletorUnidade />
            <CarrinhoButton />
          </div>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-1 pb-24 md:pb-12"
      >
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-muted-foreground">
          <p>© Raízes do Nordeste · Recife/PE</p>
          <nav className="flex flex-wrap gap-4">
            <Link to="/politica-privacidade" className="hover:text-foreground">
              Política de Privacidade
            </Link>
            <Link to="/termos-uso" className="hover:text-foreground">
              Termos de Uso
            </Link>
            <Link to="/conta/privacidade" className="hover:text-foreground">
              LGPD
            </Link>
          </nav>
        </div>
      </footer>

      <CookieBanner />

      <nav
        aria-label="Navegação principal"
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card md:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {itensNavInferior.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 px-2 py-2 text-[11px] transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
