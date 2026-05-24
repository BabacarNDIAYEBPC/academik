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
}

const MAILTO = "contact@bpc-ai.com";

// Publishers known to be distributed via Cairn.info
const CAIRN_PUBLISHERS = [
  "Cairn", "PUF", "Presses Universitaires de France", "De Boeck",
  "Armand Colin", "ERES", "La Découverte", "Lavoisier", "Médecine & Hygiène",
  "Belin", "L'Harmattan", "Érès", "Dalloz", "Dunod",
];

async function fetchJSON(url: string): Promise<any> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": `Academik/1.0 (mailto:${MAILTO})` },
      signal: AbortSignal.timeout(10000),
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
    for (const pos of positions as number[]) {
      words[pos] = word;
    }
  }
  return words.join(" ").slice(0, 500);
}

// Detect real platform from URL/publisher for display
function detectPlatform(url: string, publisher: string, defaultPlatform: string): string {
  const u = (url || "").toLowerCase();
  const p = (publisher || "").toLowerCase();
  if (u.includes("cairn.info")) return "cairn";
  if (u.includes("sciencedirect.com") || u.includes("elsevier.com") || p.includes("elsevier")) return "sciencedirect";
  if (u.includes("pubmed.ncbi") || u.includes("ncbi.nlm.nih")) return "pubmed";
  if (u.includes("hal.") || u.includes("archives-ouvertes")) return "hal";
  if (u.includes("scholar.google")) return "google_scholar";
  if (u.includes("springer") || p.includes("springer")) return "sciencedirect";
  if (CAIRN_PUBLISHERS.some(cp => p.includes(cp.toLowerCase()))) return "cairn";
  return defaultPlatform;
}

// ── GOOGLE SCHOLAR / OpenAlex (primary broad index) ──
async function searchOpenAlex(
  query: string,
  count: number,
  language: string,
  periodStart: string,
  periodEnd: string,
  accessType: string,
  publisherFilter?: string,
): Promise<RealArticle[]> {
  const filters: string[] = [];
  if (periodStart) filters.push(`from_publication_date:${periodStart}-01-01`);
  if (periodEnd) filters.push(`to_publication_date:${periodEnd}-12-31`);
  if (language === "fr") filters.push("language:fr");
  else if (language === "en") filters.push("language:en");
  if (accessType === "open_access") filters.push("is_oa:true");
  if (accessType === "paid") filters.push("is_oa:false");
  if (publisherFilter) filters.push(`locations.source.host_organization.display_name.search:${publisherFilter}`);

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
    const landingUrl = w.primary_location?.landing_page_url || "";
    const oaUrl = w.open_access?.oa_url || "";
    const resolvedUrl = oaUrl || (doi ? `https://doi.org/${doi}` : landingUrl || w.id || "");
    const journal = w.primary_location?.source?.display_name || w.host_venue?.display_name || "";
    const isOA = w.open_access?.is_oa || false;

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
    };
  }).filter((a: RealArticle) => a.title && a.url);
}

// ── PUBMED ──
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
    // PubMed articles in PMC are open access
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

// ── HAL — French open archive (always open access) ──
async function searchHAL(
  query: string,
  count: number,
  language: string,
  periodStart: string,
  periodEnd: string,
): Promise<RealArticle[]> {
  const filters: string[] = [];
  if (language === "fr") filters.push("language_s:fr");
  if (periodStart) {
    const end = periodEnd || String(new Date().getFullYear());
    filters.push(`producedDateY_i:[${periodStart} TO ${end}]`);
  }
  const fqStr = filters.map(f => `&fq=${encodeURIComponent(f)}`).join("");
  const url = `https://api.archives-ouvertes.fr/search/?q=${encodeURIComponent(query)}&rows=${count}&fl=title_s,authFirstName_s,authLastName_s,producedDateY_i,journalTitle_s,uri_s,doiId_s,openAccess_bool&sort=score+desc${fqStr}`;
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
      isOpenAccess: true, // HAL is always open access by definition
    };
  }).filter((a: RealArticle) => a.title && a.url);
}

// ── CAIRN — CrossRef filtered to French/Belgian publishers ──
async function searchCairn(
  query: string,
  count: number,
  periodStart: string,
  periodEnd: string,
): Promise<RealArticle[]> {
  // Search CrossRef with Cairn-associated publishers
  const cairnQuery = `${query} ${CAIRN_PUBLISHERS.slice(0, 4).join(" OR ")}`;
  const filters: string[] = ["type:journal-article"];
  if (periodStart) filters.push(`from-pub-date:${periodStart}`);
  if (periodEnd) filters.push(`until-pub-date:${periodEnd}`);
  const filterStr = `&filter=${encodeURIComponent(filters.join(","))}`;
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(cairnQuery)}&rows=${count}&sort=relevance&mailto=${MAILTO}${filterStr}`;
  const data = await fetchJSON(url);
  if (!data?.message?.items) return [];

  return data.message.items
    .map((item: any) => {
      const authors = item.author || [];
      const first = authors[0] || {};
      const year = item.published?.["date-parts"]?.[0]?.[0]
        || item["published-print"]?.["date-parts"]?.[0]?.[0] || "";
      const doi = item.DOI || "";
      const publisher = (item["container-title"] || [])[0] || item.publisher || "";
      const isCairnRelated = CAIRN_PUBLISHERS.some(cp =>
        publisher.toLowerCase().includes(cp.toLowerCase()) ||
        (item.publisher || "").toLowerCase().includes(cp.toLowerCase())
      );
      if (!isCairnRelated) return null;
      return {
        lastName: first.family || "",
        firstName: first.given || "",
        title: (item.title || [])[0] || "",
        year: String(year),
        publisher,
        platform: "cairn",
        url: doi ? `https://doi.org/${doi}` : (item.URL || ""),
        type: item.type || "article",
        doi,
        isOpenAccess: false, // Cairn is mostly paywalled
      };
    })
    .filter(Boolean) as RealArticle[];
}

// ── SCIENCEDIRECT — CrossRef filtered to Elsevier ──
async function searchScienceDirect(
  query: string,
  count: number,
  periodStart: string,
  periodEnd: string,
): Promise<RealArticle[]> {
  const filters: string[] = ["member:78", "type:journal-article"]; // CrossRef member 78 = Elsevier
  if (periodStart) filters.push(`from-pub-date:${periodStart}`);
  if (periodEnd) filters.push(`until-pub-date:${periodEnd}`);
  const filterStr = `&filter=${encodeURIComponent(filters.join(","))}`;
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${count}&sort=relevance&mailto=${MAILTO}${filterStr}`;
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
      isOpenAccess: item["is-referenced-by-count"] !== undefined
        ? (item.license || []).some((l: any) => l.URL?.includes("creativecommons"))
        : false,
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
  const {
    query, platforms, language, periodStart, periodEnd,
    articleCount, accessType, openAccessProportion,
  } = opts;

  const perSource = Math.ceil(articleCount * 1.5);
  const tasks: Promise<RealArticle[]>[] = [];

  // Always include OpenAlex (covers Google Scholar broadly)
  if (platforms.includes("google_scholar") || platforms.length === 0) {
    tasks.push(searchOpenAlex(query, perSource, language, periodStart, periodEnd, accessType));
  }

  // PubMed
  if (platforms.includes("pubmed")) {
    tasks.push(searchPubMed(query, Math.ceil(perSource / 2), periodStart, periodEnd));
  }

  // HAL — French open archive
  if (platforms.includes("hal")) {
    tasks.push(searchHAL(query, Math.ceil(perSource / 2), language, periodStart, periodEnd));
  }

  // Cairn — French/Belgian humanities & social sciences
  if (platforms.includes("cairn")) {
    tasks.push(searchCairn(query, Math.ceil(perSource / 2), periodStart, periodEnd));
  }

  // ScienceDirect — Elsevier journals
  if (platforms.includes("sciencedirect")) {
    tasks.push(searchScienceDirect(query, Math.ceil(perSource / 2), periodStart, periodEnd));
  }

  // Fallback: if none of the above, use OpenAlex broadly
  if (tasks.length === 0) {
    tasks.push(searchOpenAlex(query, perSource, language, periodStart, periodEnd, accessType));
  }

  const results = await Promise.allSettled(tasks);
  const all: RealArticle[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  let deduped = deduplicateByDoi(all);

  // Apply access type filter
  if (accessType === "open_access") {
    // HAL is always open, OpenAlex OA flag is reliable
    const oaOnly = deduped.filter(a => a.isOpenAccess || a.platform === "hal");
    deduped = oaOnly.length >= 3 ? oaOnly : deduped.filter(a => a.isOpenAccess);
  } else if (accessType === "paid") {
    // Keep articles that are NOT open access (subscription required)
    // Note: HAL is excluded since it's always free
    deduped = deduped.filter(a => !a.isOpenAccess && a.platform !== "hal");
  } else if (accessType === "all" && openAccessProportion !== undefined) {
    const targetOA = Math.round((articleCount * openAccessProportion) / 100);
    const oa = deduped.filter(a => a.isOpenAccess || a.platform === "hal");
    const paid = deduped.filter(a => !a.isOpenAccess && a.platform !== "hal");
    deduped = [...oa.slice(0, targetOA), ...paid.slice(0, articleCount - targetOA)];
  }

  return deduped.slice(0, articleCount);
}
