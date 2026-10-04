import { geoNaturalEarth1, geoPath, geoGraticule10 } from "d3-geo";
import { select, type Selection } from "d3-selection";
import { zoom, zoomIdentity, type D3ZoomEvent } from "d3-zoom";
import "d3-transition";
import world from "./data/world.json";
import placesData from "./data/places.json";
import { GLYPHS } from "./glyphs";
import miniData from "./data/miniatures.json";
import { showCard, placeName } from "./card";
import { lang, t, setLang } from "./i18n";
import type { Place } from "./types";

const places = placesData as Place[];
const W = 1600;
const H = 860;

// Mizielinski-like palette: flat, friendly, a little faded.
const CONTINENT_COLORS: Record<string, string[]> = {
  Europe: ["#e8c9a0", "#ebd3a8", "#e2bf94"],
  Asia: ["#e7d28b", "#ecd994", "#dfc67e"],
  Africa: ["#e9b98a", "#eec195", "#e2ae7c"],
  "North America": ["#b9d6a0", "#c4dca9", "#aecb95"],
  "South America": ["#a8d1b4", "#b4d8bf", "#9bc6a8"],
  Oceania: ["#e6a9a0", "#ebb5ac", "#dd9c93"],
};
const CONTINENT_LABELS: Array<[string, string, number, number]> = [
  ["Европа", "Europe", 14, 52], ["Азия", "Asia", 90, 48], ["Африка", "Africa", 20, 4], ["Северная Америка", "North America", -105, 46],
  ["Южная Америка", "South America", -60, -14], ["Океания", "Oceania", 135, -26],
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const projection = geoNaturalEarth1().fitExtent([[40, 30], [W - 40, H - 40]], { type: "Sphere" } as never);
const path = geoPath(projection);

const stage = document.getElementById("stage") as HTMLElement;
const svg = select(stage).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("preserveAspectRatio", "xMidYMid slice");
const defs = svg.append("defs");
defs.append("pattern").attr("id", "waves").attr("width", 28).attr("height", 14).attr("patternUnits", "userSpaceOnUse")
  .append("path").attr("d", "M0,8 q7,-6 14,0 t14,0").attr("fill", "none").attr("stroke", "#9bbbb0").attr("stroke-width", 0.8).attr("opacity", 0.55);

const root = svg.append("g");
root.append("path").attr("class", "sea").attr("d", path({ type: "Sphere" } as never) as string);
root.append("path").attr("d", path({ type: "Sphere" } as never) as string).attr("fill", "url(#waves)");
const grat = root.append("path").attr("class", "grat").attr("d", path(geoGraticule10()) as string);
let gratHidden = false;

const countries = (world as unknown as { features: Array<{ properties: { iso3: string; "континент": string }; geometry: unknown }> }).features;
const landLayer = root.append("g");
for (const f of countries) {
  const palette = CONTINENT_COLORS[f.properties["континент"]] ?? CONTINENT_COLORS.Europe;
  landLayer.append("path").attr("class", "country").attr("d", path(f as never) as string)
    .attr("fill", palette[hash(f.properties.iso3) % palette.length]);
}

const labelLayer = root.append("g");
for (const [ru, en, lon, lat] of CONTINENT_LABELS) {
  const p = projection([lon, lat]);
  if (p) labelLayer.append("text").attr("class", "cont-label").attr("x", p[0]).attr("y", p[1]).attr("text-anchor", "middle").text(lang === "ru" ? ru : en);
}

// Decorative miniatures (game-icons.net, CC BY 3.0): they only tell what region you are in. They fade in as you zoom.
const DECOR: Array<[string, number, number, number]> = [
  // kind, lon, lat, size in map units
  ["pyramid", -90, 17, 34], ["pyramid", -76, -11, 34], ["cliff-dwelling", -110, 36, 30], ["ruins", 22, 39.5, 30],
  ["tomb", 32, 22, 28], ["canyon-city", 45, 24, 30], ["stupa", 101, 15, 30], ["stupa", 88, 26, 28],
  ["temple", 126, 36, 28], ["underground-city", 2, 28, 28], ["cave", 140, -26, 30], ["salt-mine", 70, 56, 28],
];
const decorLayer = root.append("g").attr("class", "decor").style("pointer-events", "none");
for (const [kind, lon, lat, size] of DECOR) {
  const paths = (miniData as Record<string, string[]>)[kind];
  const pt = projection([lon, lat]);
  if (!paths || !pt) continue;
  const g = decorLayer.append("g").attr("transform", `translate(${pt[0] - size / 2},${pt[1] - size / 2}) scale(${size / 512})`);
  for (const d of paths) g.append("path").attr("d", d);
}

// Pins
const pinLayer = root.append("g");
const card = document.getElementById("card") as HTMLElement;
let currentId: string | null = null;

interface Pin { place: Place; x: number; y: number; r: number; g: Selection<SVGGElement, unknown, null, undefined>; node: SVGGElement }
const pins: Pin[] = places.map((place) => {
  const [x, y] = projection([place.lon, place.lat]) as [number, number];
  const r = place.wow !== null && place.wow <= 5 ? 17 : 13;
  const g = pinLayer.append("g").attr("class", "pin").classed("has-model", place.models.length > 0).attr("data-id", place.id);
  g.append("ellipse").attr("class", "shadow").attr("cx", 2).attr("cy", r - 2).attr("rx", r * 0.8).attr("ry", r * 0.3);
  g.append("circle").attr("class", "ring").attr("r", r + 5);
  g.append("circle").attr("class", "disc").attr("r", r);
  g.append("path").attr("class", "glyph").attr("d", GLYPHS[place.kind]).attr("transform", `scale(${r / 11})`);
  g.append("text").attr("class", "name").attr("x", r + 6).attr("y", 4).text(pinLabel(place));
  const more = g.append("g").attr("class", "more").attr("transform", `translate(${-r + 1},${r - 2})`);
  more.append("circle").attr("r", 9);
  more.append("text").attr("dy", "0.35em");
  more.append("title");
  more.on("click", (ev: Event) => onPinClick(ev, place.id));
  g.append("g").attr("class", "stack").on("click", (ev: Event) => ev.stopPropagation());
  g.on("click", (ev: Event) => onPinClick(ev, place.id));
  return { place, x, y, r, g, node: g.node() as SVGGElement };
});

let k = 1;
let openStack: string | null = null;
let legendFilter: "model" | "pile" | null = null;
const grouped = new Map<string, Pin[]>();

// Places that stand for a tight neighborhood, so the famous one keeps the circle.
const LEADS = new Set(["derinkuyu", "wieliczka", "mary-kings-close", "whity-umeda"]);
const MAX_K = 280;
// Same valley, in map units: Cappadocia's cities, the two Polish salt mines, Osaka, Edinburgh.
// A neighbor stays inside that one circle until this many screen pixels apart.

function rank(place: Place): number {
  if (LEADS.has(place.id)) return 28;
  return place.wow ?? 90;
}

function byRank(a: Pin, b: Pin): number {
  return rank(a.place) - rank(b.place) || (a.place.id < b.place.id ? -1 : 1);
}

const ranked = [...pins].sort(byRank);

// A label is drawn in pin-local pixels. Zoom and the pin's counter-scale cancel,
// so these boxes live in the same space as (pin.x * k, pin.y * k).
interface Box { x: number; y: number; w: number; h: number }
function hits(a: Box, b: Box, pad: number): boolean {
  return a.x - pad < b.x + b.w && a.x + a.w + pad > b.x && a.y - pad < b.y + b.h && a.y + a.h + pad > b.y;
}

function pinLabel(place: Place): string {
  const name = placeName(place).split("(")[0].trim();
  return name.replace(/ underground city$/i, "");
}

// Pixel widths of pin labels. Zoom must not measure text; resize and font load refresh this.
const labelWidths = new Map<string, number>();
let lastVisibleKey: string | null = null;
let lastOpenStack: string | null = null;
let lastCurrentId: string | null = null;

function measureLabelWidths(): boolean {
  const undo: Array<() => void> = [];
  for (const pin of pins) {
    const hidden = pin.g.style("display") === "none";
    const nolabel = pin.g.classed("nolabel");
    if (!hidden && !nolabel) continue;
    if (hidden) pin.g.style("display", null);
    if (nolabel) pin.g.classed("nolabel", false);
    undo.push(() => {
      if (hidden) pin.g.style("display", "none");
      if (nolabel) pin.g.classed("nolabel", true);
    });
  }
  try {
    let changed = false;
    for (const pin of pins) {
      const measured = pin.g.select<SVGTextElement>("text.name").node()?.getComputedTextLength() ?? 0;
      if (!(measured > 0)) continue;
      const width = measured + 8;
      const prev = labelWidths.get(pin.place.id);
      if (prev !== undefined && Math.abs(prev - width) < 0.5) continue;
      labelWidths.set(pin.place.id, width);
      changed = true;
    }
    return changed;
  } finally {
    for (const fn of undo) fn();
  }
}

function labelWidth(pin: Pin): number {
  return (labelWidths.get(pin.place.id) ?? pinLabel(pin.place).length * 8.4) + 14;
}

function placeLabels(shown: Pin[]): void {
  const discs: Array<{ cx: number; cy: number; r: number }> = [];
  const labels: Box[] = [];
  for (const pin of shown) {
    const sx = pin.x * k;
    const sy = pin.y * k;
    const chosen = pin.place.id === currentId;
    pin.g.classed("nolabel", false);
    discs.push({ cx: sx, cy: sy, r: pin.r });
    const text = pin.g.select<SVGTextElement>("text.name");
    const width = labelWidth(pin);
    const height = 22;
    const gap = pin.r + 10;
    const sides: Array<{ x: number; y: number; anchor: "start" | "end" | "middle" }> = [
      { x: gap, y: 4, anchor: "start" },
      { x: -gap, y: 4, anchor: "end" },
      { x: 0, y: -(pin.r + 6), anchor: "middle" },
      { x: 0, y: pin.r + 16, anchor: "middle" },
    ];
    let placed: Box | null = null;
    let fallback: { side: (typeof sides)[number]; box: Box; hits: number } | null = null;
    for (const side of sides) {
      const left = side.anchor === "end" ? sx + side.x - width : side.anchor === "middle" ? sx - width / 2 : sx + side.x;
      const box: Box = { x: left, y: sy + side.y - 12, w: width, h: height };
      const others = discs.slice(0, -1).map((d): Box => ({ x: d.cx - d.r, y: d.cy - d.r, w: d.r * 2, h: d.r * 2 }));
      const blocked = [...others, ...labels].filter((d) => hits(box, d, 10)).length;
      if (blocked === 0) {
        text.attr("x", side.x).attr("y", side.y).attr("text-anchor", side.anchor);
        placed = box;
        break;
      }
      if (!fallback || blocked < fallback.hits) fallback = { side, box, hits: blocked };
    }
    if (!placed && fallback) {
      text.attr("x", fallback.side.x).attr("y", fallback.side.y).attr("text-anchor", fallback.side.anchor);
      if (chosen) placed = fallback.box;
    }
    if (placed) labels.push(placed);
    pin.g.classed("nolabel", !placed);
  }
}

function syncStack(): void {
  const menu = document.getElementById("cluster");
  if (!menu) return;
  const hidden = openStack ? grouped.get(openStack) ?? [] : [];
  const host = openStack ? pins.find((p) => p.place.id === openStack) : undefined;
  menu.replaceChildren();
  if (!host || hidden.length === 0) { menu.hidden = true; return; }
  const svgNS = "http://www.w3.org/2000/svg";
  for (const other of [host, ...hidden]) {
    const b = document.createElement("button");
    b.type = "button";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "-14 -14 28 28");
    svg.setAttribute("aria-hidden", "true");
    const disc = document.createElementNS(svgNS, "circle");
    disc.setAttribute("r", "11");
    const mark = document.createElementNS(svgNS, "path");
    mark.setAttribute("d", GLYPHS[other.place.kind]);
    svg.append(disc, mark);
    const name = document.createElement("span");
    name.textContent = pinLabel(other.place);
    b.append(svg, name);
    b.addEventListener("click", (ev) => {
      ev.stopPropagation();
      openStack = null;
      menu.hidden = true;
      selectPlace(other.place.id);
    });
    menu.appendChild(b);
  }
  menu.hidden = false;
  placeCluster();
}

/** Keeps the paper plate beside the circle while the map moves. */
function placeCluster(): void {
  const menu = document.getElementById("cluster");
  const host = openStack ? pins.find((p) => p.place.id === openStack) : undefined;
  if (!menu || menu.hidden || !host) return;
  const ctm = host.g.node()?.getScreenCTM();
  if (!ctm) return;
  const width = menu.offsetWidth || 240;
  const height = menu.offsetHeight || 40;
  const left = ctm.e + host.r + 16;
  menu.style.left = `${Math.max(12, Math.min(left, window.innerWidth - width - 12))}px`;
  menu.style.top = `${Math.max(12, Math.min(ctm.f - height / 2, window.innerHeight - height - 12))}px`;
}

/** Dims shown pins that are not the legend's chosen mark. Hidden neighbours stay display:none. */
function applyLegendDim(shown: Pin[]): void {
  const shownSet = new Set(shown);
  for (const pin of pins) {
    const neighbours = grouped.get(pin.place.id) ?? [];
    const hasModel = pin.place.models.length > 0 || neighbours.some((n) => n.place.models.length > 0);
    const hasPile = neighbours.length > 0;
    const match = legendFilter === null || (legendFilter === "model" ? hasModel : hasPile);
    pin.g.classed("dim", shownSet.has(pin) && !match);
  }
}

function layoutPins(): void {
  // Overlapping circles collapse into one host with a "+N". The plate lists them;
  // the circles themselves stay put. Counter-scale updates every frame.
  const shown: Pin[] = [];
  grouped.clear();
  for (const pin of ranked) {
    const sx = pin.x * k;
    const sy = pin.y * k;
    let host: Pin | null = null;
    let nearest = Infinity;
    for (const other of shown) {
      const screen = Math.hypot(other.x * k - sx, other.y * k - sy);
      if (screen < other.r + pin.r + 10 && screen < nearest) { nearest = screen; host = other; }
    }
    pin.g.interrupt();
    pin.node.setAttribute("transform", `translate(${pin.x},${pin.y}) scale(${1 / k})`);
    if (host) {
      const list = grouped.get(host.place.id) ?? [];
      list.push(pin);
      grouped.set(host.place.id, list);
      continue;
    }
    shown.push(pin);
  }

  const visibleKey = shown.map((p) => p.place.id).join("\0");
  // Filter clicks do not change who is shown, so the early return below would
  // swallow them. Dim is applied on every call, including that path.
  applyLegendDim(shown);
  if (visibleKey === lastVisibleKey && openStack === lastOpenStack && currentId === lastCurrentId) {
    placeCluster();
    return;
  }
  lastVisibleKey = visibleKey;
  lastOpenStack = openStack;
  lastCurrentId = currentId;

  const visible = new Set(shown);
  for (const pin of pins) {
    if (visible.has(pin)) pin.g.style("display", null);
    else pin.g.style("display", "none");
  }
  placeLabels(shown);
  for (const pin of pins) {
    const hidden = grouped.get(pin.place.id) ?? [];
    pin.g.classed("has-more", hidden.length > 0);
    const more = pin.g.select<SVGGElement>(".more");
    more.select("text").text("+" + hidden.length);
    more.select("title").text(t("moreNearby").replace("{n}", String(hidden.length)));
  }
  syncStack();
}

const zoomer = zoom<SVGSVGElement, unknown>()
  .scaleExtent([1, MAX_K])
  .translateExtent([[-200, -100], [W + 200, H + 100]])
  .on("zoom", (ev: D3ZoomEvent<SVGSVGElement, unknown>) => {
    root.attr("transform", ev.transform.toString());
    k = ev.transform.k;
    svg.style("--z", k.toFixed(3));
    const hideGrat = k > 3.5;
    if (hideGrat !== gratHidden) { gratHidden = hideGrat; grat.attr("display", hideGrat ? "none" : null); }
    decorLayer.attr("opacity", Math.min(0.5, 0.22 + (k - 1) * 0.1));
    layoutPins();
  });
svg.call(zoomer as never);
svg.on("dblclick.zoom", null);

function selectPlace(id: string): void {
  const place = places.find((p) => p.id === id);
  if (!place) return;
  currentId = id;
  pinLayer.selectAll<SVGGElement, unknown>("g.pin").classed("on", (_d, i, nodes) => nodes[i].getAttribute("data-id") === id);
  showCard(card, place, () => { currentId = null; pinLayer.selectAll("g.pin").classed("on", false); layoutPins(); });
  layoutPins();
}

function flyToPoint(x: number, y: number, scale: number): void {
  const s = Math.max(1, Math.min(MAX_K, scale));
  const t = zoomIdentity.translate(W / 2 - x * s, H / 2 - y * s).scale(s);
  (svg.transition().duration(900) as never as { call: (f: unknown, t: unknown) => void }).call(zoomer.transform, t);
}

function scaleWhereVisible(pin: Pin): number {
  let need = 6;
  for (const other of pins) {
    if (other === pin) continue;
    const earlier = rank(other.place) < rank(pin.place)
      || (rank(other.place) === rank(pin.place) && other.place.id < pin.place.id);
    if (!earlier) continue;
    const geo = Math.hypot(other.x - pin.x, other.y - pin.y);
    if (geo > 0) need = Math.max(need, ((other.r + pin.r + 14) / geo) * 1.05);
  }
  return Math.min(MAX_K, need);
}

function flyTo(id: string): void {
  const pin = pins.find((p) => p.place.id === id);
  if (!pin) return;
  flyToPoint(pin.x, pin.y, scaleWhereVisible(pin));
}

function onPinClick(ev: Event, id: string): void {
  ev.stopPropagation();
  const members = grouped.get(id);
  if (members && members.length > 0) {
    openStack = openStack === id ? null : id;
    layoutPins();
    return;
  }
  openStack = null;
  selectPlace(id);
}

// "Random wonder" is an explicit action, so it is allowed to move the camera.
document.getElementById("random")?.addEventListener("click", () => {
  const others = places.filter((p) => p.id !== currentId);
  const pick = others[Math.floor(Math.random() * others.length)];
  selectPlace(pick.id);
  flyTo(pick.id);
});

svg.on("click", () => {
  openStack = null;
  layoutPins();
});
measureLabelWidths();
layoutPins();

function refreshLabelWidths(): void {
  if (!measureLabelWidths()) return;
  lastVisibleKey = null;
  layoutPins();
}
void document.fonts.ready.then(refreshLabelWidths);
window.addEventListener("resize", refreshLabelWidths);

// Deep link: index.html#derinkuyu opens that place's card (the camera stays where it is).
const fromHash = decodeURIComponent(location.hash.slice(1));
if (fromHash) selectPlace(fromHash);


decorLayer.attr("opacity", 0.22);

// --- texts, language switch, intro ---
document.title = t("pageTitle");
document.documentElement.lang = lang;
const setText = (id: string, text: string): void => { const el = document.getElementById(id); if (el) el.textContent = text; };
setText("h1", t("title")); setText("tagline", t("tagline"));
setText("random", t("random"));
setText("legend", t("legend"));
setText("legend-all", t("legendAll"));
setText("legend-model", t("legendModel"));
setText("legend-pile", t("legendPile"));
setText("credit-bar", t("gathered"));

function syncLegendRows(): void {
  const plate = document.getElementById("legend-plate");
  if (!plate) return;
  for (const btn of Array.from(plate.querySelectorAll<HTMLButtonElement>("button[data-filter]"))) {
    const key = btn.dataset.filter ?? "";
    const on = key === "all" ? legendFilter === null : key === legendFilter;
    btn.classList.toggle("on", on);
    btn.setAttribute("aria-pressed", String(on));
  }
}

document.getElementById("legend")?.addEventListener("click", () => {
  const plate = document.getElementById("legend-plate");
  const bar = document.getElementById("legend");
  if (!plate || !bar) return;
  plate.hidden = !plate.hidden;
  bar.setAttribute("aria-expanded", String(!plate.hidden));
});

document.getElementById("legend-plate")?.addEventListener("click", (ev) => {
  const btn = (ev.target as Element).closest("button[data-filter]");
  if (!btn) return;
  const key = btn.getAttribute("data-filter");
  if (key === "model" || key === "pile") legendFilter = legendFilter === key ? null : key;
  else legendFilter = null;
  syncLegendRows();
  layoutPins();
});
syncLegendRows();
setText("credit-body", `${t("footer")} ${t("iconsCredit")} ${t("introInspired")}`);
document.getElementById("credit-bar")?.addEventListener("click", () => {
  const body = document.getElementById("credit-body");
  const bar = document.getElementById("credit-bar");
  if (!body || !bar) return;
  body.hidden = !body.hidden;
  bar.setAttribute("aria-expanded", String(!body.hidden));
});
const langBtn = document.getElementById("lang") as HTMLButtonElement;
langBtn.textContent = lang === "ru" ? "EN" : "RU";
langBtn.addEventListener("click", () => setLang(lang === "ru" ? "en" : "ru"));
