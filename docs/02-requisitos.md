# Requisitos — Raízes do Nordeste

## Requisitos Funcionais (RF)

### Cliente

| ID | Requisito | Descrição | Prioridade |
|---|---|---|---|
| RF01 | Cadastro e autenticação | Cadastro com nome, e-mail, telefone, CPF (opcional), data de nascimento e senha. Login por e-mail/senha. Recuperação de senha por e-mail. Aceite explícito de termos e LGPD. | Alta |
| RF02 | Seleção de unidade | Detecção automática por geolocalização (com consentimento) ou seleção manual por CEP/cidade. Persistência da unidade na sessão. | Alta |
| RF03 | Visualização de cardápio dinâmico | Cardápio reflete produtos disponíveis na unidade específica. Categorização, filtros (vegetariano, sem glúten, faixa de preço), busca por nome, indicação visual de produtos sazonais. | Alta |
| RF04 | Detalhe do produto | Imagem, descrição, preço, ingredientes, alergênicos, customizações disponíveis e adição ao carrinho com quantidade. | Alta |
| RF05 | Carrinho de compras | Visualização de itens, edição de quantidade, remoção, aplicação de cupom, resumo (subtotal + desconto + total). Persistência via localStorage. | Alta |
| RF06 | Checkout | Confirmação de unidade, escolha entre retirada no balcão ou consumo no local, resumo final, seleção de forma de pagamento. | Alta |
| RF07 | Solicitação de pagamento | Integração simulada com gateway externo. Estados: aguardando, processando, aprovado, recusado, erro. Métodos: PIX, crédito, débito, vale-refeição. | Alta |
| RF08 | Acompanhamento do pedido | Status visíveis (Recebido → Em preparo → Pronto → Retirado), código identificador, estimativa de tempo, notificação visual quando pronto. | Alta |
| RF09 | Programa de fidelidade | Acúmulo automático de pontos (1 ponto por R$ 1), saldo, resgate de recompensas, histórico, tier (Bronze/Prata/Ouro) por frequência. | Alta |
| RF10 | Promoções e campanhas | Banner na home, cupons aplicáveis, campanhas segmentadas por perfil, promoções sazonais com data de validade. | Média |
| RF11 | Histórico de pedidos | Lista de pedidos anteriores com status, data, total, detalhes individuais e opção "pedir de novo". | Média |
| RF12 | Gestão de conta e LGPD | Editar dados, gerenciar consentimentos granulares (marketing, geolocalização, análise de perfil), exportar dados, excluir conta, visualizar política. | Alta |

### Atendente (Web — PDV)

| ID | Requisito | Descrição | Prioridade |
|---|---|---|---|
| RF13 | Lançar pedido manual | Atendente registra pedido feito no balcão, vinculando ao CPF do cliente (opcional, para fidelidade). | Alta |
| RF14 | Consultar pedidos da unidade | Fila de pedidos ativos com filtros por status. | Alta |
| RF15 | Suporte ao cliente | Buscar pedido pelo número, alterar status, lidar com cancelamento (com justificativa para auditoria). | Média |

### Cozinha (Web — KDS)

| ID | Requisito | Descrição | Prioridade |
|---|---|---|---|
| RF16 | Painel Kanban de pedidos | Colunas: Recebido / Em preparo / Pronto. Atualização em tempo real via localStorage events. | Alta |
| RF17 | Atualizar status de preparo | Drag-and-drop ou botão de avanço entre colunas. | Alta |
| RF18 | Visualizar detalhes do pedido | Itens, customizações, observações destacadas. | Alta |
| RF19 | Sinalização visual de prioridade | Pedidos atrasados (acima do SLA) destacados em vermelho. | Média |

### Gerente/Administrador (Web — Dashboard)

| ID | Requisito | Descrição | Prioridade |
|---|---|---|---|
| RF20 | Dashboard de vendas | Vendas do dia, ticket médio, pedidos ativos, top produtos. Filtros por período. | Alta |
| RF21 | Gestão de cardápio local | Ativar/desativar produtos disponíveis na unidade. | Média |
| RF22 | Gestão de estoque | Controle de itens críticos com alertas. | Média |
| RF23 | Auditoria | Log de cancelamentos, descontos manuais, ajustes — com autor, hora e motivo. | Alta |
| RF24 | Relatórios | Exportação de dados de vendas em CSV/PDF. | Média |
| RF25 | Gestão de equipe | Visualização de cadastro de atendentes e cozinheiros ativos. | Baixa |

## Requisitos Não-Funcionais (RNF)

| ID | Categoria | Requisito | Métrica/Critério |
|---|---|---|---|
| RNF01 | Usabilidade | Mobile-first, design responsivo | Funciona em 320px-1920px sem quebra de layout |
| RNF02 | Performance | Carregamento rápido | First Contentful Paint < 1.5s, Time to Interactive < 3s em 3G simulado |
| RNF03 | Acessibilidade | WCAG 2.1 AA | Contraste mínimo 4.5:1, navegação por teclado, ARIA labels, screen reader compatível |
| RNF04 | Disponibilidade | Alta disponibilidade em pico | 99.5% uptime (depende do deploy) |
| RNF05 | Escalabilidade | Suporta crescimento da rede | Arquitetura permite adicionar unidades sem refactor estrutural |
| RNF06 | Segurança | Proteção contra ataques comuns | HTTPS obrigatório, sanitização de inputs, proteção XSS, sem secrets no front |
| RNF07 | LGPD | Conformidade legal | Consentimento granular, anonimização de logs, auditoria de acessos, direito ao esquecimento |
| RNF08 | Compatibilidade | Navegadores modernos | Chrome, Firefox, Safari, Edge (últimas 2 versões) |
| RNF09 | Internacionalização | Preparado para multi-idioma | PT-BR padrão, código estruturado para futura adição de i18n |
| RNF10 | Manutenibilidade | Código sustentável | Componentes reutilizáveis, design system documentado, TypeScript estrito |
| RNF11 | Observabilidade | Erros visíveis e rastreáveis | Tratamento centralizado de erros, log no console em dev, fallback UI em prod |
| RNF12 | PWA | Experiência de app instalável | Manifest, service worker, ícones, instalável via "Add to Home Screen" |

## Mapeamento requisitos × estudo de caso

Cada requisito está ancorado em uma seção do estudo de caso ou roteiro. Isso é o que diferencia uma análise **Boa** de uma análise **Excelente** (visão sistêmica com justificativas).

| Requisito | Seção do estudo de caso |
|---|---|
| RF01-RF02, RNF07 | Seção 4 (Fidelização e LGPD) |
| RF03, RF04 | Seção 2 (Múltiplos canais) e Seção 3 (Variação entre unidades) |
| RF07 | Seção 5 (Pagamentos desacoplados) |
| RF08, RF16-RF19 | Seção 2 (Acompanhar status) |
| RF09, RF10 | Seção 4 (Programa de fidelização) |
| RF20-RF25 | Seção 3 (Operação interna e gestão da franquia) |
| RNF01 | Roteiro Front-end (Mobile-first obrigatório) |
| RNF04, RNF05 | Seção 6 (Alta disponibilidade) |
| RNF12 | Seção 2 (Aplicativo oficial) — interpretação técnica como PWA |
