# Guia de Deploy + Validações Finais

Este documento lista o passo a passo pra colocar o projeto no ar e rodar as auditorias finais antes da entrega.

## 1. Repositório no GitHub

```bash
# Já dentro do diretório raizes-do-nordeste-pmd

git init
git add .
git commit -m "feat: implementação inicial do projeto Raízes do Nordeste"

# Crie o repositório vazio em https://github.com/new (público)
# Sugestão de nome: raizes-do-nordeste-pmd

# Substitua SEU_USUARIO pelo seu username do GitHub
git remote add origin https://github.com/SEU_USUARIO/raizes-do-nordeste-pmd.git
git branch -M main
git push -u origin main
```

Ou via GitHub CLI (precisa estar autenticado: `gh auth login`):

```bash
gh repo create raizes-do-nordeste-pmd --public --source=. --remote=origin --push
```

## 2. Deploy na Vercel

### Opção A — CLI (mais rápido)

```bash
# Instala a CLI globalmente (uma vez só)
npm i -g vercel

# Loga
vercel login

# Deploy de produção
vercel --prod
```

A CLI vai perguntar:
- **Setup and deploy?** → Y
- **Scope** → sua conta pessoal
- **Link to existing project?** → N
- **Project name** → `raizes-do-nordeste-pmd` (ou outro)
- **Directory** → `./` (pressione Enter)
- **Build command** → deixe o detectado (`npm run build`)
- **Output directory** → `dist`

No fim a CLI imprime a URL pública. **Cole essa URL no README.md** (no topo, em "🌐 Deploy") e faça commit/push de novo.

### Opção B — Dashboard

1. Entre em https://vercel.com → **New Project**
2. Importe o repositório do GitHub
3. Framework Preset: **Vite** (deve ser detectado)
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Clique **Deploy**

A cada push no `main`, a Vercel faz deploy automático. Pull Requests geram preview URLs.

## 3. Validações pós-deploy

Substitua `URL_PUBLICA` pela URL que a Vercel imprimiu (algo como `https://raizes-do-nordeste-pmd.vercel.app`).

### 3.1 Smoke test em aba anônima

1. Abra Chrome em **modo anônimo** (Ctrl+Shift+N)
2. Acesse `URL_PUBLICA`
3. Confirme que a tela carrega sem erros (DevTools › Console deve estar limpa)

### 3.2 Lighthouse — meta Performance ≥ 80, Accessibility ≥ 90

```bash
# Lighthouse CLI (precisa Chrome instalado)
npx lighthouse URL_PUBLICA/home --view --output html --output-path ./docs/lighthouse-reports/home.html
npx lighthouse URL_PUBLICA/cardapio --view --output html --output-path ./docs/lighthouse-reports/cardapio.html
npx lighthouse URL_PUBLICA/carrinho --view --output html --output-path ./docs/lighthouse-reports/carrinho.html
```

Crie a pasta `docs/lighthouse-reports/` antes (`mkdir -p docs/lighthouse-reports`). Cada comando salva um HTML com a auditoria completa — abra e copie os scores pro PDF final.

Alternativa (mais visual): Chrome DevTools › aba **Lighthouse** › selecionar Performance + Accessibility + Best Practices + PWA + SEO → **Analyze page load**.

### 3.3 axe DevTools — acessibilidade

1. Instale a extensão "axe DevTools" (Chrome / Firefox)
2. Abra `URL_PUBLICA/home` e clique no ícone do axe nos DevTools
3. Clique em **Scan ALL of my page**
4. Print do resultado pra `docs/screenshots/axe-audit.png`
5. Repita pra `/cardapio`, `/carrinho`, `/checkout`, `/conta/privacidade`

Foque em ofensores **Critical** e **Serious**. Os de **Moderate**/**Minor** podem ficar pro PDF como "melhorias pós-MVP".

### 3.4 PWA install

1. Acesse `URL_PUBLICA` em Chrome desktop
2. Olhe a barra de endereço — deve aparecer um ícone de "instalar" (monitor com seta)
3. Clique em instalar → confirma → app abre como janela própria
4. **Tirar screenshot** e salvar em `docs/screenshots/pwa-install.png`

No mobile (Android Chrome): menu ⋮ → "Adicionar à tela inicial".

## 4. Screenshots pro PDF

Sugestão de **5 telas** pra incluir tanto no README quanto no PDF final, salvas em `docs/screenshots/`:

| Arquivo | Tela | Como capturar |
|---|---|---|
| `01-home-cliente.png` | `/home` com saudação e categorias | Viewport 1280×800, scroll até carrossel "Mais pedidos" |
| `02-cardapio.png` | `/cardapio/tapiocas` com chips de filtro | Mesmo viewport, filtro "Mais pedidos" ativo |
| `03-acompanhamento.png` | `/pedidos/:id` com timeline | Após fazer um pedido completo |
| `04-totem-cardapio.png` | `/totem/cardapio` | DevTools › Toggle device › Custom 1080×1920 |
| `05-kds.png` | `/admin/kds` com 3+ pedidos | Crie 3 pedidos pelo PDV/cliente, depois acesse com `gerente@raizes.com` |
| `06-dashboard.png` | `/admin/dashboard` | Mesmo login, exibe KPIs + gráfico |

Atalho pra capturar no Chrome: **Ctrl+Shift+P** → digite "screenshot" → "Capture full size screenshot".

## 5. Checklist final antes da entrega

```
[ ] Link público funciona em aba anônima
[ ] Fluxo cliente completo: cadastro → cardápio → pagamento → acompanhamento
[ ] Totem funciona em viewport 1080×1920 (Ocioso → Cardápio → Pagamento → Sucesso)
[ ] Admin: login com 3 roles redireciona pra rota correta
[ ] LGPD: cookie banner aparece em aba anônima
[ ] LGPD: exportar dados baixa JSON
[ ] LGPD: excluir conta limpa localStorage e redireciona
[ ] Pagamento: cartão 4000…0002 → recusado
[ ] Pagamento: cartão 4000…0119 → erro de comunicação
[ ] Pagamento: PIX → aprovado
[ ] PWA: instalável no Chrome desktop
[ ] PWA: ícone aparece após instalar
[ ] Lighthouse Performance ≥ 80 em /home
[ ] Lighthouse Accessibility ≥ 90 em /home
[ ] axe DevTools: zero ofensores Critical
[ ] README.md atualizado com URL do deploy
[ ] Screenshots salvos em docs/screenshots/
[ ] PDF final em deliverables/{RU}_Projeto_Front_End.pdf
```

## 6. Se algo der errado

| Sintoma | Possível causa | Solução |
|---|---|---|
| Build falha na Vercel | Versão de Node | Adicione `engines: { "node": ">=18" }` em `package.json` |
| 404 em rotas internas | SPA fallback | Crie `vercel.json` com `{"rewrites":[{"source":"/(.*)","destination":"/"}]}` |
| Service worker não atualiza | Cache do browser | Hard reload (Ctrl+Shift+R) ou DevTools › Application › Clear storage |
| Lighthouse Performance < 80 | Bundle grande | Já fizemos code split — se ainda assim cair, considere lazy loading do Cardapio do cliente |
| LocalStorage cheio | Uso prolongado | Excluir conta limpa as 6 chaves; ou DevTools › Application › Clear storage |

## 7. Manutenção do link ativo até a correção

> **Atenção:** o roteiro UNINTER zera o item de Entrega Técnica (10 pts) se o
> link cair na hora da correção. Mantenha o projeto Vercel ativo até a data
> oficial de avaliação. Não pause o deploy. Não privatize o repositório.
