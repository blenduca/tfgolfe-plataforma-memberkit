/* Catálogo visual TF Golfe, conferido na Memberkit em 15/10/2026.
 * Títulos e durações reais; miniaturas originais geradas para esta proposta.
 * Vídeos e materiais complementares não são distribuídos neste protótipo. */
(function () {
  const course = (slug, title, subtitle, description, modules) => ({
    slug, title, subtitle, description,
    cover: `assets/courses/${slug}-cover.jpg`,
    heroImage: `assets/courses/${slug}-hero.jpg`,
    category: "",
    modules,
  });
  const module = (id, title, description, cover, lessons = []) => ({
    id, title, description, cover: `assets/courses/${cover}-module.jpg`, lessons,
  });
  const lesson = (course, id, title, duration) => ({
    id, title, duration,
    thumbnail: `assets/courses/lesson-${course}-${id}.jpg`,
    content: `<p>${title}</p>`,
    attachments: [],
  });

  window.CONTENT_CONFIG = {
    banners: [
      { src: "assets/banners/universidade-corporativa-figma.png", alt: "TF Golfe Universidade Corporativa", href: "#/curso/boas-vindas" },
    ],
    categories: [],
    courses: [
      course("boas-vindas", "Boas-vindas", "Comece por aqui", "Conheça a plataforma e organize sua jornada de aprendizagem.", [
        module("bv-m1", "Boas-vindas", "Primeiros passos na TF Golfe", "primeiros-passos"),
      ]),
      course("biblioteca-de-materiais", "Biblioteca de Materiais", "Materiais de apoio", "Documentos e recursos complementares às formações.", [
        module("bm-m1", "Materiais Complementares", "Biblioteca de apoio", "materiais-complementares"),
      ]),
      course("rh-estrategico", "RH - Estratégico", "Formação RH Estratégico", "Desenvolva uma atuação estratégica na área de Recursos Humanos.", [
        module("rh-materiais", "Materiais Complementares", "Recursos da formação", "rh-materiais", [
          lesson("rh", "5702596", "Materiais Complementares", ""),
        ]),
        module("rh-01-07", "Módulos 01 a 07", "Primeira parte da formação", "rh-modulos-01-07", [
          lesson("rh", "5702581", "Módulo 01 - Aula 01 - Boas Vindas e Dicas de Estudo", "09:09"),
          lesson("rh", "5708045", "Módulo 01 - Aula 02 - Perfil do Profissional da Área de RH", "06:57"),
          lesson("rh", "5702582", "Módulo 02 - Aula 01 - Contextualizando o a Implantação da área de RH", "06:51"),
          lesson("rh", "5708050", "Módulo 02 - Aula 02 - Entendendo o RH Estratégico", "05:43"),
          lesson("rh", "5702583", "Módulo 03 - O que é Cultura e Diagnóstico", "09:05"),
          lesson("rh", "5702584", "Módulo 04 - Planejamento Estratégico e Ferramentas para Planejar", "11:50"),
          lesson("rh", "5702585", "Módulo 05 - Aula 01 - Como Elaborar as Políticas e Procedimentos da Área de RH", "07:56"),
          lesson("rh", "5708053", "Módulo 05 - Aula 02 - Como Elaborar e Implementar o Código de Ética e Conduta", "08:46"),
          lesson("rh", "5702586", "Módulo 06 - Aula 01 - Abertura, Controle e Divulgação de Vaga", "09:10"),
          lesson("rh", "5708056", "Módulo 06 - Aula 02 - Triagem, Entrevista e Devolutiva", "07:16"),
          lesson("rh", "5702587", "Módulo 07 - Levantamento, Matriz e Viabilização de Treinamentos", "06:21"),
        ]),
        module("rh-08-12", "Módulos 08 a 12", "Segunda parte da formação", "rh-modulos-08-12", [
          lesson("rh", "5702588", "Módulo 08 - Cargos e Salários", "15:27"),
          lesson("rh", "5702589", "Módulo 09 - Endomarketing, Calendário, Datas Comemorativas e Comunicados", "09:31"),
          lesson("rh", "5702590", "Módulo 10 - A importância de Medir e Indicadores", "07:42"),
          lesson("rh", "5702591", "Módulo 11 - Aula 01 - Aplicação e Tabulação da Pesquisa de Clima", "07:55"),
          lesson("rh", "5708201", "Módulo 11 - Aula 02 - Análise, Divulgação e Plano de Ação", "05:13"),
          lesson("rh", "5702592", "Módulo 12 - Aula 01 - Manutenção dos Subsistemas", "03:48"),
          lesson("rh", "5708205", "Módulo 12 - Aula 02 - Acompanhando as tendências e necessidades de inovação da área de RH", "03:37"),
          lesson("rh", "5702593", "Módulo Bônus - Aula 01 - Bônus - Aula sobre Liderança", "05:06"),
          lesson("rh", "5708217", "Módulo Bônus - Aula 02 - Agradecimento", "01:12"),
        ]),
      ]),
      course("dirf-digital", "DIRF Sem Segredo", "Formação DIRF Digital", "Domine a DIRF Digital, do eSocial e da EFD-Reinf até a entrega final.", [
        module("dirf-m01", "Módulo 01", "Contexto, conceitos e mudanças", "dirf-modulo-01", [
          lesson("dirf", "5708431", "Módulo 01 Contexto, Conceitos e Mudanças Parte 01", "01:50:11"),
          lesson("dirf", "5708436", "Módulo 01 Contexto, Conceitos e Mudanças Parte 02", "58:32"),
        ]),
        module("dirf-m02", "Módulo 02", "Parametrização e preparação do sistema", "dirf-modulo-02", [
          lesson("dirf", "5708439", "Modulo 02 parametrização e Preparação do Sistema", "34:07"),
        ]),
        module("dirf-m03", "Módulo 03", "Rendimentos e retenções", "dirf-modulo-03", [
          lesson("dirf", "5708440", "Módulo 03 – Informações de Rendimentos e Retenções", "26:59"),
        ]),
        module("dirf-m04", "Módulo 04", "Casos complexos", "dirf-modulo-04", [
          lesson("dirf", "5708442", "Módulo 04 – Situações Específicas e Casos Complexos", "57:38"),
        ]),
        module("dirf-m05", "Módulo 05", "Conferência e críticas", "dirf-modulo-05", [
          lesson("dirf", "5708443", "Módulo 05 – Conferência, Cruzamentos e Painel de Críticas", "36:21"),
        ]),
        module("dirf-m06", "Módulo 06", "Riscos e compliance", "dirf-modulo-06", [
          lesson("dirf", "5708444", "Módulo 06 – Penalidades, Riscos e Compliance Tributário", "07:48"),
        ]),
        module("dirf-mentoria", "Mentoria", "Encontros sobre DIRF Digital", "dirf-mentoria", [
          lesson("dirf", "5708497", "Mentoria DIRF Sem Segredo Fevereiro", "01:46:39"),
          lesson("dirf", "5708498", "Mentoria DIRF Sem Segredo Janeiro", "39:22"),
          lesson("dirf", "5708500", "Mentoria DIRF Digital 26052026", "01:27:17"),
        ]),
        module("dirf-planilhas", "Planilhas e Materiais Complementares", "Materiais de apoio", "dirf-planilhas", [
          lesson("dirf", "5702598", "Planilhas e Materiais Complementares.", "02:31"),
          lesson("dirf", "5708391", "Materiais complementares - Procedimento Download XML eSocial", "06:41"),
        ]),
      ]),
      course("atualizacoes-trabalhistas", "Curso - Atualizações Trabalhistas", "Atualizações Trabalhistas", "Atualizações para a prática trabalhista e de Departamento Pessoal.", [
        module("at-m1", "Atualizações Trabalhistas", "Conteúdos da formação", "trabalhista-atualizacoes", [
          lesson("trabalhista", "5707489", "Atualizações Trabalhistas", "02:30:25"),
        ]),
      ]),
      course("mentorias", "Mentorias e Conteúdos Exclusivos", "Mentorias e Conteúdos Exclusivos", "Encontros e conteúdos para aprofundar a prática profissional.", [
        module("me-m1", "Encontros e Mentorias", "Conteúdos exclusivos", "mentorias-gravacoes"),
      ]),
      course("tfg-academy", "TFG Academy", "TFG Academy", "Trilhas de desenvolvimento da TF Golfe.", [
        module("ac-m1", "Trilhas de Aprendizagem", "Formações da academia", "academy-trilhas"),
      ]),
    ],
    ranking: [],
    forums: [],
    posts: [],
    notifications: [],
  };
})();
