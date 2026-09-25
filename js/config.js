/*
 * CONFIGURACIÓN — todos los textos de la página y los colores por año.
 * Cambia aquí los títulos, etiquetas o colores sin tocar el resto del código.
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

  text: {
    searchPlaceholder: "Search courses and outcomes",
    courses: (n) => (n === 1 ? "1 course" : `${n} courses`),
    outcomes: (n) => (n === 1 ? "1 outcome" : `${n} outcomes`),
    noOutcomes: "No learning outcomes listed for this course.",
    notesLabel: "Note",
    resultsFor: (n, q) =>
      n === 0
        ? `No courses match “${q}”. Try a shorter word or check the spelling.`
        : `${n === 1 ? "1 course matches" : `${n} courses match`} “${q}”`,
    idle: (n) => `${n} courses. Open a year to see its courses, or search above.`,
    loading: "Loading courses…",
  },

  // Tiempo de espera (ms) antes de buscar mientras se escribe
  searchDelay: 150,
};
