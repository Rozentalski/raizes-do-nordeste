import cardapioMock from '@/mocks/cardapio.json'
import { comLatencia } from '@/lib/latencia'
import type { Categoria, Produto } from '@/features/cardapio/types'

const PRODUTOS = cardapioMock as Produto[]

export async function getCardapioPorUnidade(
  unidadeId: string,
): Promise<Produto[]> {
  const filtrados = PRODUTOS.filter((p) => p.unidades.includes(unidadeId))
  return comLatencia(filtrados)
}

export async function getProduto(produtoId: string): Promise<Produto | null> {
  const produto = PRODUTOS.find((p) => p.id === produtoId) ?? null
  return comLatencia(produto)
}

export interface ProdutoComStatus {
  produto: Produto
  disponivel: boolean
}

/**
 * Retorna todos os produtos do catálogo marcando quais estão disponíveis na unidade.
 * Usado quando a UI precisa exibir produtos indisponíveis (não some, fica com overlay).
 */
export async function getCardapioComStatus(
  unidadeId: string,
): Promise<ProdutoComStatus[]> {
  const lista = PRODUTOS.map((produto) => ({
    produto,
    disponivel: produto.unidades.includes(unidadeId),
  }))
  return comLatencia(lista)
}

export interface OpcoesBusca {
  unidadeId?: string
  categoria?: Categoria
}

export async function buscarProdutos(
  termo: string,
  opcoes: OpcoesBusca = {},
): Promise<Produto[]> {
  const t = termo.trim().toLowerCase()
  let resultados = PRODUTOS

  if (opcoes.unidadeId) {
    const unidade = opcoes.unidadeId
    resultados = resultados.filter((p) => p.unidades.includes(unidade))
  }
  if (opcoes.categoria) {
    resultados = resultados.filter((p) => p.categoria === opcoes.categoria)
  }
  if (t) {
    resultados = resultados.filter((p) => {
      const blob = `${p.nome} ${p.descricao} ${p.tags.join(' ')}`.toLowerCase()
      return blob.includes(t)
    })
  }

  return comLatencia(resultados)
}
