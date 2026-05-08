# Fluxos End-to-End — Raízes do Nordeste

Sete fluxos que cobrem os caminhos principais e alternativos do sistema. Servem de base para o **Diagrama da Jornada do Usuário** e para o **Plano de Testes**.

## Fluxo 1 — Cliente fazendo pedido pelo App (caminho feliz)

1. Cliente abre o app e cai na home com banner de promoção
2. App detecta localização (com consentimento prévio) e sugere unidade próxima
3. Cliente confirma unidade ou troca manualmente
4. Vê cardápio filtrado pelos produtos disponíveis na unidade selecionada
5. Aplica filtro "Café da manhã" e busca "tapioca"
6. Toca em "Tapioca de Carne de Sol" → vê detalhes → customiza (sem queijo) → adiciona 2 unidades ao carrinho
7. Adiciona "Suco de Caju" ao carrinho
8. Abre carrinho → vê subtotal R$ 38,00 → aplica cupom "FIDELIDADE10" → desconto R$ 3,80
9. Toca em "Continuar para pagamento"
10. Confirma unidade, escolhe "Retirada no balcão", confirma resumo
11. Seleciona "PIX" como método de pagamento
12. Tela de loading "Aguardando confirmação do pagamento..." (3-5s simulados)
13. Sistema externo retorna sucesso → app mostra "Pagamento aprovado"
14. Redirect para tela de acompanhamento com código #4521 e estimativa "Pronto em 12-15min"
15. Status atualiza progressivamente: Recebido → Em preparo → Pronto
16. Toast: "Seu pedido está pronto para retirada"
17. Cliente vai ao balcão, mostra código, retira → status muda para "Retirado"
18. Pontos de fidelidade são creditados automaticamente

## Fluxo 2 — Cliente no Totem (autoatendimento)

1. Tela ociosa com call-to-action "Toque para começar"
2. Pergunta: "Você é cadastrado? Digite seu CPF para acumular pontos" (Sim / Pular)
3. Cardápio visual com botões grandes, categorias na lateral
4. Adiciona produtos ao carrinho com UI simplificada
5. Revisa pedido na tela
6. Pagamento: instrução para inserir cartão na maquininha (simulado)
7. Tela de aguarde + sucesso
8. Imprime senha (simulado) com número do pedido
9. Volta para tela inicial após 10 segundos

## Fluxo 3 — Atendente registrando pedido no balcão (Web/PDV)

1. Login → seleciona unidade onde está
2. Abre tela "Novo pedido"
3. Pergunta CPF do cliente (opcional, para fidelidade)
4. Adiciona itens do cardápio (UI tipo grid + busca rápida por nome)
5. Confirma pedido → seleciona método de pagamento → simula confirmação
6. Pedido entra na fila da cozinha automaticamente

## Fluxo 4 — Cozinha gerenciando pedidos (Web/KDS)

1. Login da estação → seleciona unidade
2. Painel Kanban com 3 colunas (Recebido / Em preparo / Pronto)
3. Pedidos novos chegam na coluna "Recebido" com timestamp
4. Cozinheiro toca em "Iniciar preparo" → card move para "Em preparo"
5. Conforme avança, toca em "Pronto" → card move para "Pronto"
6. Pedidos parados há mais de X minutos ficam destacados em vermelho

## Fluxo 5 — Gerente analisando dashboard (Web)

1. Login → escolhe unidade ou matriz
2. Dashboard com cards: Vendas hoje, Ticket médio, Top 5 produtos, Pedidos ativos
3. Filtra por período (hoje, semana, mês)
4. Acessa aba "Auditoria" → vê lista de cancelamentos com motivo, autor, hora
5. Exporta CSV do dia

## Fluxo 6 — Cliente exercendo direitos LGPD

1. Acessa "Minha conta" → "Privacidade e Dados"
2. Vê tela com toggles granulares: marketing, geolocalização, perfil de consumo, fidelidade
3. Pode marcar/desmarcar cada um (revogar consentimento)
4. Acessa botões: "Exportar meus dados" (gera JSON com todos os dados) e "Excluir minha conta"
5. Excluir requer confirmação dupla com aviso claro de irreversibilidade
6. Exclusão limpa localStorage e redireciona para tela inicial

## Fluxo 7 — Tratamento de erro de pagamento

1. Cliente clica "Pagar"
2. Loading mostra "Processando..."
3. Após 30s sem resposta → mensagem "O pagamento está demorando mais que o esperado"
4. Opções: "Aguardar mais" / "Cancelar e tentar novamente"
5. Se gateway retorna erro: mensagem específica (saldo insuficiente, cartão recusado, etc) + sugestão de outra forma
6. Pedido **não é confirmado** sem pagamento — fica como "Pagamento pendente"
7. Cliente pode retomar do carrinho (não perde os itens)

## Estados do pedido (máquina de estados)

```
[Aguardando pagamento]
        ↓
   Pagamento OK?
   ↓ sim         ↓ não
[Recebido]    [Pagamento falhou]
   ↓                   ↓
[Em preparo]      Retry / cancelar
   ↓
[Pronto]
   ↓
[Retirado] ← (estado terminal)

Estados alternativos:
[Cancelado] ← pode ser acionado de Recebido ou Em preparo (com justificativa)
```

## Estados do pagamento simulado

| Estado | Trigger | UI |
|---|---|---|
| Idle | Antes de clicar "Pagar" | Botão habilitado |
| Aguardando | Após clique | Loading com spinner |
| Processando | Após 1-2s | Loading com mensagem "Confirmando com o banco" |
| Aprovado | Resposta sucesso | Tela de sucesso → redirect para acompanhamento |
| Recusado | Resposta de falha | Tela de erro com motivo + opções |
| Timeout | Sem resposta em 30s | Mensagem específica + retry |
| Erro de comunicação | Falha de rede simulada | Fallback com retry e contato |

## Persistência de estado entre sessões

| Dado | Storage | Motivo |
|---|---|---|
| Carrinho | `localStorage.raizes_carrinho` | Cliente fecha o navegador e volta sem perder itens |
| Pedidos do cliente | `localStorage.raizes_pedidos` | Histórico persistente |
| Sessão do usuário | `localStorage.raizes_usuario` | Login mantido entre sessões |
| Unidade selecionada | `localStorage.raizes_unidade` | Não pergunta toda hora |
| Pontos de fidelidade | `localStorage.raizes_fidelidade` | Saldo persistente |
| Consentimentos LGPD | `localStorage.raizes_consentimentos` | Estado granular por categoria |

## Comunicação entre abas (multi-aba)

Para simular sistema real onde cozinha vê pedido do cliente em tempo real:

```js
window.addEventListener('storage', (e) => {
  if (e.key === 'raizes_pedidos') atualizarKanban()
})
```

Usado em:
- Cliente faz pedido (aba 1) → KDS atualiza (aba 2) → Dashboard atualiza contador (aba 3)

Diferencial técnico que demonstra entendimento de estado distribuído sem precisar de WebSocket real.
