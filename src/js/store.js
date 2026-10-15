/* Estado do aluno no navegador (sem backend): progresso, favoritos,
   avaliações, comentários, posts, perfil, tema e menu.
   A chave inclui o nome da plataforma para não misturar clientes. */

const prefix = () => "mk:" + (window.PLATFORM_CONFIG?.brand?.name || "plataforma") + ":";

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(prefix() + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(prefix() + key, JSON.stringify(value));
  } catch {
    /* modo privado / armazenamento bloqueado: segue sem persistir */
  }
}

export const store = {
  get: read,
  set: write,

  /* conjunto de ids (aulas concluídas, favoritos) */
  has(key, id) {
    return read(key, []).includes(id);
  },
  toggle(key, id) {
    const list = read(key, []);
    const i = list.indexOf(id);
    if (i >= 0) list.splice(i, 1);
    else list.push(id);
    write(key, list);
    return i < 0;
  },

  /* mapa id -> valor (avaliações) */
  mapGet(key, id) {
    return read(key, {})[id];
  },
  mapSet(key, id, value) {
    const map = read(key, {});
    map[id] = value;
    write(key, map);
  },

  /* listas anexadas (comentários por aula, posts) */
  push(key, item) {
    const list = read(key, []);
    list.push(item);
    write(key, list);
  },
};
