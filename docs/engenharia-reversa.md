# Engenharia reversa — Memberkit (área do aluno)

Fonte observada: `tfgolfe.memberkit.com.br` (conta logada, outubro/2026).
Método: observação passiva no estilo do [REA](https://github.com/morluto/rea)
(`inspect_web_page` / `analyze_web_bundle`): DOM, estilos computados, folha de
estilo pública e bundle JS público — sem enviar formulários nem alterar dados.

> O template **não copia** CSS, JS, imagens ou ícones da Memberkit. Tudo foi
> reescrito a partir das medidas e comportamentos observados abaixo.
>
> Diferenças intencionais do template em relação ao original: paleta do tema
> `classic` em cinzas neutros (a Memberkit usa cinzas azulados "slate"),
> fonte padrão Helvetica (a Memberkit usa Inter), cor do fundo das páginas
> configurável (`pageBackground`) e sem tela de login.

## Stack observada

- Rails + Turbo + Stimulus (`data-controller=…`), Tailwind compilado, Swiper
  (carrosséis), Muuri (grid ordenável), Tippy (tooltips).
- Fonte: Inter (variável) com `font-feature-settings: "cv02","cv03","cv04","cv11"`.
- Tema por variáveis HSL no `:root` (padrão shadcn): `--background`,
  `--foreground`, `--card`, `--muted`, `--secondary`, `--border`, `--input`…
- Variáveis por cliente injetadas inline no `<head>`:

```css
:root {
  --devise-background: url(...);   /* fundo da tela de login (1600x900) */
  --navbar-background: url(...);   /* fundo da barra lateral (700x1050) */
  --navbar-primary:   214.88 62.32% 13.53%;  /* #0D1F38 */
  --navbar-secondary: 0 0% 0%;               /* #000000 */
  --brand-light: 42 100% 58%;
  --brand:       42.86 100% 50.59%;           /* #FFB703 */
  --brand-dark:  43.29 97.67% 41.48%;
  --brand-invert: 222.22 47.37% 11.18%;       /* texto sobre a cor da marca */
}
```

## Tela "Aparência" (o que o cliente da Memberkit pode mudar)

| Opção | Valores |
|---|---|
| Estilo da barra superior | Classic, Carbon, Dracula, Prime |
| Estilo da barra lateral | Gradiente simples, Gradiente sobreposto, Minimalista, Cor sólida, Transparente |
| Cor da barra lateral | 2 cores (início/fim do degradê) |
| Cor da marca | 1 cor (botões, progresso, links, foco) |
| Tema preferido (área do aluno) | Classic, Carbon, Dracula, Prime |
| Imagens | Logotipo (≤200px largura), fundo do login 1600x900, fundo da barra lateral 700x1050, favicon 196x196 |

Isso virou o bloco `appearance` do `platform.config.js` (menos o fundo do
login, já que o template não tem tela de login).

## Alternância claro/escuro (bundle JS, controller `theming`)

- Se o tema atual ≠ `classic` → volta para `classic`.
- Senão → vai para o tema preferido (ou `carbon` se o preferido for `classic`).
- A topbar recebe `.dark` quando o tema dela ≠ `classic`; a área base recebe
  `.dark` quando o tema ≠ `classic`; no escuro a barra lateral vira `navbar-dark`.
- Preferência salva em cookie `theme` (aqui: `localStorage`).

## Medidas

### Topbar
64px de altura, fundo `--background`, borda inferior `--border`, padding 0 16px 0 8px.
Botões redondos 40x40 (hover `foreground/5%`). Busca 40px de altura,
fundo `border/40%`, raio 6px, ícone à direita, `max-w-xs`, oculta < 768px.
Logo `max-height: 48px`. Itens: hambúrguer, logo | busca, tema, sino, avatar (menu).

### Barra lateral (navbar)
Recolhida: 56px (`3.5rem`), aberta: 240px (`15rem`), transição 300ms.
Links 40x40, padding 8px, raio 4px, ícone 24px, texto 14px/500 (ativo 600).
`navbar-dark`: texto `#ffffffb3`, hover/ativo `#ffffff1a`. `navbar-light`: texto `#02061780`.
Mobile (< 640px): gaveta fixa sobre o conteúdo com backdrop `#18181bbf`.

### Vitrine (`/`)
Padding `16 → 32 → 64px` (md/xl), topo `24 → 32 → 56px`.
Banner: carrossel arredondado (8px), proporção 1440x369, bullets à direita.
Chips de categoria: `btn-secondary` 13px/500, ativo = cor da marca.
Título "Conteúdos": 20px/600, `-0.025em`, padding 20px 0.
Cards de curso: 1/2/3/4 colunas (sm/lg/2xl), gutter 20px, capa 2:1 raio 8px,
barra de progresso de 4px sobre a capa, hover `scale(1.05)` 300ms;
título 16px/500 `-0.4px`, subtítulo 13px muted.

### Curso
Container `max-w-6xl` (1152px). Hero `rounded-xl`, padding 56px, imagem de fundo
com degradê `90deg, #000 0 → #000000f2 33.79% → #000000d9 51.37% → transparent 65.3%`.
Título 24px/600, descrição 16px branco/70%, duração e nº de conteúdos 13px/600,
barra de progresso 4px (`max-w-52`), botão primário "começar agora".
Módulos: 4 colunas (2 no mobile), pôster 5:7 raio 8px; no hover cresce 5%,
escurece de baixo (`transparent 35% → #000c`) e o nome sobe com fade.

### Módulo
Mesmo hero + título do módulo com "Ver todos →", descrição, lista em card
(`divide-y`), cada aula: círculo de conclusão 20px, miniatura 96px 16:9,
título 16px/500, duração 12px. Rodapé: "Módulo seguinte | Próximo".

### Aula
Faixa de vídeo `bg-zinc-950` com player 16:9 + lista lateral (33%) de aulas do
módulo (miniatura 60x34, ativa `bg-white/10`). Barra de breadcrumbs `muted/80`
com: alternar layout, "apagar as luzes" (overlay preto 90%), favoritar,
anterior/próximo (botões unidos). Conteúdo em grid 3 colunas: título 24px +
texto (prose) à esquerda, card fixo à direita com avaliação (5 emojis em
escala de cinza, coloridos no hover), "Marcar como concluído" e progresso do
curso (8px). Comentários: textarea com "Publicar" embutido, abas
"Mais recentes / Mais antigos / Meus comentários".

### Comunidade, ranking e páginas simples
- Comunidade: coluna 240px (Nova publicação, busca, filtros, lista de
  comunidades) + feed / estado vazio em card.
- Ranking: hero escuro por tema (`#0d1b2a` classic), medalha, subtítulo, card
  sobreposto (`-mt-24`) com seletor de turma e lista por XP (avatar com anel da marca).
- Notificações / Minha conta: cabeçalho com sobrancelha (nome da escola,
  10px uppercase) + h1, conteúdo em card.
- Certificados: estado vazio ilustrado "Enriqueça seu currículo."
- Busca: coluna de filtros (Todos/Cursos/Aulas com contadores) + resultados.

### Login (observado, mas fora do template)
Fundo de imagem (`--devise-background`, cover), logo `max-h 50px`, card
`max-w-lg` raio 8px, padding 28x24, labels 13px/500, inputs 36px,
"Esqueceu sua senha? Clique aqui" e botão `btn-outline-primary btn-lg` minúsculo.
Removido do template por decisão de produto: a plataforma abre direto na vitrine.

## Limitações

- A conta observada é administradora; barras de gestão ("Gestão de conteúdo",
  "Novo curso"…) e telas admin foram ignoradas — o template reproduz só a área do aluno.
- Não havia publicações na comunidade nem categorias de vitrine; esses estados
  foram reproduzidos pela estrutura vazia + padrões do mesmo design system.
- Sem backend: progresso, favoritos, avaliações, comentários e posts ficam no
  `localStorage` do navegador (demonstração).
