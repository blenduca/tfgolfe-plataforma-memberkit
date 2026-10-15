/* Utilidades de renderização. */

export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* url() dentro de variável CSS é resolvida a partir do arquivo .css que a usa;
   por isso caminhos relativos do config viram absolutos antes de entrar numa var. */
export const absUrl = (path) => new URL(path, document.baseURI).href;

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function timeAgo(dateLike) {
  const d = new Date(dateLike);
  if (isNaN(d)) return "";
  const s = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (s < 60) return "agora";
  const units = [
    [31536000, "ano", "anos"],
    [2592000, "mês", "meses"],
    [86400, "dia", "dias"],
    [3600, "hora", "horas"],
    [60, "minuto", "minutos"],
  ];
  for (const [secs, one, many] of units) {
    const n = Math.floor(s / secs);
    if (n >= 1) return `há ${n} ${n === 1 ? one : many}`;
  }
  return "";
}

let toastTimer;
export function toast(message) {
  let el = $(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.append(el);
  }
  el.textContent = message;
  el.dataset.state = "open";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.dataset.state = ""), 2200);
}

/* textarea que cresce com o conteúdo */
export function autogrow(textarea) {
  const fit = () => {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + 2 + "px";
  };
  textarea.addEventListener("input", fit);
  fit();
}
