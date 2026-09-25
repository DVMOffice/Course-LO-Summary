/*
 * BÚSQUEDA
 * Busca en número, nombre, outcomes y notas de cada curso.
 * Varias palabras = el curso debe contener TODAS (en cualquier campo).
 * No distingue mayúsculas/minúsculas ni acentos.
 */
(function () {
  const { courseId } = window.Render;

  function normalize(str) {
    return String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\u00a0/g, " ")
      .toLowerCase();
  }

  /* "one  health " → ["one", "health"] ; texto entre comillas se busca como frase */
  function parseQuery(query) {
    const terms = [];
    const re = /"([^"]+)"|(\S+)/g;
    let m;
    while ((m = re.exec(query)) !== null) terms.push((m[1] || m[2]).trim());
    return terms.filter(Boolean);
  }

  function searchableText(course) {
    return normalize([course.number, course.name, course.objectives, course.notes].join(" \n "));
  }

  /* Devuelve el Set de ids de cursos que contienen todos los términos */
  function findMatches(courses, terms) {
    const needles = terms.map(normalize);
    const ids = new Set();
    courses.forEach((c) => {
      const hay = searchableText(c);
      if (needles.every((t) => hay.includes(t))) ids.add(courseId(c));
    });
    return ids;
  }

  window.Search = { parseQuery, findMatches };
})();
