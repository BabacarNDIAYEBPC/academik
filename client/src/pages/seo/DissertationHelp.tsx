import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, GraduationCap, Users, Clock, Target, Lightbulb, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "How do I find academic sources for my dissertation?",
    a: "To find reliable sources for your dissertation, search academic databases: PubMed for health sciences, Google Scholar for cross-disciplinary searches, JSTOR for humanities and social sciences, ScienceDirect for sciences, Cochrane for systematic reviews. Academik searches all these databases simultaneously and automatically in seconds."
  },
  {
    q: "How many sources do I need for a dissertation?",
    a: "An undergraduate dissertation typically requires 20–40 sources. A Master's dissertation needs 40–80 minimum. A PhD thesis often cites 100–300+ sources depending on the discipline. Academik helps you find relevant sources quickly and organise them into a structured literature review."
  },
  {
    q: "What citation style should I use for my dissertation?",
    a: "It depends on your discipline: APA 7 for psychology, education, and health sciences; Vancouver for medicine, nursing, and pharmacy; Chicago 17 (Notes & Bibliography) for history and law; MLA 9 for literature and languages. Always check your university's or department's specific requirements. Academik generates all four formats."
  },
  {
    q: "How do I write a dissertation literature review?",
    a: "A good literature review: (1) identifies the current state of knowledge on your topic, (2) organises sources thematically rather than simply summarising each one, (3) identifies agreements, debates and gaps in the literature, and (4) explains how your research addresses those gaps. Academik automates the search, analysis and synthesis steps."
  },
  {
    q: "How long should a dissertation literature review be?",
    a: "A Master's dissertation literature review is typically 2,000–5,000 words (roughly 15–25% of the total word count). For a PhD thesis, it can be 8,000–20,000 words or more. For a systematic review, it forms the entire thesis. Academik generates a structured synthesis you can expand and adapt."
  },
  {
    q: "Can Academik help with a systematic review for a PhD thesis?",
    a: "Yes. Academik generates Boolean search equations for PubMed, Scopus, Web of Science and Cochrane (including MeSH terms), which are essential for systematic reviews. It also provides source analysis, inclusion/exclusion guidance, and formatted references in the required citation style — ideal for PRISMA-guided systematic reviews."
  }
];

const STEPS = [
  { icon: Target, title: "Define your topic", desc: "Identify your research area, narrow the focus and formulate a provisional research question based on your preliminary reading." },
  { icon: Search, title: "Source searching", desc: "Search PubMed, Google Scholar, JSTOR with precise keywords. Academik does this automatically across multiple databases simultaneously." },
  { icon: FileText, title: "Literature review", desc: "Analyse and synthesise sources to map the state of knowledge and refine your final research question." },
  { icon: Lightbulb, title: "Theoretical framework", desc: "Identify the theories, concepts and key authors that structure your analytical approach." },
  { icon: BarChart3, title: "Methodology", desc: "Define your data collection and analysis method (qualitative, quantitative, mixed, systematic review)." },
  { icon: Zap, title: "Writing & references", desc: "Write your dissertation and generate your final bibliography formatted in APA, Vancouver, MLA or Chicago." },
];

export default function DissertationHelp() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Dissertation Help — AI Literature Review & References | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "AI-powered dissertation help for students. Automatic source search, literature review, APA/Vancouver/MLA/Chicago bibliography. For Master's and PhD students in the UK, USA, Australia, Ireland, Canada.");
    setMeta('meta[property="og:title"]', "content", "Dissertation Help — AI Literature Review & Bibliography | Academik");
    setMeta('meta[property="og:description"]', "content",
      "Speed up your dissertation with AI. Automatic source search, literature review synthesis and formatted bibliography in APA, Vancouver, MLA or Chicago.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/en/dissertation-help";

    const hreflangs = [
      { lang: "en-US", href: "https://academik.fr/en/dissertation-help" },
      { lang: "en-GB", href: "https://academik.fr/en/dissertation-help" },
      { lang: "en-AU", href: "https://academik.fr/en/dissertation-help" },
      { lang: "en-IE", href: "https://academik.fr/en/dissertation-help" },
      { lang: "x-default", href: "https://academik.fr/en/dissertation-help" },
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
        "name": "Academik — AI Dissertation Help",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "AI tool to help students with dissertation writing: automatic source search, literature review, bibliography in APA/Vancouver/MLA/Chicago.",
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
            <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground hidden sm:block" onClick={() => setLocation("/memoire-these")}>Français</span>
            <Button onClick={() => setLocation("/connexion")} size="sm" data-testid="button-nav-cta">
              Try for free <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-blue-50/60 to-background">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ Master's · PhD · Academic Research</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            AI{" "}
            <span className="text-primary">Dissertation Help</span>{" "}
            for Students
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Academik accelerates the most time-consuming parts of your dissertation: <strong>academic source search</strong>, <strong>literature review</strong>, <strong>formatted bibliography</strong> and <strong>search equations</strong> — in minutes, not days.
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Used by thousands of Master's and PhD students across the UK, USA, Australia, Ireland and Canada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Start my research <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/en/literature-review")}>
              See: AI Literature Review
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Verified sources</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> APA, Vancouver, MLA, Chicago</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> From €4.99</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, val: "12,000+", label: "Active students" },
            { icon: FileText, val: "40,000+", label: "Reviews generated" },
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

      {/* Process */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Key stages of your dissertation or thesis</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Academik handles the steps that take the most time and cause the most errors.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <Card key={title} className={`border ${i === 1 || i === 2 || i === 5 ? "border-primary/40 bg-primary/5" : ""}`}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${i === 1 || i === 2 || i === 5 ? "bg-primary/20" : "bg-muted"}`}>
                      <Icon className={`w-4 h-4 ${i === 1 || i === 2 || i === 5 ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{title}</p>
                        {(i === 1 || i === 2 || i === 5) && <Badge className="text-xs py-0 h-4">AI</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
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
          <h2 className="text-3xl font-bold text-center mb-4">What Academik does for your dissertation</h2>
          <p className="text-center text-muted-foreground mb-12">All the tools you need to complete your research successfully.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Multi-database search", desc: "Searches PubMed, Google Scholar, JSTOR, ScienceDirect, Cochrane and more simultaneously based on your topic." },
              { title: "Automatic literature review", desc: "Source analysis and synthesis: author confrontation, thematic mapping, written synthesis ready to use." },
              { title: "APA 7 bibliography", desc: "Automatic generation in APA 7th edition, the most widely used format in psychology, education and health sciences." },
              { title: "Vancouver bibliography", desc: "Sequential ICMJE format for nursing dissertations, medical and pharmacy theses." },
              { title: "MLA 9 Works Cited", desc: "Works Cited page for literature, languages, film studies and comparative studies dissertations." },
              { title: "Chicago 17 bibliography", desc: "Footnotes (System A) and author-date (System B) for history, law and economics papers." },
              { title: "Search equations", desc: "Boolean equations for PubMed, Scopus, Web of Science and Cochrane with MeSH terms for systematic reviews." },
              { title: "Reading notes", desc: "Structured analysis (summary, methodology, results, limitations) from your PDF articles." },
              { title: "Discipline filters", desc: "Filter by date range, language, document type, database, and academic level." },
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

      {/* Disciplines */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Suited to all disciplines</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { disc: "Health sciences", details: "Nursing, medicine, pharmacy, physiotherapy, midwifery, occupational therapy", format: "Vancouver" },
              { disc: "Psychology & education", details: "Clinical psychology, educational psychology, social work, counselling", format: "APA 7" },
              { disc: "Social sciences", details: "Sociology, anthropology, political science, international relations, economics", format: "APA 7 or Chicago B" },
              { disc: "History & law", details: "Modern history, legal studies, criminology, public policy", format: "Chicago A" },
              { disc: "Literature & languages", details: "English literature, linguistics, comparative literature, translation studies", format: "MLA 9" },
              { disc: "Sciences & engineering", details: "Biology, chemistry, physics, computer science, environmental science", format: "Vancouver or APA 7" },
            ].map(({ disc, details, format }) => (
              <Card key={disc} className="border hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-4">
                  <p className="font-semibold mb-1">{disc}</p>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{details}</p>
                  <Badge variant="secondary" className="text-xs">Recommended: {format}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What type of work is Academik for?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Master's dissertation",
                desc: "Taught Master's or research Master's (10,000–20,000 words): Academik speeds up the documentary and bibliographic phase so you can focus on your own analysis and argument.",
                tags: ["MA dissertation", "MSc thesis", "Research project", "Capstone"]
              },
              {
                icon: Search,
                title: "PhD thesis & systematic review",
                desc: "Doctoral thesis or systematic review: Academik helps with the literature review, PRISMA search equations for PubMed/Cochrane/Scopus, and the full reference list in your required style.",
                tags: ["PhD thesis", "Systematic review", "PRISMA", "Meta-analysis"]
              },
              {
                icon: Users,
                title: "Specialist & professional degree",
                desc: "Nursing specialist, graduate entry medicine, postgraduate diploma, professional doctorate: Academik adapts to all levels and all citation formats required by your institution.",
                tags: ["PGDip", "Professional doctorate", "Clinical audit", "EBP project"]
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
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to speed up your dissertation?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join 12,000+ students who use Academik to save time on the research phase of their dissertation.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Get started — from €4.99 <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-blue-200 text-sm mt-4">No subscription · Secure payment · Results in under 2 minutes</p>
        </div>
      </section>

      {/* Partner banner */}
      <div className="py-5 px-4 bg-amber-50 border-y border-amber-100 text-center text-sm">
        <p className="text-muted-foreground">
          Need complete support <strong>writing your dissertation or thesis</strong>?{" "}
          <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="text-primary font-semibold underline underline-offset-2 hover:opacity-80">
            Rédacteur Mémoire
          </a>{" "}
          — personalised coaching and proofreading by academic experts (French-speaking).
        </p>
      </div>

      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-semibold">Academik</span>
            <span>— AI Dissertation Help</span>
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
