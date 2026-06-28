import { useTranslation } from "react-i18next";
import { useSEO } from "@/hooks/use-seo";
import { Search, FileText, GitCompare, Zap, Shield, ChevronRight, Check, BookOpen, Database, Save, Cpu, GraduationCap, Microscope, Briefcase, Loader2 } from "lucide-react";
import logoUrl from "@assets/logo_academik_minimal.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CREDIT_PACKS } from "@shared/schema";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useQuery } from "@tanstack/react-query";

interface CurrencyInfo {
  currency: string;
  symbol: string;
  rate: number;
  country: string;
}

const zeroDecimal = ["jpy", "krw", "vnd", "idr", "clp", "gnf", "mga", "pyg", "rwf", "ugx", "xaf", "xof"];

function formatPrice(eurPrice: number, info: CurrencyInfo): string {
  const converted = eurPrice * info.rate;
  if (zeroDecimal.includes(info.currency)) return `${info.symbol}${Math.round(converted).toLocaleString()}`;
  return `${info.symbol}${converted.toFixed(2)}`;
}

export default function Landing() {
  const { t } = useTranslation();
  useSEO("home");
  const handleLogin = () => { window.location.href = "/connexion"; };

  const { data: currencyInfo, isLoading: currencyLoading } = useQuery<CurrencyInfo>({
    queryKey: ["/api/currency"],
    staleTime: 1000 * 60 * 60,
  });
  const currency: CurrencyInfo = currencyInfo || { currency: "eur", symbol: "€", rate: 1, country: "XX" };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Academik" className="w-7 h-7 object-contain" />
            <span className="font-bold text-lg tracking-tight">{t("app_name")}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <Button onClick={handleLogin} size="sm" data-testid="button-login">
              {t("start_free")}
            </Button>
          </div>
        </div>
      </nav>

      <section className="py-12 md:py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">{t("hero_badge")}</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            {t("hero_title_1")}{" "}
            <span className="gradient-text">{t("hero_title_2")}</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-7 leading-relaxed">
            {t("hero_desc")}
          </p>
          <Button size="lg" onClick={handleLogin} className="gap-2" data-testid="button-hero-cta">
            {t("hero_cta")} <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Platforms marquee */}
      <section className="py-10 border-y bg-white overflow-hidden">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6 px-4">
          Google Scholar, PubMed, HAL, Cairn, CINAHL et des dizaines d'autres bases de données — réunis instantanément
        </p>
        {(() => {
          const platforms = [
            { name: "Google Scholar", domain: "scholar.google.com" },
            { name: "PubMed",         domain: "pubmed.ncbi.nlm.nih.gov" },
            { name: "HAL",            domain: "hal.science" },
            { name: "Cairn",          domain: "cairn.info" },
            { name: "ScienceDirect",  domain: "sciencedirect.com" },
            { name: "Scopus",         domain: "scopus.com" },
            { name: "Web of Science", domain: "webofscience.com" },
            { name: "JSTOR",          domain: "jstor.org" },
            { name: "ArXiv",          domain: "arxiv.org" },
            { name: "IEEE Xplore",    domain: "ieeexplore.ieee.org" },
            { name: "ResearchGate",   domain: "researchgate.net" },
            { name: "Cochrane",       domain: "cochranelibrary.com" },
            { name: "CrossRef",       domain: "crossref.org" },
            { name: "ERIC",           domain: "eric.ed.gov" },
            { name: "Semantic Scholar", domain: "semanticscholar.org" },
            { name: "OpenAlex",       domain: "openalex.org" },
            { name: "DOAJ",           domain: "doaj.org" },
            { name: "CINAHL",         domain: "ebsco.com" },
          ];
          const row1 = platforms.slice(0, 9);
          const row2 = platforms.slice(9);
          const Badge = ({ p }: { p: typeof platforms[0] }) => (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background shadow-sm text-sm font-medium text-foreground whitespace-nowrap mx-2">
              <img
                src={`https://www.google.com/s2/favicons?domain=${p.domain}&sz=32`}
                alt={p.name}
                className="w-4 h-4 rounded-sm"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              {p.name}
            </div>
          );
          return (
            <div className="space-y-3">
              <div className="flex animate-marquee">
                {[...row1, ...row1].map((p, i) => <Badge key={i} p={p} />)}
              </div>
              <div className="flex animate-marquee-reverse">
                {[...row2, ...row2].map((p, i) => <Badge key={i} p={p} />)}
              </div>
            </div>
          );
        })()}
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">{t("features_section_title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t("features_section_subtitle")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Search,    title: t("feature1_title"), desc: t("feature1_desc"), color: "bg-blue-50 text-blue-600" },
              { icon: FileText,  title: t("feature2_title"), desc: t("feature2_desc"), color: "bg-violet-50 text-violet-600" },
              { icon: GitCompare,title: t("feature3_title"), desc: t("feature3_desc"), color: "bg-indigo-50 text-indigo-600" },
              { icon: Database,  title: t("feature4_title"), desc: t("feature4_desc"), color: "bg-emerald-50 text-emerald-600" },
              { icon: Save,      title: t("feature5_title"), desc: t("feature5_desc"), color: "bg-amber-50 text-amber-600" },
              { icon: Cpu,       title: t("feature6_title"), desc: t("feature6_desc"), color: "bg-rose-50 text-rose-600" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <Card key={title} className="card-hover border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who uses Academik */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">{t("who_title")}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: GraduationCap, title: t("who_students"), desc: t("who_students_desc"), color: "text-violet-600" },
              { icon: Microscope,    title: t("who_researchers"), desc: t("who_researchers_desc"), color: "text-blue-600" },
              { icon: Briefcase,     title: t("who_pros"), desc: t("who_pros_desc"), color: "text-emerald-600" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="text-center p-6 rounded-xl border bg-muted/20">
                <Icon className={`w-8 h-8 mx-auto mb-3 ${color}`} />
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3">{t("pricing_title")}</h2>
            <p className="text-muted-foreground">{t("pricing_desc")}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {CREDIT_PACKS.map((pack, i) => (
              <Card key={pack.id} className={`card-hover relative ${i === 1 ? "border-primary shadow-md" : ""}`}>
                {i === 1 && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary">{t("popular")}</Badge>
                  </div>
                )}
                <CardContent className="pt-6 text-center">
                  <h3 className="font-bold text-lg mb-1">{pack.label}</h3>
                  <div className="text-3xl font-bold my-3">
                    {currencyLoading
                      ? <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      : formatPrice(pack.price, currency)
                    }
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">{pack.credits} {t("credits")}</p>
                  <div className="space-y-2 text-sm text-left mb-6">
                    {[t("feature_articles"), t("feature_analyses"), t("feature_bib")].map(f => (
                      <div key={f} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" variant={i === 1 ? "default" : "outline"} onClick={handleLogin} data-testid={`button-pack-${pack.id}`}>
                    {t("choose_pack")}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            {t("credits_note")}
          </p>
          {!currencyLoading && currency.currency !== "eur" && (
            <p className="text-center text-xs text-muted-foreground mt-2">
              {t("price_converted_note", { currency: currency.currency.toUpperCase() })}
            </p>
          )}
        </div>
      </section>

      <section className="py-12 px-4 bg-muted/30 border-t">
        <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
          {[{ icon: Shield, key: "trust_secure" }, { icon: Zap, key: "trust_fast" }, { icon: BookOpen, key: "trust_academic" }, { icon: Cpu, key: "trust_gpt4" }].map(({ icon: Icon, key }) => (
            <div key={key} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary" />
              <span>{t(key)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Texte SEO — 600 mots */}
      <section className="py-16 px-4 border-t bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">La recherche bibliographique académique, simplifiée par l'intelligence artificielle</h2>

          <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed space-y-5 text-[15px]">
            <p>
              La <strong className="text-foreground">recherche bibliographique</strong> est l'une des compétences les plus exigeantes de la vie académique. Qu'il s'agisse d'un mémoire de master, d'une thèse de doctorat, d'un article soumis à une revue à comité de lecture ou d'un rapport professionnel, chaque travail sérieux repose sur une bibliographie rigoureuse, complète et correctement formatée. Pourtant, cette étape cruciale est trop souvent bâclée, oubliée ou réalisée à la dernière minute — au risque de pénaliser l'ensemble d'un travail par ailleurs solide.
            </p>

            <p>
              Academik est un outil de <strong className="text-foreground">recherche bibliographique par intelligence artificielle</strong>, conçu spécifiquement pour les étudiants et chercheurs francophones. Il automatise les deux étapes les plus chronophages du travail académique : la <strong className="text-foreground">recherche de sources fiables</strong> dans les grandes bases de données académiques (Google Scholar, PubMed, HAL, Cairn.info, ScienceDirect, JSTOR) et la <strong className="text-foreground">génération automatique de la bibliographie</strong> dans le format imposé par votre institution.
            </p>

            <h3 className="text-xl font-bold text-foreground mt-8 mb-3">Quatre formats de citation couverts</h3>

            <p>
              Les normes de citation varient selon les disciplines. Academik maîtrise les quatre standards internationaux : le <a href="/bibliographie-apa" className="text-primary hover:underline font-medium">format APA 7</a>, utilisé en sciences sociales, psychologie et sciences de la santé ; la <a href="/bibliographie-vancouver" className="text-primary hover:underline font-medium">norme Vancouver</a>, standard en médecine et sciences biomédicales ; le <a href="/bibliographie-mla" className="text-primary hover:underline font-medium">style MLA 9</a>, référence en littérature et langues ; et le <a href="/bibliographie-chicago" className="text-primary hover:underline font-medium">format Chicago 17</a>, privilégié en histoire et sciences humaines. En quelques secondes, l'outil génère une liste de références parfaitement formatée, sans erreur de ponctuation, d'italique ou d'ordre des éléments.
            </p>

            <h3 className="text-xl font-bold text-foreground mt-8 mb-3">De la revue de littérature à la synthèse bibliographique</h3>

            <p>
              Au-delà de la simple génération de références, Academik accompagne la totalité du processus de <strong className="text-foreground">revue de littérature</strong>. L'outil identifie les articles les plus pertinents pour votre sujet, compare les sources entre elles, détecte les convergences et les débats dans la littérature existante, et génère une <strong className="text-foreground">synthèse bibliographique</strong> structurée. Cette fonctionnalité répond directement aux exigences méthodologiques des masters recherche, des doctorats et des publications scientifiques, où l'<em>état de l'art</em> constitue souvent un chapitre à part entière.
            </p>

            <p>
              Pour les étudiants en licence ou en master qui rédigent leur premier mémoire, Academik propose également des guides méthodologiques complets sur <a href="/comment-faire-bibliographie" className="text-primary hover:underline font-medium">comment faire une bibliographie</a>, comment structurer une <a href="/recherche-bibliographique" className="text-primary hover:underline font-medium">recherche bibliographique</a> efficace, et comment <a href="/reussir-memoire-master" className="text-primary hover:underline font-medium">réussir son mémoire de master</a> de A à Z.
            </p>

            <h3 className="text-xl font-bold text-foreground mt-8 mb-3">Un outil pour chaque profil académique</h3>

            <p>
              Que vous soyez <a href="/etudiant" className="text-primary hover:underline font-medium">étudiant en université</a> cherchant à valider votre mémoire avec une bibliographie irréprochable, <a href="/chercheur" className="text-primary hover:underline font-medium">chercheur</a> soumettant un article à une revue internationale, ou professionnel de la santé devant rédiger un rapport selon les normes Vancouver, Academik s'adapte à vos besoins. L'interface est entièrement en français, les sources francophones (Cairn, HAL) sont pleinement intégrées, et les résultats sont disponibles en moins de trente secondes.
            </p>

            <p>
              Le système fonctionne sur un modèle de <strong className="text-foreground">crédits à l'usage</strong>, sans abonnement mensuel : vous payez uniquement les actions effectuées. Un pack Starter de 10 crédits est disponible dès 4,99 €, permettant de tester l'outil sur un premier sujet sans engagement. Les crédits ne expirent pas et sont utilisables aussi bien pour la recherche d'articles, la génération de bibliographies, la création d'équations de recherche booléennes que pour la synthèse de littérature.
            </p>

            <p>
              Rejoignez les <strong className="text-foreground">12 000 étudiants et chercheurs</strong> qui utilisent déjà Academik pour accélérer leur travail de recherche — en France, en Belgique, en Suisse, au Canada et dans toute la francophonie.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Hub — tous les sujets */}
      <section className="py-14 px-4 border-t bg-slate-50/70">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-2 text-center">Guides & ressources bibliographiques</h2>
          <p className="text-muted-foreground text-center text-sm mb-10">Tous les outils et guides pour maîtriser la bibliographie académique, la recherche de sources et la rédaction scientifique.</p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {/* Formats bibliographiques */}
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-bold text-base mb-4 text-violet-700 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Formats bibliographiques
              </h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/comment-faire-bibliographie" className="text-muted-foreground hover:text-primary transition-colors font-medium">→ Comment faire une bibliographie</a></li>
                <li><a href="/bibliographie-apa" className="text-muted-foreground hover:text-primary transition-colors">Bibliographie APA 7</a></li>
                <li><a href="/bibliographie-vancouver" className="text-muted-foreground hover:text-primary transition-colors">Bibliographie Vancouver</a></li>
                <li><a href="/bibliographie-mla" className="text-muted-foreground hover:text-primary transition-colors">Bibliographie MLA 9</a></li>
                <li><a href="/bibliographie-chicago" className="text-muted-foreground hover:text-primary transition-colors">Bibliographie Chicago 17</a></li>
              </ul>
            </div>

            {/* Recherche & synthèse */}
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-bold text-base mb-4 text-blue-700 flex items-center gap-2">
                <Search className="w-4 h-4" /> Recherche & synthèse
              </h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/recherche-bibliographique" className="text-muted-foreground hover:text-primary transition-colors">Recherche bibliographique</a></li>
                <li><a href="/synthese-bibliographique" className="text-muted-foreground hover:text-primary transition-colors">Synthèse bibliographique</a></li>
                <li><a href="/revue-litterature" className="text-muted-foreground hover:text-primary transition-colors">Revue de littérature</a></li>
                <li><a href="/memoire-these" className="text-muted-foreground hover:text-primary transition-colors">Mémoire & thèse</a></li>
                <li><a href="/reussir-memoire-master" className="text-muted-foreground hover:text-primary transition-colors">Réussir son mémoire de master</a></li>
              </ul>
            </div>

            {/* Par profil */}
            <div className="bg-white border rounded-xl p-5">
              <h3 className="font-bold text-base mb-4 text-emerald-700 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Par profil & en anglais
              </h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/etudiant" className="text-muted-foreground hover:text-primary transition-colors">Pour les étudiants</a></li>
                <li><a href="/chercheur" className="text-muted-foreground hover:text-primary transition-colors">Pour les chercheurs</a></li>
                <li><a href="/en/apa-citation-generator" className="text-muted-foreground hover:text-primary transition-colors">APA citation generator (EN)</a></li>
                <li><a href="/en/literature-review" className="text-muted-foreground hover:text-primary transition-colors">Literature review (EN)</a></li>
                <li><a href="/en/dissertation-help" className="text-muted-foreground hover:text-primary transition-colors">Dissertation help (EN)</a></li>
              </ul>
            </div>
          </div>

          {/* Nuage de mots-clés */}
          <div className="bg-white border rounded-xl p-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">Mots-clés couverts</p>
            <div className="flex flex-wrap gap-2">
              {[
                "bibliographie APA 7","générateur de bibliographie","comment faire une bibliographie",
                "bibliographie Vancouver","bibliographie MLA","bibliographie Chicago",
                "revue de littérature","synthèse bibliographique","recherche bibliographique",
                "mémoire de master","thèse de doctorat","citation académique",
                "références bibliographiques","normes de citation","APA 7e édition",
                "format Vancouver médecine","style MLA humanités","Cairn bibliographie",
                "HAL sources académiques","PubMed citations","Google Scholar",
                "état de l'art","bibliographie automatique IA","équation de recherche",
                "sources peer-reviewed","open access","note de bas de page",
              ].map(kw => (
                <span key={kw} className="bg-slate-100 rounded-full px-3 py-1 text-xs text-slate-600 hover:bg-primary/10 hover:text-primary transition-colors cursor-default">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEO Footer Links */}
      <section className="py-12 px-4 border-t bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div>
              <p className="font-semibold mb-3 text-foreground">{t("footer_bib_title")}</p>
              <ul className="space-y-2">
                <li><a href="/bibliographie-apa" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_bib_apa")}</a></li>
                <li><a href="/bibliographie-vancouver" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_bib_vancouver")}</a></li>
                <li><a href="/bibliographie-mla" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_bib_mla")}</a></li>
                <li><a href="/bibliographie-chicago" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_bib_chicago")}</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3 text-foreground">{t("footer_research_title")}</p>
              <ul className="space-y-2">
                <li><a href="/revue-litterature" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_research_review")}</a></li>
                <li><a href="/memoire-these" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_research_thesis")}</a></li>
                <li><a href="/etudiant" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_research_students")}</a></li>
                <li><a href="/chercheur" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_research_researchers")}</a></li>
                <li><a href="/recherche-bibliographique" className="text-muted-foreground hover:text-primary transition-colors">Recherche bibliographique</a></li>
                <li><a href="/synthese-bibliographique" className="text-muted-foreground hover:text-primary transition-colors">Synthèse bibliographique</a></li>
                <li><a href="/reussir-memoire-master" className="text-muted-foreground hover:text-primary transition-colors">Réussir son mémoire</a></li>
                <li><a href="/comment-faire-bibliographie" className="text-muted-foreground hover:text-primary transition-colors">Comment faire une bibliographie</a></li>
                <li><a href="/ressources" className="text-muted-foreground hover:text-primary font-medium transition-colors">→ Tous les guides</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3 text-foreground">{t("footer_english_title")}</p>
              <ul className="space-y-2">
                <li><a href="/en/apa-citation-generator" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_en_apa")}</a></li>
                <li><a href="/en/literature-review" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_en_review")}</a></li>
                <li><a href="/en/dissertation-help" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_en_dissertation")}</a></li>
                <li><a href="/en/students" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_en_students")}</a></li>
                <li><a href="/en/vancouver-citation" className="text-muted-foreground hover:text-primary transition-colors">Vancouver citation</a></li>
                <li><a href="/en/mla-citation" className="text-muted-foreground hover:text-primary transition-colors">MLA citation</a></li>
                <li><a href="/en/chicago-citation" className="text-muted-foreground hover:text-primary transition-colors">Chicago citation</a></li>
                <li><a href="/en/researchers" className="text-muted-foreground hover:text-primary transition-colors">For researchers</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-3 text-foreground">{t("footer_partner_title")}</p>
              <ul className="space-y-2">
                <li>
                  <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary transition-colors">
                    {t("footer_partner_link")}
                  </a>
                </li>
                <li><a href="/connexion" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_login")}</a></li>
                <li><a href="/connexion" className="text-muted-foreground hover:text-primary transition-colors">{t("footer_register")}</a></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-6 px-4 text-center text-xs text-muted-foreground border-t">
        <div className="flex justify-center gap-5 mb-3 flex-wrap">
          <a href="/cgu" className="hover:text-foreground transition-colors">CGU</a>
          <a href="/cgv" className="hover:text-foreground transition-colors">CGV</a>
          <a href="/rgpd" className="hover:text-foreground transition-colors">Politique de confidentialité</a>
          <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
        </div>
        © {new Date().getFullYear()} {t("app_name")} — Performance Consulting Groupe SAS
      </footer>
    </div>
  );
}
