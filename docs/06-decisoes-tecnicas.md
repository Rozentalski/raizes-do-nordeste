# Decisões Técnicas (ADRs leves) — Raízes do Nordeste

Registro de decisões arquiteturais importantes do projeto, com contexto, alternativas consideradas e justificativa. Útil para o documento final justificar escolhas e responder eventual arguição.

## ADR-01 — PWA em vez de app nativo

**Status:** Aceito
**Data:** 2026-05-06

### Alternativas consideradas

Quatro caminhos no escopo: PWA (Progressive Web App), React Native ou Flutter para multi-plataforma híbrida, nativos puros (Kotlin para Android e Swift para iOS), ou web responsivo sem PWA. As três últimas opções esbarram nas regras do roteiro Front-end, que lista HTML/CSS/JS, React, Angular e Vue como tecnologias permitidas — frameworks nativos ficam fora antes da pergunta sequer ser técnica.

### Decisão

Implementar como **PWA**.

### Justificativa

PWA atende a definição de "aplicativo" do estudo de caso: instala via "Adicionar à tela inicial", tem ícone próprio, abre offline em rotas já visitadas. Em troca, fica uma única base de código atendendo os três contextos do projeto (cliente mobile, cliente desktop, totem na loja) e o cardápio atualiza em tempo real sem passar por revisão de loja — atualização que o estudo de caso pede explicitamente como diferencial.

Custo dessa decisão: PWA não tem push notification confiável no iOS até versões recentes do Safari. Se o cliente fictício precisar disso pra alertar sobre pedido pronto fora do app, esse caminho fica defasado e React Native vira candidato real.

### Consequências

A configuração usa `vite-plugin-pwa` para gerar manifest e service worker automaticamente. Os ícones cobrem 192×192, 512×512 e variante maskable pra Android moderno. A estratégia de cache é cache-first em assets estáticos (JS, CSS, fonts) e network-first em rotas, garantindo que o cardápio sempre busque a versão atualizada quando há rede disponível.

## ADR-02 — Mock data + localStorage em vez de back-end

**Status:** Aceito

### Contexto

Trilha Front-end. Roteiro autoriza "dados mockados (Mock Data) para simular o cardápio e interações". Estudo de caso define pagamento como integração externa, não processada pelo sistema.

### Alternativas consideradas

1. **JSON estático** apenas (sem persistência mutável)
2. **JSON estático + localStorage** (persistência client-side)
3. **JSON Server / json-server** (REST mock real)
4. **MSW (Mock Service Worker)** (interceptação de requests)
5. **Supabase free tier** (back-end real simplificado)

### Decisão

Combinar **JSON estático em `src/mocks/`** para dados imutáveis (cardápio, unidades, recompensas) e **localStorage** para estado mutável (carrinho, pedidos, sessão, fidelidade).

### Justificativa

A combinação cabe no escopo de 30-40 horas que a trilha permite. localStorage dá sensação de app real — o cliente fecha o navegador e volta com carrinho intacto, programa de fidelidade no mesmo saldo. Não há dependência externa que possa cair durante a correção do trabalho. E como prova de conceito, a substituição futura por API REST não exige refazer a UI.

### Consequências

A camada `services/` simula chamadas de API com `setTimeout` de 300-1500ms pra latência soar real. As chaves do localStorage usam o prefixo `raizes_` (detalhado na ADR-08). Em produção, cada `localStorage.getItem('raizes_pedidos')` vira `fetch('/api/pedidos')` e a estrutura dos componentes continua igual — o trabalho de migração fica concentrado na fronteira entre store e service.

## ADR-03 — React + Vite + TypeScript

**Status:** Aceito

### Contexto

Stack para implementação da Opção B do roteiro Front-end.

### Alternativas consideradas

Cinco opções avaliadas: React + CRA, React + Vite + TS (escolhida), Next.js, Vue + Vite, e HTML/CSS/JS puro.

### Decisão

**React 18 + Vite 5 + TypeScript** estrito.

### Justificativa

CRA está deprecated desde 2023 — o time do Create React App parou de manter o pacote, e qualquer projeto novo herda problemas que não vão ser corrigidos. Vite virou padrão. O dev server abre em ~400ms e o HMR responde em 80-120ms, contra os 5-10 segundos típicos do CRA em projetos médios.

TypeScript pega erros antes do build: campo obrigatório esquecido em prop, refactor que quebrou meio sistema, retorno de função que mudou sem propagar. Sem isso, projeto desse tamanho vira sopa rápido — uma única refatoração no shape do `Pedido` toca 30 arquivos sem TS, e nenhum deles avisaria que parou de funcionar.

React tem o ecossistema de UI mais maduro pra essa fatia (shadcn/ui, lucide, recharts) com integração consolidada. Next.js seria carregar SSR e App Router pra um app que vai rodar inteiramente client-side — overhead que não compensa.

### Consequências

Setup inicial leva ~5 minutos com `npm create vite@latest . -- --template react-ts`. O `tsconfig` fica em modo strict, e os aliases `@/` ficam configurados em `vite.config.ts` e `tsconfig.json` pra imports limpos do tipo `import { Button } from '@/components/ui/button'` em vez de caminhos relativos profundos.

## ADR-04 — Tailwind CSS + shadcn/ui

**Status:** Aceito

### Contexto

Sistema visual consistente nos três contextos diferentes (App, Totem, Web).

### Alternativas consideradas

Quatro abordagens: CSS puro com tokens customizados, CSS-in-JS (styled-components ou Emotion), component library completa (Material UI ou Chakra UI), ou Tailwind + shadcn/ui.

### Decisão

**Tailwind CSS** para estilos utilitários e **shadcn/ui** para components base copiados (não package).

### Justificativa

Tailwind acelera prototipagem porque a iteração visual acontece direto no JSX, sem alt-tab pra arquivo CSS separado. Em vez de inventar nome de classe (`.product-card-header-title`) e descobrir três meses depois que ele só é usado num lugar, basta escrever `text-lg font-bold text-foreground` e a intenção fica explícita no markup.

shadcn/ui não é package no `node_modules` — são componentes copiados pra `src/components/ui/`. Acessibilidade via Radix UI por baixo (foco, ARIA, navegação por teclado), tema customizável via CSS variables, e total controle sobre o código. Uma library tipo Material UI traria 200KB de bundle gzipped pra usar 12 componentes; Tailwind + shadcn fica em ~40KB porque só carrega o que tem de fato no projeto.

Custo dessa decisão: classes Tailwind acumuladas ficam longas (`flex items-center gap-2 rounded-lg border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow`). Pra componentes complexos, vale dividir em variáveis ou usar `class-variance-authority` pra não comprometer legibilidade no JSX.

### Consequências

`components.json` configura o CLI do shadcn pra adicionar novos componentes na pasta correta. O tema vive em `tailwind.config.cjs` com tokens da marca (terracota, mostarda, verde-folha). Os components ficam separados em duas pastas: `src/components/ui/` pra base do shadcn e `src/components/` pros próprios (atoms, molecules, organisms).

## ADR-05 — Zustand para estado global

**Status:** Aceito

### Contexto

Estado compartilhado entre componentes: carrinho, sessão, unidade selecionada, fidelidade, consentimentos LGPD, pedidos do cliente.

### Alternativas consideradas

Quatro candidatos: Context API com useReducer, Redux Toolkit, Zustand, e família Jotai/Recoil (atomic state).

### Decisão

**Zustand** com `persist` middleware pra integração com localStorage.

### Justificativa

Já implementei Redux Toolkit em projeto anterior com escopo equivalente — boilerplate de 4-5 arquivos por slice (slice, action types, selectors, types, hooks gerados), DevTools potentes, time-travel debugging. Tudo bem feito, mas o custo de manutenção pesava. Zustand resolve o mesmo problema em ~40 linhas de código por store: definição direta, hooks tipados sem geração extra, persistência automática via middleware.

O bundle do Zustand é de aproximadamente 1.1KB gzipped contra ~12KB do Redux Toolkit. Pra esse projeto, com sete stores pequenas, a economia sai de graça. Se o estado crescer pra dezenas de slices ou aparecer cache complexo de servidor (mutations, optimistic updates, invalidação de query), vale reavaliar — a próxima parada seria TanStack Query + Zustand antes de Redux.

Não há `Provider` envolvendo o `App.tsx` — isso elimina o problema clássico de "provider hell" quando vários contexts precisam coexistir.

### Consequências

As stores ficam em `src/stores/`, uma por feature: `useCarrinhoStore`, `useUsuarioStore`, `useUnidadeStore`, `useFidelidadeStore`, `useStorePedidos`, `useConsentimentosStore` e `useUsuarioOperacionalStore`. A persistência usa o prefixo `raizes_*` no localStorage (detalhado na ADR-08). Hooks expostos são tipados via TypeScript inferido do shape inicial, sem ações boilerplate.

## ADR-06 — React Router v6

**Status:** Aceito

A pergunta nem chegou a ser dramática. **React Router v6** com nested routes — que sustenta os três contextos (cliente, totem, admin) em layouts compartilhados via `<Outlet />`. A versão 6 quebrou compatibilidade com a 5 (`Switch` virou `Routes`, `useHistory` virou `useNavigate`); como esse projeto começou do zero, o custo dessa migração não pesou na escolha.

### Estrutura de rotas

```
/                         → Home (cliente)
/cardapio                 → Cardápio
/cardapio/:produtoId      → Detalhe do produto
/carrinho                 → Carrinho
/checkout                 → Checkout
/pagamento                → Processando pagamento
/pedidos                  → Histórico de pedidos
/pedidos/:id              → Acompanhamento individual
/fidelidade               → Programa de fidelidade
/conta                    → Minha conta
/conta/privacidade        → Privacidade e LGPD
/login                    → Login
/cadastro                 → Cadastro
/totem                    → Tela ociosa do totem
/totem/cardapio           → Cardápio do totem
/admin                    → Login operacional
/admin/pdv                → PDV (atendente)
/admin/kds                → Kanban da cozinha
/admin/dashboard          → Dashboard do gerente
/admin/auditoria          → Auditoria
```

### Consequências

`BrowserRouter` fica no nível raiz, sem provider extra. Os três layouts (ClienteLayout, TotemLayout, AdminLayout) vivem cada um em sua sub-árvore de rotas — cada um com seu header, navegação e regras próprias. Lazy loading nas rotas de admin e totem usa `React.lazy` envolto em Suspense, então o cliente comum não baixa o bundle do Dashboard até precisar dele.

## ADR-07 — Estrutura de pastas (Atomic Design adaptado)

**Status:** Aceito

A primeira versão da estrutura tinha sub-pastas pesadas dentro de `features/` — `features/cardapio/components/Cards/Card.tsx`. Achatei pra `features/cardapio/types.ts` e `services/cardapioService.ts` quando ficou claro que o modelo perseguia abstração que não existia. A lição valeu o retrabalho: profundidade só justifica se mais de um arquivo realmente vive lá.

### Decisão

Combinação de **feature-based** no nível alto com **atomic design** dentro de `components/`.

```
src/
├── pages/              # Por contexto (cliente, totem, admin)
├── components/
│   ├── ui/             # shadcn (atoms básicos)
│   ├── atoms/          # Próprios atoms
│   ├── molecules/      # Composições simples
│   └── organisms/      # Composições complexas (Header, etc)
├── features/           # Lógica por feature
│   ├── cardapio/
│   ├── carrinho/
│   ├── pagamento/
│   ├── fidelidade/
│   └── lgpd/
├── mocks/
├── services/
├── stores/
├── hooks/
├── lib/
└── styles/
```

### Justificativa

A divisão deu certo na hora que o totem precisou de versão própria de algumas telas: os atoms (Badge, Button) reusam direto, mas as molecules ganharam variantes com touch targets maiores. Sem essa separação, esse código duplicaria entre cliente e totem. Bonus: o service de cupom (`validarCupom`) fica isolado em `services/`, então testar o algoritmo de validação não exige montar React em volta.

## ADR-08 — Persistência com namespacing

**Status:** Aceito

### Decisão

Todas as chaves do localStorage com prefixo `raizes_`. Cada feature tem sua própria chave, sem aninhamento de objetos grandes.

### Lista de chaves

| Chave | Conteúdo |
|---|---|
| `raizes_carrinho` | Array de itens do carrinho |
| `raizes_usuario` | Dados do usuário logado |
| `raizes_pedidos` | Array de pedidos do cliente |
| `raizes_unidade` | Unidade selecionada |
| `raizes_fidelidade` | Saldo de pontos e tier |
| `raizes_consentimentos` | Toggles LGPD |
| `raizes_pedidos_unidade` | Pedidos da unidade (KDS, dashboard) |
| `raizes_auditoria` | Log de operações sensíveis |

### Justificativa

A escolha de localStorage em vez de IndexedDB é deliberada. IndexedDB exige API assíncrona pra cada leitura, e o estado da aplicação inteira cabe em ~10kb de JSON. O overhead de Promise pra ler 5 chaves não compensa a granularidade que IndexedDB ofereceria.

A migração futura pra back-end fica direta — cada `localStorage.getItem('raizes_pedidos')` vira `fetch('/api/pedidos')`, com o cuidado de tratar loading e erro que hoje não existem. Não é refactor de UI; é refactor da fronteira entre store e service. Dá pra fazer store por store.

O prefixo `raizes_` adiciona 7 caracteres por chave. Custo aceitável pelo benefício de inspecionar todas as chaves do projeto via filtro no DevTools (Application → Storage → digitar "raizes" no campo de busca).

## ADR-09 — Comunicação entre abas via Storage Event

**Status:** Aceito

### Contexto

O estudo de caso pede que pedidos do cliente apareçam "em tempo real" no KDS da cozinha e nos contadores do dashboard. Implementar WebSocket ou Server-Sent Events exigiria back-end real, que está fora do escopo da trilha Front-end.

### Decisão

Usar `window.addEventListener('storage', ...)` pra sincronizar abas que compartilhem origem (mesmo domínio).

### Aplicação

O cliente confirma um pedido em `/pagamento` e a chave `raizes_pedidos` no localStorage é atualizada. O navegador dispara `storage` event em todas as outras abas abertas no mesmo domínio. O KDS em `/admin/kds` escuta esse evento e chama `useStorePedidos.persist.rehydrate()` pra puxar a versão nova; o Kanban re-renderiza sem refresh manual. Mesmo padrão funciona para o Dashboard quando os contadores precisam atualizar.

### Justificativa

API nativa do navegador, suportada em todos os browsers modernos sem polyfill. Suficiente pra demonstrar entendimento de estado distribuído num ambiente single-origin sem montar servidor de WebSocket.

Custo dessa decisão: a sincronização só funciona entre abas do mesmo navegador. Cliente no celular e cozinha no tablet ficam em dispositivos físicos diferentes — esse cenário não existe no protótipo. Em produção real, o storage event seria substituído por WebSocket (Socket.IO ou equivalente) ou Server-Sent Events conectando ao back-end, mantendo a estrutura dos handlers no client-side.

## ADR-10 — Deploy na Vercel

**Status:** Aceito

### Alternativas consideradas

Quatro plataformas viáveis pra esse caso: **Vercel**, **Netlify**, **GitHub Pages** e **Cloudflare Pages**. Todas entregam HTTPS, CDN global e nível gratuito que cobre o tráfego esperado do projeto acadêmico.

### Decisão

**Vercel** com integração GitHub.

### Justificativa

A Vercel ganhou por dois motivos práticos. Primeiro, deploy automático em push — commit feito, o resultado aparece em 30 segundos sem clicar em UI. Segundo, preview por branch — abrindo PR a Vercel cria URL temporária, útil pra comparar duas implementações lado a lado.

Os outros pontos (HTTPS, CDN, free tier) são commodity hoje em dia — qualquer plataforma decente entrega. Cogitei Cloudflare Pages, que tem free tier mais generoso pra build minutes, mas a integração com Vite estava menos polida em 2026. Em vez de gastar tempo configurando, fui no caminho menos atritado.

Detalhe que não pesou na decisão mas vale registrar: PWA exige HTTPS pra service worker funcionar; a Vercel entrega isso por padrão e cobre o requisito sem configuração extra.

Custo dessa decisão: vendor lock-in leve. Se a Vercel mudar política de free tier, migrar pra outro provedor é trabalho de uma tarde — editar GitHub Actions e reescrever `vercel.json`.

### Consequências

`vercel.json` com configuração de SPA fallback (rewrites de `/(.*)` pra `/`). Repositório público no GitHub é pré-requisito do free tier — nada de privatizar antes da entrega. URL pública compartilhada no PDF, e o deploy precisa permanecer ativo até a data oficial de correção (regra explícita do roteiro: link fora do ar zera o item de Entrega Técnica).

## ADR-11 — Declaração de uso de ferramentas assistivas

**Status:** Obrigatório

### Contexto

A versão original do roteiro proibia uso de ferramentas assistivas durante a produção do trabalho. A versão atualizada (validada com a coordenação em 2026-05) permite, condicionada a declaração formal e completa do uso ao final do documento.

### Decisão

Incluir no PDF final, em seção própria intitulada "Declaração de uso de ferramentas assistivas", o registro completo: ferramentas utilizadas (com nome e versão), finalidade de cada uso (rascunho de texto, revisão, geração de boilerplate de código, etc), exemplos de prompts representativos quando aplicável, e estimativa percentual do conteúdo final que tem origem direta em saída automatizada não modificada.

### Justificativa

Atender a regra atualizada do roteiro de forma transparente protege contra qualquer alegação posterior de plágio ou autoria atribuída indevidamente. Mais importante que isso: texto autoral revisado é sempre superior a saída automatizada não modificada — quando essa diferença é declarada e mostrada no produto final, o documento ganha credibilidade. Esconder uso seria pior tecnicamente e politicamente.

### Consequências

A declaração ocupa cerca de uma página no PDF final. Durante o desenvolvimento, mantive um processo de revisão dedicado pra garantir que mesmo trechos com origem em geração automatizada passassem por reescrita autoral antes de entrar no documento final. A declaração registra honestamente que ferramentas de apoio foram usadas, sem que isso comprometa o caráter autoral do trabalho.
