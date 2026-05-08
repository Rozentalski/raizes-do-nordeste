# Briefing Técnico — Raízes do Nordeste

## Visão geral do sistema

**Nome do produto:** Raízes do Nordeste — Plataforma Multicanal de Pedidos.

A entrega cobre três contextos com a mesma base de código: o cliente que pede pelo celular ou no desktop, o totem da loja, e a operação interna onde atendente, cozinha e gerente trabalham em paralelo. Tudo conectado pelo pedido — ele nasce em um canal e atravessa os outros até chegar no balcão.

A escolha caiu em PWA. O roteiro Front-end lista React, Angular e Vue como tecnologias permitidas, então React Native e Flutter ficaram fora antes da pergunta sequer surgir. Sobra a dúvida razoável: PWA conta como "aplicativo oficial" do estudo de caso? Conta — instala via "Adicionar à tela inicial", tem ícone próprio, abre offline em rotas já visitadas. Em troca, fica uma única base atendendo os três canais e o cardápio atualiza em tempo real sem passar por app store.

## Contexto de negócio

A Raízes do Nordeste é uma rede de lanchonetes nordestinas que começou como negócio familiar em Recife há seis anos, comandado por Dona Francisca e dois filhos. Hoje opera em diferentes capitais e cidades do interior do Brasil, oferecendo culinária regional (tapiocas, cuscuz, bolos, sucos, café da manhã) com identidade cultural forte.

Com a expansão veio um conjunto de problemas que o sistema atual — uma planilha compartilhada — não dá conta. Multicanalidade é o primeiro: o cliente pode pedir pelo app, retirar no balcão, ou usar o totem antes de sentar pra comer. Cada canal precisa ver o mesmo pedido e cada um produz dados que a matriz quer consolidar.

A variação entre unidades complica. Algumas operam com cozinha completa, outras com cardápio reduzido. Bolo junino aparece em junho e sai em julho. Receitas mudam por região (a tapioca de manteiga de Recife não é exatamente a mesma da Paraíba). Tudo isso reflete em cardápio dinâmico no JSON de mock.

Soma-se LGPD obrigatória no programa de fidelidade, integração com gateway de pagamento externo (sistema não processa, só solicita) e a expectativa implícita de aguentar pico de almoço entre 11h30 e 13h30 sem cair.

## Atores e personas

| Ator | Canal principal | Objetivo |
|---|---|---|
| Cliente | App, Totem, Web | Pedir comida com rapidez, acumular pontos, pagar |
| Atendente | Web (PDV) | Lançar pedido de balcão, suporte ao cliente |
| Cozinha | Web (KDS) | Receber pedidos, atualizar status de preparo |
| Gerente/Administrador | Web (Dashboard) | Ver relatórios, auditoria, gestão de cardápio/estoque local |
| Sistema de Pagamento Externo | API (integração) | Processar pagamento, retornar status |

Dois atores secundários aparecem implícitos no estudo de caso e cabem aqui pra completar o cenário:

- **Matriz/Franqueadora** — vê dados consolidados de todas as unidades. Não tem tela própria nesse escopo (rolaria pra um v2), mas o namespacing do localStorage com prefixo `raizes_` já prevê o caso multi-tenant.
- **Cliente não cadastrado** — visitante que vê cardápio mas não pede. Login só é exigido pra fechar pedido.

## Canais e contextos de uso

### App (mobile, 360-414px)

Uso individual, casual, fora da loja. Cliente pede antecipado, consulta saldo de pontos, vê promoções no caminho. Login obrigatório só pra fechar pedido — cardápio é livre. Foco mobile-first; o layout responde a partir de 360px sem quebrar.

### Totem (touchscreen vertical, 1080×1920)

Operação na loja. Sem login obrigatório, fluxo enxuto, alvos de toque ≥ 60px. Cliente pode digitar CPF pra acumular pontos no programa Raízes, mas pode pular essa etapa.

O totem volta pra tela ociosa após 30 segundos sem interação — testei valores menores e o cliente que estava só lendo o cardápio se irritava com o reset.

### Web (desktop, 1280px+)

Dois usos coexistem no mesmo canal. O cliente acessa o cardápio antes de ir à loja, gerencia conta e histórico. A operação interna (atendente, cozinha, gerente) entra em área restrita com login dedicado. As duas trilhas vivem em layouts próprios — a do cliente reaproveita o mesmo header do mobile; a do admin tem sidebar fixa de 240px.

## Decisões de arquitetura

### 1. PWA em vez de app nativo

Já mencionei na visão geral, vale registrar formal aqui. Cheguei em PWA por exclusão da lista de tecnologias permitidas pelo roteiro. Não é segunda escolha — entrega instalação na home, ícone próprio e cache-first em rotas visitadas. Em produção real, PWA continuaria sendo a aposta pra esse caso (rede regional com 5 unidades). Se a Raízes virasse 50 unidades, uma reavaliação a favor de React Native faria sentido pra ganhar push notification confiável.

### 2. Mock data em vez de back-end real

O roteiro autoriza "dados mockados (Mock Data) para simular o cardápio e interações". Combinado com o estudo de caso definindo pagamento como integração externa, sobra a camada de interface — que é o escopo da trilha.

A implementação ficou assim: JSON estático em `src/mocks/` para dados imutáveis (cardápio, unidades, recompensas), `localStorage` prefixado com `raizes_` para estado mutável (carrinho, pedidos, sessão, fidelidade). Os services em `src/services/` envolvem tudo com `setTimeout` de 300-1500ms pra latência soar real, e o gateway de pagamento simulado responde com aprovado, recusado, erro ou timeout conforme o número do cartão informado.

Custo dessa decisão: a aplicação só "lembra" de pedidos no mesmo browser. Demonstração entre dispositivos físicos não funciona. Fica no PDF como limitação documentada.

### 3. Atomic Design para componentes

A combinação de feature-based no nível alto com atomic design dentro de `components/` reaproveita peças entre os três contextos sem duplicação. O `Carrossel` que monto pra Home reaparece no Dashboard com o mesmo código. O `LGPDConsents` aparece em duas telas. Sem essa separação, eu duplicaria.

### 4. Zustand em vez de Redux

Estado global aqui é pequeno: carrinho, sessão, unidade, fidelidade, consentimentos. Redux entrega DevTools melhores e middleware time-travel — recursos que não usaria nesse escopo. Zustand resolve com 1/10 do boilerplate e bundle de ~1KB. Se o projeto crescer pra dezenas de stores ou aparecer cache complexo de servidor, vale reavaliar.

### 5. localStorage com namespacing

Chaves prefixadas com `raizes_` (`raizes_carrinho`, `raizes_pedidos`, e assim por diante). Aprendi a fazer isso depois de um projeto antigo conflitar com extensão do navegador que usava chave genérica `cart`. Os 7 caracteres extras valem o seguro. Migrar pra back-end depois é trocar cada `localStorage.getItem('raizes_pedidos')` por `fetch('/api/pedidos')` e tratar loading/erro — store por store, sem refactor de UI.

Exemplo:
```
raizes_carrinho       → array de itens
raizes_pedidos        → array de pedidos do usuário
raizes_usuario        → dados do usuário logado
raizes_fidelidade     → saldo de pontos e tier
raizes_consentimentos → toggles LGPD
```

## Pontos sensíveis do estudo de caso

### Multicanalidade não é opcional

"Multicanal" não é só ter três telas — é o pedido sair de um canal e entrar em outro sem o cliente notar. Quando ele pede pelo app e chega na loja, o atendente acha o pedido pelo número exibido na tela. O totem credita pontos no mesmo CPF que o cliente cadastrou no app. O KDS da cozinha vê os três canais misturados, sem precisar saber qual veio de onde — o que importa é o tempo de preparo.

### Variação entre unidades

Não se assume que "Unidade A = Unidade B". Algumas operam com cozinha completa, outras só com cardápio reduzido. Bolo junino só existe em junho. Receitas regionais variam. Está implementado em `src/mocks/unidades.json`: cinco unidades fictícias (U01 a U05), com U04 e U05 reduzidas e U05 sem juninos. O service `getCardapioPorUnidade` filtra produtos pela unidade selecionada antes de devolver pra UI.

### LGPD como princípio, não checklist

Citação direta do estudo: *"Conhecer o cliente é importante, mas respeitar sua privacidade é obrigatório."*

Implementei LGPD em quatro pontos visíveis da interface, não numa página esquecida no menu. O cookie banner aparece na primeira visita e some depois da escolha — não vira nag wall. O cadastro separa três checkboxes: termos (obrigatório), marketing e análise de perfil. Antes de pedir geolocalização, abre modal explicando o porquê. E a tela "Privacidade e Dados" em `/conta/privacidade` reúne os toggles granulares, exportação de dados em JSON via Blob, exclusão de conta com confirmação dupla (a segunda exige digitar EXCLUIR pra confirmar), e link para Política e Termos.

Footer permanente com os três links no rodapé fecha a malha — em qualquer página, o usuário tem um caminho de no máximo dois cliques pra qualquer recurso de privacidade.

### Pagamento desacoplado

Sistema solicita pagamento, recebe confirmação ou negativa, registra resultado, atualiza status do pedido. Processamento é externo — citação literal do estudo de caso. A simulação cobre cinco estados: aguardando (loading), aprovado (redireciona pra acompanhamento), recusado (mostra motivo e sugere retry), erro de comunicação (fallback com retry e contato), e timeout em 30 segundos com mensagem específica.

Cartões de teste 4000…0002 e 4000…0119 forçam recusado e erro determinísticos. PIX sempre aprova. O resto roda em 90/10.

### Alta disponibilidade implícita

Sistema não pode falhar em pico — almoço entre 11h30 e 13h30 é o crítico nas unidades de Recife. No frontend, isso vira foco em performance (lazy loading das rotas pesadas, code split do Recharts pra fora do critical path, cache via service worker) e tratamento visível de erros. Em produção real, alta disponibilidade vira responsabilidade do back-end e do CDN; meu papel aqui é não ser o gargalo.

## Diretriz central

Duas citações do estudo de caso orientam todas as decisões técnicas registradas aqui.

A primeira estabelece o tom:

> "Não queremos apenas código. Queremos entendimento do negócio, decisões bem fundamentadas e uma solução que faça sentido como sistema."

A segunda é a pergunta-âncora que aparece três vezes nos documentos oficiais:

> "Se este trabalho fosse apresentado em uma empresa júnior, em um estágio ou em uma entrevista técnica, ele se sustentaria?"

Foi com essa pergunta na cabeça que cada wireframe, requisito, caso de uso e cenário de teste foi registrado com o "porquê" explícito.
