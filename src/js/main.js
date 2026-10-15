/* Inicialização + rotas (hash, funciona em GitHub Pages sem servidor). */

import { applyRootVars } from "./theme.js";
import { mountShell, updateShell } from "./shell.js";
import { renderHome } from "./pages/home.js";
import { renderCourse, renderModule } from "./pages/course.js";
import { renderLesson } from "./pages/lesson.js";
import { renderCommunity, renderPost } from "./pages/community.js";
import {
  renderRanking, renderCertificates, renderCertificate, renderNotifications,
  renderAccount, renderSearch, renderNotFound,
} from "./pages/misc.js";

const cfg = window.PLATFORM_CONFIG;
if (!cfg || !window.CONTENT_CONFIG) throw new Error("platform.config.js ou content.config.js não foi carregado.");

const ROUTES = [
  ["/", renderHome, "Conteúdos"],
  ["/curso/:slug", renderCourse],
  ["/curso/:slug/modulo/:id", renderModule],
  ["/curso/:slug/aula/:id", renderLesson, null, { white: true }],
  ["/comunidade", renderCommunity, "Comunidades"],
  ["/comunidade/post/:id", renderPost, "Comunidades"],
  ["/ranking", renderRanking, "Ranking"],
  ["/certificados", renderCertificates, "Certificados"],
  ["/certificado/:slug", renderCertificate, "Certificado"],
  ["/notificacoes", renderNotifications, "Notificações"],
  ["/conta", renderAccount, "Minha Conta"],
  ["/busca", renderSearch, "Pesquisa"],
];

const menu = cfg.menu || {};
const DISABLED = {
  "/comunidade": menu.community === false,
  "/ranking": menu.ranking === false,
  "/certificado": menu.certificates === false,
};

function match(path) {
  const parts = path.split("/").filter(Boolean);
  for (const [pattern, render, title, opts] of ROUTES) {
    const pp = pattern.split("/").filter(Boolean);
    if (pp.length !== parts.length) continue;
    const params = {};
    const ok = pp.every((seg, i) => (seg.startsWith(":") ? ((params[seg.slice(1)] = decodeURIComponent(parts[i])), true) : seg === parts[i]));
    if (ok) return { render, title, opts: opts || {}, params };
  }
  return null;
}

const app = document.getElementById("app");
let shellMounted = false;

function route() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [path, qs] = raw.split("?");
  const query = new URLSearchParams(qs || "");

  if (!shellMounted) {
    mountShell(app);
    shellMounted = true;
  }

  const hit = match(path);
  const blocked = Object.entries(DISABLED).some(([prefix, off]) => off && path.startsWith(prefix));
  const main = updateShell(path, hit && !blocked ? hit.opts : {});
  document.title = `${hit?.title || "Conteúdos"} · ${cfg.brand.name}`;
  if (!hit || blocked) return renderNotFound(main);
  hit.render(main, { params: hit.params, query });
}

/* favicon */
if (cfg.brand.favicon) {
  const link = document.querySelector("link[rel=icon]") || document.head.appendChild(Object.assign(document.createElement("link"), { rel: "icon" }));
  link.href = cfg.brand.favicon;
}

if (cfg.isTemplate) {
  console.info(
    "%cTemplate neutro%c — personalize os campos [CLIENTE] de platform.config.js e rode `node scripts/check-client.mjs`.",
    "font-weight:bold", ""
  );
}

applyRootVars();
window.addEventListener("hashchange", route);
/* troca de tema ou de perfil: remonta o shell para refletir as classes */
window.addEventListener("mk:remount", () => {
  applyRootVars();
  shellMounted = false;
  route();
});
route();
