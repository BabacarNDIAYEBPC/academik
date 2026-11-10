import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, GraduationCap, Users, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "Qu'est-ce que le style Vancouver ?",
    a: "Le style Vancouver est une norme de citation bibliographique utilisée principalement en médecine, sciences biomédicales, pharmacie, soins infirmiers et sciences de la santé. Il est requis par la grande majorité des revues médicales internationales (Lancet, NEJM, BMJ, etc.) et les mémoires en IFSI, facultés de médecine et de pharmacie."
  },
  {
    q: "Comment fonctionne la numérotation des références en Vancouver ?",
    a: "En style Vancouver, les références sont numérotées dans l'ordre de leur première apparition dans le texte. Chaque citation dans le texte est indiquée par un numéro entre parenthèses ou en exposant (ex : (1) ou ¹). La bibliographie finale liste toutes les références dans leur ordre numérique, pas alphabétique."
  },
  {
    q: "Comment générer une bibliographie Vancouver automatiquement ?",
    a: "Avec Academik, saisissez votre sujet de recherche ou collez vos sources. Notre IA recherche les articles dans PubMed, Cochrane, ScienceDirect et génère automatiquement la bibliographie au format Vancouver avec numérotation correcte, noms d'auteurs, titres abrégés de journaux et DOI."
  },
  {
    q: "Quelle est la différence entre APA et Vancouver ?",
    a: "APA utilise le système auteur-date (Smith, 2020) et est courant en sciences sociales. Vancouver utilise la numérotation séquentielle (1) et est la norme en médecine et sciences de la santé. La bibliographie Vancouver liste les références dans l'ordre d'apparition, pas alphabétiquement comme en APA."
  },
  {
    q: "Le style Vancouver est-il obligatoire en IFSI et médecine ?",
    a: "Oui, la plupart des établissements de formation en soins infirmiers (IFSI), facultés de médecine, pharmacie et kinésithérapie imposent le style Vancouver pour les mémoires de fin d'études, TFE et thèses d'exercice. Certains utilisent cependant APA — vérifiez les consignes de votre établissement."
  },
  {
    q: "Academik formate-t-il aussi les sources grises (HAS, OMS) en Vancouver ?",
    a: "Oui. Academik formate en Vancouver tous types de sources : articles de revues, livres, chapitres, rapports institutionnels (HAS, OMS, Santé Publique France), thèses, sites web et communications de congrès, selon les recommandations de l'ICMJE."
  }
];

const EXAMPLE = {
  article: `1. Dupont A, Martin B, Lefebvre C. Efficacité des soins infirmiers en oncologie pédiatrique : revue systématique. Rev Infirm. 2023;72(4):215-24. doi:10.1016/j.revinf.2023.04.005`,
  livre: `2. Collège National des Enseignants de Médecine Interne. Référentiel de médecine interne. 3e éd. Elsevier Masson; 2021. 892 p.`,
  site: `3. Haute Autorité de Santé. Recommandations de bonne pratique — Prise en charge de l'hypertension artérielle [Internet]. HAS; 2023 [cité 22 mai 2026]. Disponible sur : https://www.has-sante.fr`
};

export default function BiblioVancouver() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Bibliographie Vancouver Automatique — Générateur en ligne | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Générez automatiquement votre bibliographie au format Vancouver. Numérotation correcte, abréviations de journaux MEDLINE, DOI. Pour mémoires IFSI, thèses de médecine, pharmacie, kinésithérapie.");
    setMeta('meta[property="og:title"]', "content", "Générateur de Bibliographie Vancouver — Academik");
    setMeta('meta[property="og:description"]', "content",
      "Bibliographie Vancouver en quelques secondes. Sources médicales : PubMed, Cochrane, ScienceDirect. Norme ICMJE. Idéal pour IFSI, médecine, pharmacie.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/bibliographie-vancouver";

    const hreflangs = [
      { lang: "fr-FR", href: "https://academik.fr/bibliographie-vancouver" },
      { lang: "fr-BE", href: "https://academik.fr/bibliographie-vancouver" },
      { lang: "fr-CH", href: "https://academik.fr/bibliographie-vancouver" },
      { lang: "fr-CA", href: "https://academik.fr/bibliographie-vancouver" },
      { lang: "x-default", href: "https://academik.fr/bibliographie-vancouver" },
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
        "name": "Academik — Générateur Bibliographie Vancouver",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "Outil IA pour générer automatiquement des bibliographies au format Vancouver selon les normes ICMJE.",
        "offers": { "@type": "Offer", "price": "4.99", "priceCurrency": "EUR" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "127" }
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
    document.documentElement.lang = "fr";
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
          <Button onClick={() => setLocation("/connexion")} size="sm" data-testid="button-nav-cta">
            Essayer gratuitement <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-red-50/60 to-background">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ Norme ICMJE · Vancouver</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Générateur de{" "}
            <span className="text-primary">Bibliographie Vancouver</span>{" "}
            en ligne
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Créez des bibliographies au format <strong>Vancouver</strong> parfaitement conformes aux normes ICMJE en quelques secondes.
            Notre IA recherche vos sources dans PubMed, Cochrane et ScienceDirect et génère automatiquement la liste numérotée de références.
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Indispensable pour les mémoires IFSI, TFE infirmiers, thèses de médecine, pharmacie et kinésithérapie en France, Belgique, Suisse et Canada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Générer ma bibliographie Vancouver <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/bibliographie-apa")}>
              Voir aussi : Format APA 7
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Norme ICMJE</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> PubMed & Cochrane</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Dès 4,99 €</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, val: "12 000+", label: "Étudiants & soignants" },
            { icon: FileText, val: "85 000+", label: "Bibliographies générées" },
            { icon: Star, val: "4,8/5", label: "Note moyenne" },
            { icon: Clock, val: "< 10 sec", label: "Temps de génération" },
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
              <h2 className="text-3xl font-bold mb-4">Qu'est-ce que le style bibliographique Vancouver ?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Le <strong>style Vancouver</strong> (ou système de Vancouver) est la norme bibliographique internationale des sciences médicales et de la santé, définie par l'<strong>ICMJE</strong> (International Committee of Medical Journal Editors). Il est requis par plus de 4 000 revues médicales dans le monde.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Sa caractéristique principale est la <strong>numérotation séquentielle</strong> : les références sont numérotées dans l'ordre de leur première citation dans le texte, et la bibliographie est présentée dans ce même ordre numérique.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Les journaux sont cités avec leurs <strong>abréviations officielles MEDLINE</strong> (ex : N Engl J Med, BMJ, Lancet). Academik applique automatiquement toutes ces règles.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Exemples de références Vancouver</p>
              <Card className="border-l-4 border-primary border-t-0 border-b-0 border-r-0 rounded-l-none bg-muted/30">
                <CardContent className="py-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Article de revue</p>
                  <p className="text-xs font-mono leading-relaxed">{EXAMPLE.article}</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-primary border-t-0 border-b-0 border-r-0 rounded-l-none bg-muted/30">
                <CardContent className="py-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Livre</p>
                  <p className="text-xs font-mono leading-relaxed">{EXAMPLE.livre}</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-primary border-t-0 border-b-0 border-r-0 rounded-l-none bg-muted/30">
                <CardContent className="py-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">Site web institutionnel</p>
                  <p className="text-xs font-mono leading-relaxed">{EXAMPLE.site}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Comment générer votre bibliographie Vancouver ?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Academik automatise la mise en forme Vancouver en trois étapes simples.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: Search, title: "Décrivez votre sujet", desc: "Saisissez votre thématique de recherche ou les sources que vous souhaitez formater. L'IA interroge PubMed, Cochrane, ScienceDirect et les bases médicales." },
              { step: "2", icon: Zap, title: "L'IA formate en Vancouver", desc: "Chaque source est automatiquement mise en forme avec numérotation, abréviations de journaux MEDLINE, noms d'auteurs, volume, numéro, pages et DOI." },
              { step: "3", icon: FileText, title: "Copiez ou exportez", desc: "Copiez votre bibliographie numérotée prête à coller dans votre mémoire, ou exportez-la directement en Word." },
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
          <h2 className="text-3xl font-bold text-center mb-4">Tout ce qu'Academik fait pour vous</h2>
          <p className="text-center text-muted-foreground mb-12">Un outil complet pour tous vos besoins bibliographiques en sciences de la santé.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Numérotation automatique", desc: "Les références sont numérotées dans l'ordre d'apparition, conformément aux règles ICMJE." },
              { title: "Abréviations MEDLINE", desc: "Titres de journaux abrégés selon la liste officielle MEDLINE/PubMed (ex : N Engl J Med, JAMA, Lancet)." },
              { title: "6 auteurs + et al.", desc: "Jusqu'à 6 auteurs listés, suivi de « et al. » selon la norme Vancouver actuelle." },
              { title: "DOI systématique", desc: "Inclusion automatique du DOI pour tous les articles qui en disposent, format doi:10.xxxx." },
              { title: "Sources grises (HAS, OMS)", desc: "Formatage des rapports institutionnels, recommandations HAS, guides OMS et Santé Publique France." },
              { title: "Toutes sources médicales", desc: "Articles, livres, chapitres, thèses, congrès, sites web — tous les types documentaires en Vancouver." },
              { title: "PubMed & Cochrane", desc: "Recherche directe dans PubMed, MEDLINE, Cochrane Library et ScienceDirect selon votre thématique." },
              { title: "Revue systématique", desc: "Génération d'équations de recherche PubMed avec MeSH terms pour les revues systématiques PRISMA." },
              { title: "Multi-formats inclus", desc: "En plus de Vancouver, Academik génère aussi en APA 7, MLA et Chicago — au choix sur la même recherche." },
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
          <h2 className="text-3xl font-bold text-center mb-12">Pour qui est fait Academik ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Étudiants en soins de santé",
                desc: "Infirmiers (IFSI), aides-soignants, kinésithérapeutes, sages-femmes, orthophonistes : générez votre bibliographie Vancouver pour vos mémoires de fin d'études et TFE.",
                tags: ["IFSI", "TFE", "Mémoire fin d'études", "Soins infirmiers"]
              },
              {
                icon: Hash,
                title: "Étudiants en médecine & pharmacie",
                desc: "Thèse d'exercice en médecine, pharmacie, chirurgie dentaire, sage-femme : Academik formate vos sources Vancouver avec abréviations MEDLINE et DOI corrects.",
                tags: ["Thèse médecine", "Pharmacie", "Odontologie", "DFASM"]
              },
              {
                icon: Users,
                title: "Chercheurs & cliniciens",
                desc: "Préparez vos articles pour les revues médicales peer-reviewed (Lancet, BMJ, NEJM, Presse Médicale) avec une bibliographie Vancouver conforme aux exigences des éditeurs.",
                tags: ["Article scientifique", "Revue médicale", "CCNE", "CHU"]
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
          <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
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
      <section className="py-20 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Prêt à générer votre bibliographie Vancouver ?</h2>
          <p className="text-red-100 mb-8 text-lg">
            Rejoignez 12 000+ étudiants en santé et chercheurs qui utilisent Academik pour leurs travaux académiques.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Commencer maintenant — dès 4,99 € <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-red-200 text-sm mt-4">Sans abonnement · Paiement sécurisé · Résultats en quelques secondes</p>
        </div>
      </section>

      {/* Partner banner */}
      <div className="py-5 px-4 bg-amber-50 border-y border-amber-100 text-center text-sm">
        <p className="text-muted-foreground">
          Besoin d'aide pour <strong>rédiger votre mémoire, TFE ou thèse</strong> ?{" "}
          <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="text-primary font-semibold underline underline-offset-2 hover:opacity-80">
            Rédacteur Mémoire
          </a>{" "}
          — accompagnement personnalisé par des experts académiques en santé.
        </p>
      </div>

      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-semibold">Academik</span>
            <span>— Générateur Bibliographie Vancouver</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/bibliographie-apa")}>Format APA 7</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/revue-litterature")}>Revue de littérature</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/recherche-bibliographique")}>Recherche biblio</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/reussir-memoire-master")}>Réussir son mémoire</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>Connexion</span>
            <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="hover:text-foreground">Rédacteur Mémoire</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
