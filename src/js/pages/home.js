/* Vitrine: banners + chips de categoria + grade de cursos. */

import { icon } from "../icons.js";
import { esc, $, $$ } from "../util.js";
import { courses, categories, banners, courseProgress, courseHref } from "../content.js";

function courseCard(c) {
  const p = courseProgress(c);
  const external = c.locked && c.offerUrl;
  const attrs = `href="${esc(courseHref(c))}"${external ? ' target="_blank" rel="noopener"' : ""}`;
  return `<div class="course-card">
    <div class="course-card__media">
      <a ${attrs} tabindex="-1" aria-hidden="true"><img src="${esc(c.cover)}" alt="" loading="lazy"></a>
      ${c.locked
        ? `<div class="course-card__lock"><span>${icon("lock", 4)} Bloqueado</span></div>`
        : `<div class="course-card__progress"><div class="progress"><div style="width:${p}%"></div></div></div>`}
    </div>
    <div class="course-card__body">
      <a class="course-card__title" ${attrs}>${esc(c.title)}</a>
      <p class="course-card__sub">${esc(c.subtitle || "")}</p>
    </div>
  </div>`;
}

function bannerCarousel(list) {
  if (!list.length) return "";
  return `<div class="banners" data-banners aria-roledescription="carrossel">
    <div class="banners__track">
      ${list
        .map((b, i) => {
          const img = `<img src="${esc(b.src)}" alt="${esc(b.alt || "")}" ${i ? 'loading="lazy"' : ""}>`;
          return `<div class="banners__slide">${b.href ? `<a href="${esc(b.href)}">${img}</a>` : img}</div>`;
        })
        .join("")}
    </div>
    ${list.length > 1
      ? `<div class="banners__dots">${list.map((_, i) => `<button type="button" aria-label="Banner ${i + 1}" ${i ? "" : 'aria-current="true"'}></button>`).join("")}</div>`
      : ""}
  </div>`;
}

export function renderHome(main, { query }) {
  const cats = categories();
  const active = query.get("categoria") || "";
  const all = courses();

  /* seções: uma por categoria (na ordem do config) + "Conteúdos" para os sem categoria */
  const shelves = [];
  const loose = all.filter((c) => !c.category || !cats.some((k) => k.id === c.category));
  if (!active) {
    if (loose.length) shelves.push({ title: "Conteúdos", items: loose });
    cats.forEach((k) => {
      const items = all.filter((c) => c.category === k.id);
      if (items.length) shelves.push({ title: k.title, items });
    });
  } else {
    const k = cats.find((x) => x.id === active);
    shelves.push({ title: k ? k.title : "Conteúdos", items: all.filter((c) => c.category === active) });
  }

  main.innerHTML = `
    <div class="page-pad">
      ${bannerCarousel(banners())}
      ${cats.length
        ? `<nav class="chips" aria-label="Categorias">
            <a class="btn btn-secondary ${active ? "" : "active"}" href="#/">Início</a>
            ${cats.map((k) => `<a class="btn btn-secondary ${active === k.id ? "active" : ""}" href="#/?categoria=${esc(k.id)}">${esc(k.title)}</a>`).join("")}
          </nav>`
        : ""}
    </div>
    <div class="page-x">
      ${shelves
        .map((s) => `<section><h3 class="h2 shelf-title">${esc(s.title)}</h3><div class="course-grid">${s.items.map(courseCard).join("")}</div></section>`)
        .join("")}
      ${shelves.every((s) => !s.items.length)
        ? `<div class="surface shadow empty">${icon("collection", 10)}<h2>Nenhum conteúdo por aqui</h2><p>Os cursos desta categoria aparecerão aqui.</p></div>`
        : ""}
      <div style="height:2rem"></div>
    </div>`;

  startCarousel($("[data-banners]", main));
}

function startCarousel(el) {
  if (!el) return;
  const track = $(".banners__track", el);
  const dots = $$(".banners__dots button", el);
  if (dots.length < 2) return;
  let i = 0;
  const go = (n) => {
    i = (n + dots.length) % dots.length;
    track.style.transform = `translateX(-${i * 100}%)`;
    dots.forEach((d, k) => d.setAttribute("aria-current", String(k === i)));
  };
  dots.forEach((d, k) => d.addEventListener("click", () => go(k)));
  const timer = setInterval(() => {
    if (!document.body.contains(el)) return clearInterval(timer);
    if (!el.matches(":hover")) go(i + 1);
  }, 6000);
}
