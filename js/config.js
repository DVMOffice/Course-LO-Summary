/*
 * CONFIGURACIÓN — textos de la página y colores por año.
 * Cambia aquí títulos, etiquetas o colores sin tocar el resto del código.
 */
window.CONFIG = {
  // Nombre EXACTO del Excel subido al repositorio (en la misma carpeta que index.html)
  excelFile: "Syllabus_Course_Objectives_Report_2026-27.xlsx",
  // Hoja a leer. Déjalo vacío ("") para usar la primera hoja.
  excelSheet: "",

  siteTitle: "DVM Course Learning Outcomes",
  siteSubtitle: "UCalgary Veterinary Medicine, syllabi 2026–27",

  // Cómo se llama cada año en pantalla (la clave es el valor de la columna "Year" del Excel)
  yearLabel: (year) => `Year ${year}`,

  // Color de cada año. Si agregas un año nuevo, añade su color aquí.
  yearColors: {
    "1": "#3C7A5A",
    "2": "#2D5F8B",
    "3": "#7A4E8C",
    "4": "#94620F",
  },
  defaultYearColor: "#5E6B75",

  // Años seleccionados al abrir la página: [] = ninguno, ["1"] = Year 1, "all" = todos
  initialYears: "all",

  text: {
    allYears: "All years",
    courses: (n) => (n === 1 ? "1 course" : `${n} courses`),
    matches: (n) => (n === 1 ? "1 match" : `${n} matches`),
    outcomes: (n) => (n === 1 ? "1 outcome" : `${n} outcomes`),
    noOutcomes: "No learning outcomes listed for this course.",
    notesLabel: "Note",
    pickHint: "Select one or more years above to see their courses. Click a course to read its learning outcomes.",
    selected: (n) => `Showing ${n === 1 ? "1 course" : `${n} courses`}. Click a course to read its learning outcomes.`,
    resultsFor: (n, q) =>
      n === 0
        ? `No courses match “${q}”. Try a shorter word or check the spelling.`
        : `${n === 1 ? "1 course matches" : `${n} courses match`} “${q}” in all years.`,
  },

  // Tiempo de espera (ms) antes de buscar mientras se escribe
  searchDelay: 150,
};
