// Same scheme as projects/iterium: language is picked once per page load; the choice lives in one
// domain-wide key `lruns-lang` (shared with lruns.one and the other projects). Order: stored choice -> browser.
import { dict, type Key } from "./strings";

export type Lang = "ru" | "en";
const STORE_KEY = "lruns-lang"; // shared key, the name must not change

function readStore(): Lang | null {
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    return v === "ru" || v === "en" ? v : null;
  } catch {
    return null; // storage can throw on file://
  }
}

function fromBrowser(): Lang {
  const tags = [...(navigator.languages || []), navigator.language].filter(Boolean);
  return tags.some((t) => t.toLowerCase().startsWith("ru")) ? "ru" : "en";
}

export const lang: Lang = readStore() || fromBrowser();

export function t(key: Key): string {
  return dict[key][lang];
}

export function setLang(next: Lang): void {
  try { window.localStorage.setItem(STORE_KEY, next); } catch { /* storage denied: browser language decides */ }
  window.location.reload();
}
