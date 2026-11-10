import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Star, GraduationCap, Users, Clock, Target, Brain, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "Is Academik suitable for undergraduate students?",
    a: "Yes. Academik is designed for all academic levels, from undergraduate to PhD. Undergraduate students using Academik for essays, coursework reports and research projects will find a simple interface and immediately usable results. Level filters allow you to adjust the complexity of the sources returned."
  },
  {
    q: "How does Academik help me find sources for my essays?",
    a: "Enter your essay question or research topic in Academik. The tool automatically searches PubMed, Google Scholar, JSTOR, ScienceDirect and Cochrane, then returns a list of relevant sources with their abstracts. You can then filter by date, language, discipline or document type."
  },
  {
    q: "What is the difference between Academik and Google Scholar?",
    a: "Google Scholar returns a raw list of results that you have to sort manually. Academik analyses the results, generates a thematic synthesis, compares authors with each other, and automatically formats the bibliography in the required style (APA, Vancouver, MLA or Chicago). It's a research assistant, not just a search engine."
  },
  {
    q: "How much does Academik cost for a student?",
    a: "Academik works on a no-subscription credit system. The Starter pack (10 credits, €4.99) is enough for 10 complete searches. Each AI action (search, synthesis, bibliography) costs 1 credit. There is no monthly subscription — you buy only what you need."
  },
  {
    q: "Does Academik generate citations compliant with UK and US university standards?",
    a: "Yes. Academik generates bibliographies compliant with APA 7, Vancouver (ICMJE), MLA 9 and Chicago 17, the four formats most used in UK, US, Australian and Irish universities. Always check the format required by your supervisor or module handbook."
  },
  {
    q: "Can I use Academik for a 2,000-word essay?",
    a: "Absolutely. For a short assignment (essay or coursework of 1,000–5,000 words), one Academik search is usually enough to identify 5–15 relevant sources and generate the corresponding bibliography. It's just as quick and effective for shorter academic work."
  }
];

export default function Students() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Academic Research Tool for Students — Bibliography & Sources | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Academik helps undergraduate and postgraduate students find academic sources and generate APA, Vancouver, MLA or Chicago bibliographies automatically. Results in under 2 minutes.");
    setMeta('meta[property="og:title"]', "content", "AI Research Tool for Students — Bibliography Generator | Academik");
    setMeta('meta[property="og:description"]', "content",
      "Find reliable academic sources and generate your bibliography automatically. Academik, the AI assistant for every student.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/en/students";

    const hreflangs = [
      { lang: "en-US", href: "https://academik.fr/en/students" },
      { lang: "en-GB", href: "https://academik.fr/en/students" },
      { lang: "en-AU", href: "https://academik.fr/en/students" },
      { lang: "en-IE", href: "https://academik.fr/en/students" },
      { lang: "x-default", href: "https://academik.fr/en/students" },
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
        "name": "Academik — Academic Research Tool for Students",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "AI tool to help students find academic sources and generate bibliographies in APA, Vancouver, MLA or Chicago.",
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
            <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground hidden sm:block" onClick={() => setLocation("/etudiant")}>Français</span>
            <Button onClick={() => setLocation("/connexion")} size="sm" data-testid="button-nav-cta">
              Try for free <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-sky-50/60 to-background">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ Undergraduate · Postgraduate · PhD</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            The AI research tool for{" "}
            <span className="text-primary">students</span>{" "}
            who want reliable sources
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            No more hours wasted on Google hunting for articles. Academik finds the <strong>relevant academic sources</strong> for your topic, generates your <strong>formatted bibliography</strong> and produces a <strong>literature synthesis</strong> — in under 2 minutes.
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Used by thousands of undergraduate, postgraduate and PhD students across the UK, USA, Australia, Ireland and Canada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Start my research <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/en/dissertation-help")}>
              See: Dissertation Help
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
            { icon: FileText, val: "85,000+", label: "Bibliographies generated" },
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

      {/* Problems */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Do you recognise yourself?</h2>
          <p className="text-center text-muted-foreground mb-12">The problems every student faces during academic research.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { prob: "\"I don't know where to start\"", sol: "Academik generates a structured list of sources as soon as you type your topic." },
              { prob: "\"I find sources on Google but can't tell if they're academic\"", sol: "Academik searches only scientific databases: PubMed, JSTOR, Google Scholar, ScienceDirect." },
              { prob: "\"Formatting my reference list takes forever\"", sol: "Academik generates the entire bibliography in APA, Vancouver, MLA or Chicago in one click." },
              { prob: "\"My supervisor says my sources aren't recent enough\"", sol: "Filter by date range (e.g. 2019–2024) to get only recent publications." },
              { prob: "\"I don't know how to write a literature review\"", sol: "Academik generates a thematic synthesis ready to adapt for your theoretical framework." },
              { prob: "\"I need 30 sources but have only found 5\"", sol: "Academik searches 5+ databases simultaneously and returns up to 20 relevant sources." },
            ].map(({ prob, sol }) => (
              <Card key={prob} className="border hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-4">
                  <p className="font-semibold text-sm mb-2 text-muted-foreground italic">❝ {prob}</p>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">{sol}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">How it works</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">Three steps from vague topic to perfect bibliography.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: Search, title: "Type your topic", desc: "Enter your research question, essay title or course topic. Add filters if needed: date range, language, discipline, source type." },
              { step: "2", icon: Brain, title: "AI analyses and synthesises", desc: "Academik searches PubMed, JSTOR, Google Scholar and ScienceDirect, then analyses the results and generates a synthesis of the main themes, currents and debates." },
              { step: "3", icon: FileText, title: "Bibliography ready in one click", desc: "Choose your format (APA 7, Vancouver, MLA 9, Chicago 17) and copy your perfectly formatted bibliography into Word or Google Docs." },
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

      {/* Use cases */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">For all your academic work</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Essays & coursework",
                desc: "Quickly find 5–10 solid sources for your seminar paper, coursework report or literature review assignment. Bibliography ready in seconds.",
                tags: ["Seminar paper", "Coursework", "Book report", "Annotated bibliography"]
              },
              {
                icon: GraduationCap,
                title: "Dissertation",
                desc: "Undergraduate or Master's: identify the state of the art on your topic, structure your literature review and generate your complete bibliography in the format required by your supervisor.",
                tags: ["UG dissertation", "Master's thesis", "Research project", "Capstone"]
              },
              {
                icon: Award,
                title: "Competitive programmes",
                desc: "Law school, medical school, business school: Academik quickly structures your literature search for case studies, research-based reports and academic competitions.",
                tags: ["Law school", "Medical school", "MBA", "Research report"]
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

      {/* Pricing */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Student-friendly pricing</h2>
          <p className="text-muted-foreground mb-10">No monthly subscription. Buy only what you need.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: "Starter", credits: "10 credits", price: "€4.99", desc: "Perfect for a single essay or one-off research project" },
              { name: "Essential", credits: "30 credits", price: "€11.99", desc: "Ideal for a dissertation or a full semester", highlight: true },
              { name: "Pro", credits: "100 credits", price: "€29.99", desc: "For a PhD thesis or an intense academic year" },
            ].map(({ name, credits, price, desc, highlight }) => (
              <Card key={name} className={`border-2 ${highlight ? "border-primary" : "border-muted"}`}>
                <CardContent className="pt-6 text-center">
                  {highlight && <Badge className="mb-2 text-xs">Most popular</Badge>}
                  <p className="font-bold text-lg">{name}</p>
                  <p className="text-3xl font-bold my-2">{price}</p>
                  <p className="text-sm font-semibold text-primary mb-2">{credits}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-6">1 credit = 1 AI action (search, synthesis or bibliography)</p>
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
      <section className="py-20 px-4 bg-gradient-to-r from-sky-600 to-sky-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to find your sources in 2 minutes?</h2>
          <p className="text-sky-100 mb-8 text-lg">
            Join 12,000+ students who use Academik to save time on their academic research.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Get started — from €4.99 <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-sky-200 text-sm mt-4">No subscription · Secure payment · Instant results</p>
        </div>
      </section>

      {/* Partner banner */}
      <div className="py-5 px-4 bg-amber-50 border-y border-amber-100 text-center text-sm">
        <p className="text-muted-foreground">
          Need expert help <strong>writing your dissertation or thesis</strong>?{" "}
          <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="text-primary font-semibold underline underline-offset-2 hover:opacity-80">
            Rédacteur Mémoire
          </a>{" "}
          — personalised academic coaching by expert tutors (French-speaking).
        </p>
      </div>

      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-semibold">Academik</span>
            <span>— AI Research Tool for Students</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/en/dissertation-help")}>Dissertation Help</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/en/literature-review")}>Literature Review</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>Sign in</span>
            <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="hover:text-foreground">Rédacteur Mémoire</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
