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

async function fetchJSON(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { "User-Agent": `Academik/1.0 (mailto:${MAILTO})` },
  });
  if (!res.ok) return null;
  return res.json();
}

// OpenAlex — comprehensive open academic index
async function searchOpenAlex(
  query: string,
  count: number,
  language: string,
  periodStart: string,
  periodEnd: string,
  accessType: string
): Promise<RealArticle[]> {
  const filters: string[] = [];
  if (periodStart) filters.push(`from_publication_date:${periodStart}-01-01`);
  if (periodEnd) filters.push(`to_publication_date:${periodEnd}-12-31`);
  if (language === "fr") filters.push("language:fr");
  else if (language === "en") filters.push("language:en");
  if (accessType === "open_access") filters.push("is_oa:true");

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
    const resolvedUrl = doi ? `https://doi.org/${doi}` : (w.primary_location?.landing_page_url || w.id || "");
    const journal = w.primary_location?.source?.display_name || w.host_venue?.display_name || "";
    const isOA = w.open_access?.is_oa || false;

    return {
      lastName,
      firstName,
      title: w.title || "",
      year: String(w.publication_year || ""),
      publisher: journal,
      platform: "openalex",
      url: resolvedUrl,
      type: w.type || "article",
      doi,
      isOpenAccess: isOA,
      abstract: w.abstract_inverted_index ? rebuildAbstract(w.abstract_inverted_index) : "",
    };
  }).filter((a: RealArticle) => a.title && a.url);
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

// PubMed — biomedical literature
async function searchPubMed(
  query: string,
  count: number,
  periodStart: string,
  periodEnd: string
): Promise<RealArticle[]> {
  const dateFilter = periodStart ? `&datetype=pdat&mindate=${periodStart}&maxdate=${periodEnd || new Date().getFullYear()}` : "";
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${count}&retmode=json${dateFilter}`;
  const searchData = await fetchJSON(searchUrl);
  const ids: string[] = searchData?.esearchresult?.idlist || [];
  if (!ids.length) return [];

  const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.slice(0, 20).join(",")}&retmode=json`;
  const summaryData = await fetchJSON(summaryUrl);
  if (!summaryData?.result) return [];

  return ids
    .map((id: string) => {
      const r = summaryData.result[id];
      if (!r) return null;
      const authors = r.authors || [];
      const firstAuthor = authors[0]?.name || "";
      const nameParts = firstAuthor.split(" ");
      const lastName = nameParts[0] || "";
      const firstName = nameParts.slice(1).join(" ") || "";
      return {
        lastName,
        firstName,
        title: r.title || "",
        year: String((r.pubdate || "").split(" ")[0] || ""),
        publisher: r.fulljournalname || r.source || "",
        platform: "pubmed",
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        type: "article",
        doi: (r.elocationid || "").replace("doi: ", ""),
        isOpenAccess: false,
      };
    })
    .filter(Boolean) as RealArticle[];
}

// HAL — French open archive
async function searchHAL(
  query: string,
  count: number,
  language: string,
  periodStart: string,
  periodEnd: string
): Promise<RealArticle[]> {
  const filters: string[] = [];
  if (language === "fr") filters.push("language_s:fr");
  if (periodStart) filters.push(`producedDateY_i:[${periodStart} TO ${periodEnd || new Date().getFullYear()}]`);
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
      isOpenAccess: doc.openAccess_bool || false,
    };
  }).filter((a: RealArticle) => a.title && a.url);
}

// CrossRef — DOI-based, broad coverage
async function searchCrossRef(
  query: string,
  count: number,
  periodStart: string,
  periodEnd: string
): Promise<RealArticle[]> {
  const filters: string[] = [];
  if (periodStart) filters.push(`from-pub-date:${periodStart}`);
  if (periodEnd) filters.push(`until-pub-date:${periodEnd}`);
  const filterStr = filters.length ? `&filter=${encodeURIComponent(filters.join(","))}` : "";
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=${count}&sort=relevance&mailto=${MAILTO}${filterStr}`;
  const data = await fetchJSON(url);
  if (!data?.message?.items) return [];

  return data.message.items.map((item: any) => {
    const authors = item.author || [];
    const first = authors[0] || {};
    const year = item.published?.["date-parts"]?.[0]?.[0] || item["published-print"]?.["date-parts"]?.[0]?.[0] || "";
    const doi = item.DOI || "";
    return {
      lastName: first.family || "",
      firstName: first.given || "",
      title: (item.title || [])[0] || "",
      year: String(year),
      publisher: (item["container-title"] || [])[0] || item.publisher || "",
      platform: "crossref",
      url: doi ? `https://doi.org/${doi}` : (item.URL || ""),
      type: item.type || "article",
      doi,
      isOpenAccess: false,
    };
  }).filter((a: RealArticle) => a.title && a.url);
}

function deduplicateByDoi(articles: RealArticle[]): RealArticle[] {
  const seen = new Set<string>();
  const seenTitles = new Set<string>();
  return articles.filter(a => {
    const doiKey = a.doi?.toLowerCase().trim();
    const titleKey = a.title?.toLowerCase().trim().slice(0, 60);
    if (doiKey && seen.has(doiKey)) return false;
    if (titleKey && seenTitles.has(titleKey)) return false;
    if (doiKey) seen.add(doiKey);
    if (titleKey) seenTitles.add(titleKey);
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
    articleCount, accessType, openAccessProportion
  } = opts;

  const tasks: Promise<RealArticle[]>[] = [];
  const perSource = Math.ceil(articleCount * 1.5);

  const usePubMed = platforms.includes("pubmed");
  const useHAL = platforms.includes("hal");
  const useCrossRef = platforms.includes("sciencedirect") || platforms.includes("cairn");

  // OpenAlex covers Google Scholar, ScienceDirect, Cairn indirectly
  tasks.push(searchOpenAlex(query, perSource, language, periodStart, periodEnd, accessType));

  if (usePubMed) {
    tasks.push(searchPubMed(query, Math.ceil(perSource / 2), periodStart, periodEnd));
  }
  if (useHAL) {
    tasks.push(searchHAL(query, Math.ceil(perSource / 2), language, periodStart, periodEnd));
  }
  if (useCrossRef) {
    tasks.push(searchCrossRef(query, Math.ceil(perSource / 2), periodStart, periodEnd));
  }

  const results = await Promise.allSettled(tasks);
  const all: RealArticle[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  let deduped = deduplicateByDoi(all);

  // Apply access type filter
  if (accessType === "open_access") {
    deduped = deduped.filter(a => a.isOpenAccess);
    if (deduped.length < 3) {
      // Relax filter — open access info may be missing
      deduped = all.filter(a => a.platform === "hal" || a.isOpenAccess);
    }
  } else if (accessType === "paid") {
    deduped = deduped.filter(a => !a.isOpenAccess);
  } else if (accessType === "all" && openAccessProportion !== undefined) {
    const targetOA = Math.round((articleCount * openAccessProportion) / 100);
    const oa = deduped.filter(a => a.isOpenAccess);
    const paid = deduped.filter(a => !a.isOpenAccess);
    deduped = [...oa.slice(0, targetOA), ...paid.slice(0, articleCount - targetOA)];
  }

  return deduped.slice(0, articleCount);
}
