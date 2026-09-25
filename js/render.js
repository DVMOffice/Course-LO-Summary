/*
 * VISTAS
 * Dibuja la lista: Año → Cursos → Learning outcomes.
 * Usa <details>/<summary>, así que abrir y cerrar funciona con teclado y lector de pantalla.
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
   * options:
   *   terms      palabras a resaltar (array)
   *   visibleIds Set de ids de cursos a mostrar (null = todos)
   *   openAll    abrir años y cursos visibles (se usa al buscar)
   */
  function renderYears(container, courses, options = {}) {
    const { terms = [], visibleIds = null, openAll = false } = options;
    const cfg = window.CONFIG;

    const html = groupByYear(courses)
      .map(({ year, courses: list }) => {
        const shown = visibleIds ? list.filter((c) => visibleIds.has(courseId(c))) : list;
        if (shown.length === 0) return "";
        const color = cfg.yearColors[year] || cfg.defaultYearColor;
        return `
          <details class="year" style="--year-color:${color}" data-year="${escapeHtml(year)}"${openAll ? " open" : ""}>
            <summary class="year__summary">
              <span class="year__numeral" aria-hidden="true">${escapeHtml(year)}</span>
              <span class="year__label">${escapeHtml(cfg.yearLabel(year))}</span>
              <span class="year__count">${escapeHtml(cfg.text.courses(shown.length))}</span>
              <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>
            </summary>
            <div class="year__courses">
              ${shown.map((c) => courseHtml(c, terms, openAll)).join("")}
            </div>
          </details>`;
      })
      .join("");

    container.innerHTML = html;
  }

  window.Render = { renderYears, courseId };
})();
