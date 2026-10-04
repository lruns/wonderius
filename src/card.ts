import type { Place } from "./types";
import { lang, t } from "./i18n";

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}

/** Opens the place as an atlas plate: a stamp, one page of the story, a corner you turn. */
export function showCard(el: HTMLElement, place: Place, onClose: () => void): void {
  const paras = place.story?.length
    ? place.story.map((p) => (lang === "ru" ? p.ru : p.en))
    : [place.card];
  const many = paras.length > 1;
  const first = place.photos[0];
  const beads = place.photos.length > 1
    ? `<div class="beads">${place.photos.map((p, i) => `<button type="button" data-i="${i}" class="${i === 0 ? "on" : ""}" title="${esc(p.author)}"><img src="${esc(p.thumb)}" alt=""></button>`).join("")}</div>`
    : "";
  const arrows = place.photos.length > 1
    ? `<button type="button" class="arr prev" id="photo-prev" aria-label="${t("prev")}">‹</button><button type="button" class="arr next" id="photo-next" aria-label="${t("next")}">›</button>`
    : "";
  const stamp = first
    ? `<figure class="stamp"><div class="frame-photo"><img class="hero" id="hero" src="${esc(first.src)}" alt="${esc(placeName(place))}">${arrows}</div>${beads}<figcaption id="credit">${creditHtml(first)}</figcaption></figure>`
    : `<figure class="stamp empty"><div class="hero"></div><figcaption>${t("noPhoto")}</figcaption></figure>`;
  const model = place.models[0];
  const viewer = model
    ? `<div id="viewer"><div class="viewer"><iframe title="3D" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen src="${esc(model.embed)}"></iframe></div><div class="credit-line">${esc(model.author)}, ${esc(model.license)}, <a href="${esc(model.page)}" target="_blank" rel="noopener">${t("source")}</a></div></div>`
    : `<div id="viewer" hidden></div>`;
  const spin = model
    ? `<button type="button" class="btn" id="spin">${t("fold")}</button>`
    : "";
  const tours = place.tours.map((tour) => `<a class="btn ghost" href="${esc(tour.url)}" target="_blank" rel="noopener">${esc(tour.provider.slice(0, 28))}</a>`).join("");
  const sourcesBtn = place.sources.length
    ? `<button type="button" class="btn ghost" id="sources-btn">${t("sources")}</button>`
    : "";
  const sources = place.sources.length
    ? `<ul class="sources" id="sources" hidden>${place.sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a></li>`).join("")}</ul>`
    : "";
  const note = !place.story?.length && lang === "en" ? `<div class="credit-line">${t("textRuOnly")}</div>` : "";
  const curl = many
    ? `<button type="button" class="curl" id="curl" aria-label="${t("next")}"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M2,38 L38,38 L38,2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M38,2 L10,38" fill="none" stroke="currentColor" stroke-width="1.2"/></svg></button>`
    : "";

  el.innerHTML = `<button class="close" aria-label="${t("close")}">×</button>
    <div class="plate">
      ${viewer}
      ${stamp}
      <h2>${esc(placeName(place))}</h2>
      <div class="meta">${esc(placeCountry(place))} · ${esc(lang === "ru" ? place.nameEn : place.nameRu)}</div>
      <div class="rule"></div>
      <div class="leaf">
        <p class="text">${esc(paras[0] || "")}</p>
        ${note}
        ${curl}
        ${many ? `<div class="folio"><button type="button" id="leaf-prev" aria-label="${t("prev")}">‹</button><span id="folio">1 / ${paras.length}</span><button type="button" id="leaf-next" aria-label="${t("next")}">›</button></div>` : ""}
      </div>
      <div class="flaps">${spin}${tours}${sourcesBtn}</div>
      ${sources}
    </div>`;
  el.hidden = false;
  el.scrollTop = 0;

  let page = 0;
  let photo = 0;
  const text = el.querySelector(".leaf .text") as HTMLElement;
  const turn = (dir: number): void => {
    if (!many) return;
    text.classList.add("away");
    window.setTimeout(() => {
      page = (page + dir + paras.length) % paras.length;
      text.textContent = paras[page];
      const folio = el.querySelector("#folio");
      if (folio) folio.textContent = `${page + 1} / ${paras.length}`;
      text.classList.remove("away");
    }, 140);
  };

  el.querySelector(".close")?.addEventListener("click", () => { el.hidden = true; onClose(); });
  el.querySelector("#curl")?.addEventListener("click", () => turn(1));
  el.querySelector("#leaf-next")?.addEventListener("click", () => turn(1));
  el.querySelector("#leaf-prev")?.addEventListener("click", () => turn(-1));
  const showPhoto = (i: number): void => {
    if (!place.photos.length) return;
    photo = (i + place.photos.length) % place.photos.length;
    const p = place.photos[photo];
    (el.querySelector("#hero") as HTMLImageElement | null)?.setAttribute("src", p.src);
    const c = el.querySelector("#credit");
    if (c) c.innerHTML = creditHtml(p);
    el.querySelectorAll<HTMLButtonElement>(".beads button").forEach((n) => n.classList.toggle("on", Number(n.dataset.i) === photo));
  };
  el.querySelector("#hero")?.addEventListener("click", () => { if (place.photos.length) openPhoto(place, photo); });
  el.querySelector("#photo-prev")?.addEventListener("click", () => showPhoto(photo - 1));
  el.querySelector("#photo-next")?.addEventListener("click", () => showPhoto(photo + 1));
  el.querySelectorAll<HTMLButtonElement>(".beads button").forEach((b) =>
    b.addEventListener("click", () => showPhoto(Number(b.dataset.i))),
  );
  el.querySelector("#spin")?.addEventListener("click", () => {
    const v = el.querySelector("#viewer") as HTMLElement;
    const btn = el.querySelector("#spin");
    if (!v || !btn) return;
    const open = v.hidden;
    v.hidden = !open;
    if (open && !v.querySelector("iframe")) {
      const m = place.models[0];
      v.innerHTML = `<div class="viewer"><iframe title="3D" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen src="${esc(m.embed)}"></iframe></div><div class="credit-line">${esc(m.author)}, ${esc(m.license)}, <a href="${esc(m.page)}" target="_blank" rel="noopener">${t("source")}</a></div>`;
    }
    btn.textContent = open ? t("fold") : t("spin");
  });
  el.querySelector("#sources-btn")?.addEventListener("click", () => {
    const list = el.querySelector("#sources") as HTMLElement | null;
    if (list) list.hidden = !list.hidden;
  });
}

function creditHtml(p: { author: string; license: string; page: string }): string {
  return `${t("photoBy")}: ${esc(p.author || t("noAuthor"))}, ${esc(p.license)}, <a href="${esc(p.page)}" target="_blank" rel="noopener">Wikimedia Commons</a>`;
}

export function placeName(p: Place): string { return lang === "ru" ? p.nameRu : p.nameEn; }
export function placeCountry(p: Place): string { return lang === "ru" ? p.countryRu : p.country; }

/** Big photo window with author, licence and a link to the source page. */
function openPhoto(place: Place, start: number): void {
  const lb = document.getElementById("lb") as HTMLElement;
  let i = start;
  const draw = (): void => {
    const p = place.photos[i];
    const arrows = place.photos.length > 1
      ? `<button type="button" class="arr prev" data-d="-1" aria-label="${t("prev")}">‹</button><button type="button" class="arr next" data-d="1" aria-label="${t("next")}">›</button><span class="lb-count">${i + 1} / ${place.photos.length}</span>`
      : "";
    lb.innerHTML = `<button class="lb-close" aria-label="${t("close")}">×</button>
      <div class="lb-box"><div class="lb-stage"><img src="${esc(p.src)}" alt="${esc(placeName(place))}">${arrows}</div>
        <div class="lb-info"><b>${esc(placeName(place))}</b>
          ${t("photoBy")}: ${esc(p.author || t("noAuthor"))}, ${esc(p.license)}.
          <a href="${esc(p.page)}" target="_blank" rel="noopener">${t("onCommons")}</a>
        </div></div>`;
    lb.querySelector(".lb-close")?.addEventListener("click", close);
    lb.querySelectorAll<HTMLButtonElement>("[data-d]").forEach((b) =>
      b.addEventListener("click", (e) => { e.stopPropagation(); i = (i + Number(b.dataset.d) + place.photos.length) % place.photos.length; draw(); }));
  };
  const close = (): void => { lb.hidden = true; lb.innerHTML = ""; document.removeEventListener("keydown", onKey); };
  const onKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      i = (i + (e.key === "ArrowRight" ? 1 : -1) + place.photos.length) % place.photos.length; draw();
    }
  };
  lb.onclick = (e) => { if (e.target === lb) close(); };
  document.addEventListener("keydown", onKey);
  lb.hidden = false;
  draw();
}
