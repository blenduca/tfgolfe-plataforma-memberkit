/* Aplica a identidade do cliente (platform.config.js → [CLIENTE]) — e SÓ ela.
   Tudo o que este arquivo pode mudar está listado no topo de src/css/tokens.css. */

import { store } from "./store.js";
import { absUrl } from "./util.js";

const THEMES = ["classic", "carbon", "dracula", "prime"];
const SIDEBAR_STYLES = ["linear_gradient", "blend_gradient", "minimal", "solid", "transparent"];

function hexToHsl(hex) {
  let h = String(hex || "").replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let hue = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) hue = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
  }
  return { h: hue, s: s * 100, l: l * 100, lum: 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) };
}
const lin = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const fmt = ({ h, s, l }) => `${h.toFixed(2)} ${s.toFixed(2)}% ${Math.max(0, Math.min(100, l)).toFixed(2)}%`;

/* Mesma relação observada na Memberkit: claro ≈ L+7,4 · escuro ≈ L−9,1 */
function brandVars(hex) {
  const c = hexToHsl(hex);
  if (!c) return {};
  return {
    "--brand": fmt(c),
    "--brand-light": fmt({ ...c, l: c.l + 7.4 }),
    "--brand-dark": fmt({ ...c, l: c.l - 9.1 }),
    "--brand-invert": c.lum > 0.4 ? "222.22 47.37% 11.18%" : "0 0% 100%",
  };
}

const pick = (value, list, fallback) => (list.includes(value) ? value : fallback);

export function appearance() {
  const a = window.PLATFORM_CONFIG.appearance || {};
  return {
    theme: pick(a.theme, THEMES, "classic"),
    topbarTheme: pick(a.topbarTheme, THEMES, "classic"),
    sidebarStyle: pick(a.sidebarStyle, SIDEBAR_STYLES, "solid"),
    sidebarColors: a.sidebarColors || {},
    brandColor: a.brandColor,
    pageBackground: a.pageBackground,
    images: a.images || {},
  };
}

/* tema ativo = escolha do aluno (lua/sol) ou o tema preferido do config */
export function currentTheme() {
  const saved = store.get("theme");
  return THEMES.includes(saved) ? saved : appearance().theme;
}

export function applyRootVars() {
  const a = appearance();
  const root = document.documentElement;
  const vars = { ...brandVars(a.brandColor) };
  const p = hexToHsl(a.sidebarColors.primary);
  const s = hexToHsl(a.sidebarColors.secondary);
  if (p) vars["--navbar-primary"] = fmt(p);
  if (s) vars["--navbar-secondary"] = fmt(s);
  if (a.images.sidebarBackground) vars["--navbar-background"] = `url("${absUrl(a.images.sidebarBackground)}")`;
  const page = hexToHsl(a.pageBackground);
  if (page) vars["--page"] = fmt(page); /* só o tema classic lê --page do :root */
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.dataset.theme = currentTheme();
  applyTypography();
}

/* fonte da interface: [CLIENTE] typography.fontFamily / fontUrl */
function applyTypography() {
  const t = window.PLATFORM_CONFIG.typography || {};
  if (t.fontFamily) document.documentElement.style.setProperty("--font-sans", t.fontFamily);
  if (t.fontUrl && !document.querySelector("link[data-client-font]")) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = t.fontUrl;
    link.dataset.clientFont = "";
    document.head.append(link);
  }
}

/* classes da barra lateral: estilo + texto claro/escuro conforme a cor */
export function navbarClasses() {
  const a = appearance();
  const style = "navbar-" + a.sidebarStyle.replace("_", "-");
  if (currentTheme() !== "classic") return `${style} navbar-dark`;
  if (a.sidebarStyle === "minimal" || a.sidebarStyle === "transparent") return `${style} navbar-light`;
  const p = hexToHsl(a.sidebarColors.primary);
  return `${style} ${p && p.lum > 0.45 ? "navbar-light" : "navbar-dark"}`;
}

export function topbarState() {
  const a = appearance();
  const theme = currentTheme();
  /* no modo escuro a topbar acompanha o tema escuro (como na Memberkit) */
  const t = theme === "classic" ? a.topbarTheme : a.topbarTheme === "classic" ? theme : a.topbarTheme;
  return { theme: t, dark: t !== "classic" };
}

export const isDark = () => currentTheme() !== "classic";

export function toggleDarkMode() {
  const a = appearance();
  const next = isDark() ? "classic" : a.theme === "classic" ? "carbon" : a.theme;
  store.set("theme", next);
  document.documentElement.dataset.theme = next;
}
