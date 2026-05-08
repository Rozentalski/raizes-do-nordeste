import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RoleOperacional = 'atendente' | 'cozinha' | 'gerente'

export interface UsuarioOperacional {
  email: string
  nome: string
  role: RoleOperacional
}

interface UsuarioOperacionalState {
  usuario: UsuarioOperacional | null
  login: (email: string, senha: string, role: RoleOperacional) => UsuarioOperacional | null
  logout: () => void
}

const SENHA_DEMO = 'raizes123'
const DOMINIO_VALIDO = '@raizes.com'

function nomeDoEmail(email: string): string {
  const local = email.split('@')[0] ?? ''
  return local
    .split('.')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}

export const useUsuarioOperacionalStore = create<UsuarioOperacionalState>()(
  persist(
    (set) => ({
      usuario: null,
      login: (email, senha, role) => {
        const e = email.trim().toLowerCase()
        if (!e.endsWith(DOMINIO_VALIDO)) return null
        if (senha !== SENHA_DEMO) return null
        const usuario: UsuarioOperacional = {
          email: e,
          nome: nomeDoEmail(e),
          role,
        }
        set({ usuario })
        return usuario
      },
      logout: () => set({ usuario: null }),
    }),
    { name: 'raizes_operacional' },
  ),
)

export const ROTULOS_ROLE: Record<RoleOperacional, string> = {
  atendente: 'Atendente',
  cozinha: 'Cozinha',
  gerente: 'Gerente',
}
