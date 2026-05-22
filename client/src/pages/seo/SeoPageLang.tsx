import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, GraduationCap, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface SeoPageData {
  lang: string;
  htmlLang: string;
  hreflangs: { lang: string; href: string }[];
  canonical: string;
  title: string;
  metaDesc: string;
  ogTitle: string;
  ogDesc: string;
  badge: string;
  h1a: string;
  h1b: string;
  heroDesc: string;
  heroCountries: string;
  ctaBtn: string;
  ctaSecondary: string;
  checkFrom: string;
  checkNoSub: string;
  checkSpeed: string;
  statStudents: string;
  statBibs: string;
  statRating: string;
  statTime: string;
  statStudentsLabel: string;
  statBibsLabel: string;
  statRatingLabel: string;
  statTimeLabel: string;
  whatTitle: string;
  whatP1: string;
  whatP2: string;
  whatP3: string;
  exampleLabel1: string;
  exampleLabel2: string;
  exampleLabel3: string;
  example1: string;
  example2: string;
  example3: string;
  howTitle: string;
  howSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  featuresTitle: string;
  featuresSubtitle: string;
  features: { title: string; desc: string }[];
  whoTitle: string;
  who: { title: string; desc: string; tags: string[] }[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  ctaTitle: string;
  ctaDesc: string;
  ctaMainBtn: string;
  ctaSub: string;
  partnerText1: string;
  partnerBold: string;
  partnerText2: string;
  footerTagline: string;
  footerHome: string;
  footerLogin: string;
  footerFr?: string;
  footerFrUrl?: string;
  schemaName: string;
  schemaDesc: string;
  accentColor: string;
}

export default function SeoPageLang({ data }: { data: SeoPageData }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = data.title;
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content", data.metaDesc);
    setMeta('meta[property="og:title"]', "content", data.ogTitle);
    setMeta('meta[property="og:description"]', "content", data.ogDesc);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = data.canonical;

    // Remove old hreflangs
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    data.hreflangs.forEach(({ lang, href }) => {
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
        "name": data.schemaName,
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": data.schemaDesc,
        "offers": { "@type": "Offer", "price": "4.99", "priceCurrency": "EUR" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "127" },
        "inLanguage": data.htmlLang
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": data.faq.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
      }
    ]);
    document.head.appendChild(script);
    document.documentElement.lang = data.htmlLang;
    return () => { script.remove(); };
  }, [data]);

  const accentGrad = data.accentColor === "violet"
    ? "from-violet-50/60 to-background"
    : data.accentColor === "blue"
    ? "from-blue-50/60 to-background"
    : data.accentColor === "green"
    ? "from-green-50/60 to-background"
    : data.accentColor === "orange"
    ? "from-orange-50/60 to-background"
    : data.accentColor === "red"
    ? "from-red-50/60 to-background"
    : data.accentColor === "purple"
    ? "from-purple-50/60 to-background"
    : data.accentColor === "teal"
    ? "from-teal-50/60 to-background"
    : "from-indigo-50/60 to-background";

  const ctaGrad = data.accentColor === "violet"
    ? "from-violet-600 to-violet-700"
    : data.accentColor === "blue"
    ? "from-blue-600 to-blue-700"
    : data.accentColor === "green"
    ? "from-green-600 to-green-700"
    : data.accentColor === "orange"
    ? "from-orange-600 to-orange-700"
    : data.accentColor === "red"
    ? "from-red-600 to-red-700"
    : data.accentColor === "purple"
    ? "from-purple-600 to-purple-700"
    : data.accentColor === "teal"
    ? "from-teal-600 to-teal-700"
    : "from-indigo-600 to-indigo-700";

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">Academik</span>
          </div>
          <div className="flex items-center gap-2">
            {data.footerFr && (
              <span className="text-sm text-muted-foreground cursor-pointer hover:text-foreground hidden sm:block"
                onClick={() => setLocation(data.footerFrUrl || "/")}>
                {data.footerFr}
              </span>
            )}
            <Button onClick={() => setLocation("/connexion")} size="sm" data-testid="button-nav-cta">
              {data.ctaBtn} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </nav>

      <section className={`py-20 px-4 text-center bg-gradient-to-b ${accentGrad}`}>
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ {data.badge}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {data.h1a}{" "}
            <span className="text-primary">{data.h1b}</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">{data.heroDesc}</p>
          <p className="text-muted-foreground mb-8 text-sm">{data.heroCountries}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              {data.ctaBtn} <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/")}>{data.ctaSecondary}</Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> {data.checkFrom}</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> {data.checkNoSub}</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> {data.checkSpeed}</span>
          </div>
        </div>
      </section>

      <section className="py-10 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, val: data.statStudents, label: data.statStudentsLabel },
            { icon: FileText, val: data.statBibs, label: data.statBibsLabel },
            { icon: Star, val: data.statRating, label: data.statRatingLabel },
            { icon: Clock, val: data.statTime, label: data.statTimeLabel },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              <p className="text-2xl font-bold">{val}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">{data.whatTitle}</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">{data.whatP1}</p>
              <p className="text-muted-foreground mb-4 leading-relaxed">{data.whatP2}</p>
              <p className="text-muted-foreground leading-relaxed">{data.whatP3}</p>
            </div>
            <div className="space-y-3">
              <div className="bg-muted/40 rounded-lg p-4 font-mono text-sm border-l-4 border-primary">
                <p className="text-xs text-muted-foreground mb-2 font-sans">{data.exampleLabel1}</p>
                <span dangerouslySetInnerHTML={{ __html: data.example1 }} />
              </div>
              <div className="bg-muted/40 rounded-lg p-4 font-mono text-sm border-l-4 border-blue-400">
                <p className="text-xs text-muted-foreground mb-2 font-sans">{data.exampleLabel2}</p>
                <span dangerouslySetInnerHTML={{ __html: data.example2 }} />
              </div>
              <div className="bg-muted/40 rounded-lg p-4 font-mono text-sm border-l-4 border-green-400">
                <p className="text-xs text-muted-foreground mb-2 font-sans">{data.exampleLabel3}</p>
                <span dangerouslySetInnerHTML={{ __html: data.example3 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{data.howTitle}</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">{data.howSubtitle}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: Search, title: data.step1Title, desc: data.step1Desc },
              { step: "2", icon: Zap, title: data.step2Title, desc: data.step2Desc },
              { step: "3", icon: FileText, title: data.step3Title, desc: data.step3Desc },
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

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">{data.featuresTitle}</h2>
          <p className="text-center text-muted-foreground mb-12">{data.featuresSubtitle}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.features.map(({ title, desc }) => (
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

      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{data.whoTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {data.who.map(({ title, desc, tags }, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    {i === 0 ? <GraduationCap className="w-5 h-5 text-primary" /> : i === 1 ? <Search className="w-5 h-5 text-primary" /> : <Users className="w-5 h-5 text-primary" />}
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

      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{data.faqTitle}</h2>
          <div className="space-y-4">
            {data.faq.map(({ q, a }) => (
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

      <section className={`py-20 px-4 bg-gradient-to-r ${ctaGrad} text-white text-center`}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">{data.ctaTitle}</h2>
          <p className="mb-8 text-lg opacity-90">{data.ctaDesc}</p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            {data.ctaMainBtn} <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-sm mt-4 opacity-75">{data.ctaSub}</p>
        </div>
      </section>

      <div className="py-5 px-4 bg-amber-50 border-y border-amber-100 text-center text-sm">
        <p className="text-muted-foreground">
          {data.partnerText1} <strong>{data.partnerBold}</strong>{data.partnerText2}{" "}
          <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="text-primary font-semibold underline underline-offset-2 hover:opacity-80">
            Rédacteur Mémoire
          </a>
        </p>
      </div>

      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-semibold">Academik</span>
            <span>— {data.footerTagline}</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/")}>{data.footerHome}</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>{data.footerLogin}</span>
            <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="hover:text-foreground">Rédacteur Mémoire</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
