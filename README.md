# Template Memberkit — repositório coringa

Área de membros estática no padrão **Memberkit** (vitrine, curso, módulo,
aula, comunidade, ranking, certificados, notificações, conta e busca),
pronta para ser duplicada e vestida com a identidade de cada cliente.

> **O template é neutro de propósito**: preto, branco, cinzas, fonte
> Helvetica e imagens placeholder cinza com a medida escrita. Ele não tem
> identidade visual. Toda plataforma de cliente **precisa** receber as cores,
> fontes, fundos e logos do design system desse cliente.

Para agentes de IA (Claude, Codex…): o roteiro completo está em
[`AGENTS.md`](AGENTS.md). O `CLAUDE.md` importa esse mesmo arquivo.

---

## Sumário

1. [Rodar e publicar](#1-rodar-e-publicar)
2. [Estrutura de pastas](#2-estrutura-de-pastas)
3. [Fluxo: nova plataforma para um cliente](#3-fluxo-nova-plataforma-para-um-cliente)
4. [O que é MUTÁVEL (por cliente)](#4-o-que-é-mutável-por-cliente)
5. [Conteúdo (`content.config.js`)](#5-conteúdo-contentconfigjs)
6. [O que é IMUTÁVEL (igual em todos)](#6-o-que-é-imutável-igual-em-todos)
7. [Verificação automática](#7-verificação-automática)
8. [Como funciona por dentro](#8-como-funciona-por-dentro)
9. [Perguntas frequentes](#9-perguntas-frequentes)

---

## 1. Rodar e publicar

```bash
python3 scripts/serve.py
```

Abra `http://localhost:5180`. O servidor desliga o cache: salvou o config,
recarregou a página, viu a mudança.

**Publicar:** o workflow `.github/workflows/deploy.yml` publica no GitHub
Pages a cada push na `main` (*Settings → Pages → Source: GitHub Actions*).
As rotas usam `#/`, então não precisa configurar servidor.

## 2. Estrutura de pastas

```
platform.config.js        ← EDITAR por cliente: identidade (cores, fonte, logos, fundos)
content.config.js         ← EDITAR por cliente: cursos, módulos, aulas, banners, ranking, comunidade
assets/
  logo/                   ← logos e favicon do cliente
  brand/                  ← fundo da barra lateral, texturas (crie se precisar)
  fonts/                  ← arquivos de fonte do cliente + fonts.css (crie se precisar)
  banners/                ← banners 1440x369
  courses/                ← capas, heros, pôsteres de módulo, miniaturas
  placeholders/           ← imagens cinza do template (não use em cliente)
index.html                ✗ não editar — casca vazia
src/css/tokens.css        ✗ temas, medidas e as variáveis que o config preenche
src/css/components.css    ✗ topbar, barra lateral, botões, formulários
src/css/pages.css         ✗ vitrine, curso, módulo, aula, ranking, etc.
src/js/                   ✗ renderização, rotas e aplicação do config
scripts/serve.py          servidor local sem cache
scripts/check-client.mjs  verifica se a identidade do cliente foi aplicada
docs/engenharia-reversa.md  medidas e comportamentos levantados da Memberkit
AGENTS.md / CLAUDE.md     roteiro para agentes de IA
```

## 3. Fluxo: nova plataforma para um cliente

1. **Duplicar** este repositório (*Use this template* no GitHub, ou copiar a pasta).
2. **Reunir o material do cliente**: nome, logo (claro e escuro), favicon,
   design system (cores em hex), fonte, preferência claro/escuro, imagens e
   lista de cursos/aulas.
3. **Identidade** — editar todos os campos `[CLIENTE]` do `platform.config.js`
   (detalhes na seção 4).
4. **Conteúdo** — preencher `content.config.js` e colocar as imagens em `assets/`.
5. `isTemplate: false` no `platform.config.js`.
6. `node scripts/check-client.mjs` até não sobrar nenhum **ERRO**.
7. `python3 scripts/serve.py` e conferir vitrine, curso, módulo, aula, ranking,
   tema escuro (ícone da lua) e celular.
8. Push na `main` → publicado.

Pedindo para uma IA? Basta: *"vamos criar a plataforma do cliente X"* + o
material do passo 2. O `AGENTS.md` diz a ela o que fazer.

## 4. O que é MUTÁVEL (por cliente)

Tudo fica em `platform.config.js`. Campos `[CLIENTE]` **devem** mudar;
campos `[OPCIONAL]` podem ficar como estão.

### 4.1 Identidade — `brand` `[CLIENTE]`

| Campo | O quê | Template |
|---|---|---|
| `name` | nome no título da aba, cabeçalhos e certificado | `Nome da Plataforma` |
| `logo.src` | logo para fundo claro (≤ 200px de largura, ideal ≤ 48px de altura) | placeholder "SEU LOGO" |
| `logo.srcDark` | logo para fundo escuro (topbar escura, gaveta mobile). `""` = usa `src` | placeholder branco |
| `logo.alt` | texto alternativo | `Nome da Plataforma` |
| `favicon` | 196×196 | quadrado preto |

### 4.2 Tipografia — `typography` `[CLIENTE]`

| Campo | O quê | Template |
|---|---|---|
| `fontFamily` | pilha de fontes CSS, sempre terminando em `sans-serif`/`serif` | `"Helvetica Neue", Helvetica, Arial, sans-serif` |
| `fontUrl` | CSS da fonte (Google Fonts ou `assets/fonts/fonts.css`) | `""` |

```js
// Google Fonts
typography: {
  fontFamily: '"Manrope", sans-serif',
  fontUrl: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap",
},

// Arquivos próprios: assets/fonts/fonts.css com os @font-face
typography: {
  fontFamily: '"Marca Sans", sans-serif',
  fontUrl: "assets/fonts/fonts.css",
},
```

A interface usa os pesos 400, 500, 600 e 700.

### 4.3 Cores e fundos — `appearance` `[CLIENTE]`

Espelha a tela **Aparência** da Memberkit. São as **únicas** cores
configuráveis — não existe outra.

| Campo | Onde aparece | Template |
|---|---|---|
| `brandColor` | **botões primários**, "começar agora", barras de progresso, chip de categoria ativo, links, anel de foco, check de aula concluída, medalha do ranking | `#737373` (cinza médio) |
| `sidebarColors.primary` | cor da barra lateral (início do degradê) | `#171717` |
| `sidebarColors.secondary` | fim do degradê (`linear_gradient`/`blend_gradient`) | `#000000` |
| `sidebarStyle` | `solid` · `linear_gradient` · `blend_gradient` · `minimal` · `transparent` | `solid` |
| `pageBackground` | **fundo das páginas** no tema claro | `#FAFAFA` |
| `images.sidebarBackground` | **imagem de fundo** da barra lateral (só em `blend_gradient`), 700×1050 | placeholder cinza |
| `theme` | tema da área do aluno: `classic` (claro), `carbon`, `dracula`, `prime` (escuros) | `classic` |
| `topbarTheme` | tema da barra superior (mesmas opções) | `classic` |

Calculado automaticamente (não configure à mão):
- `--brand-light` / `--brand-dark` (hover, foco) a partir de `brandColor`;
- cor do texto **sobre** a cor da marca (escuro em cores claras, branco nas escuras);
- cor dos links da barra lateral (claros em barra escura, escuros em barra clara);
- botão lua/sol alterna entre `classic` e o `theme` escolhido (ou `carbon`).

Como traduzir um design system → ver tabela no [`AGENTS.md` §3](AGENTS.md#3-como-mapear-o-design-system-para-o-config).

### 4.4 Outros `[OPCIONAL]`

| Campo | O quê |
|---|---|
| `menu.community` / `menu.ranking` / `menu.certificates` | liga/desliga itens do menu lateral (a rota vira 404) |
| `demoUser` | nome, e-mail e avatar mostrados no menu do usuário |
| `isTemplate` | `true` no template; **`false` em cliente** (some o aviso do console) |

## 5. Conteúdo (`content.config.js`)

O cabeçalho do arquivo documenta tudo; resumo:

```js
courses: [{
  slug: "meu-curso",            // URL #/curso/meu-curso — único e estável
  title, subtitle, description,
  cover: "assets/courses/meu-curso-capa.jpg",    // 432x216
  heroImage: "assets/courses/meu-curso-hero.jpg", // 1152x320 (visual nos 35% da direita)
  category: "trilhas",          // id de categories ou "" (seção "Conteúdos")
  locked: false, offerUrl: "",  // bloqueado → cadeado + abre a página de venda
  modules: [{
    id: "m1", title, description,
    cover: "assets/courses/m1.jpg",              // 300x420
    lessons: [{
      id: "m1-a1", title, duration: "12:30",
      thumbnail: "assets/courses/m1-a1.jpg",     // 120x68
      video: { provider: "youtube", id: "..." }, // ou vimeo / iframe+src / sem video
      content: "<p>Texto da aula</p>",
      attachments: [{ title: "Apostila.pdf", href: "assets/files/apostila.pdf" }],
    }],
  }],
}]
```

Também: `banners` (1440×369, com `href` opcional), `categories`, `ranking`
(participantes fictícios), `forums` e `posts` (comunidade), `notifications`.

| Imagem | Medida | Proporção |
|---|---|---|
| Banner | 1440 × 369 | ~3,9:1 |
| Capa do curso | 432 × 216 | 2:1 |
| Hero do curso | 1152 × 320 | 3,6:1 |
| Pôster do módulo | 300 × 420 | 5:7 |
| Miniatura da aula | 120 × 68 | 16:9 |
| Fundo da barra lateral | 700 × 1050 | 2:3 |

Exporte no dobro para telas retina, se quiser.

## 6. O que é IMUTÁVEL (igual em todos)

Reproduzido da Memberkit real (`docs/engenharia-reversa.md`). Não muda por cliente.

- **Cores fora da seção 4.3**: textos, bordas, cards e os 4 temas vivem em
  `src/css/tokens.css`. O tema `classic` do template é em cinzas neutros.
- **Shell**: topbar 64px (logo até 48px, busca 40px que some < 768px, botões
  redondos 40px); barra lateral 56px recolhida / 240px aberta, vira gaveta
  < 640px; tooltip nos ícones quando recolhida.
- **Vitrine**: carrossel de banners (cantos 8px, troca a cada 6s), chips de
  categoria, cards de curso em 1/2/3/4 colunas (≥ 640/1024/1536px), capa 2:1,
  progresso de 4px sobre a capa, hover cresce 5%.
- **Curso**: hero com degradê preto da esquerda, padding 56px, progresso e
  botão "começar agora / continuar / rever conteúdo"; módulos em pôster 5:7,
  4 por linha (2 no celular), nome aparece no hover.
- **Módulo**: lista de aulas com círculo de conclusão, miniatura e duração;
  link para o próximo módulo.
- **Aula**: player 16:9 + lista lateral das aulas do módulo (some < 1024px);
  ações alternar layout, apagar as luzes, favoritar, anterior/próximo;
  avaliação com 5 emojis, "Marcar como concluído", progresso do curso;
  comentários com abas.
- **Comunidade, ranking, certificados, notificações, conta, busca**: layouts fixos.

Precisa mudar algo daqui para **todos** os clientes? Isso é evolução do
template, não personalização: mude em `src/`, atualize
`docs/engenharia-reversa.md` e este README.

## 7. Verificação automática

```bash
node scripts/check-client.mjs
```

- **ERRO** (sai com código 1): `isTemplate` ainda `true`; nome, logos ou favicon
  placeholder; fonte ainda Helvetica do template; `brandColor` ou cores da
  barra lateral ainda neutras; cor inválida; arquivo de imagem inexistente;
  id duplicado; `blend_gradient` sem imagem do cliente.
- **AVISO**: fundo ainda `#FAFAFA`; imagens ou vídeos de conteúdo ainda
  placeholder; pouco contraste da cor da marca; curso bloqueado sem `offerUrl`.

No template neutro o script **deve** falhar — é o sinal de que nada foi personalizado.

## 8. Como funciona por dentro

- `index.html` carrega `platform.config.js` e `content.config.js` (globais
  `window.PLATFORM_CONFIG` / `window.CONTENT_CONFIG`) e depois `src/js/main.js`.
- `src/js/theme.js` converte as cores hex do config em variáveis HSL
  (`--brand*`, `--navbar-*`, `--page`), aplica a fonte (`--font-sans` + `<link>`
  do `fontUrl`) e escolhe o tema (`data-theme` no `<html>`).
- `src/js/main.js` roteia por hash (`#/`, `#/curso/:slug`,
  `#/curso/:slug/modulo/:id`, `#/curso/:slug/aula/:id`, `#/comunidade`,
  `#/ranking`, `#/certificados`, `#/notificacoes`, `#/conta`, `#/busca?q=`).
- Sem backend: progresso, favoritos, avaliações, comentários, posts, perfil e
  tema ficam no `localStorage`, com prefixo do nome da plataforma. XP do
  ranking: 10 por aula concluída, 5 por avaliação, 5 por comentário.

## 9. Perguntas frequentes

**O cliente quer uma cor a mais (ex.: botão secundário colorido).**
Não há variável para isso. Use `brandColor` (ação) e `sidebarColors` (marca
escura). Se for indispensável para todos os clientes, evolua o template (seção 6).

**A fonte do cliente é Helvetica mesmo.**
Escreva `fontFamily: "Helvetica, Arial, sans-serif"` (diferente do valor do
template) para o verificador entender que foi uma escolha.

**O logo do cliente só existe em versão escura.**
Deixe `srcDark: ""` e prefira `topbarTheme: "classic"` e uma barra lateral
clara (`minimal`) para o logo aparecer.

**Mudei o config e nada aconteceu.**
Rode pelo `scripts/serve.py` (sem cache) e recarregue. Erros de sintaxe no
config aparecem no console do navegador e no `node scripts/check-client.mjs`.
