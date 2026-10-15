/* Estrutura fixa: topbar + barra lateral + área principal. IMUTÁVEL. */

import { icon } from "./icons.js";
import { esc, $, $$ } from "./util.js";
import { store } from "./store.js";
import { navbarClasses, topbarState, isDark, toggleDarkMode } from "./theme.js";
import { currentUser } from "./content.js";

const NAV = [
  { key: "home", href: "#/", label: "Conteúdos", icon: "home", match: /^\/($|curso|busca)/ },
  { key: "community", href: "#/comunidade", label: "Comunidades", icon: "community", match: /^\/comunidade/ },
  { key: "ranking", href: "#/ranking", label: "Ranking", icon: "flag", match: /^\/ranking/ },
  { key: "certificates", href: "#/certificados", label: "Certificados", icon: "badge", match: /^\/certificado/ },
];

function navItems() {
  const menu = window.PLATFORM_CONFIG.menu || {};
  return NAV.filter((n) => n.key === "home" || menu[n.key] !== false);
}

/* logo claro (srcDark) quando o fundo atrás dele é escuro */
export function logoImg(onDark = false) {
  const b = window.PLATFORM_CONFIG.brand;
  const src = (onDark && b.logo?.srcDark) || b.logo?.src;
  return `<img src="${esc(src)}" alt="${esc(b.logo?.alt || b.name)}">`;
}

function searchForm(cls, inputCls, iconSize) {
  return `<form class="${cls}" data-search role="search">
    <label class="sr-only" for="${cls}-q">Buscar</label>
    <input id="${cls}-q" type="text" name="q" class="${inputCls}" placeholder="Pesquisar" autocomplete="off">
    <button type="submit" aria-label="Buscar">${icon("search", iconSize)}</button>
  </form>`;
}

/* monta o shell uma vez; as páginas só trocam o conteúdo de #main */
export function mountShell(root) {
  const t = topbarState();
  const user = currentUser();
  const unread = (window.CONTENT_CONFIG.notifications || []).filter((n) => !n.read).length;

  root.innerHTML = `
  <header class="topbar ${t.dark ? "dark" : ""}" data-theme="${t.theme}">
    <div class="topbar__left">
      <button type="button" class="topbar__button" data-action="nav-toggle" aria-label="Abrir/fechar menu" style="margin-right:.5rem">${icon("menu")}</button>
      <a class="topbar__logo" href="#/">${logoImg(t.dark)}</a>
    </div>
    <div class="topbar__right">
      <div class="topbar__search">${searchForm("search-control", "topbar__search-input", 6)}</div>
      <div style="display:flex">
        <button type="button" class="topbar__button md-only" data-action="theme" aria-label="Alternar tema">${icon(isDark() ? "sun" : "moon")}</button>
        <a class="topbar__button md-only" href="#/notificacoes" aria-label="Notificações">${icon("bell")}${unread ? `<span class="topbar__badge">${unread}</span>` : ""}</a>
      </div>
      <div class="dropdown" data-dropdown>
        <button type="button" class="topbar__button" data-action="dropdown" aria-haspopup="true" aria-expanded="false" aria-label="Menu do usuário">
          <img src="${esc(user.avatar)}" alt="">
        </button>
        <div class="dropdown-menu" role="menu">
          <div class="dropdown-head"><p style="font-weight:600">${esc(user.name)}</p><p>${esc(user.email)}</p></div>
          <div>
            <a href="#/conta" role="menuitem">Minha conta</a>
            <a href="#/notificacoes" role="menuitem">Notificações</a>
            <button type="button" data-action="theme" role="menuitem">Alternar tema</button>
          </div>
        </div>
      </div>
    </div>
  </header>
  <div class="base ${isDark() ? "dark" : ""}">
    <nav id="navbar" class="navbar ${navbarClasses()}" data-state="${store.get("menu") === "open" ? "open" : "close"}" aria-label="Menu principal">
      <div class="navbar__inner">
        <div class="navbar__group">
          <div class="navbar__mobile-head">
            <div class="row">
              <button type="button" class="navbar__button" data-action="nav-toggle" aria-label="Fechar menu">${icon("menu")}</button>
              <a href="#/">${logoImg(navbarClasses().includes("navbar-dark"))}</a>
            </div>
            ${searchForm("navbar__search", "", 5)}
          </div>
          ${navItems()
            .map(
              (n) => `<a class="navbar__link" data-nav="${n.key}" href="${n.href}" data-tip="${esc(n.label)}">${icon(n.icon)}<span class="navbar__text">${esc(n.label)}</span></a>`
            )
            .join("")}
        </div>
        <hr class="navbar__divisor">
        <div class="navbar__group">
          <a class="navbar__link" data-nav="account" href="#/conta" data-tip="Minha conta">${icon("user")}<span class="navbar__text">Minha conta</span></a>
        </div>
      </div>
    </nav>
    <div class="navbar-backdrop" data-action="nav-close"></div>
    <main id="main" class="main"></main>
  </div>`;

  bindShell(root);
}

function bindShell(root) {
  const navbar = $("#navbar", root);

  /* busca (topbar e gaveta mobile) */
  $$("form[data-search]", root).forEach((form) =>
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const q = form.q.value.trim();
      location.hash = "#/busca?q=" + encodeURIComponent(q);
    })
  );

  /* tooltip dos ícones quando a barra está recolhida */
  let tip;
  navbar.addEventListener("mouseover", (e) => {
    const link = e.target.closest(".navbar__link");
    if (!link || navbar.dataset.state === "open" || !window.matchMedia("(min-width: 640px)").matches) return;
    tip ??= Object.assign(document.createElement("div"), { className: "navbar__tip" });
    tip.textContent = link.dataset.tip;
    const r = link.getBoundingClientRect();
    tip.style.left = r.right + 10 + "px";
    tip.style.top = r.top + r.height / 2 + "px";
    document.body.append(tip);
  });
  navbar.addEventListener("mouseout", () => tip?.remove());

  /* listeners delegados: registrados uma única vez, mesmo após remontar o shell */
  if (root.dataset.bound) return;
  root.dataset.bound = "1";

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdowns();
  });

  root.addEventListener("click", (e) => {
    const navbar = $("#navbar", root);
    const el = e.target.closest("[data-action]");
    if (!el) {
      closeDropdowns();
      return;
    }
    const action = el.dataset.action;
    if (action === "nav-toggle") {
      const open = navbar.dataset.state !== "open";
      navbar.dataset.state = open ? "open" : "close";
      if (window.matchMedia("(min-width: 640px)").matches) store.set("menu", open ? "open" : "close");
    } else if (action === "nav-close") {
      navbar.dataset.state = "close";
    } else if (action === "theme") {
      toggleDarkMode();
      window.dispatchEvent(new Event("mk:remount"));
    } else if (action === "dropdown") {
      e.stopPropagation();
      const dd = el.closest("[data-dropdown]");
      const open = dd.dataset.state !== "open";
      closeDropdowns();
      dd.dataset.state = open ? "open" : "";
      el.setAttribute("aria-expanded", String(open));
    }
  });
}

function closeDropdowns() {
  $$("[data-dropdown][data-state=open]").forEach((d) => {
    d.dataset.state = "";
    $("[data-action=dropdown]", d)?.setAttribute("aria-expanded", "false");
  });
}

/* chamado a cada navegação */
export function updateShell(path, { white = false } = {}) {
  const items = navItems();
  $$(".navbar__link").forEach((a) => {
    const item = items.find((n) => n.key === a.dataset.nav);
    const active = item ? item.match.test(path) : a.dataset.nav === "account" && /^\/conta/.test(path);
    a.classList.toggle("active", active);
    if (active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  const main = $("#main");
  main.className = "main" + (white ? " main--white" : "");
  main.scrollTop = 0;
  if (!window.matchMedia("(min-width: 640px)").matches) $("#navbar").dataset.state = "close";
  closeDropdowns();
  return main;
}
