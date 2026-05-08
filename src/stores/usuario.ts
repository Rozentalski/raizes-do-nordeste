import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ConsentimentosUsuario {
  marketing: boolean
  analisePerfil: boolean
}

export interface Usuario {
  id: string
  nome: string
  email: string
  telefone?: string
  cpf?: string
  dataNascimento?: string
  consentimentos: ConsentimentosUsuario
  criadoEm: string
}

interface UsuarioState {
  usuario: Usuario | null
  setUsuario: (usuario: Usuario | null) => void
  logout: () => void
}

export const useUsuarioStore = create<UsuarioState>()(
  persist(
    (set) => ({
      usuario: null,
      setUsuario: (usuario) => set({ usuario }),
      logout: () => set({ usuario: null }),
    }),
    {
      name: 'raizes_usuario',
    },
  ),
)
