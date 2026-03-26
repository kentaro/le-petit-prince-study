/**
 * Path-based SPA router for static export.
 *
 * Routes:
 *   /                        → home
 *   /vocab                   → vocab list
 *   /review                  → SRS review
 *   /chapter/:num            → reading
 *   /chapter/:num/flashcard  → flashcard
 *   /chapter/:num/conjugation → conjugation
 *   /chapter/:num/comprehension → comprehension
 *   /chapter/:num/summary    → summary
 */

export interface Route {
  view: "home" | "chapter" | "vocabList";
  subView?: "reading" | "flashcard" | "conjugation" | "comprehension" | "summary";
  chapterNum?: number;
  reviewMode?: boolean;
}

function getBasePath(): string {
  // basePath is set at build time via next.config.ts
  return process.env.NODE_ENV === "production" ? "/le-petit-prince-study" : "";
}

export function parseRoute(pathname?: string): Route {
  const base = getBasePath();
  const raw = pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const path = base ? raw.replace(base, "") : raw;
  const clean = path.replace(/\/+$/, "") || "/";

  if (clean === "/" || clean === "") {
    return { view: "home" };
  }

  if (clean === "/vocab") {
    return { view: "vocabList" };
  }

  if (clean === "/review") {
    return { view: "chapter", subView: "flashcard", reviewMode: true };
  }

  const chapterMatch = clean.match(/^\/chapter\/(\d+)(?:\/(reading|flashcard|conjugation|comprehension|summary))?$/);
  if (chapterMatch) {
    const num = parseInt(chapterMatch[1], 10);
    const sub = (chapterMatch[2] as Route["subView"]) || "reading";
    return { view: "chapter", subView: sub, chapterNum: num };
  }

  return { view: "home" };
}

export function buildPath(route: Route): string {
  const base = getBasePath();

  if (route.view === "home") return base + "/";
  if (route.view === "vocabList") return base + "/vocab";

  if (route.reviewMode) return base + "/review";

  if (route.view === "chapter" && route.chapterNum) {
    const sub = route.subView || "reading";
    if (sub === "reading") return base + `/chapter/${route.chapterNum}`;
    return base + `/chapter/${route.chapterNum}/${sub}`;
  }

  return base + "/";
}

export function navigateTo(route: Route): void {
  const path = buildPath(route);
  window.history.pushState(null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function replaceTo(route: Route): void {
  const path = buildPath(route);
  window.history.replaceState(null, "", path);
}
