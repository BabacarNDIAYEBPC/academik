import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, GraduationCap, Users, Clock, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "What is Chicago citation style?",
    a: "Chicago citation style (Chicago Manual of Style, 17th edition) is the standard for history, political science, economics, law, and parts of the humanities. It offers two systems: Notes & Bibliography (System A, used in history and humanities) and Author-Date (System B, used in social sciences)."
  },
  {
    q: "What is the difference between Chicago Notes & Bibliography and Author-Date?",
    a: "The Notes & Bibliography system (System A) uses numbered footnotes for in-text citations and an alphabetical bibliography at the end. This is the standard in history, law, and the arts. The Author-Date system (System B) uses parenthetical citations in the text (Smith 2020, 45) and a final reference list. It is used in social sciences."
  },
  {
    q: "How does Academik generate Chicago footnotes?",
    a: "Academik automatically generates Chicago 17th edition footnotes for your sources — both full first citations and abbreviated subsequent citations (Ibid., shortened form) — along with the final bibliography. You can choose between System A (notes) and System B (author-date)."
  },
  {
    q: "Is Chicago style used at UK and Australian universities?",
    a: "Yes. Chicago style (particularly Notes & Bibliography) is widely used at universities in the UK, Australia, Ireland and the USA for history, law, philosophy, and humanities papers. Turabian — an adaptation of Chicago for student papers — is also widely accepted. Academik generates both Chicago 17 and Turabian 9."
  },
  {
    q: "How do I cite an archival document in Chicago style?",
    a: "In Chicago System A (footnote style), cite an archival document as: Creator/Author, 'Title of Document,' date, call number, Collection Name, Repository Name, Location. Example: UK National Archives, 'Cabinet Minutes,' 10 Sept. 1939, CAB 65/1/1, Cabinet Papers, National Archives, Kew."
  },
  {
    q: "What is Turabian citation style?",
    a: "Turabian (A Manual for Writers of Research Papers, Theses, and Dissertations, 9th edition) is an adaptation of the Chicago Manual of Style specifically for student academic papers. It follows the same two-system structure (notes/bibliography and author-date) with minor modifications for theses and dissertations. Academik generates both Chicago 17 and Turabian 9 formats."
  }
];

const EXAMPLES_A = [
  { type: "Footnote (first citation)", ref: `1. Jane Smith, The French Revolution: A History (London: Penguin, 2019), 45.` },
  { type: "Footnote (subsequent)", ref: `2. Smith, French Revolution, 112.` },
  { type: "Bibliography entry", ref: `Smith, Jane. The French Revolution: A History. London: Penguin, 2019.` },
];

export default function ChicagoCitation() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Chicago Citation Generator — Notes & Author-Date | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Generate Chicago 17 citations automatically online. Footnotes (Notes & Bibliography) or author-date system. For history, law, political science, humanities dissertations.");
    setMeta('meta[property="og:title"]', "content", "Chicago Citation Generator — Notes & Author-Date | Academik");
    setMeta('meta[property="og:description"]', "content",
      "Free Chicago 17 citation generator. Footnotes or author-date format. History, law, social sciences. Turabian 9 also supported.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/en/chicago-citation";

    const hreflangs = [
      { lang: "en-US", href: "https://academik.fr/en/chicago-citation" },
      { lang: "en-GB", href: "https://academik.fr/en/chicago-citation" },
      { lang: "en-AU", href: "https://academik.fr/en/chicago-citation" },
      { lang: "en-IE", href: "https://academik.fr/en/chicago-citation" },
      { lang: "x-default", href: "https://academik.fr/en/chicago-citation" },
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
        "name": "Academik — Chicago Citation Generator",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "AI-powered tool to automatically generate Chicago 17 citations in Notes & Bibliography or Author-Date format.",
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
            <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground hidden sm:block" onClick={() => setLocation("/bibliographie-chicago")}>Français</span>
            <Button onClick={() => setLocation("/connexion")} size="sm" data-testid="button-nav-cta">
              Try for free <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-orange-50/60 to-background">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ Chicago 17th Edition · Notes & Author-Date</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Free{" "}
            <span className="text-primary">Chicago Citation</span>{" "}
            Generator Online
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Generate <strong>Chicago 17th edition</strong> footnotes and bibliographies in seconds.
            Our AI handles both systems: Notes & Bibliography (history, law) and Author-Date (social sciences), with support for Turabian 9.
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Used by students and researchers in history, law, political science, economics and humanities across the USA, UK, Australia, Ireland and Canada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Generate my Chicago citations <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/en/mla-citation")}>
              See also: MLA Citation Generator
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Chicago 17th edition</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Footnotes & Author-Date</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> From €4.99</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, val: "12,000+", label: "Students & researchers" },
            { icon: FileText, val: "85,000+", label: "Citations generated" },
            { icon: Star, val: "4.8/5", label: "Average rating" },
            { icon: Clock, val: "< 10 sec", label: "Generation time" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              <p className="text-2xl font-bold">{val}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Two systems */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Chicago: two systems, one standard</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            The Chicago Manual of Style offers two distinct systems depending on your discipline. Academik handles both.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">System A — Notes & Bibliography</p>
                    <p className="text-xs text-muted-foreground">History, law, arts, humanities</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Sources are cited in <strong>numbered footnotes</strong>. The final bibliography lists all sources alphabetically by author surname.
                </p>
                <div className="space-y-2">
                  {EXAMPLES_A.map(({ type, ref }) => (
                    <div key={type} className="bg-muted/40 rounded p-2">
                      <p className="text-xs font-semibold text-muted-foreground mb-0.5 uppercase">{type}</p>
                      <p className="text-xs font-mono leading-relaxed">{ref}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-muted">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-bold">System B — Author-Date</p>
                    <p className="text-xs text-muted-foreground">Social sciences, economics, politics</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Sources are cited in the text with <strong>parenthetical author-date</strong> format: (Smith 2020, 45). The final reference list is sorted alphabetically.
                </p>
                <div className="space-y-2">
                  <div className="bg-muted/40 rounded p-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-0.5 uppercase">In-text citation</p>
                    <p className="text-xs font-mono">(Smith 2020, 45)</p>
                  </div>
                  <div className="bg-muted/40 rounded p-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-0.5 uppercase">Reference list entry</p>
                    <p className="text-xs font-mono leading-relaxed">Smith, Jane. 2020. The French Revolution: A History. London: Penguin.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How to generate Chicago citations with AI</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">Academik automates Chicago 17 formatting in three simple steps.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: Search, title: "Describe your topic", desc: "Enter your research topic or source titles. The AI searches JSTOR, Google Scholar, ProQuest, archival databases and major humanities repositories." },
              { step: "2", icon: Zap, title: "AI formats in Chicago 17", desc: "Each source is formatted according to your chosen system (A or B): numbered footnotes or parenthetical references, with specific formats for archives, manuscripts, and primary sources." },
              { step: "3", icon: FileText, title: "Footnotes & bibliography ready", desc: "Your numbered footnotes and final bibliography are generated instantly, ready to paste into your word processor — Microsoft Word or Google Docs." },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                  <Icon className="w-6 h-6 text-primary" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">{step}</span>
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything Academik does for you</h2>
          <p className="text-center text-muted-foreground mb-12">A complete tool for all your citation needs in history and the humanities.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Footnotes & endnotes", desc: "Full first citation, shortened subsequent citations (Ibid., shortened form) in Chicago System A — both footnote and endnote formats." },
              { title: "Final bibliography", desc: "Alphabetical reference list in Chicago 17 format with correct punctuation, indentation, and em-dash for repeated authors." },
              { title: "Author-Date system", desc: "Parenthetical citations (Smith 2020, 45) and alphabetical reference list in Chicago System B for social sciences." },
              { title: "Archival & primary sources", desc: "Specific format for archival documents, manuscripts, correspondence, unpublished sources, and special collections." },
              { title: "Digital & online sources", desc: "Websites, databases, e-books, online PDFs — all formatted per Chicago 17 with URL and access date." },
              { title: "Turabian 9th edition", desc: "Chicago adaptation for student papers: Academik also generates Turabian 9 format, widely used for dissertations and theses." },
              { title: "Article search", desc: "Academik searches articles on JSTOR, Google Scholar, ProQuest, and formats them directly in Chicago 17." },
              { title: "Literature review", desc: "Synthesis and comparison of sources found to support your theoretical framework and historical argumentation." },
              { title: "Multi-format included", desc: "Besides Chicago, Academik also generates APA 7, Vancouver and MLA 9 — your choice on the same search." },
            ].map(({ title, desc }) => (
              <Card key={title} className="border hover:shadow-md transition-shadow">
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

      {/* Who */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Who is Academik for?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Landmark,
                title: "History & political science students",
                desc: "BA, MA, PhD in history, international relations, political science, geography: Chicago System A (footnotes) is the standard. Generate your footnotes and bibliography in seconds.",
                tags: ["History dissertation", "MA thesis", "PhD", "International relations"]
              },
              {
                icon: GraduationCap,
                title: "Law & economics students",
                desc: "Law, economics, management: Chicago System A or B depending on your department. Academik generates both for Master's dissertations and doctoral theses.",
                tags: ["Law dissertation", "Economics MA", "Doctoral thesis", "Business school"]
              },
              {
                icon: Users,
                title: "Researchers & academics",
                desc: "Prepare your articles for history and social science journals (AHR, JMH, APSR) with a Chicago bibliography compliant with publisher requirements.",
                tags: ["Journal article", "Monograph", "Book chapter", "Conference paper"]
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

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <Card key={q} className="border">
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
      <section className="py-20 px-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to generate your Chicago citations?</h2>
          <p className="text-orange-100 mb-8 text-lg">
            Join 12,000+ students and researchers who use Academik for their academic work.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Get started — from €4.99 <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-orange-200 text-sm mt-4">No subscription · Secure payment · Instant results</p>
        </div>
      </section>

      {/* Partner banner */}
      <div className="py-5 px-4 bg-amber-50 border-y border-amber-100 text-center text-sm">
        <p className="text-muted-foreground">
          Need expert help <strong>writing your dissertation or thesis</strong>?{" "}
          <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="text-primary font-semibold underline underline-offset-2 hover:opacity-80">
            Rédacteur Mémoire
          </a>{" "}
          — personalised academic writing support from expert tutors (French-speaking).
        </p>
      </div>

      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-semibold">Academik</span>
            <span>— Chicago Citation Generator</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/en/apa-citation-generator")}>APA Generator</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/en/mla-citation")}>MLA Generator</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>Sign in</span>
            <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="hover:text-foreground">Rédacteur Mémoire</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
