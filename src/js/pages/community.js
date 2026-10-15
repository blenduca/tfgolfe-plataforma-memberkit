/* Comunidade: lista de posts com filtros + página do post. */

import { icon } from "../icons.js";
import { esc, $, toast, timeAgo, autogrow } from "../util.js";
import { store } from "../store.js";
import { forums, currentUser, avatarFor } from "../content.js";
import { renderNotFound } from "./misc.js";

const FILTERS = [
  ["", "Todos os posts", "collection"],
  ["mine", "Minhas perguntas", "user"],
  ["answered", "Resolvido", "checkCircle"],
  ["unanswered", "Não resolvido", "question"],
];

function allPosts() {
  const seeded = (window.CONTENT_CONFIG.posts || []).map((p) => ({ ...p, at: new Date(p.date).getTime() }));
  const mine = store.get("posts", []);
  const extra = store.get("postComments", {});
  return [...mine, ...seeded]
    .map((p) => ({ ...p, comments: [...(p.comments || []), ...(extra[p.id] || [])] }))
    .sort((a, b) => b.at - a.at);
}

const forumTitle = (id) => forums().find((f) => f.id === id)?.title || "";

function sidebar(active, forum) {
  return `<aside class="community__side"><div>
    <button type="button" class="btn btn-primary btn-block" data-do="new">${icon("plus", 4)} Nova publicação</button>
    <form class="stack-input" style="margin-top:.5rem" data-post-search>
      <input type="text" name="q" class="form-input search-soft" placeholder="Pesquisar" aria-label="Pesquisar publicações">
      <button type="submit" class="btn btn-ghost btn-icon" style="margin-right:.5rem" aria-label="Buscar">${icon("search", 4)}</button>
    </form>
    <nav class="side-nav">
      ${FILTERS.map(([k, l, ic]) => `<a href="#/comunidade${k ? "?f=" + k : ""}" aria-selected="${!forum && active === k}">${icon(ic, 5)}<span>${l}</span></a>`).join("")}
    </nav>
    ${forums().length
      ? `<span class="side-label">Comunidades</span>
         <nav class="side-nav" style="margin-top:.5rem">
           ${forums().map((f) => `<a href="#/comunidade?forum=${esc(f.id)}" aria-selected="${forum === f.id}"><span style="width:.5rem;height:.5rem;border-radius:9999px;background:hsl(var(--brand))"></span><span>${esc(f.title)}</span></a>`).join("")}
         </nav>`
      : ""}
  </div></aside>`;
}

function composer() {
  return `<form class="surface shadow" style="padding:1.25rem;display:grid;gap:1rem;margin-bottom:1rem" data-composer>
    <div class="form-group"><label class="form-label" for="post-title">Título</label><input id="post-title" class="form-input" name="title" required maxlength="140"></div>
    <div class="form-group"><label class="form-label" for="post-forum">Comunidade</label>
      <select id="post-forum" class="form-select" name="forum">${forums().map((f) => `<option value="${esc(f.id)}">${esc(f.title)}</option>`).join("")}</select></div>
    <div class="form-group"><label class="form-label" for="post-body">Mensagem</label><textarea id="post-body" class="form-textarea" name="body" rows="4" required></textarea></div>
    <div style="display:flex;gap:.5rem;justify-content:flex-end">
      <button type="button" class="btn btn-ghost" data-do="cancel">Cancelar</button>
      <button type="submit" class="btn btn-primary">Publicar</button>
    </div>
  </form>`;
}

export function renderCommunity(main, { query }) {
  const f = query.get("f") || "";
  const forum = query.get("forum") || "";
  const q = (query.get("q") || "").toLowerCase();
  let posts = allPosts();
  if (forum) posts = posts.filter((p) => p.forum === forum);
  if (f === "mine") posts = posts.filter((p) => p.mine);
  if (f === "answered") posts = posts.filter((p) => p.answered);
  if (f === "unanswered") posts = posts.filter((p) => !p.answered);
  if (q) posts = posts.filter((p) => (p.title + " " + p.body).toLowerCase().includes(q));

  main.innerHTML = `<div style="padding:1.5rem 1rem 1rem" class="md-pad-community">
    <div style="max-width:72rem;margin:0 auto">
      <div class="community">
        ${sidebar(f, forum)}
        <div class="community__feed">
          <div data-composer-slot></div>
          ${posts.length
            ? `<div class="surface shadow divide-y">${posts
                .map(
                  (p) => `<article class="post">
                    <img class="avatar avatar-10" src="${p.mine ? esc(currentUser().avatar) : avatarFor(p.author)}" alt="">
                    <div style="min-width:0;flex:1">
                      <a class="post__title" href="#/comunidade/post/${esc(p.id)}">${esc(p.title)}</a>
                      <div class="post__meta"><span>${esc(p.author)}</span><span>·</span><span>${timeAgo(p.at)}</span>
                        ${p.forum ? `<span class="badge badge-secondary">${esc(forumTitle(p.forum))}</span>` : ""}
                        ${p.answered ? `<span class="badge badge-success">Resolvido</span>` : ""}</div>
                      <p class="post__excerpt">${esc(p.body)}</p>
                    </div>
                    <span class="post__stats">${icon("chat", 4)} ${p.comments.length}</span>
                  </article>`
                )
                .join("")}</div>`
            : `<div class="surface shadow empty" style="min-height:20rem;justify-content:center">${icon("community", 10)}<h2>Não há publicações neste momento</h2><p>Crie o primeiro tópico ou compartilhe algo incrível neste espaço.</p></div>`}
        </div>
      </div>
    </div>
  </div>`;

  const slot = $("[data-composer-slot]", main);
  $("[data-do=new]", main).addEventListener("click", () => {
    if (!forums().length) return toast("Cadastre ao menos uma comunidade em content.config.js");
    slot.innerHTML = composer();
    $("#post-title", slot).focus();
    $("[data-do=cancel]", slot).addEventListener("click", () => (slot.innerHTML = ""));
    $("[data-composer]", slot).addEventListener("submit", (e) => {
      e.preventDefault();
      const form = e.target;
      store.push("posts", {
        id: "u" + Date.now(),
        forum: form.forum.value,
        author: currentUser().name,
        title: form.title.value.trim(),
        body: form.body.value.trim(),
        at: Date.now(),
        mine: true,
        answered: false,
        comments: [],
      });
      toast("Publicação criada");
      window.dispatchEvent(new Event("hashchange"));
    });
  });

  const search = $("[data-post-search]", main);
  search.q.value = query.get("q") || "";
  search.addEventListener("submit", (e) => {
    e.preventDefault();
    location.hash = "#/comunidade?q=" + encodeURIComponent(search.q.value.trim());
  });
}

export function renderPost(main, { params }) {
  const post = allPosts().find((p) => p.id === params.id);
  if (!post) return renderNotFound(main);
  const me = currentUser();

  main.innerHTML = `<div style="padding:1.5rem 1rem 2rem">
    <div style="max-width:48rem;margin:0 auto">
      <a href="#/comunidade" class="text-muted" style="display:inline-flex;align-items:center;gap:.25rem">${icon("left", 4)} Comunidade</a>
      <article class="surface shadow" style="margin-top:1rem;padding:1.5rem">
        <div style="display:flex;gap:.75rem;align-items:center">
          <img class="avatar avatar-10" src="${post.mine ? esc(me.avatar) : avatarFor(post.author)}" alt="">
          <div><p style="font-weight:600">${esc(post.author)}</p><p class="text-xs text-muted">${timeAgo(post.at)}${post.forum ? " · " + esc(forumTitle(post.forum)) : ""}</p></div>
          ${post.answered ? `<span class="badge badge-success" style="margin-left:auto">Resolvido</span>` : ""}
        </div>
        <h1 class="h1" style="margin-top:1.25rem">${esc(post.title)}</h1>
        <p class="prose" style="margin-top:.75rem;white-space:pre-line">${esc(post.body)}</p>
      </article>
      <h3 class="h3" style="margin-top:2rem">${post.comments.length} ${post.comments.length === 1 ? "resposta" : "respostas"}</h3>
      <div class="divide-y" style="margin-top:.5rem">
        ${post.comments
          .map(
            (c) => `<div class="comment"><img class="avatar avatar-10" src="${c.mine ? esc(me.avatar) : avatarFor(c.author)}" alt="">
              <div><div class="comment__head"><strong>${esc(c.author)}</strong><span class="text-xs text-muted">${timeAgo(c.at || c.date)}</span></div>
              <p class="comment__body">${esc(c.body)}</p></div></div>`
          )
          .join("")}
      </div>
      <form class="comment-form" data-reply>
        <img class="avatar avatar-10" src="${esc(me.avatar)}" alt="">
        <div class="stack-input" style="flex-grow:1">
          <textarea class="form-textarea" rows="1" required placeholder="Escreva sua resposta…" aria-label="Resposta"></textarea>
          <button type="submit" class="btn btn-primary btn-sm">Responder</button>
        </div>
      </form>
    </div>
  </div>`;

  const form = $("[data-reply]", main);
  autogrow($("textarea", form));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const body = $("textarea", form).value.trim();
    if (!body) return;
    const map = store.get("postComments", {});
    (map[post.id] ||= []).push({ author: me.name, body, at: Date.now(), mine: true });
    store.set("postComments", map);
    window.dispatchEvent(new Event("hashchange"));
  });
}
