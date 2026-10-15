#!/usr/bin/env node
/* Verifica se a plataforma foi personalizada para o cliente.
 *
 * Uso: node scripts/check-client.mjs
 *
 * ERRO  = valor de template que obrigatoriamente muda por cliente ([CLIENTE]).
 * AVISO = vale conferir (conteúdo ainda placeholder, contraste, etc).
 * Sai com código 1 se houver qualquer ERRO.
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const sandbox = { window: {} };
vm.createContext(sandbox);
for (const file of ["platform.config.js", "content.config.js"]) {
  vm.runInContext(readFileSync(join(ROOT, file), "utf8"), sandbox, { filename: file });
}
const P = sandbox.window.PLATFORM_CONFIG || {};
const C = sandbox.window.CONTENT_CONFIG || {};

/* valores neutros do template — se ainda estiverem aqui, não houve personalização */
const TEMPLATE = {
  name: "Nome da Plataforma",
  font: '"Helvetica Neue", Helvetica, Arial, sans-serif',
  brandColor: "#737373",
  sidebarPrimary: "#171717",
  sidebarSecondary: "#000000",
  pageBackground: "#FAFAFA",
};

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const same = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
const isHex = (v) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(v || ""));

/* ---------- platform.config.js ---------- */
const a = P.appearance || {};
const t = P.typography || {};
const logo = P.brand?.logo || {};

if (P.isTemplate !== false) err("platform.config.js → isTemplate ainda é true (mude para false ao personalizar).");
if (!P.brand?.name || same(P.brand.name, TEMPLATE.name)) err("brand.name ainda é o placeholder.");
if (same(logo.alt, TEMPLATE.name)) warn("brand.logo.alt ainda é o placeholder.");
if (!t.fontFamily || same(t.fontFamily, TEMPLATE.font)) err("typography.fontFamily ainda é Helvetica (fonte do template). Use a fonte do cliente.");
if (t.fontFamily && !/sans-serif|serif|monospace|system-ui/.test(t.fontFamily)) warn("typography.fontFamily sem fallback genérico (ex.: , sans-serif).");

for (const [key, value] of [
  ["appearance.brandColor", a.brandColor],
  ["appearance.sidebarColors.primary", a.sidebarColors?.primary],
  ["appearance.sidebarColors.secondary", a.sidebarColors?.secondary],
  ["appearance.pageBackground", a.pageBackground],
]) {
  if (!isHex(value)) err(`${key} precisa ser um hex (#RRGGBB). Valor: ${JSON.stringify(value)}`);
}
if (same(a.brandColor, TEMPLATE.brandColor)) err("appearance.brandColor ainda é o cinza do template (cor dos botões/progresso).");
if (same(a.sidebarColors?.primary, TEMPLATE.sidebarPrimary) && same(a.sidebarColors?.secondary, TEMPLATE.sidebarSecondary))
  err("appearance.sidebarColors ainda são as do template (cores da barra lateral).");
if (same(a.pageBackground, TEMPLATE.pageBackground)) warn("appearance.pageBackground ainda é o off-white do template — confira com o design system.");
if (a.sidebarStyle === "blend_gradient" && String(a.images?.sidebarBackground || "").includes("placeholders/"))
  err("sidebarStyle é blend_gradient mas images.sidebarBackground ainda é placeholder.");

/* contraste aproximado: barra lateral clara com estilo sólido/gradiente */
function luminance(hex) {
  let h = String(hex).replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (x, y) => {
  const [l1, l2] = [luminance(x), luminance(y)].sort((m, n) => n - m);
  return (l1 + 0.05) / (l2 + 0.05);
};
if (isHex(a.brandColor) && isHex(a.pageBackground) && contrast(a.brandColor, a.pageBackground) < 1.6)
  warn(`brandColor tem pouco contraste com pageBackground (${contrast(a.brandColor, a.pageBackground).toFixed(2)}:1) — progresso e chips vão sumir.`);
if (isHex(a.brandColor) && contrast(a.brandColor, "#000000") < 1.6)
  warn("brandColor muito escura: o botão 'começar agora' some sobre o hero preto do curso.");

/* placeholders na identidade = erro */
const platformPaths = [
  ["brand.logo.src", logo.src],
  ["brand.logo.srcDark", logo.srcDark],
  ["brand.favicon", P.brand?.favicon],
];
for (const [key, value] of platformPaths) {
  if (String(value || "").includes("assets/placeholders/")) err(`${key} ainda aponta para o placeholder (${value}).`);
}

/* ---------- content.config.js ---------- */
let placeholderImages = 0;
let placeholderVideos = 0;
const missing = new Set();
const seen = new Map();

function checkPath(path) {
  if (!path || /^(https?:|data:|#)/.test(path)) return;
  if (path.includes("assets/placeholders/")) placeholderImages++;
  if (!existsSync(join(ROOT, path))) missing.add(path);
}
function checkId(kind, id) {
  const key = `${kind}:${id}`;
  if (!id) err(`${kind} sem id/slug.`);
  else if (seen.has(key)) err(`${kind} com id duplicado: "${id}" (o progresso do aluno é salvo por id).`);
  seen.set(key, true);
}

(C.banners || []).forEach((b) => checkPath(b.src));
for (const c of C.courses || []) {
  checkId("curso", c.slug);
  [c.cover, c.heroImage].forEach(checkPath);
  if (c.category && !(C.categories || []).some((k) => k.id === c.category)) warn(`curso "${c.slug}" usa categoria inexistente "${c.category}".`);
  if (c.locked && !c.offerUrl) warn(`curso "${c.slug}" está bloqueado sem offerUrl.`);
  for (const m of c.modules || []) {
    checkId("módulo", m.id);
    checkPath(m.cover);
    for (const l of m.lessons || []) {
      checkId("aula", l.id);
      checkPath(l.thumbnail);
      if (l.video?.provider === "placeholder") placeholderVideos++;
    }
  }
}
for (const [key, value] of platformPaths.concat([["images.sidebarBackground", a.images?.sidebarBackground]])) checkPath(value);

if (missing.size) err(`arquivos não encontrados: ${[...missing].join(", ")}`);
if (placeholderImages) warn(`${placeholderImages} imagem(ns) de conteúdo ainda são placeholders cinza (assets/placeholders/).`);
if (placeholderVideos) warn(`${placeholderVideos} aula(s) ainda com vídeo placeholder.`);

/* ---------- saída ---------- */
const brand = P.brand?.name || "(sem nome)";
console.log(`\nVerificação da plataforma: ${brand}\n`);
errors.forEach((m) => console.log(`  ERRO   ${m}`));
warnings.forEach((m) => console.log(`  AVISO  ${m}`));
if (!errors.length && !warnings.length) console.log("  Tudo certo: identidade e conteúdo personalizados.");
console.log(`\n${errors.length} erro(s), ${warnings.length} aviso(s).\n`);
process.exit(errors.length ? 1 : 0);
