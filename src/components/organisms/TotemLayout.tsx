import { Outlet, useLocation, useNavigate } from 'react-router-dom'

import { TotemScaler } from '@/components/molecules/TotemScaler'
import { SkipLink } from '@/components/atoms/SkipLink'
import { useInactivityTimer } from '@/hooks/useInactivityTimer'
import { useCarrinhoStore } from '@/stores/carrinho'

const TIMEOUT_INATIVIDADE_MS = 30_000

export default function TotemLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const limparCarrinho = useCarrinhoStore((s) => s.limpar)

  const naTelaOciosa = location.pathname === '/totem'

  function resetarParaOcioso() {
    limparCarrinho()
    navigate('/totem', { replace: true })
  }

  // Inatividade só fora da tela ociosa — lá esperar é o estado natural.
  useInactivityTimer(TIMEOUT_INATIVIDADE_MS, resetarParaOcioso, !naTelaOciosa)

  return (
    <>
      <SkipLink />
      <TotemScaler>
        <main id="main-content" className="contents">
          <Outlet />
        </main>
      </TotemScaler>
    </>
  )
}
