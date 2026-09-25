/*
 * VISTAS
 * 1) Selector de años (tarjetas arriba de la página)
 * 2) Lista de cursos de los años elegidos; cada curso se abre para ver sus outcomes.
 */
(function () {
  const { escapeHtml, highlight, objectivesToHtml, countOutcomes } = window.Format;

  /* "VETM 501" → "VETM-501" (para enlaces directos: index.html#VETM-501) */
  function courseId(course) {
    return String(course.number || course.name).trim().replace(/\s+/g, "-");
  }

  function compareCourses(a, b) {
    return String(a.number).localeCompare(String(b.number), undefined, { numeric: true });
  }

  function groupByYear(courses) {
    const groups = new Map();
    courses.forEach((c) => {
      const year = String(c.year || "?");
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push(c);
    });
    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
      .map(([year, list]) => ({ year, courses: list.sort(compareCourses) }));
  }

  function yearColor(year) {
    const cfg = window.CONFIG;
    return cfg.yearColors[year] || cfg.defaultYearColor;
  }

  /*
   * Tarjetas de años.
   *   selected   Set de años elegidos
   *   matchIds   Set de ids que coinciden con la búsqueda (null si no hay búsqueda)
   */
  function renderYearPicker(container, courses, selected, matchIds) {
    const cfg = window.CONFIG;
    const groups = groupByYear(courses);
    const allSelected = groups.length > 0 && groups.every((g) => selected.has(g.year));
    const searching = matchIds !== null;

    const countFor = (list) => {
      if (!searching) return cfg.text.courses(list.length);
      return cfg.text.matches(list.filter((c) => matchIds.has(courseId(c))).length);
    };

    const cards = groups
      .map(({ year, courses: list }) => {
        const on = !searching && selected.has(year);
        return `
          <button type="button" class="year-card${on ? " is-selected" : ""}" data-year="${escapeHtml(year)}"
                  style="--year-color:${yearColor(year)}" aria-pressed="${on}" ${searching ? "disabled" : ""}>
            <span class="year-card__numeral" aria-hidden="true">${escapeHtml(year)}</span>
            <span class="year-card__label">${escapeHtml(cfg.yearLabel(year))}</span>
            <span class="year-card__count">${escapeHtml(countFor(list))}</span>
            <span class="year-card__check" aria-hidden="true"></span>
          </button>`;
      })
      .join("");

    const allOn = !searching && allSelected;
    const all = `
      <button type="button" class="year-card year-card--all${allOn ? " is-selected" : ""}" data-year="all"
              aria-pressed="${allOn}" ${searching ? "disabled" : ""}>
        <span class="year-card__numeral" aria-hidden="true">1–${escapeHtml(groups.length ? groups[groups.length - 1].year : "")}</span>
        <span class="year-card__label">${escapeHtml(cfg.text.allYears)}</span>
        <span class="year-card__count">${escapeHtml(searching ? cfg.text.matches(matchIds.size) : cfg.text.courses(courses.length))}</span>
        <span class="year-card__check" aria-hidden="true"></span>
      </button>`;

    container.innerHTML = cards + all;
  }

  function courseHtml(course, terms, open) {
    const cfg = window.CONFIG;
    const n = countOutcomes(course.objectives);
    const body = course.objectives
      ? objectivesToHtml(course.objectives, terms)
      : `<p class="outcomes__empty">${escapeHtml(cfg.text.noOutcomes)}</p>`;
    const notes = course.notes
      ? `<aside class="course__note"><strong>${escapeHtml(cfg.text.notesLabel)}.</strong> ${highlight(course.notes, terms)}</aside>`
      : "";

    return `
      <details class="course" id="${escapeHtml(courseId(course))}"${open ? " open" : ""}>
        <summary class="course__summary">
          <span class="course__number">${highlight(course.number, terms)}</span>
          <span class="course__name">${highlight(course.name, terms)}</span>
          <span class="course__count">${n ? escapeHtml(cfg.text.outcomes(n)) : ""}</span>
          <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>
        </summary>
        <div class="course__body">
          <div class="outcomes">${body}</div>
          ${notes}
        </div>
      </details>`;
  }

  /*
   * Lista de cursos agrupada por año.
   *   years      Set de años a mostrar
   *   terms      palabras a resaltar
   *   visibleIds Set de ids a mostrar (null = todos los de esos años)
   *   openAll    abrir los outcomes de todos los cursos mostrados
   * Devuelve cuántos cursos se mostraron.
   */
  function renderYears(container, courses, options = {}) {
    const { years, terms = [], visibleIds = null, openAll = false } = options;
    const cfg = window.CONFIG;
    let total = 0;

    container.innerHTML = groupByYear(courses)
      .filter((g) => !years || years.has(g.year))
      .map(({ year, courses: list }) => {
        const shown = visibleIds ? list.filter((c) => visibleIds.has(courseId(c))) : list;
        if (shown.length === 0) return "";
        total += shown.length;
        return `
          <section class="year" style="--year-color:${yearColor(year)}" data-year="${escapeHtml(year)}">
            <h2 class="year__heading">
              <span class="year__numeral" aria-hidden="true">${escapeHtml(year)}</span>
              <span class="year__label">${escapeHtml(cfg.yearLabel(year))}</span>
              <span class="year__count">${escapeHtml(cfg.text.courses(shown.length))}</span>
            </h2>
            <div class="year__courses">
              ${shown.map((c) => courseHtml(c, terms, openAll)).join("")}
            </div>
          </section>`;
      })
      .join("");

    return total;
  }

  window.Render = { renderYearPicker, renderYears, courseId, groupByYear };
})();
