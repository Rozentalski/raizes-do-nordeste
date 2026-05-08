# Plano de Testes — Raízes do Nordeste

## Estratégia geral

A validação combina **testes manuais de usabilidade** com **cenários funcionais documentados**. O foco é garantir que os fluxos críticos do sistema funcionam como esperado, que a interface é responsiva nos três contextos (App, Totem, Web Desktop) e que os requisitos de privacidade (LGPD) e qualidade estão atendidos.

O roteiro Front-end exige **mínimo de 10 cenários** com entradas, saídas esperadas, validações e mensagens de erro. Este plano entrega 20 cenários cobrindo positivos, negativos e casos especiais.

## Categorias de teste

| Categoria | Cenários | Foco |
|---|---|---|
| Autenticação | TC01-TC04 | Cadastro, login, recuperação, LGPD obrigatório |
| Carrinho e Cardápio | TC05-TC08 | Adição, remoção, cupons, persistência |
| Pagamento | TC09-TC11 | Sucesso, falha, timeout |
| Acompanhamento e Fidelidade | TC12-TC14 | Status, resgate de recompensas |
| LGPD e Privacidade | TC15-TC16 | Revogação, exportação, exclusão |
| Responsividade e Acessibilidade | TC17-TC19 | Mobile, Totem, teclado |
| Performance | TC20 | Carregamento em rede lenta |

## Cenários de teste

### TC01 — Login com credenciais válidas (positivo)

| Campo | Valor |
|---|---|
| **Pré-condição** | Usuário cadastrado no sistema |
| **Entrada** | E-mail correto + senha correta |
| **Passos** | 1. Abrir tela de login. 2. Preencher campos. 3. Clicar em "Entrar". |
| **Saída esperada** | Redireciona para home autenticada. localStorage `raizes_usuario` preenchido. |
| **Critério de aceite** | Sessão ativa, nome do usuário visível no header. |

### TC02 — Login com senha incorreta (negativo)

| Campo | Valor |
|---|---|
| **Pré-condição** | Usuário cadastrado |
| **Entrada** | E-mail correto + senha errada |
| **Passos** | 1. Tela de login. 2. Preencher e submeter. |
| **Saída esperada** | Mensagem genérica "Credenciais inválidas" sem revelar qual campo está errado (segurança). |
| **Critério de aceite** | Permanece na tela de login. Sem redirecionamento. |

### TC03 — Cadastro com e-mail já existente (negativo)

| Campo | Valor |
|---|---|
| **Pré-condição** | Existir usuário com aquele e-mail |
| **Entrada** | E-mail duplicado em formulário válido |
| **Passos** | 1. Tela de cadastro. 2. Preencher tudo. 3. Submeter. |
| **Saída esperada** | Mensagem "E-mail já cadastrado" com link "Fazer login". |
| **Critério de aceite** | Não cria novo registro. Não redireciona. |

### TC04 — Cadastro sem aceitar termos LGPD (negativo)

| Campo | Valor |
|---|---|
| **Pré-condição** | — |
| **Entrada** | Formulário válido com checkbox de termos desmarcado |
| **Passos** | 1. Tela de cadastro. 2. Preencher tudo, deixar termos desmarcado. |
| **Saída esperada** | Botão "Cadastrar" desabilitado + mensagem inline "Aceite os termos para continuar". |
| **Critério de aceite** | Conformidade LGPD: cadastro só prossegue com consentimento explícito. |

### TC05 — Adicionar produto ao carrinho (positivo)

| Campo | Valor |
|---|---|
| **Pré-condição** | Cardápio carregado, produto disponível na unidade |
| **Entrada** | Toque em "+" do produto |
| **Passos** | 1. Cardápio. 2. Tocar em produto. 3. Adicionar. |
| **Saída esperada** | Item adicionado ao carrinho. Badge do header atualiza com nova quantidade. Toast confirmando. |
| **Critério de aceite** | localStorage `raizes_carrinho` contém o item. |

### TC06 — Tentar finalizar com carrinho vazio (negativo)

| Campo | Valor |
|---|---|
| **Pré-condição** | Carrinho vazio |
| **Entrada** | Clique no botão de checkout |
| **Passos** | 1. Acessar carrinho vazio. 2. Tentar avançar. |
| **Saída esperada** | Mensagem "Adicione itens ao carrinho para continuar". CTA desabilitado. |
| **Critério de aceite** | Não permite checkout sem itens. |

### TC07 — Aplicar cupom válido (positivo)

| Campo | Valor |
|---|---|
| **Pré-condição** | Carrinho com itens, cupom "FIDELIDADE10" ativo |
| **Entrada** | Código FIDELIDADE10 |
| **Passos** | 1. Carrinho. 2. Expandir cupom. 3. Inserir código. 4. Aplicar. |
| **Saída esperada** | Desconto de 10% aplicado. Total recalculado. Linha "Desconto: -R$ X,XX" visível. |
| **Critério de aceite** | Total final = subtotal - desconto. |

### TC08 — Aplicar cupom inválido (negativo)

| Campo | Valor |
|---|---|
| **Pré-condição** | Carrinho com itens |
| **Entrada** | Código inexistente "ABC123" |
| **Passos** | 1. Carrinho. 2. Inserir código inválido. 3. Aplicar. |
| **Saída esperada** | Mensagem "Cupom inválido ou expirado". Total não muda. |
| **Critério de aceite** | Sistema rejeita graciosamente. |

### TC09 — Pagamento aprovado (positivo)

| Campo | Valor |
|---|---|
| **Pré-condição** | Checkout completo, método PIX selecionado |
| **Entrada** | Confirmação de pagamento simulado |
| **Passos** | 1. Checkout. 2. Selecionar PIX. 3. Confirmar. |
| **Saída esperada** | Loading 2-3s → tela de sucesso → redirect para acompanhamento com código do pedido. |
| **Critério de aceite** | Pedido criado em `raizes_pedidos` com status "Recebido". |

### TC10 — Pagamento recusado (negativo)

| Campo | Valor |
|---|---|
| **Pré-condição** | Checkout completo |
| **Entrada** | Cartão de teste com saldo insuficiente (mock retorna "recusado") |
| **Passos** | 1. Selecionar cartão de crédito. 2. Confirmar. |
| **Saída esperada** | Mensagem específica "Pagamento recusado: saldo insuficiente" + botão "Tentar outra forma". |
| **Critério de aceite** | Pedido NÃO é criado. Carrinho mantido. |

### TC11 — Timeout do gateway (negativo)

| Campo | Valor |
|---|---|
| **Pré-condição** | Mock simulando demora |
| **Entrada** | Tempo de resposta > 30s |
| **Passos** | 1. Iniciar pagamento. 2. Aguardar timeout. |
| **Saída esperada** | Mensagem "O pagamento está demorando mais que o esperado" + opções "Aguardar mais" / "Cancelar". |
| **Critério de aceite** | Sistema não trava. Cliente tem opção clara. |

### TC12 — Acompanhamento atualiza progressivamente (positivo)

| Campo | Valor |
|---|---|
| **Pré-condição** | Pedido criado |
| **Entrada** | Tempo passando |
| **Passos** | 1. Tela de acompanhamento. 2. Aguardar transições simuladas. |
| **Saída esperada** | Status muda automaticamente: Recebido → Em preparo (após N segundos) → Pronto. |
| **Critério de aceite** | UI reflete cada estado com badge correta. |

### TC13 — Resgate de recompensa com saldo (positivo)

| Campo | Valor |
|---|---|
| **Pré-condição** | Saldo de fidelidade ≥ custo da recompensa |
| **Entrada** | Toque em "Resgatar" |
| **Passos** | 1. Tela fidelidade. 2. Escolher recompensa. 3. Resgatar. |
| **Saída esperada** | Pontos descontados. Cupom gerado e disponível no carrinho. Confirmação visual. |
| **Critério de aceite** | localStorage `raizes_fidelidade` atualizado. |

### TC14 — Resgate sem saldo (negativo)

| Campo | Valor |
|---|---|
| **Pré-condição** | Saldo insuficiente |
| **Entrada** | Tentativa de resgate |
| **Passos** | 1. Tela fidelidade. 2. Tocar em recompensa cara. |
| **Saída esperada** | Botão "Resgatar" desabilitado + tooltip "Faltam X pontos". |
| **Critério de aceite** | Sistema previne resgate inválido. |

### TC15 — Revogar consentimento de marketing (LGPD)

| Campo | Valor |
|---|---|
| **Pré-condição** | Usuário com consentimento ativo |
| **Entrada** | Toggle em "Privacidade e Dados" |
| **Passos** | 1. Minha conta. 2. Privacidade. 3. Desligar toggle de marketing. |
| **Saída esperada** | Toast "Preferência atualizada". Estado persiste em `raizes_consentimentos`. |
| **Critério de aceite** | Conformidade LGPD: revogação granular efetiva. |

### TC16 — Solicitar exportação de dados (LGPD)

| Campo | Valor |
|---|---|
| **Pré-condição** | Usuário autenticado |
| **Entrada** | Clique em "Exportar meus dados" |
| **Passos** | 1. Privacidade. 2. Exportar dados. |
| **Saída esperada** | Download de arquivo JSON contendo perfil, pedidos, fidelidade, consentimentos. |
| **Critério de aceite** | Conformidade LGPD Art. 18 (direito de portabilidade). |

### TC17 — Responsividade mobile 360px

| Campo | Valor |
|---|---|
| **Pré-condição** | DevTools aberto, viewport 360x640 |
| **Entrada** | Navegação por todas as telas principais |
| **Passos** | 1. Resize viewport. 2. Percorrer 5+ telas. |
| **Saída esperada** | Layout adapta sem scroll horizontal. Componentes empilham. Touch targets ≥ 44px. |
| **Critério de aceite** | Nenhum overflow lateral em qualquer tela. |

### TC18 — Layout do Totem 1080x1920

| Campo | Valor |
|---|---|
| **Pré-condição** | Rota /totem |
| **Entrada** | Viewport vertical 1080x1920 |
| **Passos** | 1. Acessar tela de totem. 2. Validar dimensões dos elementos. |
| **Saída esperada** | Botões grandes (≥60px), navegação vertical, contraste alto, tipografia ampliada. |
| **Critério de aceite** | Usável a 50cm de distância. |

### TC19 — Navegação por teclado (acessibilidade)

| Campo | Valor |
|---|---|
| **Pré-condição** | Qualquer tela do app |
| **Entrada** | Tecla Tab |
| **Passos** | 1. Foco no body. 2. Tab pelos elementos. |
| **Saída esperada** | Foco visível em cada interativo. Ordem lógica de navegação. Enter ativa. Esc fecha modais. |
| **Critério de aceite** | Conformidade WCAG 2.1 AA — Operável. |

### TC20 — Performance em rede lenta

| Campo | Valor |
|---|---|
| **Pré-condição** | DevTools com throttle "Slow 3G" |
| **Entrada** | Acesso à home pela primeira vez |
| **Passos** | 1. Habilitar throttle. 2. Hard refresh. 3. Medir métricas. |
| **Saída esperada** | First Contentful Paint < 3s. Skeleton screens durante carregamento. PWA instalável. |
| **Critério de aceite** | Lighthouse Performance ≥ 80. |

## Matriz de cobertura

| Requisito | Cenários que cobrem |
|---|---|
| RF01 (Cadastro) | TC03, TC04 |
| RF02-RF06 (Cardápio + Carrinho) | TC05-TC08 |
| RF07 (Pagamento) | TC09-TC11 |
| RF08 (Acompanhamento) | TC12 |
| RF09 (Fidelidade) | TC13, TC14 |
| RF12 (LGPD) | TC04, TC15, TC16 |
| RNF01 (Responsividade) | TC17, TC18 |
| RNF02 (Performance) | TC20 |
| RNF03 (Acessibilidade) | TC19 |
| RNF07 (LGPD) | TC04, TC15, TC16 |

## Ferramentas de validação

| Ferramenta | Uso |
|---|---|
| **Chrome DevTools** | Throttle de rede, viewport responsivo, audit Lighthouse |
| **Lighthouse** | Performance, Acessibilidade, PWA, SEO |
| **WAVE / axe DevTools** | Auditoria de acessibilidade automatizada |
| **Teste manual** | Fluxos completos em dispositivo real (mobile + desktop) |
