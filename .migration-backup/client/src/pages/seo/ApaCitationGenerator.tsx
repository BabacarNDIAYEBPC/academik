import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, GraduationCap, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "What is APA 7th edition format?",
    a: "APA 7th edition (American Psychological Association) is the latest citation standard used across social sciences, psychology, education, nursing, and health sciences. It defines how to format references, in-text citations, and academic papers. The 7th edition introduced new rules for digital sources, DOIs, and removed the requirement for publisher location."
  },
  {
    q: "How do I generate an APA citation automatically?",
    a: "With Academik, simply describe your research topic or paste your source information. Our AI searches academic databases (PubMed, Google Scholar, ScienceDirect) and automatically formats your bibliography in APA 7 with correct author names, publication years, journal titles, volume numbers, and DOIs."
  },
  {
    q: "Is Academik free to use?",
    a: "Academik uses a pay-as-you-go credit system. You can start with a Starter pack from €4.99 for 10 credits. Each action (article search, bibliography generation) uses 1 credit. No monthly subscription — you only pay for what you use."
  },
  {
    q: "What's the difference between APA, Vancouver, MLA and Chicago?",
    a: "APA is standard in social sciences and health. Vancouver uses numbered references and is standard in medicine and biomedical sciences. MLA is used in literature and humanities. Chicago is used in history and humanities (footnote style). Academik generates all four formats."
  },
  {
    q: "Can I use Academik for my dissertation or thesis?",
    a: "Absolutely. Academik is designed for undergraduate and postgraduate students as well as professional researchers. It generates bibliographies compliant with university requirements in APA 7, Vancouver, MLA, and Chicago styles."
  },
  {
    q: "Does Academik work for UK, Australian and Irish universities?",
    a: "Yes. Academik works for all English-speaking academic institutions worldwide — UK, USA, Australia, Ireland, Canada and beyond. APA 7 is widely accepted across all these countries. Our AI searches international databases including PubMed, Google Scholar, and ScienceDirect."
  }
];

export default function ApaCitationGenerator() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Free APA 7 Citation Generator Online — Instant Bibliography | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Generate perfect APA 7 citations and bibliographies automatically in seconds. Free AI-powered tool for students and researchers. Works with PubMed, Google Scholar, ScienceDirect.");
    setMeta('meta[property="og:title"]', "content", "Free APA 7 Citation Generator — Academik");
    setMeta('meta[property="og:description"]', "content",
      "Create perfect APA 7 bibliographies instantly with AI. Ideal for dissertations, theses and research papers. Used by 12,000+ students worldwide.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/en/apa-citation-generator";

    const hreflangs = [
      { lang: "en-US", href: "https://academik.fr/en/apa-citation-generator" },
      { lang: "en-GB", href: "https://academik.fr/en/apa-citation-generator" },
      { lang: "en-AU", href: "https://academik.fr/en/apa-citation-generator" },
      { lang: "en-IE", href: "https://academik.fr/en/apa-citation-generator" },
      { lang: "x-default", href: "https://academik.fr/en/apa-citation-generator" },
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
        "name": "Academik — APA Citation Generator",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "AI-powered online tool to automatically generate APA 7, Vancouver, MLA and Chicago bibliographies.",
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
      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">Academik</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground hidden sm:block" onClick={() => setLocation("/bibliographie-apa")}>Français</span>
            <Button onClick={() => setLocation("/connexion")} size="sm" data-testid="button-nav-cta">
              Try for free <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-blue-50/60 to-background">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ APA 7th Edition</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Free{" "}
            <span className="text-primary">APA Citation Generator</span>{" "}
            Online
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Generate perfectly formatted <strong>APA 7th edition</strong> citations and bibliographies in seconds.
            Our AI searches PubMed, Google Scholar, ScienceDirect and automatically formats your reference list to meet university standards.
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Used by students and researchers across the USA, UK, Australia, Ireland and Canada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Generate my APA bibliography <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/")}>
              See all features
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> From €4.99</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> No subscription</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Results in seconds</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, val: "12,000+", label: "Students & researchers" },
            { icon: FileText, val: "85,000+", label: "Bibliographies generated" },
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

      {/* What is APA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">What is APA 7th Edition?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                The <strong>APA 7th edition</strong> (American Psychological Association) is the current citation standard used across social sciences, psychology, education, nursing, and many other disciplines worldwide.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                It defines precisely how to cite journal articles, books, websites, theses, and other sources. A correctly formatted APA bibliography is essential for dissertations, theses, and research papers at universities in the US, UK, Australia, Ireland and Canada.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Academik generates citations according to the 7th edition — the most recent — including updated rules for DOIs, URLs, and digital sources.
              </p>
            </div>
            <div className="space-y-3">
              <div className="bg-muted/40 rounded-lg p-4 font-mono text-sm border-l-4 border-primary">
                <p className="text-xs text-muted-foreground mb-2 font-sans">APA 7 example — Journal article</p>
                Smith, J., &amp; Johnson, A. (2023). The impact of AI on academic research. <em>Journal of Educational Technology, 45</em>(2), 112–134. https://doi.org/10.xxxx/xxxxx
              </div>
              <div className="bg-muted/40 rounded-lg p-4 font-mono text-sm border-l-4 border-blue-400">
                <p className="text-xs text-muted-foreground mb-2 font-sans">APA 7 example — Book</p>
                Brown, M. (2022). <em>Research methods in social sciences</em> (3rd ed.). Oxford University Press.
              </div>
              <div className="bg-muted/40 rounded-lg p-4 font-mono text-sm border-l-4 border-green-400">
                <p className="text-xs text-muted-foreground mb-2 font-sans">APA 7 example — Website</p>
                World Health Organization. (2023, March 15). <em>Mental health guidelines</em>. https://www.who.int/mental-health
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How does it work?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            In 3 simple steps, get a complete APA 7 bibliography ready to paste into your dissertation or research paper.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: Search,
                title: "Describe your topic",
                desc: "Enter your research theme or keywords. Academik searches PubMed, Google Scholar, ScienceDirect and other databases to find the most relevant academic sources."
              },
              {
                step: "2",
                icon: Zap,
                title: "AI selects and analyses",
                desc: "Our GPT-4o powered AI selects quality academic sources, extracts metadata (authors, year, journal, DOI) and verifies their relevance to your topic."
              },
              {
                step: "3",
                icon: FileText,
                title: "APA bibliography ready",
                desc: "In seconds, your APA 7 bibliography is formatted and ready to use. Copy it directly into Word, Google Docs or your writing software."
              }
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                  <Icon className="w-6 h-6 text-primary" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">{step}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Everything you need</h2>
          <p className="text-center text-muted-foreground mb-12">Beyond APA, Academik covers all your citation needs.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "APA 7th Edition", desc: "Most recent format, accepted by all universities worldwide. Includes DOI, URL and digital source rules." },
              { title: "Vancouver", desc: "Standard in medicine, pharmacy and biomedical sciences. Automatic numbered references." },
              { title: "MLA 9", desc: "Used in literature, languages and humanities. Automatic formatting." },
              { title: "Chicago 17", desc: "For history and humanities. Footnotes and bibliography formats included." },
              { title: "Major databases", desc: "PubMed, Google Scholar, ScienceDirect, Web of Science — all major academic databases." },
              { title: "Literature review", desc: "Automatically compare and synthesise your sources for your systematic literature review." },
              { title: "Reading notes", desc: "Generate structured reading notes from your PDFs and journal articles." },
              { title: "Search equations", desc: "Create Boolean search equations for PubMed, Scopus and Web of Science." },
              { title: "Instant export", desc: "One-click copy into Word, Google Docs, LaTeX or your writing software." },
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

      {/* Who is it for */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Who is Academik for?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Students",
                desc: "Undergraduate, Masters, and PhD students across the USA, UK, Australia, Ireland and Canada. Perfect for dissertations, theses, and research papers.",
                tags: ["Dissertation", "Thesis", "Research paper", "Essays"]
              },
              {
                icon: Search,
                title: "Researchers",
                desc: "Lecturers, professors, postdoctoral researchers. Speed up your literature reviews and ensure bibliographic compliance in your publications.",
                tags: ["Journal articles", "Reviews", "Conferences", "Reports"]
              },
              {
                icon: Users,
                title: "Professionals",
                desc: "Healthcare professionals, consultants, social workers. Produce professional bibliographies for reports, training materials and internal publications.",
                tags: ["Reports", "Training", "Protocols", "Audits"]
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
          <h2 className="text-3xl font-bold mb-4">Ready to generate your APA bibliography?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join over 12,000 students and researchers who use Academik for their academic work.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Get started — from €4.99 <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-blue-200 text-sm mt-4">No subscription · Secure payment · Instant results</p>
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
            <span>— AI Academic Research Tool</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/")}>Home</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>Sign in</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/bibliographie-apa")}>Français</span>
            <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="hover:text-foreground">Rédacteur Mémoire</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
