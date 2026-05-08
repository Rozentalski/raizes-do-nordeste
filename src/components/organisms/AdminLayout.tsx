import {
  BarChart3,
  ClipboardList,
  LogOut,
  ShieldCheck,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { SkipLink } from '@/components/atoms/SkipLink'
import {
  ROTULOS_ROLE,
  useUsuarioOperacionalStore,
  type RoleOperacional,
} from '@/stores/usuarioOperacional'
import { cn } from '@/lib/utils'

interface ItemSidebar {
  to: string
  label: string
  icon: LucideIcon
  roles: RoleOperacional[]
}

const ITENS: ItemSidebar[] = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: BarChart3, roles: ['gerente'] },
  { to: '/admin/pdv', label: 'PDV', icon: ClipboardList, roles: ['atendente', 'gerente'] },
  { to: '/admin/kds', label: 'KDS', icon: UtensilsCrossed, roles: ['cozinha', 'gerente'] },
  { to: '/admin/auditoria', label: 'Auditoria', icon: ShieldCheck, roles: ['gerente'] },
]

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).slice(0, 2)
  return partes.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const usuario = useUsuarioOperacionalStore((s) => s.usuario)
  const logout = useUsuarioOperacionalStore((s) => s.logout)

  if (!usuario) return <Navigate to="/admin/login" replace />

  const itensVisiveis = ITENS.filter((i) => i.roles.includes(usuario.role))

  return (
    <div className="flex min-h-screen bg-background">
      <SkipLink />
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-[#2a1a10] text-white md:flex">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div
            className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground"
            aria-hidden
          >
            <span className="font-serif text-lg font-bold leading-none">R</span>
          </div>
          <div className="leading-tight">
            <p className="font-serif text-sm font-bold">Raízes</p>
            <p className="text-[10px] uppercase tracking-wider text-white/55">
              Painel operacional
            </p>
          </div>
        </div>

        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/55">
            Unidade
          </p>
          <p className="mt-0.5 font-serif text-sm font-bold text-white">
            Boa Viagem
          </p>
          <p className="mt-1 text-[11px] text-emerald-400">
            ● Aberta · 09:00–22:00
          </p>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {itensVisiveis.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-white/85 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto border-t border-white/10 px-5 py-3 text-[11px] text-white/50">
          v 2.4.1 · sincronizado
        </div>
      </aside>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {ROTULOS_ROLE[usuario.role]}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-secondary to-primary text-xs font-bold text-white"
                aria-hidden
              >
                {iniciais(usuario.nome)}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-foreground">
                  {usuario.nome}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {usuario.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout()
                navigate('/admin/login', { replace: true })
              }}
            >
              <LogOut className="size-3.5" aria-hidden />
              Sair
            </Button>
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

interface RequireRoleProps {
  roles: RoleOperacional[]
  children: React.ReactNode
}

/** Wrapper que protege rotas por role. Use em cada rota dentro de AdminLayout. */
export function RequireRole({ roles, children }: RequireRoleProps) {
  const usuario = useUsuarioOperacionalStore((s) => s.usuario)

  if (!usuario) return <Navigate to="/admin/login" replace />

  if (!roles.includes(usuario.role)) {
    const dest =
      usuario.role === 'atendente'
        ? '/admin/pdv'
        : usuario.role === 'cozinha'
          ? '/admin/kds'
          : '/admin/dashboard'
    return <Navigate to={dest} replace />
  }

  return <>{children}</>
}
