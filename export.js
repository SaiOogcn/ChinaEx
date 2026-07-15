import { I18N, LEVELS, REGION_BY_ID, text } from "./data.js";

const svgNs = "http://www.w3.org/2000/svg";

function escapeXml(value) {
  return String(value).replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[character]));
}

function triggerDownload(blob, filename) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

function shortLabelEntries(svg, lang) {
  if (lang !== "en") return [];
  return [...svg.querySelectorAll(".map-label[data-short='true']")]
    .map((label) => {
      const region = REGION_BY_ID[label.dataset.region];
      return region && { region, marker: label.dataset.mapKey || label.textContent.trim() };
    })
    .filter(Boolean);
}

export function buildExportSvg({ svg, state, score, visited }) {
  const lang = state.lang;
  const copy = svg.querySelector("#map-content").cloneNode(true);
  copy.removeAttribute("transform");
  copy.setAttribute("transform", "translate(150 124) scale(30)");
  copy.querySelectorAll(".province").forEach((node) => node.classList.remove("is-active", "is-hovered"));

  const index = shortLabelEntries(svg, lang);
  const indexHeight = index.length ? Math.ceil(index.length / 2) * 26 + 42 : 0;
  const height = 1010 + indexHeight;
  const name = state.name.trim();
  const title = name
    ? text(lang, "exportTitle", { name, level: score })
    : text(lang, "exportTitleAnonymous", { level: score });
  const legendY = 948;
  const legend = LEVELS.map((level, index) => {
    const x = 58 + index * 187;
    const label = `${I18N[lang].levelNames[level.id]} · ${level.score}`;
    return `<g transform="translate(${x} ${legendY})"><circle r="9" fill="${level.color}" stroke="#314152" stroke-width="1"/><text x="16" y="5" class="legend-text">${escapeXml(label)}</text></g>`;
  }).join("");
  const indexMarkup = index.length ? `
    <g transform="translate(58 1003)">
      <text class="index-title" y="0">${escapeXml(text(lang, "mapKey"))}</text>
      ${index.map((entry, i) => {
        const column = i % 2;
        const row = Math.floor(i / 2);
        return `<text class="index-text" x="${column * 540}" y="${28 + row * 26}">${escapeXml(entry.marker)} · ${escapeXml(entry.region.en)}</text>`;
      }).join("")}
    </g>` : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}">
    <style>
      .province { stroke: #273443; stroke-width: .15; stroke-linejoin: round; }
      .province.white { fill: #fff; } .province.blue { fill: #3498db; } .province.green { fill: #39c778; }
      .province.yellow { fill: #f4bf19; } .province.orange { fill: #dc8a32; } .province.red { fill: #ef5747; }
      .map-label { fill: #14202e; text-anchor: middle; dominant-baseline: middle; font-family: Arial, "Noto Sans SC", sans-serif; font-size: .8px; font-weight: 700; pointer-events: none; }
      .map-label.label-en { font-family: Arial, sans-serif; font-size: .53px; font-weight: 700; }
      .map-label.label-en.label-compact { font-size: .48px; }
      .map-label-leader { stroke: rgba(19,32,48,.55); stroke-width: .06px; vector-effect: non-scaling-stroke; }
      .export-title { font: 700 42px Arial, "Noto Sans SC", sans-serif; fill: #152233; }
      .export-subtitle { font: 500 20px Arial, "Noto Sans SC", sans-serif; fill: #476071; }
      .legend-text { font: 600 18px Arial, "Noto Sans SC", sans-serif; fill: #273443; }
      .index-title { font: 700 22px Arial, sans-serif; fill: #273443; }
      .index-text { font: 500 18px Arial, sans-serif; fill: #476071; }
    </style>
    <rect width="1200" height="${height}" fill="#9fc4fa"/>
    <text x="58" y="59" class="export-title">${escapeXml(title)}</text>
    <text x="58" y="91" class="export-subtitle">${escapeXml(text(lang, "visited", { count: visited, total: 34 }))}</text>
    ${new XMLSerializer().serializeToString(copy)}
    <rect x="36" y="918" width="1128" height="58" rx="16" fill="#ffffff" fill-opacity=".9"/>
    ${legend}
    ${indexMarkup}
    <text x="1142" y="${height - 18}" text-anchor="end" class="export-subtitle">ChinaEX</text>
  </svg>`;
}

export async function downloadSvg(options) {
  const payload = buildExportSvg(options);
  triggerDownload(new Blob([payload], { type: "image/svg+xml;charset=utf-8" }), `ChinaEX_Level_${options.score}.svg`);
}

export async function downloadPng(options) {
  await document.fonts?.ready;
  const markup = buildExportSvg(options);
  const image = new Image();
  const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; image.src = url; });
    const canvas = document.createElement("canvas");
    canvas.width = image.width * 2;
    canvas.height = image.height * 2;
    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.drawImage(image, 0, 0);
    const png = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!png) throw new Error("PNG conversion failed");
    triggerDownload(png, `ChinaEX_Level_${options.score}.png`);
  } finally {
    URL.revokeObjectURL(url);
  }
}
