import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useI18n, LanguageSelector } from "@/lib/i18n";
import { useCheckout, useConfirmPayment } from "@/hooks/use-entitlements";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight, BookOpen, GraduationCap, Sparkles, BrainCircuit,
  FileText, Search, FlaskConical, CheckCircle2, Lightbulb, Map,
  BookMarked, Award, Briefcase, ClipboardList, ChevronDown, ChevronUp,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";

const SECTION_PRICES = {
  foundation: 29,
  plan: 19,
  conceptual: 19,
  literature: 39,
  methodology: 29,
};

const OPTION_PRICES = {
  unlimitedRegen: 9,
  articleAnalysis: 15,
  multilingualEq: 9,
  advancedHistory: 9,
  multiExport: 9,
};

const BASE_PRICE = 19;

export default function Landing() {
  const { t, tArray, lang } = useI18n();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ProjectTypesBar />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
}

function Navbar() {
  const { t } = useI18n();
  return (
    <nav className="fixed w-full z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
            A
          </div>
          <span className="font-bold text-xl tracking-tight">Academic</span>
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
            <Button data-testid="button-login">{t("nav.signIn")}</Button>
          </a>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const { t } = useI18n();
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
            <a href="#features">
              <Button size="lg" variant="outline" data-testid="button-hero-demo">
                {t("hero.demo")}
              </Button>
            </a>
          </div>
        </motion.div>
      </div>

      <div className="mt-16 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 h-full w-full pointer-events-none" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80">
          <img
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80"
            alt="Academic Library"
            className="rounded-2xl shadow-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500 h-56 w-full object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80"
            alt="Writing Workspace"
            className="rounded-2xl shadow-2xl transform translate-y-8 hover:translate-y-4 transition-transform duration-500 h-56 w-full object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
            alt="Student Collaboration"
            className="rounded-2xl shadow-2xl transform rotate-[2deg] hover:rotate-0 transition-transform duration-500 h-56 w-full object-cover"
          />
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

  const modules = [
    {
      icon: BookOpen,
      titleKey: "features.module1Title",
      descKey: "features.module1Desc",
      detailsKey: "features.module1Details",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Map,
      titleKey: "features.module2Title",
      descKey: "features.module2Desc",
      detailsKey: "features.module2Details",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      icon: Lightbulb,
      titleKey: "features.module3Title",
      descKey: "features.module3Desc",
      detailsKey: "features.module3Details",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      icon: BookMarked,
      titleKey: "features.module4Title",
      descKey: "features.module4Desc",
      detailsKey: "features.module4Details",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: FlaskConical,
      titleKey: "features.module5Title",
      descKey: "features.module5Desc",
      detailsKey: "features.module5Details",
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
    },
  ];

  return (
    <section id="features" className="py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{t("features.sectionTitle")}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("features.sectionSubtitle")}</p>
        </div>

        <div className="space-y-8">
          {modules.map((mod, index) => (
            <FeatureModule key={index} mod={mod} index={index} t={t} tArray={tArray} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureModule({ mod, index, t, tArray }: { mod: any; index: number; t: (k: string) => string; tArray: (k: string) => string[] }) {
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
                  {index + 1}/5
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
  const { t } = useI18n();
  const { user } = useAuth();
  const checkout = useCheckout();
  const confirmPayment = useConfirmPayment();
  const { toast } = useToast();
  const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, boolean>>({});
  const [selectedPack, setSelectedPack] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const sessionId = params.get("session_id");
    if (payment === "success" && sessionId) {
      confirmPayment.mutate(sessionId, {
        onSuccess: () => {
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

  const handleCheckout = () => {
    if (!user) {
      window.location.href = "/api/login";
      return;
    }
    if (selectedPack) {
      checkout.mutate({ pack: selectedPack });
    } else {
      const items = [
        ...Object.entries(selectedSections).filter(([, v]) => v).map(([k]) => k),
        ...Object.entries(selectedOptions).filter(([, v]) => v).map(([k]) => k),
      ];
      if (items.length > 0) {
        checkout.mutate({ items });
      }
    }
  };

  const sections = [
    { key: "foundation", price: SECTION_PRICES.foundation },
    { key: "plan", price: SECTION_PRICES.plan },
    { key: "conceptual", price: SECTION_PRICES.conceptual },
    { key: "literature", price: SECTION_PRICES.literature },
    { key: "methodology", price: SECTION_PRICES.methodology },
  ];

  const options = [
    { key: "unlimitedRegen", price: OPTION_PRICES.unlimitedRegen },
    { key: "articleAnalysis", price: OPTION_PRICES.articleAnalysis },
    { key: "multilingualEq", price: OPTION_PRICES.multilingualEq },
    { key: "advancedHistory", price: OPTION_PRICES.advancedHistory },
    { key: "multiExport", price: OPTION_PRICES.multiExport },
  ];

  const sectionLabelMap: Record<string, string> = {
    foundation: t("pricing.foundation"),
    plan: t("pricing.plan"),
    conceptual: t("pricing.conceptual"),
    literature: t("pricing.literature"),
    methodology: t("pricing.methodology"),
  };

  const optionLabelMap: Record<string, string> = {
    unlimitedRegen: t("pricing.optUnlimitedRegen"),
    articleAnalysis: t("pricing.optArticleAnalysis"),
    multilingualEq: t("pricing.optMultilingualEq"),
    advancedHistory: t("pricing.optAdvancedHistory"),
    multiExport: t("pricing.optMultiExport"),
  };

  const handlePackSelect = (packKey: string) => {
    setSelectedPack(packKey);
    if (packKey === "essential") {
      setSelectedSections({ foundation: true, plan: true });
      setSelectedOptions({});
    } else if (packKey === "research") {
      setSelectedSections({ foundation: true, plan: true, literature: true, methodology: true });
      setSelectedOptions({});
    } else if (packKey === "complete") {
      setSelectedSections({ foundation: true, plan: true, conceptual: true, literature: true, methodology: true });
      setSelectedOptions({ unlimitedRegen: true, advancedHistory: true, multiExport: true });
    }
  };

  const handleSectionToggle = (key: string) => {
    setSelectedPack(null);
    setSelectedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOptionToggle = (key: string) => {
    setSelectedPack(null);
    setSelectedOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sectionsTotal = Object.entries(selectedSections)
    .filter(([, v]) => v)
    .reduce((sum, [key]) => sum + (SECTION_PRICES[key as keyof typeof SECTION_PRICES] || 0), 0);

  const optionsTotal = Object.entries(selectedOptions)
    .filter(([, v]) => v)
    .reduce((sum, [key]) => sum + (OPTION_PRICES[key as keyof typeof OPTION_PRICES] || 0), 0);

  const hasSections = Object.values(selectedSections).some(Boolean);
  const total = (hasSections ? BASE_PRICE : 0) + sectionsTotal + optionsTotal;

  const packPrices: Record<string, number> = {
    essential: 59,
    research: 99,
    complete: 129,
  };

  const displayTotal = selectedPack ? packPrices[selectedPack] : total;

  return (
    <section id="pricing" className="py-20 bg-muted/20 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{t("pricing.sectionTitle")}</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">{t("pricing.sectionSubtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <CardTitle className="text-lg">{t("pricing.baseAccess")}</CardTitle>
                  <Badge variant="outline" className="text-base font-bold">{BASE_PRICE} &euro;</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{t("pricing.baseDesc")}</p>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t("pricing.sections")}</CardTitle>
                <p className="text-sm text-muted-foreground">{t("pricing.sectionsDesc")}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {sections.map(({ key, price }) => (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/50 cursor-pointer hover-elevate transition-all"
                    data-testid={`pricing-section-${key}`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={!!selectedSections[key]}
                        onCheckedChange={() => handleSectionToggle(key)}
                        data-testid={`checkbox-section-${key}`}
                      />
                      <span className="text-sm font-medium">{sectionLabelMap[key]}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{price} &euro;</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t("pricing.options")}</CardTitle>
                <p className="text-sm text-muted-foreground">{t("pricing.optionsDesc")}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {options.map(({ key, price }) => (
                  <label
                    key={key}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border/50 cursor-pointer hover-elevate transition-all"
                    data-testid={`pricing-option-${key}`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={!!selectedOptions[key]}
                        onCheckedChange={() => handleOptionToggle(key)}
                        data-testid={`checkbox-option-${key}`}
                      />
                      <span className="text-sm font-medium">{optionLabelMap[key]}</span>
                    </div>
                    <span className="text-sm font-bold text-muted-foreground">+{price} &euro;</span>
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="sticky top-20 space-y-6">
              <Card className="border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{t("pricing.packs")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <PackCard
                    label={t("pricing.packEssential")}
                    desc={t("pricing.packEssentialDesc")}
                    price={59}
                    selected={selectedPack === "essential"}
                    onClick={() => handlePackSelect("essential")}
                    testId="pack-essential"
                  />
                  <PackCard
                    label={t("pricing.packResearch")}
                    desc={t("pricing.packResearchDesc")}
                    price={99}
                    badge={t("pricing.mostPopular")}
                    selected={selectedPack === "research"}
                    onClick={() => handlePackSelect("research")}
                    testId="pack-research"
                  />
                  <PackCard
                    label={t("pricing.packComplete")}
                    desc={t("pricing.packCompleteDesc")}
                    price={129}
                    badge={t("pricing.bestValue")}
                    selected={selectedPack === "complete"}
                    onClick={() => handlePackSelect("complete")}
                    testId="pack-complete"
                  />
                </CardContent>
              </Card>

              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <p className="text-sm opacity-80 uppercase tracking-wider">{t("pricing.total")}</p>
                    <p className="text-4xl font-extrabold" data-testid="text-pricing-total">
                      {displayTotal} &euro;
                    </p>
                    {selectedPack && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        {t("pricing.packs")}
                      </Badge>
                    )}
                    <Button
                      size="lg"
                      variant="secondary"
                      className="w-full mt-2"
                      disabled={displayTotal === 0 || checkout.isPending}
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

function PackCard({ label, desc, price, badge, selected, onClick, testId }: {
  label: string; desc: string; price: number; badge?: string; selected: boolean; onClick: () => void; testId: string;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        selected ? "border-primary bg-primary/5" : "border-border/50 hover-elevate"
      }`}
      data-testid={testId}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm">{label}</span>
            {badge && <Badge variant="secondary" className="text-xs">{badge}</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{desc}</p>
        </div>
        <span className="font-extrabold text-primary text-lg whitespace-nowrap">{price} &euro;</span>
      </div>
    </div>
  );
}

function Footer() {
  const { t, lang } = useI18n();
  return (
    <footer className="py-12 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
              A
            </div>
            <span className="font-bold text-lg">Academic Writing Assistant</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {lang === "fr"
              ? "Un assistant méthodologique intelligent. Pas de rédaction clé en main, pas de triche académique."
              : "An intelligent methodological assistant. No turnkey writing, no academic cheating."}
          </p>
        </div>
      </div>
    </footer>
  );
}
