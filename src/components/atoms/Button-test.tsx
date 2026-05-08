import { Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export function ButtonTest() {
  return (
    <section className="space-y-10 p-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          shadcn/ui · new-york · cores da marca
        </p>
        <h2 className="font-serif text-4xl text-foreground">
          Button — variações
        </h2>
        <p className="text-sm text-muted-foreground max-w-prose">
          <span className="text-primary font-medium">primary</span> usa terracota,{' '}
          <span className="text-secondary-foreground bg-secondary/40 rounded px-1">
            secondary
          </span>{' '}
          usa mostarda, e{' '}
          <span className="text-destructive font-medium">destructive</span> usa o
          vermelho de erro do design system.
        </p>
      </header>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
          Variants
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button>
            <ShoppingCart aria-hidden />
            Adicionar ao carrinho
          </Button>
          <Button variant="secondary">Aplicar cupom</Button>
          <Button variant="destructive">
            <Trash2 aria-hidden />
            Excluir conta
          </Button>
          <Button variant="outline">Cancelar</Button>
          <Button variant="ghost">Mais opções</Button>
          <Button variant="link">Ver detalhes</Button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
          Sizes
        </h3>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Pequeno</Button>
          <Button size="default">Padrão</Button>
          <Button size="lg">Grande</Button>
          <Button size="icon" aria-label="Adicionar item">
            <Plus />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
          Disabled
        </h3>
        <div className="flex flex-wrap gap-3">
          <Button disabled>Pagar (indisponível)</Button>
          <Button variant="outline" disabled>
            Cancelar
          </Button>
          <Button variant="secondary" disabled>
            Aplicar cupom
          </Button>
        </div>
      </div>
    </section>
  )
}
