/*
 * ARRANQUE
 * Lee el Excel, muestra el selector de años y conecta la búsqueda y los botones.
 */
window.AppStarted = true; // lo usa la revisión de index.html

(async function () {
  const cfg = window.CONFIG;
  const { renderYearPicker, renderYears, groupByYear } = window.Render;
  const { parseQuery, findMatches } = window.Search;

  const el = {
    title: document.getElementById("site-title"),
    subtitle: document.getElementById("site-subtitle"),
    picker: document.getElementById("year-picker"),
    years: document.getElementById("years"),
    input: document.getElementById("search-input"),
    clear: document.getElementById("search-clear"),
    status: document.getElementById("search-status"),
    actions: document.getElementById("toolbar-actions"),
    expand: document.getElementById("expand-all"),
    collapse: document.getElementById("collapse-all"),
  };

  el.title.textContent = cfg.siteTitle;
  el.subtitle.textContent = cfg.siteSubtitle;
  document.title = cfg.siteTitle;

  // 1. Leer el Excel
  let courses;
  try {
    courses = await window.Data.loadCourses();
  } catch (err) {
    el.picker.innerHTML = `<p class="load-error">${window.Format.escapeHtml(err.message)}</p>`;
    console.error(err);
    return;
  }
  const allYears = groupByYear(courses).map((g) => g.year);

  // 2. Estado: años elegidos (se guarda en la URL: ?years=1,2)
  const params = new URL(window.location).searchParams;
  let selected;
  if (params.has("years")) {
    selected = new Set(params.get("years").split(",").filter((y) => allYears.includes(y)));
  } else if (cfg.initialYears === "all") {
    selected = new Set(allYears);
  } else {
    selected = new Set((cfg.initialYears || []).map(String));
  }

  function updateUrl(q) {
    const url = new URL(window.location);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    if (selected.size) url.searchParams.set("years", [...selected].join(","));
    else url.searchParams.delete("years");
    history.replaceState(null, "", url);
  }

  // 3. Dibujar según búsqueda y años elegidos
  function run() {
    const q = el.input.value.trim();
    el.clear.hidden = q === "";

    if (q) {
      // Con búsqueda: busca en TODOS los años
      const terms = parseQuery(q);
      const ids = findMatches(courses, terms);
      renderYearPicker(el.picker, courses, selected, ids);
      renderYears(el.years, courses, { terms, visibleIds: ids, openAll: true });
      el.status.textContent = cfg.text.resultsFor(ids.size, q);
      el.actions.hidden = ids.size === 0;
    } else {
      renderYearPicker(el.picker, courses, selected, null);
      const shown = selected.size ? renderYears(el.years, courses, { years: selected }) : 0;
      if (!selected.size) el.years.innerHTML = "";
      el.status.textContent = selected.size ? cfg.text.selected(shown) : cfg.text.pickHint;
      el.actions.hidden = !selected.size;
    }
    updateUrl(q);
  }

  // Clic en una tarjeta de año:
  //  - "All years" elige todos (o ninguno si ya estaban todos)
  //  - si estaban todos, muestra solo el año tocado
  //  - si no, agrega o quita ese año (se pueden combinar varios)
  el.picker.addEventListener("click", (e) => {
    const card = e.target.closest(".year-card");
    if (!card || card.disabled) return;
    const year = card.dataset.year;
    const everything = allYears.every((y) => selected.has(y));
    if (year === "all") {
      selected = everything ? new Set() : new Set(allYears);
    } else if (everything) {
      // Si estaban todos, al tocar un año se muestra solo ese año
      selected = new Set([year]);
    } else if (selected.has(year)) {
      selected.delete(year);
    } else {
      selected.add(year);
    }
    run();
  });

  /* Abre el curso de index.html#VETM-501 (y selecciona su año) */
  function openFromHash() {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const target = courses.find((c) => window.Render.courseId(c) === id);
    if (!target) return;
    if (!el.input.value.trim() && !selected.has(String(target.year))) {
      selected.add(String(target.year));
      run();
    }
    const node = document.getElementById(id);
    if (!node) return;
    node.open = true;
    node.scrollIntoView({ block: "start" });
  }

  let timer;
  el.input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(run, cfg.searchDelay);
  });

  el.clear.addEventListener("click", () => {
    el.input.value = "";
    run();
    el.input.focus();
  });

  el.input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") el.clear.click();
  });

  // Tecla "/" enfoca el buscador
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== el.input) {
      e.preventDefault();
      el.input.focus();
    }
  });

  function setAll(open) {
    el.years.querySelectorAll("details.course").forEach((d) => (d.open = open));
  }
  el.expand.addEventListener("click", () => setAll(true));
  el.collapse.addEventListener("click", () => setAll(false));

  // Al abrir un curso, pone su id en la URL (enlace directo)
  el.years.addEventListener("click", (e) => {
    const summary = e.target.closest(".course__summary");
    if (!summary) return;
    const d = summary.parentElement;
    setTimeout(() => {
      const url = new URL(window.location);
      url.hash = d.open ? d.id : "";
      history.replaceState(null, "", url);
    });
  });

  window.addEventListener("hashchange", openFromHash);

  // Primer dibujo
  el.input.value = params.get("q") || "";
  run();
  openFromHash();
})();
