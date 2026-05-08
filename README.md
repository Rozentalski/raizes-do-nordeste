# Raízes do Nordeste — Plataforma Multicanal

Projeto Front-end multicanal (App, Totem, Web) para a rede fictícia **Raízes do Nordeste**, desenvolvido como entrega da disciplina de Projeto Multidisciplinar (UNINTER, 2026).

> Adicione aqui o link público do deploy assim que estiver no ar:
> **🌐 Deploy:** _a definir após `vercel --prod`_

## Visão geral

PWA cobrindo três contextos com a mesma base de código: cliente (mobile e desktop), totem na loja, e operação interna (atendente, cozinha, gerente). O pedido nasce em qualquer canal e atravessa os outros — quem pede pelo app retira no balcão, quem digita CPF no totem acumula pontos no app.

O que está implementado:

- Cardápio que muda por unidade — algumas têm cozinha completa, outras servem só café da manhã
- Fluxo de pedido fim-a-fim: carrinho → checkout → pagamento simulado → acompanhamento com timeline ao vivo
- Programa Raízes: 1 ponto por R$ 1 creditado quando o pedido sai como retirado, três tiers (Bronze, Prata, Ouro) e resgate de recompensas que vira cupom no carrinho
- LGPD em quatro pontos da interface (cookie banner, cadastro com checkboxes separados, modal de geolocalização, tela de privacidade com exportação JSON e exclusão de conta com confirmação dupla)
- Pagamento desacoplado simulando gateway externo — quatro métodos (PIX, crédito, débito, VR) e cartões de teste pra forçar recusa e erro
- Lado operacional: PDV pro atendente, KDS Kanban da cozinha com sincronização entre abas via storage event, Dashboard do gerente com KPIs e gráficos, e Auditoria de operações sensíveis

## Stack técnica

| Camada | Escolha |
|---|---|
| Framework | React 18 + Vite 5 + TypeScript estrito |
| Estilização | Tailwind CSS 3 + shadcn/ui (Radix UI) |
| Estado | Zustand com persist middleware |
| Roteamento | React Router v6 + lazy/Suspense |
| Mock data | JSON estático + localStorage prefixado `raizes_*` |
| Gráficos | Recharts (lazy no Dashboard) |
| Notificações | Sonner |
| PWA | vite-plugin-pwa (manifest + service worker) |

## Como rodar local

```bash
# Pré-requisitos: Node 18+ e npm

# 1) instalar dependências
npm install

# 2) rodar em modo desenvolvimento
npm run dev
# abre em http://localhost:5173 (a porta varia se 5173 estiver ocupada)

# 3) build de produção (typecheck + Vite)
npm run build

# 4) preview local do build
npm run preview
```

## Contas de demonstração

Todas as contas de demo são mockadas — nenhuma autenticação real chega ao servidor.

### Cliente (rota `/login`)
| E-mail | Senha |
|---|---|
| `maria@exemplo.com` | `senha123` |
| `pedro@exemplo.com` | `senha123` |

Você também pode criar uma conta nova em `/cadastro` — ela fica persistida no `localStorage` e funciona pra logins seguintes.

### Operação interna (rota `/admin/login`)
| E-mail | Senha | Vai para |
|---|---|---|
| `atendente@raizes.com` | `raizes123` | PDV |
| `cozinha@raizes.com` | `raizes123` | KDS |
| `gerente@raizes.com` | `raizes123` | Dashboard + Auditoria |

## Cartões de teste do gateway simulado

| Número | Resultado |
|---|---|
| `4000 0000 0000 0002` | Recusado (saldo insuficiente) |
| `4000 0000 0000 0119` | Erro de comunicação |
| Qualquer outro | ~90% aprovado, ~10% recusado |

PIX sempre aprova — útil pra demonstrar o caminho feliz.

## Canais

| Canal | Rota base | Observações |
|---|---|---|
| **Cliente** (mobile/web) | `/home` em diante | PWA instalável, mobile-first |
| **Totem** | `/totem` | Layout fixo 1080×1920 escalado pra viewport, touch ≥60px, inatividade 30s |
| **Admin** | `/admin/login` | Sidebar + 4 telas (PDV, KDS, Dashboard, Auditoria) com guard por role |

## Créditos

Projeto acadêmico desenvolvido por **Rudinei Rozentalski** para a disciplina de
Projeto Multidisciplinar (UNINTER, 2026.1, Trilha Front-end).

Cliente fictício baseado no estudo de caso oficial da disciplina (Raízes do
Nordeste, rede de lanchonetes nordestinas em expansão a partir de Recife/PE).

## Licença

Uso restrito ao contexto acadêmico da disciplina. Reprodução, redistribuição
ou uso comercial não autorizados.
