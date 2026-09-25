/*
 * DATOS
 * Lee el Excel que está en el repositorio (nombre en js/config.js → excelFile)
 * y lo convierte en la lista de cursos. Usa la librería SheetJS (cargada en index.html).
 *
 * El Excel necesita una fila de encabezados con estos nombres exactos
 * (puede haber filas de título arriba; se buscan automáticamente):
 *   Year | Course Number | Course Name | Course Learning Objectives | Notes
 */
(function () {
  const COLUMNS = {
    year: "Year",
    number: "Course Number",
    name: "Course Name",
    objectives: "Course Learning Objectives",
    notes: "Notes",
  };

  async function loadCourses() {
    const cfg = window.CONFIG;

    if (typeof XLSX === "undefined") {
      throw new Error("No se pudo cargar la librería para leer Excel (SheetJS). Revisa la conexión a internet.");
    }

    // "?v=..." evita que el navegador muestre una versión vieja del Excel
    let response;
    try {
      response = await fetch(`${encodeURI(cfg.excelFile)}?v=${Date.now()}`, { cache: "no-store" });
    } catch (e) {
      throw new Error(
        "No se pudo abrir el Excel. Esta página debe verse desde el link de GitHub Pages, no abriendo index.html con doble clic."
      );
    }
    if (!response.ok) {
      throw new Error(`No se encontró el archivo "${cfg.excelFile}" en el repositorio. Revisa que el nombre sea exactamente igual al de js/config.js.`);
    }

    const workbook = XLSX.read(await response.arrayBuffer(), { type: "array" });
    const sheetName = cfg.excelSheet || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) throw new Error(`No existe la hoja "${sheetName}" en el Excel.`);

    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });

    // Buscar la fila de encabezados
    const headerIndex = rows.findIndex((r) => {
      const cells = r.map((c) => String(c).trim());
      return cells.includes(COLUMNS.year) && cells.includes(COLUMNS.number);
    });
    if (headerIndex === -1) {
      throw new Error('No se encontró la fila de encabezados en el Excel (debe tener "Year" y "Course Number").');
    }

    const header = rows[headerIndex].map((c) => String(c).trim());
    const col = {};
    Object.entries(COLUMNS).forEach(([key, label]) => (col[key] = header.indexOf(label)));

    const courses = [];
    rows.slice(headerIndex + 1).forEach((r) => {
      const get = (key) => (col[key] >= 0 && r[col[key]] != null ? String(r[col[key]]).trim() : "");
      if (!get("number") && !get("name")) return; // fila vacía
      const course = {};
      Object.keys(COLUMNS).forEach((key) => (course[key] = get(key)));
      courses.push(course);
    });

    return courses;
  }

  window.Data = { loadCourses };
})();
