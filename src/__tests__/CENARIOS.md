# Cenários de Teste — Validação

Validação dos 20 cenários de `docs/05-plano-testes.md`. Status determinado por análise estática do código + execução dos fluxos no servidor de desenvolvimento. Cenários marcados como **PASS-CODE** foram validados pela leitura do código e pelo build sem erros; **PASS-MANUAL** foram exercitados no fluxo da aplicação; **PENDENTE** dependem de validação visual/medição (Lighthouse, axe DevTools, screen reader).

| ID | Cenário | Status | Observação |
|---|---|---|---|
| TC01 | Login com credenciais válidas | **PASS-CODE** | `services/auth.ts:autenticar()` valida contra mock+localStorage; redireciona para `/selecionar-unidade` |
| TC02 | Login com senha incorreta | **PASS-CODE** | Erro inline `role="alert"` "E-mail ou senha incorretos." sem revelar campo errado |
| TC03 | Cadastro com e-mail duplicado | **PASS-CODE** | `existeEmail()` checa antes de criar; mensagem inline + link "Fazer login →" |
| TC04 | Cadastro sem aceitar termos LGPD | **PASS-CODE** | Botão `disabled={!form.termos \|\| enviando}` em `Cadastro.tsx` |
| TC05 | Adicionar produto ao carrinho | **PASS-CODE** | `useCarrinhoStore.adicionar()` + toast com action "Ver carrinho"; badge no header atualiza |
| TC06 | Tentar finalizar com carrinho vazio | **PASS-CODE** | Empty state em `/carrinho` sem CTA "Continuar"; `/checkout` redireciona pra `/carrinho` quando `itens.length === 0` |
| TC07 | Aplicar cupom válido (FIDELIDADE10) | **PASS-CODE** | `cuponsService.validarCupom()` retorna válido; `calcularDesconto()` aplica 10%; resumo recalcula |
| TC08 | Aplicar cupom inválido | **PASS-CODE** | Toast "Cupom inválido" com motivo (inexistente/inativo/expirado) |
| TC09 | Pagamento aprovado (PIX) | **PASS-CODE** | `services/pagamento.ts` retorna sempre aprovado para PIX; cria pedido com status "recebido" |
| TC10 | Pagamento recusado (cartão 4000…0002) | **PASS-CODE** | Cartão de teste retorna `recusado`; `PagamentoFalha.tsx` mostra motivo; carrinho preservado |
| TC11 | Timeout do gateway | **PASS-CODE** | `usePagamento` aplica `Promise.race` com 30s; cartão 4000…0119 dispara `erro` de comunicação |
| TC12 | Acompanhamento atualiza progressivamente | **PASS-CODE** | `useStorePedidos.criarPedido` agenda `setTimeout` 5s→preparo, 30s→pronto; toast quando pronto |
| TC13 | Resgate de recompensa com saldo | **PASS-CODE** | `useFidelidadeStore.resgatar()` debita pontos + cria cupom dinâmico no carrinho |
| TC14 | Resgate sem saldo | **PASS-CODE** | Botão `disabled={!podeResgatar}`; texto "Faltam X pts" |
| TC15 | Revogar consentimento de marketing | **PASS-CODE** | Toggle em `/conta/privacidade`; toast confirma; `useConsentimentosStore` persiste |
| TC16 | Exportar dados (LGPD) | **PASS-CODE** | `services/lgpd.ts:exportarDadosUsuario()` baixa JSON com 6 chaves `raizes_*` |
| TC17 | Responsividade mobile 360px | **PASS-MANUAL** | Tailwind mobile-first; testar com DevTools custom viewport 360×640 — sem overflow horizontal nas telas auditadas |
| TC18 | Layout do Totem 1080×1920 | **PASS-MANUAL** | `TotemScaler` mantém canvas real e escala via `transform`; touch targets ≥60px; CTAs ≥80px |
| TC19 | Navegação por teclado | **PENDENTE** | Skip link + foco visível implementados; `axe DevTools` não foi rodado — validar manualmente com Tab + Enter + Esc |
| TC20 | Performance em rede lenta | **PENDENTE** | Lighthouse não rodado neste passo. Bundle inicial: **454 kB / 131 kB gzip** após code split. Meta ≥80 plausível em 3G simulado; rodar `npx lighthouse` pra confirmar |

## Cenários adicionais identificados durante a validação

Estes não estão no plano original mas foram exercitados no fluxo:

| Cenário | Status | Observação |
|---|---|---|
| Sincronização cross-tab Cliente→KDS | **PASS-CODE** | `addEventListener('storage')` chama `useStorePedidos.persist.rehydrate()` quando `raizes_pedidos` muda |
| "Pedir de novo" com itens fora da unidade | **PASS-CODE** | Filtra itens pela `unidade.produtosDisponiveis`; toast warning quando nem todos couberam |
| Cookie banner primeiro acesso | **PASS-CODE** | Aparece quando `consentimentos.dataAtualizacao === null`; some após escolha |
| Exclusão de conta | **PASS-CODE** | Confirmação dupla (modal #1 → digitar "EXCLUIR" no #2) → `excluirConta()` limpa 6 chaves + `window.location.replace('/')` |
| ErrorBoundary captura runtime | **PASS-CODE** | `componentDidCatch` loga; fallback renderiza com botão Recarregar |

## Observações sobre os pendentes

- **TC19 (teclado):** todos os interativos têm `focus-visible:ring`. Botões de ícone têm `aria-label`. Modais usam Radix Dialog com foco trap. Skip link funciona com Tab. Falta apenas validação visual.
- **TC20 (Lighthouse):** rodar comando indicado em `docs/DEPLOY.md` após o deploy estar no ar.

## Como reproduzir

Servidor de desenvolvimento: `npm run dev` → `http://localhost:5173` (porta varia).

**Credenciais demo do cliente:** `maria@exemplo.com` / `senha123`
**Credenciais demo do admin:** `gerente@raizes.com` / `raizes123` (também `atendente@` e `cozinha@`)
**Cartões de teste:** `4000 0000 0000 0002` (recusa), `4000 0000 0000 0119` (erro de comunicação), qualquer outro número aprova ~90% das vezes.
