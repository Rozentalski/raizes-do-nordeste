import { Link, useNavigate } from 'react-router-dom'
import {
  Award,
  ChevronRight,
  LogOut,
  Receipt,
  ShieldCheck,
  UserPen,
  type LucideIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useUsuarioStore } from '@/stores/usuario'
import { useFidelidadeStore } from '@/stores/fidelidade'
import { useStorePedidos } from '@/stores/pedidos'
import {
  FAIXAS_TIER,
  tierPorPontos,
  type Tier,
} from '@/features/fidelidade/types'

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).slice(0, 2)
  return partes.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
}

const COR_TIER: Record<Tier, string> = {
  bronze: 'bg-primary/15 text-primary',
  prata: 'bg-muted text-foreground',
  ouro: 'bg-secondary/40 text-secondary-foreground',
}

export default function Conta() {
  const navigate = useNavigate()
  const usuario = useUsuarioStore((s) => s.usuario)
  const logout = useUsuarioStore((s) => s.logout)
  const saldoPontos = useFidelidadeStore((s) => s.saldoPontos)
  const pedidos = useStorePedidos((s) => s.pedidos)

  const tier = tierPorPontos(saldoPontos)
  const tierLabel = FAIXAS_TIER.find((f) => f.tier === tier)?.rotulo ?? 'Bronze'

  if (!usuario) {
    return (
      <section className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div className="max-w-sm space-y-3">
          <h1 className="font-serif text-2xl text-foreground">
            Você não está logado
          </h1>
          <p className="text-sm text-muted-foreground">
            Entre na sua conta pra acessar pedidos, fidelidade e dados.
          </p>
          <Button asChild className="mt-2 w-full">
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6 px-4 py-6 md:px-8">
      <header className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div
          className="grid size-16 shrink-0 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground"
          aria-hidden
        >
          {iniciais(usuario.nome)}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-serif text-xl text-foreground">
            {usuario.nome}
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {usuario.email}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${COR_TIER[tier]}`}
            >
              {tierLabel}
            </span>
            <span className="text-xs text-muted-foreground">
              {saldoPontos} pts · {pedidos.length}{' '}
              {pedidos.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>
        </div>
      </header>

      <ul className="space-y-2">
        <Card
          icon={UserPen}
          titulo="Editar perfil"
          descricao="Atualize nome, e-mail e telefone."
          href="/conta/editar"
        />
        <Card
          icon={Receipt}
          titulo="Histórico de pedidos"
          descricao="Veja status, repita o que mais gostou."
          href="/pedidos"
        />
        <Card
          icon={Award}
          titulo="Programa Raízes"
          descricao={`Saldo: ${saldoPontos} pontos · Nível ${tierLabel}`}
          href="/fidelidade"
        />
        <Card
          icon={ShieldCheck}
          titulo="Privacidade e dados"
          descricao="Consentimentos, exportar e excluir conta."
          href="/conta/privacidade"
        />
      </ul>

      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => {
          logout()
          navigate('/splash', { replace: true })
        }}
        className="h-12 w-full text-sm font-bold uppercase tracking-wide"
      >
        <LogOut className="size-4" aria-hidden />
        Sair da conta
      </Button>
    </section>
  )
}

interface CardProps {
  icon: LucideIcon
  titulo: string
  descricao: string
  href: string
}

function Card({ icon: Icon, titulo, descricao, href }: CardProps) {
  return (
    <li>
      <Link
        to={href}
        className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40"
      >
        <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">{titulo}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {descricao}
          </p>
        </div>
        <ChevronRight
          className="size-5 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </Link>
    </li>
  )
}
