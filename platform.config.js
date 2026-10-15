/* =============================================================
 * PLATFORM CONFIG — identidade visual do cliente.
 * =============================================================
 *
 * ⚠️  ESTE TEMPLATE É NEUTRO DE PROPÓSITO (preto, branco, cinzas,
 *     Helvetica e imagens placeholder). Nada aqui é a identidade final.
 *
 * Ao criar uma plataforma para um cliente ("vamos criar a plataforma
 * do cliente X"), TODO campo marcado com [CLIENTE] DEVE ser trocado
 * pelo design system / identidade visual desse cliente:
 *
 *   [CLIENTE] nome, logo, logo para fundo escuro, favicon
 *   [CLIENTE] fonte da interface (typography)
 *   [CLIENTE] cor da marca  → botões primários, progresso, chips, links, foco
 *   [CLIENTE] cores da barra lateral (sidebar)
 *   [CLIENTE] fundo das páginas e imagem de fundo da barra lateral
 *   [CLIENTE] tema claro/escuro e tema da barra superior
 *
 * Ao terminar, mude `isTemplate` para false e rode:
 *   node scripts/check-client.mjs
 * O script aponta qualquer valor de template que ainda tenha ficado.
 *
 * Campos marcados com [OPCIONAL] podem ficar como estão.
 * Layout, medidas e componentes são IMUTÁVEIS e vivem em src/ — não
 * edite src/ para "encaixar" a identidade do cliente. Ver AGENTS.md.
 * ============================================================= */

window.PLATFORM_CONFIG = {
  /* true = ainda é o template neutro. [CLIENTE] mude para false ao personalizar. */
  isTemplate: false,

  /* ---------- Identidade ---------- */
  brand: {
    name: "TF Golfe — Universidade Corporativa",
    logo: {
      src: "assets/logo/tfgolfe-light.png",
      srcDark: "assets/logo/tfgolfe-white.png",
      alt: "TF Golfe — Universidade Corporativa",
    },
    favicon: "assets/logo/favicon.png",
  },

  /* ---------- Tipografia ----------
     Template: Helvetica. Cliente: a fonte do design system dele.
     - Google Fonts: cole a URL do CSS em fontUrl e o nome em fontFamily.
       ex.: fontUrl: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap"
            fontFamily: '"Manrope", sans-serif'
     - Arquivos próprios: coloque em assets/fonts/, crie assets/fonts/fonts.css
       com os @font-face e use fontUrl: "assets/fonts/fonts.css".
     Pesos usados pela interface: 400, 500, 600 e 700. */
  typography: {
    fontFamily: '"Roboto", Arial, sans-serif',
    fontUrl: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap",
  },

  /* ---------- Aparência ----------
     Espelha a tela "Aparência" da Memberkit. Só estas opções existem —
     NÃO crie cores novas em src/css para um cliente. */
  appearance: {
    /* [CLIENTE] Cor da marca (UMA cor, hex). Pinta: botões primários, botão
       "começar agora", barras de progresso, chip de categoria ativo, links,
       anel de foco, check de aula concluída, medalha do ranking.
       Claro/escuro e cor do texto sobre ela são calculados sozinhos.
       Template: cinza médio neutro. */
    brandColor: "#FFB81C",

    /* [CLIENTE] Cores da barra lateral (hex): início e fim do degradê;
       em "solid" só primary é usada. Prefira um tom escuro em primary —
       a cor do texto (clara/escura) é escolhida automaticamente.
       Template: grafite/preto. */
    sidebarColors: { primary: "#003366", secondary: "#001D3D" },

    /* [CLIENTE] Estilo da barra lateral:
       "solid" (cor sólida) | "linear_gradient" (gradiente simples)
       "blend_gradient" (gradiente sobre images.sidebarBackground)
       "minimal" (fundo branco com borda) | "transparent" */
    sidebarStyle: "blend_gradient",

    /* [CLIENTE] Fundo das páginas no tema claro (hex) — normalmente o
       off-white/neutro do design system. Temas escuros usam o próprio fundo. */
    pageBackground: "#F6F8FB",

    /* [CLIENTE] Tema da área do aluno: "classic" (claro) | "carbon" | "dracula" | "prime" (escuros).
       O botão lua/sol alterna entre "classic" e este tema (ou "carbon"). */
    theme: "classic",

    /* [CLIENTE] Tema da barra superior: "classic" | "carbon" | "dracula" | "prime" */
    topbarTheme: "classic",

    images: {
      /* [CLIENTE] só aparece com sidebarStyle "blend_gradient". 700x1050 → assets/brand/ */
      sidebarBackground: "assets/brand/sidebar.jpg",
    },
  },

  /* ---------- Menu lateral [OPCIONAL] ----------
     Liga/desliga itens. "Conteúdos" sempre aparece. */
  menu: {
    community: true,     // Comunidades
    ranking: true,       // Ranking
    certificates: true,  // Certificados
  },

  /* ---------- Aluno de demonstração [OPCIONAL] ---------- */
  demoUser: {
    name: "Aluno TF Golfe",
    email: "aluno@tfgolfe.com.br",
    avatar: "", // vazio = avatar padrão
  },
};
