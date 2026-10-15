/* Página da aula: player + lista lateral, breadcrumbs com ações,
   conteúdo, avaliação/conclusão e comentários. */

import { icon } from "../icons.js";
import { esc, $, $$, toast, timeAgo, autogrow } from "../util.js";
import { store } from "../store.js";
import {
  findCourse, findLesson, flatLessons, courseProgress, lessonHref, moduleHref,
  isDone, currentUser,
} from "../content.js";
import { renderNotFound } from "./misc.js";

const RATINGS = [
  ["😠", "Muito ruim"],
  ["😞", "Ruim"],
  ["😐", "Razoável"],
  ["🙂", "Muito bom"],
  ["😀", "Excelente"],
];

function player(lesson) {
  const v = lesson.video;
  if (!v) return `<div class="player__empty">${icon("doc", 10)}<span>Conteúdo em texto</span></div>`;
  if (v.provider === "placeholder") return `<div class="player__empty player__placeholder">${icon("play", 10)}<span>VÍDEO 16:9</span></div>`;
  let src = "";
  if (v.provider === "youtube") src = `https://www.youtube.com/embed/${encodeURIComponent(v.id)}?rel=0&modestbranding=1&iv_load_policy=3`;
  else if (v.provider === "vimeo") src = `https://player.vimeo.com/video/${encodeURIComponent(v.id)}?dnt=1`;
  else if (v.provider === "iframe") src = v.src;
  if (!src) return `<div class="player__empty">${icon("play", 10)}</div>`;
  return `<iframe src="${esc(src)}" title="${esc(lesson.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
}

function commentsList(lessonId, tab) {
  const me = currentUser();
  let list = store.get("comments", []).filter((c) => c.lesson === lessonId);
  if (tab === "mine") list = list.filter((c) => c.mine);
  list.sort((a, b) => (tab === "older" ? a.at - b.at : b.at - a.at));
  if (!list.length)
    return `<div class="empty" style="padding:2rem 0">${icon("chat", 10)}<h2>Nenhum comentário ainda</h2><p>Seja o primeiro a comentar este conteúdo.</p></div>`;
  return list
    .map(
      (c) => `<div class="comment">
        <img class="avatar avatar-10" src="${esc(me.avatar)}" alt="">
        <div>
          <div class="comment__head"><strong>${esc(c.author)}</strong><span class="text-xs text-muted">${timeAgo(c.at)}</span></div>
          <p class="comment__body">${esc(c.body)}</p>
        </div>
      </div>`
    )
    .join("");
}

export function renderLesson(main, { params, query }) {
  const course = findCourse(params.slug);
  const lesson = findLesson(course, params.id);
  if (!course || !lesson) return renderNotFound(main);
  document.title = `${lesson.title} · ${window.PLATFORM_CONFIG.brand.name}`;

  const all = flatLessons(course);
  const idx = all.findIndex((l) => l.id === lesson.id);
  const prev = all[idx - 1];
  const next = all[idx + 1];
  const mod = lesson.module;
  const siblings = mod.lessons || [];
  const tab = ["recent", "older", "mine"].includes(query.get("tab")) ? query.get("tab") : "recent";
  const rating = store.mapGet("ratings", lesson.id);
  const wide = store.get("layout") === "wide";
  const me = currentUser();
  const base = lessonHref(course, lesson);

  main.innerHTML = `
  <div class="theater-band ${wide ? "layout-wide" : ""}" data-band>
    <div class="theater-band__inner">
      <div class="player">${player(lesson)}</div>
      <div class="aside-entries" id="aside-entries">
        <div class="aside-entries__scroll">
          ${siblings
            .map(
              (l) => `<a class="aside-entry ${l.id === lesson.id ? "active" : ""}" href="${lessonHref(course, l)}" ${l.id === lesson.id ? 'aria-current="page"' : ""}>
                <img src="${esc(l.thumbnail)}" alt="" width="60" height="34">
                <div>${esc(l.title)}</div>
                ${isDone(l.id) ? `<span class="done-dot">${icon("checkCircle", 5)}</span>` : ""}
              </a>`
            )
            .join("")}
        </div>
      </div>
    </div>
  </div>

  <div class="breadcrumbs no-print">
    <div class="breadcrumbs__inner">
      <nav class="crumbs" aria-label="Você está em">
        <a href="#/" aria-label="Início">${icon("home", 4)}</a>
        ${icon("crumb", 5)}<a href="#/curso/${esc(course.slug)}">${esc(course.title)}</a>
        ${icon("crumb", 5)}<a href="${moduleHref(course, mod)}">${esc(mod.title)}</a>
      </nav>
      <div class="lesson-actions">
        <button type="button" class="btn btn-outline-secondary btn-md btn-square layout-toggle" data-do="layout" title="Alternar layout" aria-controls="aside-entries">${icon("expand", 5)}</button>
        <button type="button" class="btn btn-outline-secondary btn-md btn-square" data-do="lights" title="Apagar as luzes">${icon("bulb", 5)}</button>
        <button type="button" class="btn btn-outline-secondary btn-md btn-square ${store.has("bookmarks", lesson.id) ? "active" : ""}" data-do="bookmark" title="Adicionar aos favoritos" aria-pressed="${store.has("bookmarks", lesson.id)}">${icon("bookmark", 5)}</button>
        <div class="join">
          <a class="btn btn-outline-secondary btn-md btn-square ${prev ? "" : "disabled"}" href="${prev ? lessonHref(course, prev) : "#"}" title="Anterior" aria-label="Aula anterior">${icon("left", 5)}</a>
          <a class="btn btn-outline-secondary btn-md btn-square ${next ? "" : "disabled"}" href="${next ? lessonHref(course, next) : "#"}" title="Próximo" aria-label="Próxima aula">${icon("right", 5)}</a>
        </div>
      </div>
    </div>
  </div>

  <div class="container-xl" style="padding-bottom:2rem">
    <div class="lesson-grid">
      <div class="lesson-grid__main">
        <h2 class="h1 lesson-title">${esc(lesson.title)}</h2>
        <div class="prose" style="margin-top:2rem">${lesson.content || ""}</div>
        ${(lesson.attachments || []).length
          ? `<div class="attachments surface divide-y">
              ${lesson.attachments.map((a) => `<a href="${esc(a.href)}" target="_blank" rel="noopener" download>${icon("download", 5)}<span>${esc(a.title)}</span></a>`).join("")}
            </div>`
          : ""}
      </div>

      <div class="lesson-grid__side">
        <div class="popout surface shadow-subtle">
          <p class="popout__title">Como você avalia este conteúdo?</p>
          <div class="ratings" role="group" aria-label="Avaliação">
            ${RATINGS.map(
              ([emoji, label], i) => `<button type="button" data-do="rate" data-value="${i + 1}" title="${label}" aria-label="${label}"
                data-state="${rating === i + 1 ? "active" : "inactive"}">${emoji}</button>`
            ).join("")}
          </div>
          <button type="button" class="btn btn-block btn-md ${isDone(lesson.id) ? "btn-done" : "btn-outline-secondary"}" data-do="complete">
            ${isDone(lesson.id) ? `${icon("check", 4)} Concluído` : "Marcar como concluído"}
          </button>
          <div class="popout__progress">
            <div class="progress progress--lg"><div style="width:${courseProgress(course)}%"></div></div>
            <span>${courseProgress(course)}%</span>
          </div>
        </div>
      </div>

      <div class="lesson-grid__main" id="comments">
        <h3 class="h2" style="font-weight:500">Comentários</h3>
        <form class="comment-form" data-comment>
          <img class="avatar avatar-10" src="${esc(me.avatar)}" alt="">
          <div class="stack-input" style="flex-grow:1">
            <textarea class="form-textarea" rows="1" maxlength="2400" required placeholder="Escreva seu comentário…" aria-label="Comentário"></textarea>
            <button type="submit" class="btn btn-primary btn-sm">Publicar</button>
          </div>
        </form>
        <div class="comments-bar">
          <nav class="tabs-box" role="tablist">
            ${[["recent", "Mais recentes"], ["older", "Mais antigos"], ["mine", "Meus comentários"]]
              .map(([k, l]) => `<a class="tab" role="tab" aria-selected="${tab === k}" href="${base}?tab=${k}">${l}</a>`)
              .join("")}
          </nav>
        </div>
        <div style="margin-top:1rem" class="divide-y" data-comments>${commentsList(lesson.id, tab)}</div>
      </div>
    </div>
  </div>`;

  bind(main, { course, lesson, tab });
}

function bind(main, { course, lesson, tab }) {
  const rerender = () => window.dispatchEvent(new Event("hashchange"));

  main.querySelectorAll("[data-do]").forEach((el) =>
    el.addEventListener("click", () => {
      const what = el.dataset.do;
      if (what === "layout") {
        const wide = store.get("layout") !== "wide";
        store.set("layout", wide ? "wide" : "default");
        $("[data-band]", main).classList.toggle("layout-wide", wide);
      } else if (what === "lights") {
        const ov = document.createElement("div");
        ov.className = "theater-overlay";
        ov.title = "Clique para acender as luzes";
        ov.addEventListener("click", () => {
          ov.dataset.state = "";
          setTimeout(() => ov.remove(), 200);
        });
        document.body.append(ov);
        requestAnimationFrame(() => (ov.dataset.state = "open"));
        $(".player", main).style.zIndex = 31;
      } else if (what === "bookmark") {
        const on = store.toggle("bookmarks", lesson.id);
        el.classList.toggle("active", on);
        el.setAttribute("aria-pressed", String(on));
        toast(on ? "Adicionado aos favoritos" : "Removido dos favoritos");
      } else if (what === "rate") {
        store.mapSet("ratings", lesson.id, Number(el.dataset.value));
        $$("[data-do=rate]", main).forEach((b) => (b.dataset.state = b === el ? "active" : "inactive"));
        toast("Obrigado pela avaliação!");
      } else if (what === "complete") {
        const done = store.toggle("done", lesson.id);
        if (done) {
          const all = flatLessons(course);
          const next = all[all.findIndex((l) => l.id === lesson.id) + 1];
          toast(courseProgress(course) === 100 ? "Curso concluído! 🎉" : "Conteúdo concluído");
          if (next) return void (location.hash = lessonHref(course, next));
        }
        rerender();
      }
    })
  );

  /* "apagar as luzes": o player fica acima da sobreposição */
  $(".player", main).style.position = "relative";

  const form = $("[data-comment]", main);
  const ta = $("textarea", form);
  autogrow(ta);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const body = ta.value.trim();
    if (!body) return;
    store.push("comments", { lesson: lesson.id, author: currentUser().name, body, at: Date.now(), mine: true });
    ta.value = "";
    autogrow(ta);
    $("[data-comments]", main).innerHTML = commentsList(lesson.id, tab);
    toast("Comentário publicado");
  });
}
