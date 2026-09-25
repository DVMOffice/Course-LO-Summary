/*
 * FORMATO DEL TEXTO
 * Convierte el texto plano de "Course Learning Objectives" en bloques legibles
 * (párrafos, subtítulos y listas) sin cambiar ninguna palabra.
 * También resalta las palabras buscadas.
 */
(function () {
  // Marcadores de lista que aparecen en el Excel: "1.", "1)", "(1)", "•", "-", "–"
  const MARKER = /^(\(\d{1,2}\)|\d{1,2}[.)]|[•\-–·▪◦])\s*/;
  const NUMERIC = /\d/;

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /* Devuelve HTML escapado con <mark> alrededor de cada término buscado */
  function highlight(text, terms) {
    if (!terms || terms.length === 0) return escapeHtml(text);
    const pattern = new RegExp(`(${terms.map(escapeRegExp).join("|")})`, "gi");
    return text
      .split(pattern)
      .map((part, i) => (i % 2 === 1 ? `<mark>${escapeHtml(part)}</mark>` : escapeHtml(part)))
      .join("");
  }

  function isHeadingLine(line, nextLine) {
    const short = line.length <= 70;
    const noSentenceEnd = !/[.;!?]$/.test(line);
    const nextIsItem = nextLine !== undefined && MARKER.test(nextLine);
    return short && noSentenceEnd && nextIsItem;
  }

  /*
   * Convierte el texto en bloques:
   *   { type: "p", text }                    párrafo
   *   { type: "h", text }                    subtítulo (p. ej. "Business:")
   *   { type: "list", ordered, items: [{ marker, text }] }
   */
  function parseObjectives(raw) {
    const lines = String(raw || "")
      .replace(/\u00a0/g, " ")
      .split(/\r?\n/)
      .map((l) => l.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const blocks = [];
    const last = () => blocks[blocks.length - 1];

    lines.forEach((line, i) => {
      const match = line.match(MARKER);

      if (match) {
        const marker = match[1];
        const text = line.slice(match[0].length);
        const ordered = NUMERIC.test(marker);
        if (!last() || last().type !== "list" || last().ordered !== ordered) {
          blocks.push({ type: "list", ordered, items: [] });
        }
        last().items.push({ marker: ordered ? marker : "", text });
        return;
      }

      // Línea que continúa la anterior (empieza en minúscula): se une con un espacio
      if (last() && /^[a-z]/.test(line)) {
        if (last().type === "list") {
          const items = last().items;
          items[items.length - 1].text += " " + line;
          return;
        }
        if (last().type === "p") {
          last().text += " " + line;
          return;
        }
      }

      if (isHeadingLine(line, lines[i + 1])) {
        blocks.push({ type: "h", text: line });
        return;
      }

      // Párrafo largo con "able to:" seguido de texto: se separa la frase introductoria
      const intro = line.match(/^(.{10,200}?able to:)\s+(\S.*)$/);
      if (intro) {
        blocks.push({ type: "p", text: intro[1], lead: true });
        blocks.push({ type: "p", text: intro[2] });
        return;
      }

      blocks.push({ type: "p", text: line, lead: /:$/.test(line) });
    });

    return blocks;
  }

  /* Convierte los bloques en HTML, resaltando los términos buscados */
  function objectivesToHtml(raw, terms) {
    const blocks = parseObjectives(raw);
    return blocks
      .map((b) => {
        if (b.type === "h") return `<h4 class="outcomes__heading">${highlight(b.text, terms)}</h4>`;
        if (b.type === "p")
          return `<p class="outcomes__para${b.lead ? " outcomes__para--lead" : ""}">${highlight(b.text, terms)}</p>`;
        const tag = b.ordered ? "ol" : "ul";
        const items = b.items
          .map(
            (it) =>
              `<li>${it.marker ? `<span class="outcomes__num">${escapeHtml(it.marker)}</span>` : ""}` +
              `<span class="outcomes__text">${highlight(it.text, terms)}</span></li>`
          )
          .join("");
        return `<${tag} class="outcomes__list${b.ordered ? " outcomes__list--ordered" : ""}">${items}</${tag}>`;
      })
      .join("");
  }

  function countOutcomes(raw) {
    return parseObjectives(raw).reduce((n, b) => n + (b.type === "list" ? b.items.length : 0), 0);
  }

  window.Format = { escapeHtml, highlight, parseObjectives, objectivesToHtml, countOutcomes };
})();
