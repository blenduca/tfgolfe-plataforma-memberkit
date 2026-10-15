/* Lê o content.config.js e oferece consultas prontas às páginas. */

import { store } from "./store.js";
import { DEFAULT_AVATAR } from "./icons.js";

const C = () => window.CONTENT_CONFIG || {};

export const courses = () => C().courses || [];
export const categories = () => C().categories || [];
export const banners = () => C().banners || [];
export const forums = () => C().forums || [];

export const findCourse = (slug) => courses().find((c) => c.slug === slug);

export function findModule(course, id) {
  return (course?.modules || []).find((m) => m.id === id);
}

/* aulas do curso em ordem, com referência ao módulo */
export function flatLessons(course) {
  const out = [];
  (course?.modules || []).forEach((m) => (m.lessons || []).forEach((l) => out.push({ ...l, module: m })));
  return out;
}

export function findLesson(course, id) {
  return flatLessons(course).find((l) => l.id === id);
}

export const isDone = (lessonId) => store.has("done", lessonId);

export function courseProgress(course) {
  const all = flatLessons(course);
  if (!all.length) return 0;
  return Math.round((all.filter((l) => isDone(l.id)).length / all.length) * 100);
}

/* "1:50:11", "58:32" -> segundos */
function seconds(d) {
  if (!d) return 0;
  return String(d).split(":").map(Number).reduce((acc, n) => acc * 60 + (n || 0), 0);
}

export function courseDuration(course) {
  const total = flatLessons(course).reduce((acc, l) => acc + seconds(l.duration), 0);
  if (!total) return "";
  const h = Math.floor(total / 3600);
  const m = Math.round((total % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

/* próxima aula a assistir ("começar agora" / "continuar") */
export function nextLesson(course) {
  const all = flatLessons(course);
  return all.find((l) => !isDone(l.id)) || all[0];
}

export const lessonHref = (course, lesson) => `#/curso/${course.slug}/aula/${lesson.id}`;
export const moduleHref = (course, mod) => `#/curso/${course.slug}/modulo/${mod.id}`;
export const courseHref = (course) => (course.locked && course.offerUrl ? course.offerUrl : `#/curso/${course.slug}`);

/* ---------- aluno ---------- */
export function currentUser() {
  const demo = window.PLATFORM_CONFIG.demoUser || {};
  const saved = store.get("profile", {});
  return {
    name: saved.name || demo.name || "Aluno",
    email: saved.email || demo.email || "",
    bio: saved.bio || "",
    avatar: saved.avatar || demo.avatar || DEFAULT_AVATAR,
  };
}

/* XP: 10 por aula concluída, 5 por avaliação, 5 por comentário */
export function myXp() {
  const done = store.get("done", []).length;
  const ratings = Object.keys(store.get("ratings", {})).length;
  const comments = store.get("comments", []).length;
  return done * 10 + ratings * 5 + comments * 5;
}

/* avatar com iniciais (tons de cinza) para participantes fictícios */
export function avatarFor(name) {
  const initials = String(name || "?").split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase().replace(/[<>&"']/g, "");
  let hash = 0;
  for (const ch of String(name)) hash = (hash * 31 + ch.charCodeAt(0)) % 40;
  return (
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="hsl(0 0% ${25 + hash}%)"/><text x="40" y="51" font-family="Inter,Arial,sans-serif" font-size="30" font-weight="600" fill="#fff" text-anchor="middle">${initials}</text></svg>`
    )
  );
}
