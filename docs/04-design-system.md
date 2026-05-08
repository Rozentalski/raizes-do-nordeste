# Design System — Raízes do Nordeste

Tokens visuais, padrões de componentes e diretrizes de acessibilidade. Pronto para implementação direta com Tailwind CSS + shadcn/ui.

## Identidade da marca

Marca que une **tradição nordestina** com **tecnologia moderna**. Visualmente:

- Quente, acolhedora, com referências culturais sutis
- Não folclórica nem caricatural — moderna e contemporânea
- Texturas inspiradas em palha trançada e arte cordel, usadas com parcimônia
- Iconografia rounded e amigável

## Paleta de cores

### Cores principais

| Token | Hex | Uso |
|---|---|---|
| `terracota` | `#C84B31` | Primária — botões principais, destaques, marca |
| `mostarda` | `#E1A140` | Secundária — banners, badges de promoção |
| `verde-folha` | `#4A6741` | Accent — selos de orgânico, sucessos, fidelidade |

### Neutros

| Token | Hex | Uso |
|---|---|---|
| `branco-quente` | `#FAF6F1` | Background principal |
| `creme` | `#F2EBE0` | Background secundário (cards, modais) |
| `marrom-escuro` | `#3D2817` | Texto primário, headings |
| `cinza-300` | `#D9D2C7` | Bordas, dividers |
| `cinza-500` | `#9B9387` | Texto secundário |

### Semânticas

| Token | Hex | Uso |
|---|---|---|
| `success` | `#2E7D32` | Confirmações, status "pronto" |
| `error` | `#C62828` | Erros, status "cancelado", pedidos atrasados |
| `warning` | `#F57C00` | Atenção, status próximo do SLA |
| `info` | `#1976D2` | Informações neutras |

### Tailwind config (tokens)

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      brand: {
        terracota: '#C84B31',
        mostarda: '#E1A140',
        verde: '#4A6741',
      },
      surface: {
        DEFAULT: '#FAF6F1',
        muted: '#F2EBE0',
      },
      ink: {
        DEFAULT: '#3D2817',
        muted: '#9B9387',
      },
    }
  }
}
```

## Tipografia

| Família | Uso | Tailwind |
|---|---|---|
| **Playfair Display** | Headings (h1, h2, h3) | `font-serif` |
| **Inter** | UI, body, labels | `font-sans` |

### Escala

| Token | Tamanho | Line height | Uso |
|---|---|---|---|
| `text-xs` | 12px | 16px | Helper texts, captions |
| `text-sm` | 14px | 20px | Body small, labels |
| `text-base` | 16px | 24px | Body default |
| `text-lg` | 18px | 28px | Body large, subtítulos |
| `text-xl` | 20px | 28px | H4 |
| `text-2xl` | 24px | 32px | H3 |
| `text-3xl` | 30px | 36px | H2 |
| `text-4xl` | 36px | 40px | H1 |
| `text-display` | 48px+ | 1.1 | Heroes, hero numbers |

## Espaçamento

Sistema baseado em múltiplos de 4px (Tailwind default). Não inventar valores intermediários.

| Token | Valor | Uso típico |
|---|---|---|
| `space-1` | 4px | Espaçamento mínimo entre ícone e texto |
| `space-2` | 8px | Padding interno de chips, badges |
| `space-3` | 12px | Espaçamento entre items de lista compacta |
| `space-4` | 16px | Padding padrão de cards |
| `space-6` | 24px | Margin entre seções |
| `space-8` | 32px | Margin entre blocos grandes |
| `space-12` | 48px | Margin entre páginas/sections |

## Border radius

| Token | Valor | Uso |
|---|---|---|
| `rounded-sm` | 4px | Inputs, buttons compactos |
| `rounded` | 8px | Cards, botões padrão |
| `rounded-lg` | 12px | Cards destacados, modais |
| `rounded-xl` | 16px | Hero cards |
| `rounded-full` | 9999px | Avatares, chips, badges |

## Sombras

| Token | Uso |
|---|---|
| `shadow-sm` | Cards padrão |
| `shadow` | Cards interativos (hover) |
| `shadow-lg` | Modais, drawers |
| `shadow-xl` | Hero overlays |

Manter discreto — sombras escuras desviam da identidade quente.

## Touch targets (acessibilidade)

| Contexto | Mínimo | Recomendado |
|---|---|---|
| App mobile | 44x44px | 48x48px |
| Totem | 60x60px | 72x72px |
| Web desktop | 32x32px | 40x40px |

## Estados de interação

Todo componente interativo precisa ter os 5 estados:

1. **Default** — repouso
2. **Hover** — desktop apenas, ligeiro escurecimento (10%)
3. **Focus** — ring visível para navegação por teclado (`focus-visible:ring-2 ring-brand-terracota ring-offset-2`)
4. **Active/Pressed** — escurecimento maior (20%) ou scale 0.98
5. **Disabled** — opacidade 50% + cursor not-allowed

## Componentes-chave

### Button

```tsx
// variants: primary, secondary, outline, ghost, destructive
// sizes: sm (32px), md (40px), lg (48px), xl (60px - totem)

<Button variant="primary" size="lg">
  Adicionar ao carrinho
</Button>
```

Primary: bg `brand.terracota`, text branco, hover escurece 10%.

### Card de produto

```
┌────────────────────────┐
│ [imagem 1:1]           │
│                        │
├────────────────────────┤
│ Tapioca de Carne de Sol│
│ Carne de sol desfiada..│
│                        │
│ R$ 18,50      [+] btn  │
└────────────────────────┘
```

### Status badge

| Status | Cor | Texto |
|---|---|---|
| Recebido | `info` | "Recebido" |
| Em preparo | `warning` | "Em preparo" |
| Pronto | `success` | "Pronto" |
| Retirado | `cinza-500` | "Retirado" |
| Cancelado | `error` | "Cancelado" |

### Toggle (LGPD)

iOS-style toggle com label à esquerda e descrição abaixo. Cor "on" = `brand.verde`.

## Iconografia

- **Lucide React** (`lucide-react`) como biblioteca padrão
- Stroke width 1.5-2px para harmonia com tipografia
- Tamanho default 20px (em botões), 24px (em listas), 32px (em headers)
- Cor herda do contexto (texto)

## Loading e empty states

### Loading
- Skeleton screens em listas (não spinners brancos)
- Spinner só em ações de fundo (pagamento, login)
- Cores em tons de `cinza-300` para não competir com conteúdo

### Empty states
- Ilustração pequena (não obrigatória)
- Título caloroso ("Seu carrinho está vazio")
- Subtítulo orientativo ("Adicione produtos para começar")
- CTA quando aplicável ("Ver cardápio")

## Acessibilidade (WCAG 2.1 AA)

| Requisito | Aplicação |
|---|---|
| Contraste texto | Mínimo 4.5:1 (texto normal), 3:1 (texto grande) |
| Contraste UI | Mínimo 3:1 (bordas, ícones interativos) |
| Foco visível | `focus-visible:ring-2` em todos os interativos |
| Labels | `aria-label` ou label associado em todo input |
| Alt text | Imagens funcionais com `alt` descritivo, decorativas com `alt=""` |
| Estrutura | Hierarquia de headings consistente (h1 → h2 → h3) |
| Teclado | Toda interação acessível por Tab, Enter, Esc |
| Skip links | Link "Pular para o conteúdo" no topo |

## Dark mode

Não obrigatório no escopo do projeto. Se implementar, manter paleta cromática mas inverter neutros (background marrom-escuro, texto branco-quente).

## Animações

| Tipo | Duração | Easing |
|---|---|---|
| Micro (botões, hovers) | 150ms | ease-out |
| Pequena (modais, drawers) | 250ms | ease-in-out |
| Grande (page transitions) | 350ms | ease-in-out |

Respeitar `prefers-reduced-motion` desabilitando animações grandes para usuários que sinalizam essa preferência.

## Imagens e fotografia

- Fotos de produto em proporção 1:1 (quadrado) ou 4:3
- Iluminação quente, fundo neutro creme
- Sem filtros saturados — preservar autenticidade da culinária
- Formato WebP com fallback PNG, lazy loading nativo
