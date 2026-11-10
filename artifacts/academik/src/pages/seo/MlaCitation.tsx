import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, GraduationCap, Users, Clock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "What is MLA citation style?",
    a: "MLA (Modern Language Association) citation style is the standard for literature, languages, linguistics, cultural studies, and humanities. Its 9th edition (2021) is the current version, widely used at universities in the USA, UK, Canada, Australia, and Ireland for papers in the arts and humanities."
  },
  {
    q: "What is the difference between MLA 8 and MLA 9?",
    a: "MLA 9th edition (2021) is the current standard. Compared to MLA 8, it provides clearer guidance on digital sources, clarifies URL and DOI use, and introduces minor changes to titles and medium notation. Academik generates citations that comply with MLA 9."
  },
  {
    q: "How does MLA in-text citation work?",
    a: "In MLA, in-text citations include the author's last name and the page number in parentheses: (Smith 45). If the author's name appears in the sentence, only the page number is given: (45). For sources without page numbers (websites), use paragraph numbers or omit. The final bibliography is called 'Works Cited' and is listed alphabetically by author surname."
  },
  {
    q: "How do I cite a website in MLA 9?",
    a: "In MLA 9, a website citation includes: Last, First. 'Title of Page.' Name of Site, date of publication, URL. Accessed date. For example: Smith, Jane. 'The Evolution of the English Novel.' British Library, 15 Mar. 2023, www.bl.uk/article/xxx. Accessed 22 May 2026."
  },
  {
    q: "Does Academik generate a full Works Cited page?",
    a: "Yes. Academik searches your sources in Google Scholar, PubMed, JSTOR, and other databases, then automatically generates a complete Works Cited page in MLA 9 format with all required elements: authors, title, container, other contributors, version, number, publisher, date, and location (DOI or URL)."
  },
  {
    q: "Does Academik work for UK, Australian and US universities?",
    a: "Yes. Academik is used by students and researchers at universities across the USA, UK, Australia, Ireland, Canada and beyond. MLA 9 formatting follows the official MLA Handbook standards accepted at all universities that require MLA referencing."
  }
];

const EXAMPLES = [
  { type: "Journal article", ref: `Smith, Jane, and Robert Jones. "Postcolonial Narratives in Contemporary British Fiction." PMLA, vol. 138, no. 2, 2023, pp. 312-28. doi:10.1632/pmla.2023.138.2.312.` },
  { type: "Book", ref: `Woolf, Virginia. A Room of One's Own. Harcourt, 1929.` },
  { type: "Chapter in edited book", ref: `Butler, Judith. "Performative Acts and Gender Constitution." Performing Feminisms, edited by Sue-Ellen Case, Johns Hopkins UP, 1990, pp. 270-82.` },
];

export default function MlaCitation() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "MLA Citation Generator — Free MLA 9 Works Cited Online | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Generate MLA 9 citations and Works Cited pages automatically online. Author-page format, literature, humanities, languages. For dissertations, essays and research papers.");
    setMeta('meta[property="og:title"]', "content", "MLA Citation Generator — MLA 9 Works Cited | Academik");
    setMeta('meta[property="og:description"]', "content",
      "Free MLA 9 citation generator. Complete Works Cited in seconds. Google Scholar, JSTOR, PubMed. For literature, humanities, languages.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/en/mla-citation";

    const hreflangs = [
      { lang: "en-US", href: "https://academik.fr/en/mla-citation" },
      { lang: "en-GB", href: "https://academik.fr/en/mla-citation" },
      { lang: "en-AU", href: "https://academik.fr/en/mla-citation" },
      { lang: "en-IE", href: "https://academik.fr/en/mla-citation" },
      { lang: "x-default", href: "https://academik.fr/en/mla-citation" },
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
        "name": "Academik — MLA Citation Generator",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "AI-powered tool to automatically generate MLA 9 citations and Works Cited pages for literature and humanities papers.",
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
            <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground hidden sm:block" onClick={() => setLocation("/bibliographie-mla")}>Français</span>
            <Button onClick={() => setLocation("/connexion")} size="sm" data-testid="button-nav-cta">
              Try for free <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-violet-50/60 to-background">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ MLA 9th Edition · Modern Language Association</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Free{" "}
            <span className="text-primary">MLA Citation</span>{" "}
            Generator Online
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Generate a complete <strong>Works Cited</strong> page in MLA 9 format in seconds.
            Our AI searches Google Scholar, JSTOR, PubMed and other databases and automatically formats your references with author-page citations and container structure.
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Used by students and researchers in literature, languages, humanities and cultural studies across the USA, UK, Australia, Ireland and Canada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Generate my Works Cited <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/en/apa-citation-generator")}>
              See also: APA Citation Generator
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> MLA 9th edition</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Full Works Cited</span>
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

      {/* What is MLA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-4">What is MLA 9 citation style?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                <strong>MLA style</strong> (Modern Language Association) is the standard citation system for literature, languages, linguistics, and humanities. Its 9th edition (2021) is the current version, required by most US, UK, Australian and Canadian universities for essays and papers in the arts and humanities.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                MLA uses an <strong>author-page</strong> system in the text (Smith 45) and a final list called <strong>Works Cited</strong>, organised alphabetically by author surname. Each reference follows a "container" structure that adapts to all source types — from journal articles to social media posts.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Academik automatically generates your MLA 9 Works Cited for all source types — articles, books, chapters, websites — in seconds.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">MLA 9 reference examples</p>
              {EXAMPLES.map(({ type, ref }) => (
                <Card key={type} className="border-l-4 border-primary border-t-0 border-b-0 border-r-0 rounded-l-none bg-muted/30">
                  <CardContent className="py-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">{type}</p>
                    <p className="text-xs font-mono leading-relaxed">{ref}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How to generate MLA citations with AI</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Academik automates MLA 9 formatting in three simple steps.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: Search, title: "Describe your topic", desc: "Enter your research topic or the titles of your sources. The AI searches Google Scholar, JSTOR, Project MUSE, PubMed and MLA International Bibliography." },
              { step: "2", icon: Zap, title: "AI formats in MLA 9", desc: "Each source is structured following MLA 9 container structure: authors, title, container, other contributors, version, number, publisher, date, location." },
              { step: "3", icon: FileText, title: "Works Cited ready to paste", desc: "Your alphabetical Works Cited page is generated instantly, with proper hanging indent formatting, ready to paste into your essay or paper." },
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
          <p className="text-center text-muted-foreground mb-12">A complete tool for all your citation needs in literature and the humanities.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Alphabetical Works Cited", desc: "Reference list sorted alphabetically by author surname, with proper hanging indent (second line indented 0.5 inch)." },
              { title: "MLA 9 container structure", desc: "Nested container structure for articles in journals, chapters in books, pages on websites, items in databases." },
              { title: "In-text citation format", desc: "Correct author-page format: (Smith 45), (Smith and Jones 112), ('Title' 45) for anonymous sources." },
              { title: "Digital sources", desc: "Websites, blogs, podcasts, tweets, YouTube videos, online databases — all formatted in MLA 9." },
              { title: "Humanities databases", desc: "JSTOR, Project MUSE, Google Scholar, MLA International Bibliography — major humanistic databases." },
              { title: "Scientific sources", desc: "PubMed, ScienceDirect, Web of Science — for interdisciplinary papers requiring scientific references." },
              { title: "Article search", desc: "Academik searches academic articles on your topic and formats them directly in MLA 9." },
              { title: "Literature review", desc: "Synthesis and comparison of sources found to support your argumentation and literary analysis." },
              { title: "Multi-format included", desc: "Besides MLA, Academik also generates APA 7, Vancouver and Chicago — your choice on the same search." },
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
                icon: Pencil,
                title: "Literature & Language students",
                desc: "BA, MA, PhD in English literature, comparative literature, linguistics, translation, film studies, cultural studies: generate your MLA 9 Works Cited for essays, dissertations and theses.",
                tags: ["Literature essay", "MA dissertation", "PhD thesis", "Language studies"]
              },
              {
                icon: GraduationCap,
                title: "Humanities students",
                desc: "Philosophy, art history, cultural studies, media studies, music, education: MLA is often required in these disciplines, especially at US, UK and Australian universities.",
                tags: ["Philosophy", "Art history", "Media studies", "Education"]
              },
              {
                icon: Users,
                title: "Researchers & academics",
                desc: "Prepare your articles for literary and humanities journals (PMLA, Modern Fiction Studies, Comparative Literature) with a Works Cited page compliant with MLA publisher requirements.",
                tags: ["Journal article", "Book chapter", "Conference paper", "Monograph"]
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
      <section className="py-20 px-4 bg-gradient-to-r from-violet-600 to-violet-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to generate your Works Cited?</h2>
          <p className="text-violet-100 mb-8 text-lg">
            Join 12,000+ students and researchers who use Academik for their academic work.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Get started — from €4.99 <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-violet-200 text-sm mt-4">No subscription · Secure payment · Instant results</p>
        </div>
      </section>

      {/* Partner banner */}
      <div className="py-5 px-4 bg-amber-50 border-y border-amber-100 text-center text-sm">
        <p className="text-muted-foreground">
          Need expert help <strong>writing your dissertation or essay</strong>?{" "}
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
            <span>— MLA Citation Generator</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/en/apa-citation-generator")}>APA Generator</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/en/vancouver-citation")}>Vancouver</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>Sign in</span>
            <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="hover:text-foreground">Rédacteur Mémoire</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
