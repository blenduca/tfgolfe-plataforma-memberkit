/* Ranking, certificados, notificações, minha conta, busca, 404. */

import { icon, MEDAL_SVG } from "../icons.js";
import { esc, $, toast, timeAgo } from "../util.js";
import { store } from "../store.js";
import {
  courses, findCourse, flatLessons, courseProgress, lessonHref, currentUser, myXp, avatarFor,
} from "../content.js";

const brandName = () => window.PLATFORM_CONFIG.brand.name;

function pageHead(title, actions = "") {
  return `<div class="page-head">
    <div><p class="eyebrow">${esc(brandName())}</p><h1 class="h1">${esc(title)}</h1></div>
    ${actions ? `<div style="display:flex;gap:.5rem">${actions}</div>` : ""}
  </div>`;
}

export function renderNotFound(main) {
  main.innerHTML = `<div class="notfound"><h1>404</h1><h2>A página que você está procurando não foi encontrada.</h2></div>`;
}

/* ---------- Ranking ---------- */
export function renderRanking(main) {
  const me = currentUser();
  const rows = [
    ...(window.CONTENT_CONFIG.ranking || []).map((r) => ({ ...r, avatar: r.avatar || avatarFor(r.name) })),
    { name: me.name, xp: myXp(), avatar: me.avatar, me: true },
  ].sort((a, b) => b.xp - a.xp);

  main.innerHTML = `
    <div class="ranking-hero">
      <div class="ranking-hero__inner">
        ${MEDAL_SVG}
        <h2>Compare seu progresso com outros participantes</h2>
        <p>Conquiste mais pontos de experiência postando comentários relevantes, avaliando e concluindo todas as aulas. Se esforce para ir até a linha de chegada e concluir seu curso com máximo de aproveitamento.</p>
      </div>
    </div>
    <div class="ranking-board">
      <div class="surface shadow-lg">
        <div class="ranking-board__head">
          <select class="form-select" aria-label="Turma">
            <option>Todas as turmas matriculadas</option>
            ${courses().filter((c) => !c.locked).map((c) => `<option>${esc(c.title)}</option>`).join("")}
          </select>
        </div>
        <div class="ranking-board__body divide-y">
          ${rows
            .map(
              (r, i) => `<div class="ranking-row ${r.me ? "me" : ""}">
                <div class="ranking-row__pos">${i + 1}</div>
                <div class="ranking-row__who"><img class="avatar avatar-10" src="${esc(r.avatar)}" alt=""><p>${esc(r.name)}${r.me ? ' <span class="text-xs text-muted">(você)</span>' : ""}</p></div>
                <div class="ranking-row__xp">${r.xp} <small>XP</small></div>
              </div>`
            )
            .join("")}
        </div>
      </div>
    </div>`;
}

/* ---------- Certificados ---------- */
export function renderCertificates(main) {
  const done = courses().filter((c) => !c.locked && flatLessons(c).length && courseProgress(c) === 100);
  main.innerHTML = `<div style="padding:1rem" class="cert-page">
    <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:2rem">
      <span style="color:hsl(var(--brand))">${icon("badge", 10)}</span>
      <h1 class="h1" style="margin-top:1rem">Enriqueça seu currículo.</h1>
      <p class="text-muted" style="margin-top:1rem;font-size:1rem">Complete todas as aulas para receber seu certificado de conclusão de curso.</p>
    </div>
    <div style="max-width:56rem;margin:0 auto">
      ${done.length
        ? `<div class="cert-list">${done
            .map(
              (c) => `<div class="cert-item surface shadow-subtle">
                <img src="${esc(c.cover)}" alt="">
                <div style="flex:1;min-width:0"><p style="font-weight:600">${esc(c.title)}</p><p class="text-xs text-muted">100% concluído</p></div>
                <a class="btn btn-primary btn-sm" href="#/certificado/${esc(c.slug)}">Ver certificado</a>
              </div>`
            )
            .join("")}</div>`
        : ""}
    </div>
  </div>`;
}

export function renderCertificate(main, { params }) {
  const c = findCourse(params.slug);
  if (!c || courseProgress(c) < 100) return renderNotFound(main);
  const b = window.PLATFORM_CONFIG.brand;
  const date = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  main.innerHTML = `<div style="padding:1rem">
    <div class="no-print" style="max-width:56rem;margin:1rem auto 0;display:flex;justify-content:space-between">
      <a href="#/certificados" class="text-muted" style="display:inline-flex;align-items:center;gap:.25rem">${icon("left", 4)} Certificados</a>
      <button type="button" class="btn btn-outline" onclick="window.print()">${icon("printer", 4)} Imprimir / salvar PDF</button>
    </div>
    <div class="certificate">
      <img src="${esc(b.logo?.src)}" alt="${esc(b.name)}">
      <p style="letter-spacing:.2em;text-transform:uppercase;font-size:.8rem">Certificado de conclusão</p>
      <h1 style="margin-top:.5rem">${esc(c.title)}</h1>
      <p>Certificamos que</p>
      <div class="who">${esc(currentUser().name)}</div>
      <p>concluiu todas as aulas do curso em ${date}.</p>
      <p style="margin-top:2.5rem;font-weight:600;color:#171717">${esc(b.name)}</p>
    </div>
  </div>`;
}

/* ---------- Notificações ---------- */
export function renderNotifications(main) {
  const list = window.CONTENT_CONFIG.notifications || [];
  main.innerHTML = `<div class="container-lg">
    ${pageHead("Notificações", `<button type="button" class="btn btn-primary" data-do="read">Marcar todos como lidos</button>`)}
    <div class="surface shadow" style="margin-top:2rem;padding:1.25rem">
      ${list.length
        ? `<div class="divide-y">${list
            .map((n) => `<div style="display:flex;gap:.75rem;padding:.75rem 0">${icon("bell", 5)}<div><p style="font-weight:500">${esc(n.title)}</p><p class="text-xs text-muted">${esc(n.date ? timeAgo(n.date) : "")}</p></div></div>`)
            .join("")}</div>`
        : `<div class="empty">${icon("bell", 10)}<h2>Nenhuma notificação nova.</h2><p>Acompanhe aqui as respostas dos seus comentários, ganho de pontuações e módulos desbloqueados.</p></div>`}
    </div>
  </div>`;
  $("[data-do=read]", main).addEventListener("click", () => toast("Tudo em dia!"));
}

/* ---------- Minha conta ---------- */
export function renderAccount(main) {
  const u = currentUser();
  main.innerHTML = `<div class="container-xl" style="padding-bottom:2rem">
    ${pageHead("Minha Conta")}
    <form class="account-grid" data-account>
      <div><h3 class="h3">Meu perfil</h3><p class="text-muted" style="margin-top:.25rem">Conte um pouco sobre você para seus colegas de turma. De onde você é? Qual resultado pretende alcançar?</p></div>
      <div class="surface shadow account-card">
        <div class="two-col">
          <div class="form-group"><label class="form-label" for="u-name">Nome completo</label><input id="u-name" name="name" class="form-input" value="${esc(u.name)}" maxlength="165"></div>
          <div class="form-group"><label class="form-label" for="u-email">Email</label><input id="u-email" name="email" type="email" class="form-input" value="${esc(u.email)}"></div>
        </div>
        <div class="two-col">
          <div class="form-group"><label class="form-label" for="u-bio">Biografia</label><textarea id="u-bio" name="bio" rows="3" class="form-textarea">${esc(u.bio)}</textarea></div>
          <div class="form-group">
            <span class="form-label">Avatar</span>
            <label style="position:relative;cursor:pointer;align-self:start;width:3rem">
              <input type="file" accept="image/*" name="avatar" class="sr-only">
              <img class="avatar avatar-12" src="${esc(u.avatar)}" alt="" data-preview>
              <span class="btn btn-primary btn-icon" style="position:absolute;right:-.25rem;bottom:-.25rem;width:1.5rem;height:1.5rem;border-radius:9999px;box-shadow:0 0 0 2px hsl(var(--card))">${icon("camera", 4)}</span>
            </label>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end"><button type="submit" class="btn btn-primary">Salvar</button></div>
      </div>
    </form>
  </div>`;

  const form = $("[data-account]", main);
  let avatar = u.avatar;
  form.avatar.addEventListener("change", () => {
    const file = form.avatar.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      /* reduz para 160px antes de salvar no navegador */
      const img = new Image();
      img.onload = () => {
        const canvas = Object.assign(document.createElement("canvas"), { width: 160, height: 160 });
        const s = Math.min(img.width, img.height);
        canvas.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 160, 160);
        avatar = canvas.toDataURL("image/jpeg", 0.85);
        $("[data-preview]", form).src = avatar;
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    store.set("profile", { name: form.name.value.trim(), email: form.email.value.trim(), bio: form.bio.value.trim(), avatar });
    toast("Perfil atualizado");
    window.dispatchEvent(new Event("mk:remount"));
  });
}

/* ---------- Busca ---------- */
export function renderSearch(main, { query }) {
  const q = (query.get("q") || "").trim();
  const type = query.get("tipo") || "";
  const needle = q.toLowerCase();
  const hl = (text) => {
    const safe = esc(text);
    if (!q) return safe;
    const re = new RegExp("(" + esc(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
    return safe.replace(re, "<mark>$1</mark>");
  };

  const open = courses().filter((c) => !c.locked);
  const courseHits = q ? open.filter((c) => (c.title + " " + (c.description || "")).toLowerCase().includes(needle)) : [];
  const lessonHits = q
    ? open.flatMap((c) => flatLessons(c).filter((l) => l.title.toLowerCase().includes(needle)).map((l) => ({ c, l })))
    : [];
  const total = courseHits.length + lessonHits.length;

  const filter = (key, label, ic, n) => `<a class="search-filter" aria-selected="${type === key}" href="#/busca?q=${encodeURIComponent(q)}${key ? "&tipo=" + key : ""}">
      <span class="search-filter__icon">${icon(ic)}</span><p>${label}</p><span class="badge ${type === key ? "badge-brand" : "badge-secondary"}">${n}</span></a>`;

  const items = [
    ...(type !== "aulas" ? courseHits.map((c) => `<a class="search-result" href="#/curso/${esc(c.slug)}"><img src="${esc(c.cover)}" alt=""><div><p class="text-xs text-muted">Curso</p><p style="font-weight:500;font-size:1rem">${hl(c.title)}</p></div></a>`) : []),
    ...(type !== "cursos" ? lessonHits.map(({ c, l }) => `<a class="search-result" href="${lessonHref(c, l)}"><img src="${esc(l.thumbnail)}" alt=""><div><p class="text-xs text-muted">${esc(c.title)} · ${esc(l.module.title)}</p><p style="font-weight:500;font-size:1rem">${hl(l.title)}</p></div></a>`) : []),
  ];

  main.innerHTML = `<div class="search-page">
    <div class="search-grid">
      <form class="stack-input full" data-search-page>
        <input type="text" name="q" class="form-input form-input-md" placeholder="Digite as palavras-chave" value="${esc(q)}" aria-label="Buscar" style="padding-right:2.25rem">
        <button type="submit" class="text-muted" style="margin-right:.875rem" aria-label="Buscar">${icon("search")}</button>
      </form>
      <h4 class="h4 full">${q ? `${total} ${total === 1 ? "resultado" : "resultados"} para “${esc(q)}”` : "Digite algo para pesquisar"}</h4>
      <nav class="search-filters">
        ${filter("", "Todos", "search", total)}
        ${filter("cursos", "Cursos", "collection", courseHits.length)}
        ${filter("aulas", "Aulas", "play", lessonHits.length)}
      </nav>
      <div>${items.length ? `<div class="surface shadow-subtle divide-y">${items.join("")}</div>` : q ? `<div class="surface empty">${icon("search", 10)}<h2>Nada encontrado</h2><p>Tente outras palavras-chave.</p></div>` : ""}</div>
    </div>
  </div>`;

  const form = $("[data-search-page]", main);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    location.hash = "#/busca?q=" + encodeURIComponent(form.q.value.trim());
  });
}
