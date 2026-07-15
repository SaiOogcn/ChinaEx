import { LEVEL_BY_ID, LEVEL_ORDER, REGION_IDS } from "./data.js";

const STORAGE_KEY = "chinaex-state-v2";
const LEGACY_LEVELS_KEY = "chinaex-levels";
const LEGACY_LANGUAGE_KEY = "chinaex-lang";

const emptyLevels = () => Object.fromEntries(REGION_IDS.map((id) => [id, "white"]));

function safeJson(value) {
  try { return JSON.parse(value); } catch { return null; }
}

function normalizeLevels(levels = {}) {
  const normalized = emptyLevels();
  REGION_IDS.forEach((id) => {
    if (LEVEL_BY_ID[levels[id]]) normalized[id] = levels[id];
  });
  return normalized;
}

function levelsFromLegacyHash(hash) {
  if (!/^\d{1,34}$/.test(hash)) return null;
  const levels = emptyLevels();
  hash.split("").forEach((score, index) => {
    const id = REGION_IDS[index];
    if (id) levels[id] = LEVEL_ORDER[Math.min(5, Number(score))] || "white";
  });
  return levels;
}

function readHash() {
  const hash = window.location.hash.slice(1);
  const legacy = levelsFromLegacyHash(hash);
  if (legacy) return { levels: legacy, name: new URLSearchParams(window.location.search).get("t") || "", lang: null };
  const params = new URLSearchParams(hash);
  if (params.get("v") !== "2" || !params.get("l")) return null;
  const compact = params.get("l");
  if (!/^\d{34}$/.test(compact)) return null;
  const levels = emptyLevels();
  compact.split("").forEach((score, index) => { levels[REGION_IDS[index]] = LEVEL_ORDER[Number(score)] || "white"; });
  return { levels, name: params.get("n") || "", lang: ["zh", "en"].includes(params.get("lang")) ? params.get("lang") : null };
}

function readLegacy() {
  const saved = safeJson(localStorage.getItem(LEGACY_LEVELS_KEY) || "{}") || {};
  return {
    levels: normalizeLevels(saved),
    name: new URLSearchParams(window.location.search).get("t") || "",
    lang: localStorage.getItem(LEGACY_LANGUAGE_KEY) === "en" ? "en" : "zh"
  };
}

export function createStore() {
  const fromHash = readHash();
  const persisted = safeJson(localStorage.getItem(STORAGE_KEY) || "");
  const initial = fromHash || (persisted ? { ...persisted, levels: normalizeLevels(persisted.levels) } : readLegacy());
  let state = {
    version: 2,
    levels: normalizeLevels(initial.levels),
    name: String(initial.name || "").slice(0, 48),
    lang: initial.lang === "en" ? "en" : "zh"
  };
  const listeners = new Set();

  function compactLevels() {
    return REGION_IDS.map((id) => LEVEL_ORDER.indexOf(state.levels[id] || "white")).join("");
  }

  function shareUrl() {
    const url = new URL(window.location.href);
    const hash = new URLSearchParams({ v: "2", l: compactLevels(), lang: state.lang });
    if (state.name) hash.set("n", state.name);
    url.hash = hash.toString();
    url.searchParams.delete("t");
    return url.toString();
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(LEGACY_LANGUAGE_KEY, state.lang);
    history.replaceState(null, "", shareUrl());
  }

  function emit() { listeners.forEach((listener) => listener(getState())); }
  function getState() { return { ...state, levels: { ...state.levels } }; }
  function update(patch) { state = { ...state, ...patch }; persist(); emit(); }

  persist();
  return {
    getState,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    setLevel(id, level) { if (REGION_IDS.includes(id) && LEVEL_BY_ID[level]) update({ levels: { ...state.levels, [id]: level } }); },
    setName(name) { update({ name: String(name || "").trim().slice(0, 48) }); },
    setLanguage(lang) { if (["zh", "en"].includes(lang)) update({ lang }); },
    reset() { update({ levels: emptyLevels() }); },
    shareUrl,
    score() { return REGION_IDS.reduce((sum, id) => sum + LEVEL_BY_ID[state.levels[id]].score, 0); },
    visited() { return REGION_IDS.filter((id) => state.levels[id] !== "white").length; }
  };
}
