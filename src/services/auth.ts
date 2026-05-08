import usuariosMock from '@/mocks/usuarios.json'
import { comLatencia } from '@/lib/latencia'
import type { Usuario } from '@/stores/usuario'

interface UsuarioCadastrado extends Usuario {
  senha: string
}

const CHAVE_CADASTRADOS = 'raizes_usuarios_cadastrados'

const MOCK = usuariosMock as UsuarioCadastrado[]

function lerCadastrados(): UsuarioCadastrado[] {
  try {
    const raw = window.localStorage.getItem(CHAVE_CADASTRADOS)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function gravarCadastrados(lista: UsuarioCadastrado[]): void {
  window.localStorage.setItem(CHAVE_CADASTRADOS, JSON.stringify(lista))
}

function semSenha(u: UsuarioCadastrado): Usuario {
  const { senha: _ignorada, ...resto } = u
  void _ignorada
  return resto
}

function emailIguais(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

/** Retorna true se o e-mail já existe no mock ou em cadastros locais. */
export function existeEmail(email: string): boolean {
  if (MOCK.some((u) => emailIguais(u.email, email))) return true
  return lerCadastrados().some((u) => emailIguais(u.email, email))
}

/**
 * Tenta autenticar contra mock + cadastrados. Latência simulada de 300ms
 * pra dar tempo do botão mostrar estado de carregamento.
 */
export async function autenticar(
  email: string,
  senha: string,
): Promise<Usuario | null> {
  const todos = [...MOCK, ...lerCadastrados()]
  const encontrado = todos.find(
    (u) => emailIguais(u.email, email) && u.senha === senha,
  )
  return comLatencia(encontrado ? semSenha(encontrado) : null, 300, 300)
}

/**
 * Registra um novo usuário. Falha se o e-mail já existe.
 * Persiste em raizes_usuarios_cadastrados pra próximo login funcionar.
 */
export function cadastrar(usuario: Usuario, senha: string): boolean {
  if (existeEmail(usuario.email)) return false
  const cadastrados = lerCadastrados()
  cadastrados.push({ ...usuario, senha })
  gravarCadastrados(cadastrados)
  return true
}
