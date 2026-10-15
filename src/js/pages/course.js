/* Página do curso (hero + módulos) e página do módulo (hero + lista de aulas). */

import { icon } from "../icons.js";
import { esc, absUrl } from "../util.js";
import {
  findCourse, findModule, flatLessons, courseProgress, courseDuration,
  nextLesson, lessonHref, moduleHref, isDone,
} from "../content.js";
import { renderNotFound } from "./misc.js";

function hero(course, { linkTitle = false } = {}) {
  const p = courseProgress(course);
  const total = flatLessons(course).length;
  const next = nextLesson(course);
  const dur = courseDuration(course);
  const title = linkTitle ? `<a href="#/curso/${esc(course.slug)}" style="color:#fff">${esc(course.title)}</a>` : esc(course.title);
  return `<div class="hero" style="--art-background:url('${esc(absUrl(course.heroImage || course.cover))}')">
    <h2 class="h1 hero__title">${title}</h2>
    <p class="hero__desc">${esc(course.description || course.subtitle || "")}</p>
    <div class="hero__meta">${dur ? `<span>${dur}</span>` : ""}<span>${total} ${total === 1 ? "conteúdo" : "conteúdos"}</span></div>
    <div class="hero__progress"><div class="progress"><div style="width:${p}%"></div></div><span>${p}%</span></div>
    ${next ? `<a class="btn btn-primary" href="${lessonHref(course, next)}">${p > 0 && p < 100 ? "continuar" : p === 100 ? "rever conteúdo" : "começar agora"}</a>` : ""}
  </div>`;
}

export function renderCourse(main, { params }) {
  const course = findCourse(params.slug);
  if (!course || course.locked) return renderNotFound(main);
  document.title = `${course.title} · ${window.PLATFORM_CONFIG.brand.name}`;

  main.innerHTML = `<div class="course-wrap"><div class="container-6xl">
    ${hero(course)}
    <div style="margin-top:2rem">
      <h3 class="section-title">Módulos</h3>
      <div class="module-grid">
        ${(course.modules || [])
          .map((m) => {
            const done = (m.lessons || []).filter((l) => isDone(l.id)).length;
            const all = (m.lessons || []).length;
            return `<div class="module-card">
              <a href="${moduleHref(course, m)}" aria-label="${esc(m.title)}">
                <img src="${esc(m.cover)}" alt="" loading="lazy">
                <div class="module-card__shade"></div>
                ${all && done === all ? `<span class="badge badge-brand module-card__count">${icon("check", 4)}</span>` : ""}
                <div class="module-card__label"><p>${esc(m.title)}</p></div>
              </a>
            </div>`;
          })
          .join("")}
      </div>
    </div>
  </div></div>`;
}

export function renderModule(main, { params }) {
  const course = findCourse(params.slug);
  const mod = findModule(course, params.id);
  if (!course || !mod) return renderNotFound(main);
  document.title = `${mod.title} · ${window.PLATFORM_CONFIG.brand.name}`;

  const mods = course.modules;
  const nextMod = mods[mods.indexOf(mod) + 1];

  main.innerHTML = `<div class="course-wrap"><div class="container-6xl">
    ${hero(course, { linkTitle: true })}
    <div class="module-head">
      <div style="flex-grow:1">
        <h3 class="section-title">${esc(mod.title)} <a href="#/curso/${esc(course.slug)}">Ver todos →</a></h3>
        <p class="text-muted">${esc(mod.description || "")}</p>
      </div>
    </div>
    <div class="lesson-list surface shadow-subtle divide-y">
      ${(mod.lessons || [])
        .map(
          (l) => `<div class="lesson-row">
            <span class="lesson-row__check ${isDone(l.id) ? "done" : ""}" title="${isDone(l.id) ? "Concluída" : "Não concluída"}">${icon("check", 4)}</span>
            <a href="${lessonHref(course, l)}" tabindex="-1" aria-hidden="true"><img src="${esc(l.thumbnail)}" alt="" loading="lazy"></a>
            <div class="lesson-row__body">
              <a href="${lessonHref(course, l)}">${esc(l.title)}</a>
              ${l.duration ? `<span class="text-xs text-muted">${esc(l.duration)}</span>` : ""}
            </div>
            <span class="lesson-row__play">${icon(l.video ? "play" : "doc", 5)}</span>
          </div>`
        )
        .join("") || `<div class="empty">${icon("inbox", 10)}<h2>Nenhum conteúdo neste módulo</h2></div>`}
    </div>
    ${nextMod
      ? `<div class="module-foot">
          <span class="text-xs text-muted">${esc(nextMod.title)}</span><span class="sep"></span>
          <a href="${moduleHref(course, nextMod)}" style="font-weight:500">Próximo</a>
          <a class="btn btn-outline btn-square" href="${moduleHref(course, nextMod)}" aria-label="Próximo módulo">${icon("right", 5)}</a>
        </div>`
      : ""}
  </div></div>`;
}
