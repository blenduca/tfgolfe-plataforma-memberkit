# AGENTS.md — como criar uma plataforma a partir deste template

Este arquivo é lido por Claude Code (via `CLAUDE.md`), Codex e outros agentes.
Ele é o **roteiro obrigatório** quando alguém pedir algo como
*"vamos criar a plataforma do cliente X"*.

## 0. Entenda o que é este repositório

- Uma área de membros estática (HTML + CSS + JS puro, sem build) que reproduz
  a **Memberkit**: vitrine, curso, módulo, aula, comunidade, ranking,
  certificados, notificações, conta e busca. Não tem login.
- O template é **neutro de propósito**: preto, branco, cinzas, Helvetica e
  imagens placeholder cinza com a medida escrita. **Nada disso é identidade
  final.** Se a plataforma de um cliente terminar cinza e em Helvetica, ela
  não foi feita.
- Só dois arquivos mudam por cliente: `platform.config.js` (identidade) e
  `content.config.js` (conteúdo), mais os arquivos em `assets/`.

## 1. Regras que não se negociam

1. **Todo campo `[CLIENTE]` do `platform.config.js` é trocado na criação**,
   a partir do design system / identidade do cliente:
   - nome, logo (fundo claro), logo para fundo escuro, favicon;
   - fonte da interface (`typography`);
   - **cor da marca** (`appearance.brandColor`) → todos os botões primários,
     progresso, chips ativos, links e foco;
   - **cores da barra lateral** (`appearance.sidebarColors`) e estilo (`sidebarStyle`);
   - **fundos**: `appearance.pageBackground` e `images.sidebarBackground`;
   - tema (`theme`) e tema da barra superior (`topbarTheme`).
2. **Não edite `src/`, `index.html` nem `scripts/`** para aplicar identidade.
   Medidas, espaçamentos e componentes são da Memberkit e ficam iguais em
   todos os clientes. Se algo parecer impossível só com o config, pergunte
   antes de mexer no `src/`.
3. **Não invente variáveis de cor.** Só existem `brandColor`,
   `sidebarColors.primary/secondary` e `pageBackground`. Uma "cor extra" do
   cliente vira uma dessas ou fica de fora.
4. **Fonte**: Helvetica é só do template. No cliente, use a fonte do design
   system dele (Google Fonts ou arquivos em `assets/fonts/`). Se a fonte do
   cliente for de fato Helvetica, escreva `"Helvetica, Arial, sans-serif"`.
5. Ao terminar, `isTemplate: false` e `node scripts/check-client.mjs` sem
   nenhum **ERRO**.

## 2. O que pedir ao usuário (se não vier junto)

Peça tudo de uma vez, numa mensagem só:

| Item | Formato | Vai para |
|---|---|---|
| Nome da plataforma | texto | `brand.name`, `brand.logo.alt` |
| Logo para fundo claro | SVG/PNG, ≤ 200px de largura | `assets/logo/` → `brand.logo.src` |
| Logo para fundo escuro | SVG/PNG (versão branca) | `assets/logo/` → `brand.logo.srcDark` |
| Favicon | 196×196 | `assets/logo/` → `brand.favicon` |
| Design system / paleta | hex, Figma, link, PDF ou print | cores (ver §3) |
| Fonte | nome + Google Fonts ou arquivos | `typography` |
| Claro ou escuro? | preferência | `theme`, `topbarTheme` |
| Imagens | banners, capas, heros, módulos, miniaturas | `assets/…` → `content.config.js` |
| Conteúdo | cursos → módulos → aulas, vídeos | `content.config.js` |

Se o usuário só tiver parte disso, avance com o que tiver, **mas nunca deixe
os campos de identidade com o valor neutro sem avisar**.

## 3. Como mapear o design system para o config

| Do design system do cliente | Campo |
|---|---|
| Cor primária / de ação (a dos botões, CTA) | `appearance.brandColor` |
| Cor escura de marca (navy, grafite, vinho…) | `appearance.sidebarColors.primary` |
| Tom mais escuro ou preto para o fim do degradê | `appearance.sidebarColors.secondary` |
| Fundo / off-white / neutro claro | `appearance.pageBackground` |
| Textura, foto ou padrão de marca vertical | `images.sidebarBackground` + `sidebarStyle: "blend_gradient"` |
| Fonte principal (corpo/interface) | `typography.fontFamily` + `fontUrl` |

Escolha do `sidebarStyle`:
- `solid` — padrão seguro; uma cor escura da marca.
- `linear_gradient` — a marca tem duas cores escuras que combinam.
- `blend_gradient` — existe uma imagem/textura de marca (700×1050).
- `minimal` / `transparent` — marcas claras e minimalistas; a barra fica com
  fundo da página e texto escuro.

Escolha de tema:
- Marca escura/premium → `theme: "carbon"` (ou `prime` se puxar para azul,
  `dracula` se puxar para roxo) e `topbarTheme` igual.
- Marca clara → `theme: "classic"`, `topbarTheme: "classic"`.

Cuidados de contraste (o `check-client.mjs` avisa):
- `brandColor` precisa aparecer **sobre o fundo claro** (progresso, chips) **e
  sobre o hero preto** do curso (botão "começar agora"). Cores muito escuras
  ou muito claras falham — prefira o tom médio/vibrante da paleta.
- `sidebarColors.primary` escuro → texto branco automático; claro → texto escuro.
- A cor do texto **sobre** a cor da marca é calculada sozinha.

## 4. Passo a passo

1. Leia `README.md` (seções "Mutável" e "Imutável") e
   `docs/engenharia-reversa.md` se precisar entender alguma medida.
2. Copie logo, logo escuro e favicon para `assets/logo/`; atualize `brand`.
3. Configure `typography` (fonte do cliente; ver exemplos no próprio config).
4. Configure `appearance` seguindo o §3.
5. Monte `content.config.js`: banners, categorias, cursos → módulos → aulas.
   Imagens do cliente em `assets/banners/` e `assets/courses/` nas medidas do
   cabeçalho do arquivo. Sem imagem ainda? Mantenha o placeholder e avise.
6. `isTemplate: false`.
7. `node scripts/check-client.mjs` → zere os **ERROS**, leia os **AVISOS**.
8. `python3 scripts/serve.py` e confira em `http://localhost:5180`:
   vitrine, um curso, um módulo, uma aula, ranking, tema escuro (ícone de lua)
   e largura de celular (375px).
9. Mostre ao usuário o que foi aplicado e o que ficou pendente (imagens,
   vídeos, textos ainda placeholder).

## 5. Pegadinhas

- IDs (`slug` do curso, `id` de módulo e aula) são a chave do progresso salvo
  no navegador: não reaproveite nem renomeie depois de publicado.
- `heroImage` tem o lado esquerdo coberto por degradê preto: o elemento
  visual importante deve ficar nos ~35% da direita.
- Curso com `locked: true` precisa de `offerUrl`.
- Vídeo: `youtube`/`vimeo` usam só o `id`; outros players usam `iframe` + `src`.
- Mudou o config e não refletiu? O `scripts/serve.py` já desliga cache —
  recarregue a página; se estiver usando outro servidor, recarregue sem cache.
