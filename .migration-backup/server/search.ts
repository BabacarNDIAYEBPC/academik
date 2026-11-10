export interface RealArticle {
  lastName: string;
  firstName: string;
  title: string;
  year: string;
  publisher: string;
  platform: string;
  url: string;
  type: string;
  doi?: string;
  isOpenAccess?: boolean;
  abstract?: string;
  relevanceScore?: number;
}

const MAILTO = "contact@bpc-ai.com";

const CAIRN_PUBLISHERS_LOWER = [
  "puf", "presses universitaires de france", "de boeck", "armand colin",
  "eres", "érès", "la découverte", "lavoisier", "médecine & hygiène",
  "belin", "l'harmattan", "dalloz", "dunod", "érès", "cairn",
  "presses de sciences po", "ellipses", "éditions du seuil",
];

async function fetchJSON(url: string): Promise<any> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": `Academik/1.0 (mailto:${MAILTO})` },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function rebuildAbstract(inv: Record<string, number[]>): string {
  if (!inv) return "";
  const words: string[] = [];
  for (const [word, positions] of Object.entries(inv)) {
    for (const pos of positions as number[]) words[pos] = word;
  }
  return words.join(" ").slice(0, 400);
}

function detectPlatform(url: string, publisher: string, fallback: string): string {
  const u = (url || "").toLowerCase();
  const p = (publisher || "").toLowerCase();
  if (u.includes("cairn.info")) return "cairn";
  if (u.includes("sciencedirect.com") || u.includes("linkinghub.elsevier")) return "sciencedirect";
  if (u.includes("pubmed.ncbi") || u.includes("ncbi.nlm.nih")) return "pubmed";
  if (u.includes("hal.") || u.includes("archives-ouvertes") || u.includes("theses.fr")) return "hal";
  if (CAIRN_PUBLISHERS_LOWER.some(cp => p.includes(cp))) return "cairn";
  if (p.includes("elsevier") || p.includes("springer") || p.includes("wiley")) return "sciencedirect";
  return fallback;
}

// ── OpenAlex — Google Scholar equivalent (most comprehensive) ──
async function searchOpenAlex(
  query: string,
  count: number,
  language: string,
  periodStart: string,
  periodEnd: string,
  accessType: string,
): Promise<RealArticle[]> {
  const filters: string[] = [];
  if (periodStart) filters.push(`from_publication_date:${periodStart}-01-01`);
  if (periodEnd) filters.push(`to_publication_date:${periodEnd}-12-31`);
  // Only apply OA filter at API level — language filter is too restrictive
  if (accessType === "open_access") filters.push("is_oa:true");
  if (accessType === "paid") filters.push("is_oa:false");

  const filterStr = filters.length ? `&filter=${encodeURIComponent(filters.join(","))}` : "";
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per_page=${Math.min(count, 25)}&sort=relevance_score:desc${filterStr}&mailto=${MAILTO}`;

  const data = await fetchJSON(url);
  if (!data?.results) return [];

  return data.results.map((w: any) => {
    const authors = w.authorships || [];
    const first = authors[0]?.author?.display_name || "";
    const parts = first.split(" ");
    const lastName = parts.slice(-1)[0] || "";
    const firstName = parts.slice(0, -1).join(" ") || "";
    const doi = w.doi ? w.doi.replace("https://doi.org/", "") : "";
    // Prefer free PDF URL if available
    const oaUrl = w.open_access?.oa_url || "";
    const landingUrl = w.primary_location?.landing_page_url || "";
    const resolvedUrl = oaUrl || (doi ? `https://doi.org/${doi}` : landingUrl || w.id || "");
    const journal = w.primary_location?.source?.display_name || w.host_venue?.display_name || "";
    const isOA = w.open_access?.is_oa || false;
    const lang = w.language || "";

    return {
      lastName,
      firstName,
      title: w.title || "",
      year: String(w.publication_year || ""),
      publisher: journal,
      platform: detectPlatform(resolvedUrl, journal, "openalex"),
      url: resolvedUrl,
      type: w.type || "article",
      doi,
      isOpenAccess: isOA,
      abstract: w.abstract_inverted_index ? rebuildAbstract(w.abstract_inverted_index) : "",
      // Boost French-language articles if user wants French
      relevanceScore: (language === "fr" && lang === "fr") ? 1.2 : 1.0,
    };
  }).filter((a: RealArticle) => a.title && a.url);
}

// ── PubMed ──
async function searchPubMed(
  query: string,
  count: number,
  periodStart: string,
  periodEnd: string,
): Promise<RealArticle[]> {
  const dateFilter = periodStart
    ? `&datetype=pdat&mindate=${periodStart}&maxdate=${periodEnd || new Date().getFullYear()}`
    : "";
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${Math.min(count, 20)}&retmode=json${dateFilter}`;
  const searchData = await fetchJSON(searchUrl);
  const ids: string[] = searchData?.esearchresult?.idlist || [];
  if (!ids.length) return [];

  const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
  const summaryData = await fetchJSON(summaryUrl);
  if (!summaryData?.result) return [];

  return ids.map((id: string) => {
    const r = summaryData.result[id];
    if (!r) return null;
    const authors = r.authors || [];
    const firstAuthor = authors[0]?.name || "";
    const [lastName, ...rest] = firstAuthor.split(" ");
    const isPMC = (r.articleids || []).some((aid: any) => aid.idtype === "pmc");
    return {
      lastName: lastName || "",
      firstName: rest.join(" ") || "",
      title: r.title || "",
      year: String((r.pubdate || "").split(" ")[0] || ""),
      publisher: r.fulljournalname || r.source || "",
      platform: "pubmed",
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      type: "article",
      doi: (r.elocationid || "").replace("doi: ", ""),
      isOpenAccess: isPMC,
    };
  }).filter(Boolean) as RealArticle[];
}

// ── HAL — French open archive (always OA) ──
async function searchHAL(
  query: string,
  count: number,
  periodStart: string,
  periodEnd: string,
): Promise<RealArticle[]> {
  const fq: string[] = [];
  if (periodStart) {
    fq.push(`producedDateY_i:[${periodStart} TO ${periodEnd || new Date().getFullYear()}]`);
  }
  const fqStr = fq.map(f => `&fq=${encodeURIComponent(f)}`).join("");
  const url = `https://api.archives-ouvertes.fr/search/?q=${encodeURIComponent(query)}&rows=${count}&fl=title_s,authFirstName_s,authLastName_s,producedDateY_i,journalTitle_s,uri_s,doiId_s&sort=score+desc${fqStr}`;
  const data = await fetchJSON(url);
  if (!data?.response?.docs) return [];

  return data.response.docs.map((doc: any) => {
    const doi = (doc.doiId_s || [])[0] || "";
    const uri = doc.uri_s || (doi ? `https://doi.org/${doi}` : "");
    return {
      lastName: (doc.authLastName_s || [])[0] || "",
      firstName: (doc.authFirstName_s || [])[0] || "",
      title: (doc.title_s || [])[0] || "",
      year: String(doc.producedDateY_i || ""),
      publisher: doc.journalTitle_s || "HAL",
      platform: "hal",
      url: uri,
      type: "article",
      doi,
      isOpenAccess: true,
    };
  }).filter((a: RealArticle) => a.title && a.url);
}

// ── Cairn — CrossRef filtered by Cairn-associated publishers ──
async function searchCairn(
  query: string,
  count: number,
  periodStart: string,
  periodEnd: string,
): Promise<RealArticle[]> {
  const filters: string[] = ["type:journal-article"];
  if (periodStart) filters.push(`from-pub-date:${periodStart}`);
  if (periodEnd) filters.push(`until-pub-date:${periodEnd}`);
  // Search CrossRef with the actual query — no publisher names appended
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${Math.min(count * 3, 40)}&sort=relevance&mailto=${MAILTO}&filter=${encodeURIComponent(filters.join(","))}`;
  const data = await fetchJSON(url);
  if (!data?.message?.items) return [];

  const results: RealArticle[] = [];
  for (const item of data.message.items) {
    const publisher = (item["container-title"] || [])[0] || item.publisher || "";
    const isCairn = CAIRN_PUBLISHERS_LOWER.some(cp =>
      publisher.toLowerCase().includes(cp) ||
      (item.publisher || "").toLowerCase().includes(cp)
    );
    if (!isCairn) continue;

    const authors = item.author || [];
    const first = authors[0] || {};
    const year = item.published?.["date-parts"]?.[0]?.[0]
      || item["published-print"]?.["date-parts"]?.[0]?.[0] || "";
    const doi = item.DOI || "";
    results.push({
      lastName: first.family || "",
      firstName: first.given || "",
      title: (item.title || [])[0] || "",
      year: String(year),
      publisher,
      platform: "cairn",
      url: doi ? `https://doi.org/${doi}` : (item.URL || ""),
      type: item.type || "article",
      doi,
      isOpenAccess: (item.license || []).some((l: any) => l.URL?.includes("creativecommons")),
    });
    if (results.length >= count) break;
  }
  return results;
}

// ── ScienceDirect — CrossRef member 78 (Elsevier) ──
async function searchScienceDirect(
  query: string,
  count: number,
  periodStart: string,
  periodEnd: string,
): Promise<RealArticle[]> {
  const filters: string[] = ["member:78", "type:journal-article"];
  if (periodStart) filters.push(`from-pub-date:${periodStart}`);
  if (periodEnd) filters.push(`until-pub-date:${periodEnd}`);
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${count}&sort=relevance&mailto=${MAILTO}&filter=${encodeURIComponent(filters.join(","))}`;
  const data = await fetchJSON(url);
  if (!data?.message?.items) return [];

  return data.message.items.map((item: any) => {
    const authors = item.author || [];
    const first = authors[0] || {};
    const year = item.published?.["date-parts"]?.[0]?.[0]
      || item["published-print"]?.["date-parts"]?.[0]?.[0] || "";
    const doi = item.DOI || "";
    return {
      lastName: first.family || "",
      firstName: first.given || "",
      title: (item.title || [])[0] || "",
      year: String(year),
      publisher: (item["container-title"] || [])[0] || item.publisher || "",
      platform: "sciencedirect",
      url: doi ? `https://doi.org/${doi}` : (item.URL || ""),
      type: item.type || "article",
      doi,
      isOpenAccess: (item.license || []).some((l: any) => l.URL?.includes("creativecommons")),
    };
  }).filter((a: RealArticle) => a.title && a.url);
}

function deduplicateByDoi(articles: RealArticle[]): RealArticle[] {
  const seenDoi = new Set<string>();
  const seenTitle = new Set<string>();
  return articles.filter(a => {
    const doiKey = a.doi?.toLowerCase().trim();
    const titleKey = a.title?.toLowerCase().trim().slice(0, 60);
    if (doiKey && seenDoi.has(doiKey)) return false;
    if (titleKey && seenTitle.has(titleKey)) return false;
    if (doiKey) seenDoi.add(doiKey);
    if (titleKey) seenTitle.add(titleKey);
    return true;
  });
}

export interface SearchOptions {
  query: string;
  platforms: string[];
  language: string;
  periodStart: string;
  periodEnd: string;
  articleCount: number;
  accessType: string;
  openAccessProportion: number;
}

export async function realSearch(opts: SearchOptions): Promise<RealArticle[]> {
  const { query, platforms, language, periodStart, periodEnd, articleCount, accessType, openAccessProportion } = opts;
  const perSource = Math.ceil(articleCount * 2);
  const tasks: Promise<RealArticle[]>[] = [];

  if (platforms.includes("google_scholar")) {
    tasks.push(searchOpenAlex(query, perSource, language, periodStart, periodEnd, accessType));
  }
  if (platforms.includes("pubmed")) {
    tasks.push(searchPubMed(query, Math.ceil(perSource / 2), periodStart, periodEnd));
  }
  if (platforms.includes("hal")) {
    tasks.push(searchHAL(query, Math.ceil(perSource / 2), periodStart, periodEnd));
  }
  if (platforms.includes("cairn")) {
    tasks.push(searchCairn(query, Math.ceil(perSource / 2), periodStart, periodEnd));
  }
  if (platforms.includes("sciencedirect")) {
    tasks.push(searchScienceDirect(query, Math.ceil(perSource / 2), periodStart, periodEnd));
  }
  if (tasks.length === 0) {
    tasks.push(searchOpenAlex(query, perSource, language, periodStart, periodEnd, accessType));
  }

  const settled = await Promise.allSettled(tasks);
  const all: RealArticle[] = [];
  for (const r of settled) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  let deduped = deduplicateByDoi(all);

  // Access type filter
  if (accessType === "open_access") {
    const oaOnly = deduped.filter(a => a.isOpenAccess || a.platform === "hal");
    deduped = oaOnly.length >= 3 ? oaOnly : deduped.filter(a => a.isOpenAccess);
  } else if (accessType === "paid") {
    deduped = deduped.filter(a => !a.isOpenAccess && a.platform !== "hal");
  } else if (accessType === "all" && openAccessProportion !== undefined) {
    const targetOA = Math.round((articleCount * openAccessProportion) / 100);
    const oa = deduped.filter(a => a.isOpenAccess || a.platform === "hal");
    const paid = deduped.filter(a => !a.isOpenAccess && a.platform !== "hal");
    deduped = [...oa.slice(0, targetOA), ...paid.slice(0, articleCount - targetOA)];
  }

  return deduped;
}
