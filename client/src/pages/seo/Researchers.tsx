import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Star, Users, Clock, Microscope, Globe, BarChart3, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "Is Academik useful for experienced researchers?",
    a: "Yes. Academik is designed for both postgraduate students and experienced researchers and academics. Simultaneous multi-database searching (Scopus, WoS, PubMed, JSTOR, Cochrane) and the generation of advanced Boolean equations with MeSH terms are particularly useful for literature searches and article preparation."
  },
  {
    q: "Can Academik help me write a systematic review?",
    a: "Yes. Academik generates Boolean search equations for PubMed, Scopus, Web of Science and Cochrane (including MeSH terms), in line with PRISMA recommendations. It also provides a structured synthesis of results to feed into your systematic review or meta-analysis."
  },
  {
    q: "Does Academik format bibliographies to journal standards?",
    a: "Academik generates bibliographies in APA 7, Vancouver (ICMJE), MLA 9 and Chicago 17. These four formats cover the vast majority of international scientific journals. For specific journal requirements (Nature, Lancet, PLOS ONE), check the journal's author guidelines and adapt if necessary."
  },
  {
    q: "How is Academik different from Zotero or Mendeley?",
    a: "Zotero and Mendeley are reference management tools: they store and format your sources. Academik is an AI research assistant: it searches for sources, analyses them, compares them and generates a written synthesis. The two tools are complementary — Academik to discover and analyse, Zotero to manage."
  },
  {
    q: "Can Academik help with ongoing literature monitoring?",
    a: "Yes. By saving your searches, you can return regularly to a topic to identify recent publications. Academik returns publications from the last 5 years by default and allows filtering from 2020 or any other reference year of your choice."
  },
  {
    q: "Is Academik suited for humanities and social science researchers?",
    a: "Absolutely. Academik searches JSTOR, Google Scholar, HAL and Cairn (the reference database for French-speaking humanities), which are the main databases for humanities and social sciences. It generates Chicago 17 (System A for footnotes) and MLA 9, the standard formats in these disciplines."
  }
];

export default function Researchers() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "AI Literature Search Tool for Researchers — Systematic Review & Bibliography | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Academik helps researchers and academics with literature searches, systematic reviews, PRISMA Boolean equations and formatted bibliographies in APA, Vancouver, MLA or Chicago.");
    setMeta('meta[property="og:title"]', "content", "AI Research Tool for Academics — Systematic Review & Bibliography | Academik");
    setMeta('meta[property="og:description"]', "content",
      "Literature searches, systematic reviews and formatted bibliographies for researchers. Academik searches Scopus, PubMed, WoS, JSTOR simultaneously.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/en/researchers";

    const hreflangs = [
      { lang: "en-US", href: "https://academik.fr/en/researchers" },
      { lang: "en-GB", href: "https://academik.fr/en/researchers" },
      { lang: "en-AU", href: "https://academik.fr/en/researchers" },
      { lang: "en-IE", href: "https://academik.fr/en/researchers" },
      { lang: "x-default", href: "https://academik.fr/en/researchers" },
    ];
    hreflangs.forEach(({ lang, href }) => {
      const existing = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
      if (existing) { existing.setAttribute("href", href); return; }
      const link = document.createElement("link");
      link.rel = "alternate"; link.setAttribute("hreflang", lang); link.href = href;
      document.head.appendChild(link);
    });

    const existing = document.getElementById("schema-seo-page");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "schema-seo-page";
    script.type = "application/ld+json";
    script.text = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Academik — AI Literature Search for Researchers",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "AI tool for researchers: literature searches, systematic reviews, Boolean search equations, bibliographies in APA/Vancouver/MLA/Chicago.",
        "offers": { "@type": "Offer", "price": "4.99", "priceCurrency": "EUR" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "127" },
        "inLanguage": "en"
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
      }
    ]);
    document.head.appendChild(script);
    document.documentElement.lang = "en";
    return () => { script.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">Academik</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground hidden sm:block" onClick={() => setLocation("/chercheur")}>Français</span>
            <Button onClick={() => setLocation("/connexion")} size="sm" data-testid="button-nav-cta">
              Try for free <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-emerald-50/60 to-background">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ PhD · Post-doc · Academic · Research Institute</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            AI{" "}
            <span className="text-primary">literature search tool</span>{" "}
            for researchers
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Academik accelerates your literature searches, <strong>systematic reviews</strong> and <strong>scientific article</strong> preparation. Simultaneous searching of Scopus, PubMed, Web of Science, JSTOR and Cochrane — with PRISMA-compliant Boolean equation generation.
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Designed for researchers, PhD candidates, post-docs and academics across all disciplines in the UK, USA, Australia, Ireland and Canada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Start my literature search <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/en/literature-review")}>
              See: AI Literature Review
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Multi-database simultaneous</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> PRISMA equations</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> From €4.99</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, val: "12,000+", label: "Academic users" },
            { icon: FileText, val: "40,000+", label: "Syntheses generated" },
            { icon: Star, val: "4.8/5", label: "Average rating" },
            { icon: Clock, val: "< 2 min", label: "Per search" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              <p className="text-2xl font-bold">{val}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">For what type of research?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Microscope,
                title: "Systematic review & meta-analysis",
                desc: "Generate Boolean search equations for PubMed, Scopus, Cochrane and Web of Science with MeSH terms. Structured synthesis of studies for your PRISMA protocol.",
                tags: ["PRISMA 2020", "Meta-analysis", "Cochrane review", "Scoping review"]
              },
              {
                icon: Globe,
                title: "Research article & conference paper",
                desc: "Prepare the state of the art for your research article. Academik identifies key publications, reference authors and current debates in your field.",
                tags: ["Original article", "Review article", "Letter", "Conference paper"]
              },
              {
                icon: BookMarked,
                title: "PhD thesis & academic report",
                desc: "Structure your literature review, identify gaps in existing literature and generate your complete bibliography in the format required by your thesis committee.",
                tags: ["PhD thesis", "Post-doc", "Research report", "Grant application"]
              }
            ].map(({ icon: Icon, title, desc, tags }) => (
              <Card key={title} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map(t => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Advanced features for researchers</h2>
          <p className="text-center text-muted-foreground mb-12">A tool built for the rigorous demands of professional academic research.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Multi-database search", desc: "Scopus, Web of Science, PubMed, HAL, JSTOR, ScienceDirect, Cochrane — all major databases searched simultaneously." },
              { title: "Boolean search equations", desc: "Complex Boolean equations with MeSH terms for PubMed, Scopus syntax, WoS and Cochrane field codes." },
              { title: "PRISMA compliance", desc: "Search structure aligned with PRISMA 2020 recommendations for systematic reviews and meta-analyses." },
              { title: "Multi-format bibliography", desc: "APA 7, Vancouver ICMJE, Chicago 17 (A and B), MLA 9 — the four major standards used by scientific journals." },
              { title: "Bibliographic comparison", desc: "Thematic mapping, author confrontation, identification of convergences and divergences in the literature." },
              { title: "Written synthesis", desc: "Literature synthesis in English, structured by themes, ready to integrate into your Introduction or Discussion section." },
              { title: "Reading notes", desc: "Structured analysis (abstract, methodology, results, bias, limitations) from your article PDFs for critical appraisal." },
              { title: "Topic monitoring", desc: "Save your searches and return regularly to identify new publications on your research topics." },
              { title: "Expert filters", desc: "Filter by date, language, article type (RCT, cohort, review, meta-analysis), impact factor and database." },
            ].map(({ title, desc }) => (
              <Card key={title} className="border hover:shadow-md transition-shadow bg-white">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm mb-1">{title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Academik vs existing tools</h2>
          <p className="text-center text-muted-foreground mb-10">Why Academik complements your existing research tools.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 pr-4 font-semibold">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold text-primary">Academik</th>
                  <th className="text-center py-3 px-4 font-semibold">Zotero / Mendeley</th>
                  <th className="text-center py-3 px-4 font-semibold">Google Scholar</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Simultaneous multi-database search", true, false, false],
                  ["Advanced Boolean equations (MeSH)", true, false, false],
                  ["Written thematic synthesis", true, false, false],
                  ["Bibliographic comparison", true, false, false],
                  ["Automatic bibliography generation", true, true, false],
                  ["Personal reference library", false, true, false],
                  ["PDF import and metadata", false, true, false],
                  ["Full-text access", false, false, "partial"],
                ].map(([feat, acad, zot, gs]) => (
                  <tr key={String(feat)} className="border-b hover:bg-muted/20">
                    <td className="py-3 pr-4">{feat}</td>
                    <td className="text-center px-4">{acad === true ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="text-center px-4">{zot === true ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="text-center px-4">{gs === true ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : gs === "partial" ? <span className="text-xs text-muted-foreground">partial</span> : <span className="text-muted-foreground">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <Card key={q} className="border bg-white">
                <CardContent className="pt-5 pb-4">
                  <h3 className="font-semibold mb-2">{q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to accelerate your literature search?</h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Join researchers and academics who use Academik to save time on their scientific documentation.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Get started — from €4.99 <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-emerald-200 text-sm mt-4">No subscription · Secure payment · Results in under 2 minutes</p>
        </div>
      </section>

      {/* Partner banner */}
      <div className="py-5 px-4 bg-amber-50 border-y border-amber-100 text-center text-sm">
        <p className="text-muted-foreground">
          Need support for <strong>your students writing dissertations or theses</strong>?{" "}
          <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="text-primary font-semibold underline underline-offset-2 hover:opacity-80">
            Rédacteur Mémoire
          </a>{" "}
          — personalised academic coaching and proofreading by expert tutors (French-speaking).
        </p>
      </div>

      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-semibold">Academik</span>
            <span>— AI Literature Search for Researchers</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/en/literature-review")}>Literature Review</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/en/apa-citation-generator")}>APA Generator</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>Sign in</span>
            <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="hover:text-foreground">Rédacteur Mémoire</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
