import { useState, useEffect } from "react";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n, LanguageSelector } from "@/lib/i18n";
import { useCheckout, useConfirmPayment } from "@/hooks/use-entitlements";
import { useModuleVisibility, isModuleVisible } from "@/hooks/use-admin";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight, BookOpen, GraduationCap, Sparkles, BrainCircuit,
  FileText, Search, FlaskConical, CheckCircle2, Lightbulb, Map,
  BookMarked, Award, Briefcase, ClipboardList, ChevronDown, ChevronUp,
  Loader2, Mic, BarChart3, FileCheck, Presentation, ShieldCheck, Package, PenTool,
  ChevronLeft, ChevronRight, Calendar, Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { BLOG_ARTICLES } from "@/pages/Blog";

const CORE_PACK_PRICE = 179;

const OPTION_CATALOG = {
  collecte: [
    { key: "questionnaire", price: 25, fr: "Questionnaire (collecte)", en: "Questionnaire (Collection)" },
    { key: "guide_entretien", price: 25, fr: "Guide d'entretien (collecte)", en: "Interview Guide (Collection)" },
    { key: "simulation_entretien", price: 19, fr: "Simulation d'entretien guidée", en: "Guided Interview Simulation" },
    { key: "questionnaire_analysis", price: 29, fr: "Dépouillement du questionnaire", en: "Questionnaire Analysis" },
  ],
  analyse: [
    { key: "data_visualization", price: 25, fr: "Analyse et visualisation des données", en: "Data Analysis & Visualization" },
    { key: "confrontation", price: 19, fr: "Confrontation des résultats", en: "Results Confrontation" },
    { key: "hypothesis_validation", price: 19, fr: "Validation des hypothèses", en: "Hypothesis Validation" },
    { key: "formulaire", price: 25, fr: "Formulaire en ligne", en: "Online Form Builder" },
    { key: "financial_simulation", price: 29, fr: "Simulation financière", en: "Financial Simulation" },
    { key: "analyse_qualitative", price: 39, fr: "Analyse qualitative (verbatims, codage, synthèse)", en: "Qualitative Analysis (verbatims, coding, synthesis)" },
    { key: "analyse_quantitative", price: 39, fr: "Analyse quantitative (tableaux + graphiques)", en: "Quantitative Analysis (tables + charts)" },
  ],
  revue: [
    { key: "article_analysis", price: 29, fr: "Résumé & analyse d'articles", en: "Article Summary & Analysis" },
    { key: "article_confrontation", price: 29, fr: "Confrontation d'articles", en: "Article Confrontation" },
    { key: "biblio_multinormes", price: 25, fr: "Bibliographie multi-normes (APA, Vancouver, MLA, Chicago)", en: "Multi-standard Bibliography (APA, Vancouver, MLA, Chicago)" },
  ],
  soutenance: [
    { key: "soutenance_ppt", price: 29, fr: "PowerPoint de soutenance structuré", en: "Structured Defense PowerPoint" },
    { key: "soutenance_simulation", price: 29, fr: "Simulation de soutenance (questions jury)", en: "Defense Simulation (jury questions)" },
    { key: "audit", price: 49, fr: "Audit complet du mémoire", en: "Complete Dissertation Audit" },
  ],
  redaction: [
    { key: "remerciements", price: 9, fr: "Page de remerciements", en: "Acknowledgments Page" },
    { key: "abstract_resume", price: 9, fr: "Résumé / Abstract", en: "Abstract / Summary" },
    { key: "sigles_acronymes", price: 9, fr: "Sigles et acronymes", en: "Abbreviations & Acronyms" },
    { key: "cover_page", price: 15, fr: "Page de couverture", en: "Cover Page" },
  ],
  confort: [
    { key: "export_illimite", price: 19, fr: "Export illimité Word / PPT", en: "Unlimited Word / PPT Export" },
    { key: "fusion_memoire", price: 19, fr: "Fusion mémoire en un document", en: "Merge Dissertation into One Document" },
  ],
  ia: [
    { key: "words_20k", price: 19, fr: "+20 000 mots", en: "+20,000 Words" },
    { key: "words_50k", price: 39, fr: "+50 000 mots", en: "+50,000 Words" },
    { key: "extra_project", price: 29, fr: "Projet supplémentaire", en: "Additional Project" },
  ],
};

const PACK_OPTIONS: Record<string, { keys: string[]; price: number; fr: string; en: string }> = {
  pack_collecte: { keys: ["questionnaire", "guide_entretien"], price: 49, fr: "Pack Collecte", en: "Collection Pack" },
  pack_analyse: { keys: ["analyse_qualitative", "analyse_quantitative"], price: 69, fr: "Pack Analyse", en: "Analysis Pack" },
  pack_revue: { keys: ["article_analysis", "article_confrontation", "biblio_multinormes"], price: 59, fr: "Pack Revue avancée", en: "Advanced Review Pack" },
  pack_soutenance: { keys: ["soutenance_ppt", "soutenance_simulation", "audit"], price: 79, fr: "Pack Soutenance & Audit", en: "Defense & Audit Pack" },
};

export default function Landing() {
  const { t, tArray, lang } = useI18n();

  const faqItems = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
    { q: t("faq.q6"), a: t("faq.a6") },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a }
    }))
  };

  const appJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Academik",
    "url": "https://academik.fr",
    "description": t("seo.landingDescription"),
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "179", "priceCurrency": "EUR" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.95", "reviewCount": "238", "ratingCount": "238", "bestRating": "5", "worstRating": "1" },
    "creator": {
      "@type": "Organization",
      "name": "Performance Consulting Groupe SAS",
      "url": "https://academik.fr",
      "logo": "https://academik.fr/images/logo-512.png"
    },
    "inLanguage": ["fr", "en"]
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SEO titleKey="seo.landingTitle" descriptionKey="seo.landingDescription" keywordsKey="seo.landingKeywords" canonicalPath="/" ogType="website" jsonLd={[appJsonLd, faqJsonLd]} />
      <Navbar />
      <HeroSection />
      <ProjectTypesBar />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection faqItems={faqItems} />
      <BlogSection />
      <Footer />
    </div>
  );
}

function Navbar() {
  const { t, lang } = useI18n();
  return (
    <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
            A
          </div>
          <span className="font-bold text-xl tracking-tight">Academik</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <a href="#features">
            <Button variant="ghost" className="hidden sm:flex" data-testid="nav-features">{t("nav.features")}</Button>
          </a>
          <a href="#pricing">
            <Button variant="ghost" className="hidden sm:flex" data-testid="nav-pricing">{t("nav.pricing")}</Button>
          </a>
          <LanguageSelector />
          <a href="/api/login">
            <Button variant="outline" data-testid="button-login">{t("nav.signIn")}</Button>
          </a>
          <a href="/api/login">
            <Button data-testid="button-signup">
              {lang === "fr" ? "S'inscrire" : "Sign Up"}
            </Button>
          </a>
        </div>
      </div>
    </nav>
  );
}

const HERO_IMAGES = [
  { src: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80", alt: "Academic Library" },
  { src: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80", alt: "Writing Workspace" },
  { src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80", alt: "Student Collaboration" },
];

function HeroSection() {
  const { t, lang } = useI18n();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const touchStartX = useState<number | null>(null);

  const goTo = (idx: number) => {
    if (idx < 0) setCarouselIndex(HERO_IMAGES.length - 1);
    else if (idx >= HERO_IMAGES.length) setCarouselIndex(0);
    else setCarouselIndex(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX[1](e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartX[0];
    if (startX === null) return;
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? carouselIndex + 1 : carouselIndex - 1);
    }
    touchStartX[1](null);
  };

  return (
    <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center space-y-8 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium inline-block mb-6">
            {t("hero.badge")}
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            {t("hero.title1")} <br />
            <span className="gradient-text">{t("hero.title2")}</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/api/login">
              <Button size="lg" className="shadow-xl shadow-primary/20" data-testid="button-hero-cta">
                {t("hero.cta")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <a href="/api/login">
              <Button size="lg" variant="outline" data-testid="button-hero-signup">
                {lang === "fr" ? "S'inscrire sur la plateforme" : "Sign up on the platform"}
              </Button>
            </a>
          </div>
        </motion.div>
      </div>

      <div className="mt-16 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-full w-full pointer-events-none" />

        <div className="hidden md:grid grid-cols-3 gap-6 opacity-80">
          <img
            src={HERO_IMAGES[0].src}
            alt={HERO_IMAGES[0].alt}
            className="rounded-2xl shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 h-56 w-full object-cover"
          />
          <img
            src={HERO_IMAGES[1].src}
            alt={HERO_IMAGES[1].alt}
            className="rounded-2xl shadow-2xl transform translate-y-8 hover:translate-y-4 transition-transform duration-500 h-56 w-full object-cover"
          />
          <img
            src={HERO_IMAGES[2].src}
            alt={HERO_IMAGES[2].alt}
            className="rounded-2xl shadow-2xl transform rotate-[2deg] hover:rotate-0 transition-transform duration-500 h-56 w-full object-cover"
          />
        </div>

        <div
          className="md:hidden relative opacity-80"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          data-testid="hero-carousel"
        >
          <div className="overflow-hidden rounded-2xl shadow-2xl">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            >
              {HERO_IMAGES.map((img, i) => (
                <img
                  key={i}
                  src={img.src}
                  alt={img.alt}
                  className="w-full flex-shrink-0 h-48 object-cover"
                  data-testid={`hero-image-${i}`}
                />
              ))}
            </div>
          </div>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => goTo(carouselIndex - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm shadow-md"
            aria-label="Image précédente"
            data-testid="button-carousel-prev"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => goTo(carouselIndex + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm shadow-md"
            aria-label="Image suivante"
            data-testid="button-carousel-next"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="flex justify-center gap-2 mt-3">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === carouselIndex ? "bg-primary w-4" : "bg-muted-foreground/30"}`}
                aria-label={`Image ${i + 1}`}
                data-testid={`button-carousel-dot-${i}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectTypesBar() {
  const { t } = useI18n();
  const types = [
    { icon: GraduationCap, label: t("features.memoire") },
    { icon: ClipboardList, label: t("features.tfe") },
    { icon: BookOpen, label: t("features.these") },
    { icon: Award, label: t("features.vae") },
    { icon: Briefcase, label: t("features.rapportStage") },
  ];

  return (
    <section className="py-8 border-y border-border/30 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-muted-foreground mb-4 font-medium uppercase tracking-wider">
          {t("features.projectTypes")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {types.map((type, i) => (
            <div key={i} className="flex items-center gap-2 text-muted-foreground">
              <type.icon className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{type.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { t, tArray } = useI18n();

  const allModules = [
    { icon: BrainCircuit, titleKey: "features.feat1Title", descKey: "features.feat1Desc", detailsKey: "features.feat1Details", color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { icon: Search, titleKey: "features.feat2Title", descKey: "features.feat2Desc", detailsKey: "features.feat2Details", color: "text-indigo-500", bgColor: "bg-indigo-500/10" },
    { icon: FlaskConical, titleKey: "features.feat3Title", descKey: "features.feat3Desc", detailsKey: "features.feat3Details", color: "text-cyan-500", bgColor: "bg-cyan-500/10" },
    { icon: FileText, titleKey: "features.feat4Title", descKey: "features.feat4Desc", detailsKey: "features.feat4Details", color: "text-orange-500", bgColor: "bg-orange-500/10" },
    { icon: ShieldCheck, titleKey: "features.feat5Title", descKey: "features.feat5Desc", detailsKey: "features.feat5Details", color: "text-teal-500", bgColor: "bg-teal-500/10" },
  ];
  const totalCount = allModules.length;

  return (
    <section id="features" className="py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{t("features.sectionTitle")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("features.sectionSubtitle")}</p>
        </div>

        <div className="space-y-8">
          {allModules.map((mod, index) => (
            <FeatureModule key={index} mod={mod} index={index} total={totalCount} t={t} tArray={tArray} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureModule({ mod, index, total, t, tArray }: { mod: any; index: number; total: number; t: (k: string) => string; tArray: (k: string) => string[] }) {
  const [expanded, setExpanded] = useState(false);
  const details = tArray(mod.detailsKey);
  const Icon = mod.icon;
  const isEven = index % 2 === 0;

  return (
    <Card className="overflow-visible" data-testid={`feature-module-${index}`}>
      <CardContent className="p-6 sm:p-8">
        <div className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-6 items-start`}>
          <div className="flex-shrink-0">
            <div className={`w-14 h-14 rounded-xl ${mod.bgColor} ${mod.color} flex items-center justify-center`}>
              <Icon className="w-7 h-7" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <Badge variant="secondary" className="mb-2 text-xs">
                  {index + 1}/{total}
                </Badge>
                <h3 className="text-xl font-bold mb-2">{t(mod.titleKey)}</h3>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">{t(mod.descKey)}</p>

            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm text-primary font-medium hover-elevate px-2 py-1 rounded-md"
              data-testid={`button-expand-feature-${index}`}
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {expanded ? (t("common.close")) : "Voir le détail"}
            </button>

            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                {details.map((detail: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${mod.color}`} />
                    <span>{detail}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PricingSection() {
  const { t, tArray, lang } = useI18n();
  const { user } = useAuth();
  const checkout = useCheckout();
  const confirmPayment = useConfirmPayment();
  const { toast } = useToast();
  const { data: moduleVis } = useModuleVisibility();
  const [coreSelected, setCoreSelected] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
  const [selectedPacks, setSelectedPacks] = useState<Record<string, boolean>>({});
  const [selectionsRestored, setSelectionsRestored] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");
    if (payment === "success" && sessionId) {
      confirmPayment.mutate(sessionId, {
        onSuccess: () => {
          localStorage.removeItem("academik_pricing_selection");
          toast({ title: "Paiement confirmé", description: "Vos modules ont été activés avec succès." });
          window.history.replaceState({}, "", window.location.pathname);
        },
        onError: () => {
          toast({ title: "Erreur", description: "Impossible de confirmer le paiement. Contactez le support.", variant: "destructive" });
        },
      });
    } else if (payment === "cancelled") {
      toast({ title: "Paiement annulé", description: "Votre paiement a été annulé." });
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (selectionsRestored) return;
    try {
      const saved = localStorage.getItem("academik_pricing_selection");
      if (saved) {
        const data = JSON.parse(saved);
        const maxAge = 30 * 60 * 1000;
        if (data.timestamp && Date.now() - data.timestamp < maxAge) {
          if (data.coreSelected) setCoreSelected(true);
          if (data.selectedOptions) setSelectedOptions(data.selectedOptions);
          if (data.selectedPacks) setSelectedPacks(data.selectedPacks);
          if (user) {
            localStorage.removeItem("academik_pricing_selection");
            setTimeout(() => {
              const pricingEl = document.getElementById("pricing");
              if (pricingEl) pricingEl.scrollIntoView({ behavior: "smooth" });
            }, 500);
          }
        } else {
          localStorage.removeItem("academik_pricing_selection");
        }
      }
    } catch {}
    setSelectionsRestored(true);
  }, [user, selectionsRestored]);

  const handleOptionToggle = (key: string) => {
    setSelectedOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePackToggle = (packKey: string) => {
    const packDef = PACK_OPTIONS[packKey];
    if (!packDef) return;
    const isActive = !selectedPacks[packKey];
    setSelectedPacks(prev => ({ ...prev, [packKey]: isActive }));
    if (isActive) {
      const newOpts = { ...selectedOptions };
      packDef.keys.forEach(k => { newOpts[k] = false; });
      setSelectedOptions(newOpts);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      localStorage.setItem("academik_pricing_selection", JSON.stringify({
        coreSelected,
        selectedOptions,
        selectedPacks,
        timestamp: Date.now(),
      }));
      window.location.href = "/api/login";
      return;
    }
    const items: string[] = [];
    if (coreSelected) items.push("core_pack");
    Object.entries(selectedPacks).filter(([, v]) => v).forEach(([packKey]) => {
      items.push(packKey);
    });
    Object.entries(selectedOptions).filter(([, v]) => v).forEach(([key]) => {
      const isInPack = Object.entries(selectedPacks).some(([pk, active]) => active && PACK_OPTIONS[pk]?.keys.includes(key));
      if (!isInPack) items.push(key);
    });
    if (items.length > 0) {
      checkout.mutate({ items }, {
        onError: (err: any) => {
          toast({ title: "Erreur de paiement", description: err.message || "Impossible de procéder au paiement. Veuillez réessayer.", variant: "destructive" });
        },
      });
    }
  };

  const optionsTotal = Object.entries(selectedOptions)
    .filter(([key, v]) => {
      if (!v) return false;
      const isInPack = Object.entries(selectedPacks).some(([pk, active]) => active && PACK_OPTIONS[pk]?.keys.includes(key));
      return !isInPack;
    })
    .reduce((sum, [key]) => {
      const allItems = Object.values(OPTION_CATALOG).flat();
      const item = allItems.find(i => i.key === key);
      return sum + (item?.price || 0);
    }, 0);

  const packsTotal = Object.entries(selectedPacks)
    .filter(([, v]) => v)
    .reduce((sum, [key]) => sum + (PACK_OPTIONS[key]?.price || 0), 0);

  const total = (coreSelected ? CORE_PACK_PRICE : 0) + optionsTotal + packsTotal;

  const filterItems = (items: typeof OPTION_CATALOG.collecte) =>
    items.filter(item => isModuleVisible(moduleVis, item.key));

  const categories: { catKey: string; titleKey: string; icon: any; items: typeof OPTION_CATALOG.collecte; packKey?: string }[] = [
    { catKey: "collecte", titleKey: "pricing.catCollecte", icon: Mic, items: filterItems(OPTION_CATALOG.collecte), packKey: "pack_collecte" },
    { catKey: "analyse", titleKey: "pricing.catAnalyse", icon: BarChart3, items: filterItems(OPTION_CATALOG.analyse), packKey: "pack_analyse" },
    { catKey: "revue", titleKey: "pricing.catRevue", icon: Search, items: filterItems(OPTION_CATALOG.revue), packKey: "pack_revue" },
    { catKey: "soutenance", titleKey: "pricing.catSoutenance", icon: Presentation, items: filterItems(OPTION_CATALOG.soutenance), packKey: "pack_soutenance" },
    { catKey: "redaction", titleKey: "pricing.catRedaction", icon: PenTool, items: filterItems(OPTION_CATALOG.redaction) },
    { catKey: "confort", titleKey: "pricing.catConfort", icon: FileCheck, items: filterItems(OPTION_CATALOG.confort) },
    { catKey: "ia", titleKey: "pricing.catIA", icon: BrainCircuit, items: filterItems(OPTION_CATALOG.ia) },
  ].filter(cat => cat.items.length > 0);

  const coreIncludes = tArray("pricing.corePackIncludes");

  return (
    <section id="pricing" className="py-20 bg-muted/20 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{t("pricing.sectionTitle")}</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">{t("pricing.sectionSubtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card
              className={`cursor-pointer transition-all border-2 ${coreSelected ? "border-primary bg-primary/5" : "border-border/50"}`}
              onClick={() => setCoreSelected(!coreSelected)}
              data-testid="pricing-core-pack"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={coreSelected} onCheckedChange={() => setCoreSelected(!coreSelected)} data-testid="checkbox-core-pack" />
                    <div>
                      <CardTitle className="text-lg">{t("pricing.corePackTitle")}</CardTitle>
                      <p className="text-sm text-muted-foreground">{t("pricing.corePackSubtitle")}</p>
                    </div>
                  </div>
                  <Badge className="text-lg font-extrabold px-4 py-1">{CORE_PACK_PRICE} &euro;</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">{t("pricing.corePackDesc")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {coreIncludes.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <h3 className="text-xl font-bold mb-1">{t("pricing.optionsTitle")}</h3>
              <p className="text-sm text-muted-foreground">{t("pricing.optionsSubtitle")}</p>
            </div>

            {categories.map(({ catKey, titleKey, icon: CatIcon, items, packKey }) => {
              const packDef = packKey ? PACK_OPTIONS[packKey] : null;
              const packActive = packKey ? !!selectedPacks[packKey] : false;

              return (
                <Card key={catKey}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <CatIcon className="w-5 h-5 text-primary" />
                      <CardTitle className="text-base">{t(titleKey)}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {items.map((item) => {
                      const isInActivePack = packActive && packDef?.keys.includes(item.key);
                      return (
                        <label
                          key={item.key}
                          className={`flex items-center justify-between gap-4 p-3 rounded-lg border border-border/50 cursor-pointer hover-elevate transition-all ${isInActivePack ? "opacity-50" : ""}`}
                          data-testid={`pricing-option-${item.key}`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isInActivePack || !!selectedOptions[item.key]}
                              disabled={isInActivePack}
                              onCheckedChange={() => handleOptionToggle(item.key)}
                              data-testid={`checkbox-option-${item.key}`}
                            />
                            <span className="text-sm font-medium">{lang === "fr" ? item.fr : item.en}</span>
                          </div>
                          <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">{item.price} &euro;</span>
                        </label>
                      );
                    })}
                    {packDef && (
                      <div
                        onClick={() => handlePackToggle(packKey!)}
                        className={`flex items-center justify-between gap-4 p-3 rounded-lg border-2 cursor-pointer transition-all mt-2 ${
                          packActive ? "border-primary bg-primary/5" : "border-dashed border-primary/30 hover-elevate"
                        }`}
                        data-testid={`pricing-pack-${packKey}`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox checked={packActive} onCheckedChange={() => handlePackToggle(packKey!)} />
                          <div>
                            <span className="text-sm font-bold flex items-center gap-2">
                              <Package className="w-4 h-4 text-primary" />
                              {lang === "fr" ? packDef.fr : packDef.en}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {lang === "fr" ? "Tout inclus, économisez !" : "All included, save!"}
                            </span>
                          </div>
                        </div>
                        <Badge className="font-extrabold">{packDef.price} &euro;</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="space-y-6">
            <div className="sticky top-20">
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <p className="text-sm opacity-80 uppercase tracking-wider">{t("pricing.total")}</p>
                    <p className="text-4xl font-extrabold" data-testid="text-pricing-total">
                      {total} &euro;
                    </p>
                    {coreSelected && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        Pack Fondations
                      </Badge>
                    )}
                    <div className="text-left text-sm space-y-1 opacity-90">
                      {coreSelected && <div className="flex justify-between gap-2"><span>{t("pricing.corePackTitle")}</span><span>{CORE_PACK_PRICE} &euro;</span></div>}
                      {Object.entries(selectedPacks).filter(([, v]) => v).map(([pk]) => (
                        <div key={pk} className="flex justify-between gap-2"><span>{lang === "fr" ? PACK_OPTIONS[pk].fr : PACK_OPTIONS[pk].en}</span><span>{PACK_OPTIONS[pk].price} &euro;</span></div>
                      ))}
                      {Object.entries(selectedOptions).filter(([key, v]) => {
                        if (!v) return false;
                        return !Object.entries(selectedPacks).some(([pk, active]) => active && PACK_OPTIONS[pk]?.keys.includes(key));
                      }).map(([key]) => {
                        const item = Object.values(OPTION_CATALOG).flat().find(i => i.key === key);
                        if (!item) return null;
                        return <div key={key} className="flex justify-between gap-2"><span>{lang === "fr" ? item.fr : item.en}</span><span>{item.price} &euro;</span></div>;
                      })}
                    </div>
                    <Button
                      size="lg"
                      variant="secondary"
                      className="w-full mt-2"
                      disabled={total === 0 || checkout.isPending}
                      onClick={handleCheckout}
                      data-testid="button-pay-activate"
                    >
                      {checkout.isPending ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
                      {t("pricing.payAndActivate")}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { lang } = useI18n();

  const testimonials = [
    {
      name: "Aminata Diallo",
      role: lang === "fr" ? "Master 2 en Sciences de l'Éducation" : "Master's in Education Sciences",
      image: "/images/testimonial-1.png",
      quote: lang === "fr"
        ? "J'étais complètement perdue dans la rédaction de mon mémoire. La problématique, les hypothèses, le cadre théorique... tout me semblait flou. Cet outil m'a permis de structurer ma pensée étape par étape. Mon directeur de mémoire a été impressionné par la qualité de mon plan. Je n'aurais jamais pu y arriver seule en si peu de temps."
        : "I was completely lost writing my dissertation. The research question, hypotheses, theoretical framework... everything seemed unclear. This tool helped me structure my thinking step by step. My supervisor was impressed by the quality of my outline. I could never have achieved this alone in such a short time.",
    },
    {
      name: "Thomas Mercier",
      role: lang === "fr" ? "Doctorant en Sociologie, Université de Lyon" : "PhD Candidate in Sociology, University of Lyon",
      image: "/images/testimonial-2.png",
      quote: lang === "fr"
        ? "Après trois ans de terrain et des centaines de pages de verbatims, je n'arrivais pas à prendre du recul pour construire mon cadre conceptuel. L'assistant m'a aidé à identifier les tensions théoriques dans mes données et à articuler ma revue de littérature avec ma méthodologie. C'est devenu un vrai compagnon de réflexion académique."
        : "After three years of fieldwork and hundreds of pages of verbatims, I couldn't step back to build my conceptual framework. The assistant helped me identify theoretical tensions in my data and articulate my literature review with my methodology. It became a true companion for academic reflection.",
    },
    {
      name: "Ousmane Kaboré",
      role: lang === "fr" ? "TFE en Gestion des Ressources Humaines" : "Final Year Project in HR Management",
      image: "/images/testimonial-3.png",
      quote: lang === "fr"
        ? "Je travaille à temps plein et je devais rédiger mon TFE en parallèle. Le temps me manquait cruellement. Grâce à la génération de plan et la simulation d'entretien, j'ai gagné des semaines de travail. La qualité méthodologique de mon travail a été saluée par le jury. Je recommande sans hésiter."
        : "I work full-time and had to write my final year project simultaneously. Time was desperately short. Thanks to the plan generation and interview simulation, I saved weeks of work. The methodological quality of my work was praised by the jury. I recommend without hesitation.",
    },
    {
      name: "Claire Fontaine",
      role: lang === "fr" ? "VAE en Management, 15 ans d'expérience" : "Prior Learning Assessment in Management, 15 years experience",
      image: "/images/testimonial-4.png",
      quote: lang === "fr"
        ? "Reprendre des études après 15 ans dans le monde professionnel, c'est un défi énorme. Je ne savais plus comment rédiger un travail académique. L'outil m'a guidée pour transformer mon expérience terrain en analyse structurée. Mon rapport de VAE a été validé du premier coup. Une aide précieuse pour les professionnels en reconversion."
        : "Going back to school after 15 years in the professional world is a huge challenge. I no longer knew how to write academic work. The tool guided me to transform my field experience into structured analysis. My VAE report was validated on the first attempt. Invaluable help for professionals in career transition.",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            {lang === "fr" ? "Ils ont réussi avec notre accompagnement" : "They succeeded with our support"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {lang === "fr"
              ? "Découvrez les témoignages d'étudiants et professionnels qui ont transformé leur parcours académique."
              : "Discover testimonials from students and professionals who transformed their academic journey."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <Card key={i} className="overflow-visible" data-testid={`testimonial-card-${i}`}>
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20 flex-shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-base">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <blockquote className="text-sm leading-relaxed text-muted-foreground italic">
                  "{t.quote}"
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection({ faqItems }: { faqItems: { q: string; a: string }[] }) {
  const { t } = useI18n();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" data-testid="text-faq-title">
            {t("faq.title")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("faq.subtitle")}
          </p>
        </div>

        <div className="space-y-3" data-testid="faq-list">
          {faqItems.map((item, i) => (
            <Card key={i} className="overflow-visible" data-testid={`faq-item-${i}`}>
              <CardContent className="p-0">
                <button
                  className="flex items-center justify-between gap-4 w-full p-5 text-left hover-elevate rounded-md"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  data-testid={`button-faq-toggle-${i}`}
                >
                  <span className="font-semibold text-sm sm:text-base">{item.q}</span>
                  {openIndex === i ? <ChevronUp className="w-5 h-5 flex-shrink-0 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 flex-shrink-0 text-muted-foreground" />}
                </button>
                {openIndex === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="px-5 pb-5"
                  >
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function BlogSection() {
  const { lang } = useI18n();
  const preview = BLOG_ARTICLES.slice(0, 3);

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <BookOpen className="w-3 h-3 mr-1" />
            {lang === "fr" ? "Ressources" : "Resources"}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4" data-testid="text-blog-section-title">
            {lang === "fr" ? "Guide de rédaction académique" : "Academic Writing Guide"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {lang === "fr"
              ? "Des articles méthodologiques pour vous accompagner à chaque étape de votre travail académique."
              : "Methodological articles to guide you through every step of your academic work."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {preview.map((article, i) => (
            <Link key={article.slug} href={`/blog/${article.slug}`}>
              <Card className="hover-elevate cursor-pointer overflow-visible h-full" data-testid={`blog-preview-card-${i}`}>
                <CardContent className="p-6 flex flex-col gap-3 h-full">
                  <h3 className="text-lg font-bold leading-snug">
                    {lang === "fr" ? article.titleFr : article.titleEn}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {lang === "fr" ? article.descFr : article.descEn}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.date).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readMinutes} min
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href="/blog">
            <Button variant="outline" data-testid="link-blog-all">
              {lang === "fr" ? "Voir tous les articles" : "View all articles"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t, lang } = useI18n();
  return (
    <footer className="py-12 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
                A
              </div>
              <span className="font-bold text-lg">Academik</span>
            </div>
            <p className="text-sm text-muted-foreground text-center sm:text-right">
              {lang === "fr"
                ? "Un assistant méthodologique intelligent. Pas de rédaction clé en main, pas de triche académique."
                : "An intelligent methodological assistant. No turnkey writing, no academic cheating."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap">
            <Link href="/blog">
              <Button variant="ghost" size="sm" data-testid="link-footer-blog">
                Blog
              </Button>
            </Link>
            <Link href="/legal/cgu">
              <Button variant="ghost" size="sm" data-testid="link-footer-cgu">
                {lang === "fr" ? "CGU" : "Terms of Use"}
              </Button>
            </Link>
            <Link href="/legal/cgv">
              <Button variant="ghost" size="sm" data-testid="link-footer-cgv">
                {lang === "fr" ? "CGV" : "Terms of Sale"}
              </Button>
            </Link>
            <Link href="/legal/politique-de-confidentialite">
              <Button variant="ghost" size="sm" data-testid="link-footer-privacy">
                {lang === "fr" ? "Confidentialité" : "Privacy"}
              </Button>
            </Link>
            <a href="/api/login">
              <Button variant="outline" data-testid="button-footer-login">
                {lang === "fr" ? "Se connecter" : "Sign In"}
              </Button>
            </a>
            <a href="/api/login">
              <Button data-testid="button-footer-signup">
                {lang === "fr" ? "S'inscrire sur la plateforme" : "Sign up on the platform"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </a>
          </div>
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Performance Consulting Groupe SAS – SIREN 913 540 944</p>
            <p>3 Avenue de Toulouse, 66140 Canet-en-Roussillon – Capital social : 14 000 €</p>
            <p><a href="mailto:contact@academik.fr" className="hover:underline">contact@academik.fr</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
