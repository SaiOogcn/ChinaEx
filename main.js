import { I18N, LEVELS, LEVEL_BY_ID, REGION_BY_ID, REGIONS, text } from "./data.js";
import { createStore } from "./state.js";
import { MapViewport } from "./viewport.js";
import { downloadPng, downloadSvg } from "./export.js";

const svgNs = "http://www.w3.org/2000/svg";
const store = createStore();
const dom = {
  svg: document.querySelector("#svg"),
  mapStage: document.querySelector("#map-stage"),
  content: document.querySelector("#map-content"),
  labels: document.querySelector("#label"),
  metaDescription: document.querySelector("#meta-description"),
  ogTitle: document.querySelector("#og-title"),
  ogDescription: document.querySelector("#og-description"),
  level: document.querySelector("#level"),
  visited: document.querySelector("#visited"),
  scoreLabel: document.querySelector("#score-label"),
  siteTitle: document.querySelector("#site-title"),
  siteSubtitle: document.querySelector("#site-subtitle"),
  legendHeading: document.querySelector("#legend-heading"),
  legend: document.querySelector("#legend"),
  mapHint: document.querySelector("#map-hint"),
  fit: document.querySelector("#fit-map"),
  regionCard: document.querySelector("#region-card"),
  regionKicker: document.querySelector("#region-kicker"),
  regionName: document.querySelector("#region-name"),
  regionCurrent: document.querySelector("#region-current"),
  regionLevels: document.querySelector("#level-options"),
  regionSearch: document.querySelector("#region-search"),
  closeRegion: document.querySelector("#close-region"),
  actionDock: document.querySelector("#action-dock"),
  language: document.querySelector("#btn-language"),
  name: document.querySelector("#btn-name"),
  copy: document.querySelector("#btn-copy"),
  share: document.querySelector("#btn-share"),
  shareX: document.querySelector("#btn-share-x"),
  shareFacebook: document.querySelector("#btn-share-fb"),
  export: document.querySelector("#btn-export"),
  exportMenu: document.querySelector("#export-menu"),
  exportPng: document.querySelector("#btn-export-png"),
  exportSvg: document.querySelector("#btn-export-svg"),
  reset: document.querySelector("#btn-reset"),
  toast: document.querySelector("#toast"),
  nameDialog: document.querySelector("#name-dialog"),
  nameForm: document.querySelector("#name-form"),
  nameInput: document.querySelector("#name-input"),
  nameInputLabel: document.querySelector("#name-input-label"),
  nameHint: document.querySelector("#name-dialog-hint"),
  nameDialogTitle: document.querySelector("#name-dialog-title"),
  nameDialogClose: document.querySelector("#name-dialog-close"),
  nameCancel: document.querySelector("#name-cancel"),
  nameSave: document.querySelector("#name-save"),
  resetDialog: document.querySelector("#reset-dialog"),
  resetForm: document.querySelector("#reset-form"),
  resetDialogTitle: document.querySelector("#reset-dialog-title"),
  resetDialogText: document.querySelector("#reset-dialog-text"),
  resetDialogClose: document.querySelector("#reset-dialog-close"),
  resetCancel: document.querySelector("#reset-cancel"),
  resetConfirm: document.querySelector("#reset-confirm")
};

const viewport = new MapViewport(dom.svg, dom.content);
let selectedRegionId = null;
let lastRegionTrigger = null;
let toastTimer = null;

function state() { return store.getState(); }
function t(key, values) { return text(state().lang, key, values); }

function setText(node, value) { if (node) node.textContent = value; }

function scoreAndVisited() {
  return { score: store.score(), visited: store.visited() };
}

function createSvg(name, attributes = {}) {
  const element = document.createElementNS(svgNs, name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function appendLines(label, lines, vertical, className) {
  label.textContent = "";
  label.classList.toggle("label-en", className === "en");
  if (lines.length === 1) {
    label.textContent = lines[0];
    return;
  }
  lines.forEach((line, index) => {
    const span = createSvg("tspan", { x: label.getAttribute("x") });
    span.setAttribute("dy", index === 0 ? (vertical ? "0" : "-.34") : (vertical ? ".72" : ".68"));
    span.textContent = line;
    label.append(span);
  });
}

function divide(label, maxLength) {
  if (label.length <= maxLength) return [label];
  const cut = Math.ceil(label.length / 2);
  return [label.slice(0, cut), label.slice(cut)];
}

function englishLabel(region, shape) {
  const box = shape?.getBBox?.();
  const width = Math.max(box?.width || 1, .8);
  const height = Math.max(box?.height || 1, .8);
  // This is deliberately conservative: SVG text is wider than its character count suggests.
  // If the full name cannot fit clearly, use the readable registry short name as one intact unit.
  const capacity = Math.max(3, Math.floor(width / .46));
  const full = region.en;
  if (full.length <= capacity) return { lines: [full], short: false, vertical: false, rotate: false };
  const words = full.split(" ");
  if (words.length === 2 && words.every((word) => word.length <= capacity) && height >= 1.55) {
    return { lines: words, short: false, vertical: true, rotate: false };
  }
  const short = region.shortEn;
  // A rotated whole short name remains legible in a thin north-south region; never stack characters.
  const rotate = height > width * 1.2 && short.length * .32 <= height;
  return { lines: [short], short: true, vertical: false, rotate };
}

function renderLabels() {
  const { lang } = state();
  dom.labels.replaceChildren();
  REGIONS.forEach((region) => {
    const shape = document.getElementById(region.id);
    const labelAnchor = lang === "en" && region.label.en ? region.label.en : region.label;
    if (labelAnchor !== region.label) {
      dom.labels.append(createSvg("line", {
        x1: region.label.x, y1: region.label.y, x2: labelAnchor.x, y2: labelAnchor.y, class: "map-label-leader"
      }));
    }
    const label = createSvg("text", {
      x: labelAnchor.x,
      y: labelAnchor.y,
      class: "map-label",
      tabindex: "0",
      role: "button",
      "data-region": region.id
    });
    const display = lang === "en"
      ? englishLabel(region, shape)
      : { lines: region.label.zhLines, short: false, vertical: region.label.zhLines.length > 1 };
    appendLines(label, display.lines, display.vertical, lang);
    label.dataset.short = String(display.short);
    label.setAttribute("aria-label", region[lang] + t("labelSuffix", { level: I18N[lang].levelNames[state().levels[region.id]] }));
    label.addEventListener("click", (event) => handleRegionSelection(region.id, event));
    label.addEventListener("keydown", (event) => handleRegionKeydown(region.id, event));
    label.addEventListener("pointerenter", () => setHover(region.id, true));
    label.addEventListener("pointerleave", () => setHover(region.id, false));
    dom.labels.append(label);
  });
}

function bindRegionFeatures() {
  REGIONS.forEach((region) => {
    const shape = document.getElementById(region.id);
    if (!shape) return;
    shape.setAttribute("tabindex", "0");
    shape.setAttribute("role", "button");
    shape.dataset.region = region.id;
    shape.addEventListener("click", (event) => handleRegionSelection(region.id, event));
    shape.addEventListener("keydown", (event) => handleRegionKeydown(region.id, event));
    shape.addEventListener("pointerenter", () => setHover(region.id, true));
    shape.addEventListener("pointerleave", () => setHover(region.id, false));
  });
}

function handleRegionKeydown(regionId, event) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleRegionSelection(regionId, event);
  }
  if (event.key === "Escape") closeRegion();
}

function handleRegionSelection(regionId, event) {
  if (viewport.shouldIgnoreClick()) return;
  event.preventDefault();
  event.stopPropagation();
  selectedRegionId = regionId;
  lastRegionTrigger = event.currentTarget;
  renderRegionCard(event.clientX, event.clientY);
}

function setHover(regionId, active) {
  const shape = document.getElementById(regionId);
  shape?.classList.toggle("is-hovered", active);
}

function renderMapLevels() {
  const { levels, lang } = state();
  REGIONS.forEach((region) => {
    const shape = document.getElementById(region.id);
    if (!shape) return;
    Object.keys(LEVEL_BY_ID).forEach((level) => shape.classList.remove(level));
    shape.classList.add(levels[region.id]);
    shape.classList.toggle("is-active", selectedRegionId === region.id);
    shape.setAttribute("aria-label", region[lang] + t("labelSuffix", { level: I18N[lang].levelNames[levels[region.id]] }));
  });
}

function renderLegend() {
  const { lang } = state();
  dom.legend.replaceChildren();
  LEVELS.forEach((level) => {
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `<span class="legend-dot" style="background:${level.color}"></span><span>${I18N[lang].levelLabels[level.id]}</span><span class="legend-score">${level.score}</span>`;
    dom.legend.append(item);
  });
}

function renderRegionCard(clientX, clientY) {
  if (!selectedRegionId) return;
  const current = state();
  const region = REGION_BY_ID[selectedRegionId];
  const level = current.levels[region.id];
  setText(dom.regionKicker, t("detailsTitle"));
  setText(dom.regionName, region[current.lang]);
  setText(dom.regionCurrent, `${t("currentLevel")}: ${I18N[current.lang].levelLabels[level]}`);
  setText(dom.closeRegion, "×");
  dom.closeRegion.setAttribute("aria-label", t("close"));
  dom.regionLevels.setAttribute("aria-label", t("chooseLevel"));
  dom.regionLevels.replaceChildren();
  LEVELS.forEach((entry) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "level-option" + (entry.id === level ? " is-selected" : "");
    option.setAttribute("aria-pressed", String(entry.id === level));
    option.innerHTML = `<span class="level-option__dot" style="background:${entry.color}"></span><span>${I18N[current.lang].levelNames[entry.id]}</span><span class="level-option__score">${entry.score}</span>`;
    option.addEventListener("click", (event) => { event.stopPropagation(); store.setLevel(region.id, entry.id); });
    dom.regionLevels.append(option);
  });
  const searchTerm = current.lang === "en" ? `${region.en} travel` : `${region.zh} 旅游景点`;
  dom.regionSearch.href = current.lang === "en"
    ? `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}`
    : `https://www.baidu.com/s?wd=${encodeURIComponent(searchTerm)}`;
  setText(dom.regionSearch, `${t("search")} ↗`);
  dom.regionCard.classList.add("is-open");
  dom.regionCard.setAttribute("aria-hidden", "false");
  placeRegionCard(clientX, clientY);
}

function placeRegionCard(clientX = innerWidth / 2, clientY = innerHeight / 2) {
  if (matchMedia("(max-width: 760px), (max-height: 600px)").matches) return;
  const margin = 16;
  const width = dom.regionCard.offsetWidth;
  const height = dom.regionCard.offsetHeight;
  let left = clientX + 16;
  let top = clientY + 16;
  if (left + width > innerWidth - margin) left = clientX - width - 16;
  if (top + height > innerHeight - margin) top = innerHeight - height - margin;
  dom.regionCard.style.left = `${Math.max(margin, left)}px`;
  dom.regionCard.style.top = `${Math.max(margin, top)}px`;
  dom.regionCard.style.right = "auto";
  dom.regionCard.style.bottom = "auto";
}

function closeRegion() {
  selectedRegionId = null;
  dom.regionCard.classList.remove("is-open");
  dom.regionCard.setAttribute("aria-hidden", "true");
  renderMapLevels();
  lastRegionTrigger?.focus?.();
}

function renderLanguage() {
  const current = state();
  const dictionary = I18N[current.lang];
  document.documentElement.lang = current.lang === "en" ? "en" : "zh-CN";
  document.title = `${dictionary.appName} · ${store.score()}`;
  dom.metaDescription?.setAttribute("content", dictionary.metaDescription);
  dom.ogTitle?.setAttribute("content", document.title);
  dom.ogDescription?.setAttribute("content", dictionary.metaDescription);
  dom.mapStage?.setAttribute("aria-label", dictionary.mapLabel);
  dom.svg.setAttribute("aria-label", dictionary.mapLabel);
  dom.labels.setAttribute("aria-label", dictionary.mapLabels);
  dom.actionDock?.setAttribute("aria-label", dictionary.actions);
  setText(dom.siteTitle, dictionary.appName);
  setText(dom.siteSubtitle, dictionary.appSubtitle);
  setText(dom.scoreLabel, dictionary.level);
  setText(dom.visited, t("visited", { count: store.visited(), total: REGIONS.length }));
  setText(dom.legendHeading, t("chooseLevel"));
  setText(dom.mapHint, t("mapHint"));
  setText(dom.fit.querySelector("span"), t("fitMap"));
  dom.fit.setAttribute("aria-label", t("fitMap"));
  setText(dom.language, dictionary.language);
  setText(dom.name, t("setName"));
  setText(dom.copy, t("copyLink"));
  setText(dom.share, t("share"));
  dom.shareX.setAttribute("aria-label", dictionary.shareX);
  dom.shareFacebook.setAttribute("aria-label", dictionary.shareFacebook);
  setText(dom.export, t("export"));
  setText(dom.exportPng, t("exportPng"));
  setText(dom.exportSvg, t("exportSvg"));
  setText(dom.reset, t("reset"));
  setText(dom.closeRegion, "\u00d7");
  dom.closeRegion.setAttribute("aria-label", t("close"));
  setText(dom.nameDialogTitle, t("nameDialogTitle"));
  setText(dom.nameHint, t("nameDialogHint"));
  setText(dom.nameInputLabel, t("displayNameLabel"));
  dom.nameInput.placeholder = t("namePlaceholder");
  setText(dom.nameDialogClose, "\u00d7");
  dom.nameDialogClose.setAttribute("aria-label", t("close"));
  setText(dom.nameCancel, t("cancel"));
  setText(dom.nameSave, t("save"));
  setText(dom.resetDialogTitle, t("resetDialogTitle"));
  setText(dom.resetDialogText, t("resetDialogText"));
  setText(dom.resetDialogClose, "\u00d7");
  dom.resetDialogClose.setAttribute("aria-label", t("close"));
  setText(dom.resetCancel, t("cancel"));
  setText(dom.resetConfirm, t("resetConfirm"));
  renderLegend();
  renderLabels();
}

function renderAll() {
  const { score } = scoreAndVisited();
  setText(dom.level, score);
  renderLanguage();
  renderMapLevels();
  if (selectedRegionId) renderRegionCard();
}

function showToast(message) {
  clearTimeout(toastTimer);
  setText(dom.toast, message);
  dom.toast.hidden = false;
  toastTimer = setTimeout(() => { dom.toast.hidden = true; }, 2600);
}

async function copyShareLink() {
  const value = store.shareUrl();
  try {
    await navigator.clipboard.writeText(value);
    showToast(t("copied"));
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();
    showToast(copied ? t("copied") : t("copyFailed"));
  }
}

function shareText() {
  const { score, visited } = scoreAndVisited();
  return t("shareText", { level: score, count: visited, total: REGIONS.length });
}

async function nativeShare() {
  const url = store.shareUrl();
  if (navigator.share) {
    try { await navigator.share({ title: document.title, text: shareText(), url }); return; } catch (error) { if (error.name === "AbortError") return; }
  }
  await copyShareLink();
}

function externalShare(network) {
  const url = encodeURIComponent(store.shareUrl());
  const quote = encodeURIComponent(shareText());
  const target = network === "x"
    ? `https://x.com/intent/post?text=${quote}&url=${url}`
    : `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`;
  window.open(target, "_blank", "noopener,noreferrer,width=680,height=550");
}

function exportOptions() {
  const current = state();
  const { score, visited } = scoreAndVisited();
  return { svg: dom.svg, state: current, score, visited };
}

function openNameDialog() {
  dom.nameInput.value = state().name;
  dom.nameDialog.showModal();
  setTimeout(() => dom.nameInput.focus(), 0);
}

function openResetDialog() { dom.resetDialog.showModal(); }
function toggleExportMenu() {
  const next = dom.exportMenu.hidden;
  dom.exportMenu.hidden = !next;
  dom.export.setAttribute("aria-expanded", String(next));
}
function closeExportMenu() { dom.exportMenu.hidden = true; dom.export.setAttribute("aria-expanded", "false"); }

function bindControls() {
  dom.language.addEventListener("click", () => store.setLanguage(state().lang === "zh" ? "en" : "zh"));
  dom.fit.addEventListener("click", () => viewport.fit());
  dom.closeRegion.addEventListener("click", closeRegion);
  dom.name.addEventListener("click", openNameDialog);
  dom.copy.addEventListener("click", copyShareLink);
  dom.share.addEventListener("click", nativeShare);
  dom.shareX.addEventListener("click", () => externalShare("x"));
  dom.shareFacebook.addEventListener("click", () => externalShare("facebook"));
  dom.export.addEventListener("click", toggleExportMenu);
  dom.exportPng.addEventListener("click", async () => { closeExportMenu(); await downloadPng(exportOptions()); });
  dom.exportSvg.addEventListener("click", async () => { closeExportMenu(); await downloadSvg(exportOptions()); });
  dom.reset.addEventListener("click", openResetDialog);
  dom.nameForm.addEventListener("submit", (event) => { if (event.submitter?.value === "save") store.setName(dom.nameInput.value); });
  dom.resetForm.addEventListener("submit", (event) => { if (event.submitter?.value === "reset") { store.reset(); closeRegion(); } });
  document.addEventListener("click", (event) => {
    if (!dom.exportMenu.hidden && !event.target.closest(".button-menu")) closeExportMenu();
    if (selectedRegionId && !event.target.closest("#region-card") && !event.target.closest(".province") && !event.target.closest(".map-label")) closeRegion();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { closeExportMenu(); if (selectedRegionId) closeRegion(); }
  });
  window.addEventListener("resize", () => { if (selectedRegionId) placeRegionCard(); });
}

bindRegionFeatures();
bindControls();
store.subscribe(renderAll);
requestAnimationFrame(renderAll);
