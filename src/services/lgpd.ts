/**
 * Direitos do titular (LGPD Art. 18) — implementação client-side.
 * Em produção, exportar/excluir devem passar por API autenticada com auditoria.
 * Aqui, como o protótipo é só front + localStorage, fazemos no próprio browser.
 */

const CHAVES_RAIZES = [
  'raizes_usuario',
  'raizes_unidade',
  'raizes_carrinho',
  'raizes_pedidos',
  'raizes_fidelidade',
  'raizes_consentimentos',
] as const

type ChaveRaizes = (typeof CHAVES_RAIZES)[number]

type DumpDados = {
  versao: string
  geradoEm: string
  fonte: 'navegador-localStorage'
  dados: Record<ChaveRaizes, unknown>
}

function lerJsonSeguro(chave: string): unknown {
  try {
    const raw = window.localStorage.getItem(chave)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function nomeArquivo(): string {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `raizes-meus-dados-${ts}.json`
}

export function exportarDadosUsuario(): DumpDados {
  const dados = CHAVES_RAIZES.reduce<Record<string, unknown>>((acc, chave) => {
    acc[chave] = lerJsonSeguro(chave)
    return acc
  }, {}) as Record<ChaveRaizes, unknown>

  const dump: DumpDados = {
    versao: '1.0',
    geradoEm: new Date().toISOString(),
    fonte: 'navegador-localStorage',
    dados,
  }

  const blob = new Blob([JSON.stringify(dump, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo()
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Pequena janela pra browsers terminarem o download antes de revogar.
  setTimeout(() => URL.revokeObjectURL(url), 1500)

  return dump
}

export function excluirConta(): void {
  for (const chave of CHAVES_RAIZES) {
    window.localStorage.removeItem(chave)
  }
  // Hard reload pra garantir que stores em memória sejam descartados também.
  window.location.replace('/')
}
