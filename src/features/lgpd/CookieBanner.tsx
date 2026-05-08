import { useNavigate } from 'react-router-dom'
import { Cookie } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useConsentimentosStore } from '@/stores/consentimentos'

export function CookieBanner() {
  const navigate = useNavigate()
  const dataAtualizacao = useConsentimentosStore((s) => s.dataAtualizacao)
  const aceitarTodos = useConsentimentosStore((s) => s.aceitarTodos)
  const apenasEssenciais = useConsentimentosStore((s) => s.apenasEssenciais)

  if (dataAtualizacao !== null) return null

  return (
    <div
      role="dialog"
      aria-label="Política de cookies"
      aria-describedby="cookie-desc"
      className="fixed inset-x-0 bottom-16 z-40 mx-auto max-w-3xl px-4 pb-4 md:bottom-0 md:pb-6"
    >
      <div className="rounded-2xl border border-border bg-card p-4 shadow-2xl backdrop-blur md:p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <Cookie className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif text-lg text-foreground">
              Usamos cookies
            </h2>
            <p
              id="cookie-desc"
              className="mt-1 text-xs text-muted-foreground md:text-sm"
            >
              Cookies essenciais mantêm o app funcionando. Os analíticos nos
              ajudam a melhorar a experiência. Você pode mudar de ideia depois
              em <strong>Conta › Privacidade</strong>.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Button
                size="sm"
                onClick={() => aceitarTodos()}
                className="h-10 flex-1 text-xs uppercase tracking-wide"
              >
                Aceitar todos
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => apenasEssenciais()}
                className="h-10 flex-1 text-xs uppercase tracking-wide"
              >
                Apenas essenciais
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/conta/privacidade')}
                className="h-10 text-xs uppercase tracking-wide"
              >
                Personalizar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
