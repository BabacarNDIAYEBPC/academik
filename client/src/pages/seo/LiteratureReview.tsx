import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, GraduationCap, Users, Clock, GitMerge, Brain, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "What is a literature review?",
    a: "A literature review is a critical and synthetic analysis of existing scientific publications on a given topic. It identifies the current state of knowledge, ongoing debates, and gaps in research. It is an essential component of any dissertation, thesis, or scientific article."
  },
  {
    q: "How does Academik generate a literature review?",
    a: "Academik searches for academic articles in PubMed, Google Scholar, ScienceDirect, and other databases based on your topic. The AI analyses and compares the sources, identifies converging and diverging themes, and automatically writes a structured synthesis with author confrontation and thematic mapping."
  },
  {
    q: "How long does it take to generate a literature review?",
    a: "With Academik, a complete literature review on a given topic is generated in under 2 minutes. The process includes source search, content analysis, author confrontation, and synthesis writing."
  },
  {
    q: "What is the difference between a narrative and systematic review?",
    a: "A narrative review synthesises existing work thematically without a strict search protocol. A systematic review follows a rigorous protocol (PRISMA) with explicit inclusion/exclusion criteria, search equations, and a reproducible process. Academik can help with both types."
  },
  {
    q: "Can Academik generate search equations for PubMed?",
    a: "Yes. Academik automatically generates Boolean search equations for PubMed, Scopus, Web of Science, and Cochrane. These include appropriate MeSH terms, Boolean operators (AND, OR, NOT), and date and language filters."
  },
  {
    q: "Does Academik work for UK, Australian and American universities?",
    a: "Yes. Academik is used by students and researchers worldwide — USA, UK, Australia, Ireland, Canada and beyond. It searches international databases (PubMed, Google Scholar, ScienceDirect) and generates bibliographies in APA 7, Vancouver, MLA and Chicago styles accepted by all universities."
  }
];

export default function LiteratureReview() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "AI Literature Review Generator — Automatic & Free | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Generate a complete literature review automatically with AI in under 2 minutes. Source search, author confrontation, thematic mapping and written synthesis. For dissertations and theses.");
    setMeta('meta[property="og:title"]', "content", "AI Literature Review Generator — Academik");
    setMeta('meta[property="og:description"]', "content",
      "Create a full literature review in minutes with AI. Academic sources: PubMed, Google Scholar, ScienceDirect. APA 7, Vancouver, MLA citations included.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/en/literature-review";

    const hreflangs = [
      { lang: "en-US", href: "https://academik.fr/en/literature-review" },
      { lang: "en-GB", href: "https://academik.fr/en/literature-review" },
      { lang: "en-AU", href: "https://academik.fr/en/literature-review" },
      { lang: "en-IE", href: "https://academik.fr/en/literature-review" },
      { lang: "x-default", href: "https://academik.fr/en/literature-review" },
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
        "name": "Academik — AI Literature Review Tool",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "AI-powered tool to automatically generate literature reviews, bibliographic syntheses and research equations.",
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
            <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground hidden sm:block" onClick={() => setLocation("/revue-litterature")}>Français</span>
            <Button onClick={() => setLocation("/connexion")} size="sm" data-testid="button-nav-cta">
              Try for free <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-teal-50/60 to-background">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ Powered by GPT-4o</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            AI{" "}
            <span className="text-primary">Literature Review</span>{" "}
            Generator
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Generate a <strong>complete literature review</strong> in under 2 minutes.
            Source search, author confrontation, thematic mapping and written synthesis — all automatically powered by artificial intelligence.
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Essential for Master's dissertations, PhD theses, and scientific articles across the USA, UK, Australia, Ireland and Canada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Generate my literature review <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/en/apa-citation-generator")}>
              See also: APA Citation Generator
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Under 2 minutes</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Verified sources</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> From €4.99</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, val: "12,000+", label: "Researchers & students" },
            { icon: GitMerge, val: "40,000+", label: "Reviews generated" },
            { icon: Star, val: "4.8/5", label: "Average rating" },
            { icon: Clock, val: "< 2 min", label: "Generation time" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              <p className="text-2xl font-bold">{val}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What is it */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">What is a literature review?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                A <strong>literature review</strong> is a critical analysis and synthesis of existing scientific publications on a given topic. It forms the theoretical foundation of any research: Master's dissertation, PhD thesis, scientific article, or professional report.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                A good literature review identifies the current state of knowledge, confronts authors' positions, identifies consensus and controversies, and highlights gaps in existing research.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Academik automates this time-consuming process: in a few minutes, it searches, analyses and synthesises dozens of academic sources for you.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Search, title: "Narrative review", desc: "Thematic synthesis of existing work. Ideal for dissertations and theses in humanities and social sciences." },
                { icon: ListOrdered, title: "Systematic review", desc: "Rigorous PRISMA protocol with inclusion/exclusion criteria. Standard in medicine and health sciences." },
                { icon: Brain, title: "Thematic mapping", desc: "Conceptual mapping of main themes, sub-themes and relationships between authors and their positions." },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="border-l-4 border-primary border-t-0 border-b-0 border-r-0 rounded-l-none">
                  <CardContent className="py-4 flex gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">{title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
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
          <h2 className="text-3xl font-bold text-center mb-4">How does the AI literature review work?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Academik combines automated research and AI to produce quality academic synthesis in minutes.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", icon: Search, title: "Multi-database search", desc: "AI queries PubMed, Google Scholar, ScienceDirect, Web of Science and Cochrane based on your topic and search criteria." },
              { step: "2", icon: FileText, title: "Source analysis", desc: "Each source is analysed: methodology, results, conclusions, limitations. AI extracts key information automatically." },
              { step: "3", icon: GitMerge, title: "Author confrontation", desc: "AI identifies convergences, divergences and controversies between authors to structure the scientific debate." },
              { step: "4", icon: Zap, title: "Written synthesis", desc: "A fluent, structured synthesis is automatically generated, with the associated APA 7 or Vancouver bibliography." },
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
          <h2 className="text-3xl font-bold text-center mb-4">Everything for your academic research</h2>
          <p className="text-center text-muted-foreground mb-12">Beyond the literature review, Academik covers all your research steps.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Automatic synthesis", desc: "Author confrontation, thematic mapping and synthesis written in academic style." },
              { title: "Search equations", desc: "Boolean equations for PubMed, Scopus, Web of Science and Cochrane with MeSH terms." },
              { title: "APA 7 bibliography", desc: "All your sources formatted in APA 7, Vancouver, MLA or Chicago in one click." },
              { title: "Reading notes", desc: "Generate structured reading notes (summary, methodology, limitations) from your PDFs." },
              { title: "International databases", desc: "PubMed/MEDLINE, Google Scholar, ScienceDirect, Cochrane — access to global publications." },
              { title: "Advanced filters", desc: "Filter by date range, language, document type (article, thesis, book), level of evidence." },
              { title: "Keywords & MeSH", desc: "Automatic identification of relevant keywords and MeSH descriptors for your topic." },
              { title: "PRISMA support", desc: "Systematic review methodology support with PRISMA flow diagram guidance." },
              { title: "Word / PDF export", desc: "Export your literature review directly to Word or Google Docs in one click." },
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
                icon: GraduationCap,
                title: "Masters & PhD Students",
                desc: "Speed up writing your theoretical framework and literature review. Ideal for dissertations, theses and research papers at universities in the USA, UK, Australia, Ireland and Canada.",
                tags: ["Dissertation", "PhD thesis", "Research paper", "IMRAD"]
              },
              {
                icon: Search,
                title: "Researchers & Academics",
                desc: "Speed up systematic reviews, quickly identify the state of the art on a topic, and prepare your articles for peer-reviewed journals.",
                tags: ["Systematic review", "Journal article", "Grant", "Conference"]
              },
              {
                icon: Users,
                title: "Healthcare Professionals",
                desc: "Nurses, doctors, physiotherapists, psychologists: produce literature reviews for specialist qualifications, CPD and professional publications.",
                tags: ["EBP protocols", "CPD", "Specialist cert.", "Clinical audit"]
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
      <section className="py-20 px-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to generate your literature review?</h2>
          <p className="text-teal-100 mb-8 text-lg">
            Join 12,000+ students and researchers who use Academik to accelerate their academic research.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Get started — from €4.99 <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-teal-200 text-sm mt-4">No subscription · Secure payment · Results in under 2 minutes</p>
        </div>
      </section>

      {/* Partner banner */}
      <div className="py-5 px-4 bg-amber-50 border-y border-amber-100 text-center text-sm">
        <p className="text-muted-foreground">
          Need expert help <strong>writing your dissertation or thesis</strong>?{" "}
          <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="text-primary font-semibold underline underline-offset-2 hover:opacity-80">
            Rédacteur Mémoire
          </a>{" "}
          — personalised academic support from expert tutors (French-speaking).
        </p>
      </div>

      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-semibold">Academik</span>
            <span>— AI Literature Review Tool</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/en/apa-citation-generator")}>APA Generator</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>Sign in</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/revue-litterature")}>Français</span>
            <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="hover:text-foreground">Rédacteur Mémoire</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
