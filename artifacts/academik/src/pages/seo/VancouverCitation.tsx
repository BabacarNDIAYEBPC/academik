import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, GraduationCap, Users, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "What is Vancouver citation style?",
    a: "Vancouver citation style is the international bibliographic standard for medical and biomedical sciences, defined by the ICMJE (International Committee of Medical Journal Editors). It uses sequential numbering — references are cited in the text by a number in parentheses or superscript and listed numerically in the bibliography."
  },
  {
    q: "How does Vancouver referencing work?",
    a: "In Vancouver style, the first source cited in your text is numbered (1), the second (2), and so on. If you cite the same source again later, you use the same number. Your reference list at the end presents all sources in numerical order (not alphabetically like Harvard/APA)."
  },
  {
    q: "How do I generate a Vancouver reference automatically?",
    a: "With Academik, simply enter your research topic or paste your source information. Our AI searches PubMed, Cochrane, ScienceDirect and other medical databases, then automatically formats your references in Vancouver style with correct author names, MEDLINE journal abbreviations, volume, issue, page numbers and DOI."
  },
  {
    q: "What is the difference between Vancouver and Harvard referencing?",
    a: "Harvard uses an author-date system in the text (Smith 2020) and an alphabetical reference list. Vancouver uses sequential numbers in the text (1) and a numerical reference list ordered by first citation. Vancouver is standard in medicine and health sciences; Harvard is common in social sciences and education."
  },
  {
    q: "Does Academik work for UK and Australian universities?",
    a: "Yes. Academik is used by students and researchers in the UK, Australia, Ireland, USA, Canada and beyond. Vancouver formatting follows ICMJE international standards accepted at all universities worldwide that require Vancouver referencing."
  },
  {
    q: "How many authors should I list before 'et al.' in Vancouver?",
    a: "In current Vancouver/ICMJE style, list all authors when there are six or fewer. When there are seven or more authors, list the first six followed by 'et al.' Academik applies this rule automatically when generating your reference list."
  }
];

const EXAMPLE = {
  article: `1. Smith J, Jones A, Brown C, Williams D, Taylor E, Davis F, et al. Effectiveness of nurse-led interventions in paediatric oncology: systematic review. BMJ. 2023;382:e075123. doi:10.1136/bmj-2023-075123`,
  book: `2. Kumar V, Abbas AK, Aster JC. Robbins & Cotran Pathologic Basis of Disease. 10th ed. Elsevier; 2020. 1392 p.`,
  website: `3. World Health Organization. Global tuberculosis report 2023 [Internet]. WHO; 2023 [cited 2026 May 22]. Available from: https://www.who.int/publications/i/item/9789240083851`
};

export default function VancouverCitation() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Vancouver Citation Generator — Free Online Tool | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Generate Vancouver references automatically online. Correct ICMJE formatting, MEDLINE journal abbreviations, DOI. For medical dissertations, nursing, pharmacy and scientific articles.");
    setMeta('meta[property="og:title"]', "content", "Vancouver Citation Generator — Academik");
    setMeta('meta[property="og:description"]', "content",
      "Free Vancouver reference generator. PubMed, Cochrane, ScienceDirect sources. ICMJE standard. Perfect for medical dissertations, nursing, pharmacy.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/en/vancouver-citation";

    const hreflangs = [
      { lang: "en-US", href: "https://academik.fr/en/vancouver-citation" },
      { lang: "en-GB", href: "https://academik.fr/en/vancouver-citation" },
      { lang: "en-AU", href: "https://academik.fr/en/vancouver-citation" },
      { lang: "en-IE", href: "https://academik.fr/en/vancouver-citation" },
      { lang: "x-default", href: "https://academik.fr/en/vancouver-citation" },
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
        "name": "Academik — Vancouver Citation Generator",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "AI-powered tool to automatically generate references in Vancouver style following ICMJE standards.",
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
            <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground hidden sm:block" onClick={() => setLocation("/bibliographie-vancouver")}>Français</span>
            <Button onClick={() => setLocation("/connexion")} size="sm" data-testid="button-nav-cta">
              Try for free <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-rose-50/60 to-background">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ ICMJE Standard · Vancouver</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Free{" "}
            <span className="text-primary">Vancouver Citation</span>{" "}
            Generator Online
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Generate perfectly formatted <strong>Vancouver references</strong> in seconds.
            Our AI searches PubMed, Cochrane and ScienceDirect and automatically creates your numbered reference list following ICMJE standards.
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Used by medical students, nurses, pharmacists and researchers across the USA, UK, Australia, Ireland and Canada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Generate my Vancouver references <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/en/apa-citation-generator")}>
              See also: APA Citation Generator
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> ICMJE compliant</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> PubMed & Cochrane</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> From €4.99</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, val: "12,000+", label: "Students & clinicians" },
            { icon: FileText, val: "85,000+", label: "References generated" },
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

      {/* What is Vancouver */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">What is Vancouver referencing style?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                <strong>Vancouver style</strong> is the international bibliographic standard for medicine and health sciences, defined by the <strong>ICMJE</strong> (International Committee of Medical Journal Editors). It is required by over 4,000 medical journals worldwide including The Lancet, NEJM, BMJ and JAMA.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Its key feature is <strong>sequential numbering</strong>: references are numbered in the order they first appear in your text, and your reference list presents them in that same numerical order — not alphabetically.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Journal titles are abbreviated according to official <strong>MEDLINE/PubMed abbreviations</strong> (e.g. N Engl J Med, BMJ, Lancet). Academik applies all these rules automatically.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Vancouver reference examples</p>
              <Card className="border-l-4 border-primary border-t-0 border-b-0 border-r-0 rounded-l-none bg-muted/30">
                <CardContent className="py-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Journal article</p>
                  <p className="text-xs font-mono leading-relaxed">{EXAMPLE.article}</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-primary border-t-0 border-b-0 border-r-0 rounded-l-none bg-muted/30">
                <CardContent className="py-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Book</p>
                  <p className="text-xs font-mono leading-relaxed">{EXAMPLE.book}</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-primary border-t-0 border-b-0 border-r-0 rounded-l-none bg-muted/30">
                <CardContent className="py-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Website</p>
                  <p className="text-xs font-mono leading-relaxed">{EXAMPLE.website}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How to generate Vancouver references with AI</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Academik automates Vancouver formatting in three simple steps.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: Search, title: "Describe your topic", desc: "Enter your research subject or the sources you want to format. The AI searches PubMed, Cochrane, ScienceDirect and other medical databases." },
              { step: "2", icon: Zap, title: "AI formats in Vancouver", desc: "Each source is automatically formatted with sequential numbering, MEDLINE journal abbreviations, author names, volume, issue, pages and DOI." },
              { step: "3", icon: FileText, title: "Copy or export", desc: "Copy your numbered reference list ready to paste into your dissertation, or export directly to Word." },
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
          <p className="text-center text-muted-foreground mb-12">A complete tool for all your bibliographic needs in health sciences.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Automatic numbering", desc: "References numbered in order of appearance, fully compliant with ICMJE rules." },
              { title: "MEDLINE abbreviations", desc: "Journal titles abbreviated following the official PubMed/MEDLINE list (e.g. N Engl J Med, JAMA, Lancet)." },
              { title: "6 authors + et al.", desc: "Up to 6 authors listed, followed by 'et al.' as per current Vancouver/ICMJE guidelines." },
              { title: "DOI included", desc: "Automatic DOI inclusion for all articles that have one, in the doi:10.xxxx format." },
              { title: "Grey literature", desc: "Format WHO reports, institutional guidelines, government publications and healthcare websites." },
              { title: "All source types", desc: "Journal articles, books, chapters, theses, conferences, websites — all document types in Vancouver." },
              { title: "PubMed & Cochrane", desc: "Direct search of PubMed, MEDLINE, Cochrane Library and ScienceDirect for your research topic." },
              { title: "Systematic review support", desc: "Generate PubMed search equations with MeSH terms for PRISMA systematic reviews." },
              { title: "Multi-format included", desc: "Besides Vancouver, Academik also generates APA 7, MLA and Chicago — all on the same search." },
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
                title: "Healthcare students",
                desc: "Nursing, physiotherapy, midwifery, pharmacy, occupational therapy: generate your Vancouver references for dissertations, final year projects and clinical audits.",
                tags: ["Nursing dissertation", "Final year project", "Clinical audit", "Case study"]
              },
              {
                icon: Hash,
                title: "Medical & dental students",
                desc: "Medical school dissertations, pharmacy theses, dental projects: Academik formats your Vancouver references with correct MEDLINE abbreviations and DOIs.",
                tags: ["Medical thesis", "Pharmacy", "Dentistry", "Clinical research"]
              },
              {
                icon: Users,
                title: "Researchers & clinicians",
                desc: "Submit to peer-reviewed medical journals (Lancet, BMJ, NEJM, JAMA) with a Vancouver reference list fully compliant with journal submission requirements.",
                tags: ["Journal article", "Case report", "Systematic review", "Clinical trial"]
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
      <section className="py-20 px-4 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to generate your Vancouver references?</h2>
          <p className="text-rose-100 mb-8 text-lg">
            Join 12,000+ healthcare students and researchers who use Academik for their academic work.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Get started — from €4.99 <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-rose-200 text-sm mt-4">No subscription · Secure payment · Results in seconds</p>
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
            <span>— Vancouver Citation Generator</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/en/apa-citation-generator")}>APA Generator</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/en/literature-review")}>Literature Review</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>Sign in</span>
            <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="hover:text-foreground">Rédacteur Mémoire</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
