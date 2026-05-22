import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, GraduationCap, Users, Clock, Target, Lightbulb, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "Comment trouver des sources académiques pour mon mémoire ?",
    a: "Pour trouver des sources fiables pour votre mémoire, interrogez les bases de données académiques : Cairn.info pour les sciences humaines francophones, HAL pour les archives ouvertes, PubMed pour les sciences de la santé, Google Scholar pour une recherche transversale, et ScienceDirect pour les sciences exactes. Academik interroge automatiquement toutes ces bases simultanément."
  },
  {
    q: "Quelle est la différence entre un mémoire de master et une thèse de doctorat ?",
    a: "Le mémoire de master (M1 ou M2) est un travail de recherche de 50 à 150 pages qui valide un diplôme de 2e cycle. La thèse de doctorat est une contribution originale au savoir, généralement de 200 à 500 pages, qui valide un diplôme de 3e cycle. Les deux nécessitent une revue de littérature solide, mais la thèse exige une plus grande originalité méthodologique."
  },
  {
    q: "Comment rédiger une problématique de mémoire ?",
    a: "Une bonne problématique de mémoire se construit en trois temps : identification d'un constat de départ (pourquoi ce sujet est important), formulation du problème (ce qui est insuffisamment connu ou compris), et question de recherche centrale (formulation interrogative précise). Academik peut vous aider à identifier l'état des connaissances existantes pour formuler votre problématique."
  },
  {
    q: "Combien de sources faut-il dans un mémoire de master ?",
    a: "Un mémoire de M1 comporte généralement 20 à 40 sources. Un mémoire de M2 en requiert 40 à 80 minimum. Une thèse de doctorat cite souvent 100 à 300 sources selon la discipline. Academik vous aide à trouver rapidement les sources pertinentes et à les organiser en revue de littérature structurée."
  },
  {
    q: "Quel format de bibliographie utiliser pour mon mémoire ?",
    a: "Cela dépend de votre discipline : APA 7 pour la psychologie, l'éducation et les sciences de la santé ; Vancouver pour la médecine, pharmacie et soins infirmiers (IFSI) ; Chicago 17 (système A) pour l'histoire et le droit ; MLA 9 pour les lettres et langues. Academik génère les quatre formats. Vérifiez toujours les consignes de votre établissement."
  },
  {
    q: "Academik peut-il m'aider à structurer le plan de mon mémoire ?",
    a: "Oui. Après avoir identifié les sources sur votre sujet, Academik génère une synthèse thématique des connaissances existantes qui vous aide à structurer votre cadre théorique et votre plan. La cartographie des thèmes et la confrontation des auteurs vous donnent une vision claire de l'état de l'art pour construire votre argumentation."
  }
];

const STEPS = [
  { icon: Target, title: "Définir votre sujet", desc: "Identifiez votre domaine, délimitez le sujet et formulez une problématique provisoire en vous appuyant sur vos lectures préliminaires." },
  { icon: Search, title: "Recherche de sources", desc: "Interrogez Cairn, HAL, PubMed, Google Scholar avec des mots-clés précis. Academik fait cela automatiquement pour vous." },
  { icon: FileText, title: "Revue de littérature", desc: "Analysez et synthétisez les sources trouvées pour dresser l'état de l'art et affiner votre problématique définitive." },
  { icon: Lightbulb, title: "Cadre théorique", desc: "Identifiez les théories, concepts et auteurs de référence qui structurent votre approche analytique." },
  { icon: BarChart3, title: "Méthodologie", desc: "Définissez votre méthode de collecte et d'analyse des données (qualitative, quantitative, mixte)." },
  { icon: Zap, title: "Rédaction & bibliographie", desc: "Rédigez votre mémoire et générez votre bibliographie finale formatée en APA, Vancouver, MLA ou Chicago." },
];

export default function MemoireThese() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Aide Mémoire Master & Thèse de Doctorat — IA académique | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Accélérez la rédaction de votre mémoire de master ou thèse de doctorat avec l'IA. Recherche de sources, revue de littérature, bibliographie APA/Vancouver/MLA/Chicago. Pour étudiants en France, Belgique, Suisse, Canada.");
    setMeta('meta[property="og:title"]', "content", "Aide Mémoire & Thèse par IA — Academik");
    setMeta('meta[property="og:description"]', "content",
      "Recherche de sources, revue de littérature et bibliographie automatiques pour votre mémoire de master ou thèse. Academik, l'outil IA académique.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/memoire-these";

    const hreflangs = [
      { lang: "fr-FR", href: "https://academik.fr/memoire-these" },
      { lang: "fr-BE", href: "https://academik.fr/memoire-these" },
      { lang: "fr-CH", href: "https://academik.fr/memoire-these" },
      { lang: "fr-CA", href: "https://academik.fr/memoire-these" },
      { lang: "x-default", href: "https://academik.fr/memoire-these" },
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
        "name": "Academik — Aide Mémoire & Thèse par IA",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "Outil IA pour aider les étudiants dans la rédaction de leur mémoire de master et thèse de doctorat : recherche de sources, revue de littérature, bibliographie automatique.",
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
      <section className="py-20 px-4 text-center bg-gradient-to-b from-indigo-50/60 to-background">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ Master · Doctorat · Recherche académique</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Réussir votre{" "}
            <span className="text-primary">mémoire de master</span>{" "}
            ou votre{" "}
            <span className="text-primary">thèse</span>{" "}
            avec l'IA
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Academik accélère les étapes les plus chronophages de votre travail de recherche : <strong>recherche de sources académiques</strong>, <strong>revue de littérature</strong>, <strong>bibliographie formatée</strong> et <strong>équations de recherche</strong> — en quelques minutes.
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Utilisé par des milliers d'étudiants en master et doctorat en France, Belgique, Suisse, Canada et Luxembourg.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Commencer ma recherche <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/revue-litterature")}>
              Voir : Revue de littérature IA
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Sources vérifiées</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> APA, Vancouver, MLA, Chicago</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Dès 4,99 €</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, val: "12 000+", label: "Étudiants actifs" },
            { icon: FileText, val: "40 000+", label: "Synthèses générées" },
            { icon: Star, val: "4,8/5", label: "Note moyenne" },
            { icon: Clock, val: "< 2 min", label: "Par recherche" },
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
          <h2 className="text-3xl font-bold text-center mb-4">Les étapes clés de votre mémoire ou thèse</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Academik intervient sur les étapes qui prennent le plus de temps et génèrent le plus d'erreurs.
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
                        {(i === 1 || i === 2 || i === 5) && <Badge className="text-xs py-0 h-4">IA</Badge>}
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
          <h2 className="text-3xl font-bold text-center mb-4">Ce qu'Academik fait pour votre mémoire</h2>
          <p className="text-center text-muted-foreground mb-12">Toutes les fonctionnalités dont vous avez besoin pour réussir votre travail de recherche.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Recherche multi-bases simultanée", desc: "Interroge en parallèle Cairn, HAL, PubMed, Google Scholar et ScienceDirect selon votre sujet et vos filtres." },
              { title: "Revue de littérature automatique", desc: "Analyse et synthèse des sources trouvées : confrontation des auteurs, mapping thématique, synthèse rédigée." },
              { title: "Bibliographie APA 7", desc: "Génération automatique en APA 7e édition, norme la plus utilisée en sciences humaines et de la santé." },
              { title: "Bibliographie Vancouver", desc: "Format numéroté ICMJE pour les mémoires IFSI, thèses de médecine, pharmacie et kinésithérapie." },
              { title: "Bibliographie MLA 9", desc: "Works Cited pour les mémoires en lettres, langues et études anglophones ou comparatives." },
              { title: "Bibliographie Chicago 17", desc: "Notes de bas de page (système A) et auteur-date (système B) pour l'histoire, le droit et l'économie." },
              { title: "Équations de recherche", desc: "Génération d'équations booléennes pour PubMed, Scopus, Web of Science et Cochrane avec MeSH terms." },
              { title: "Fiches de lecture", desc: "Analyse structurée (résumé, méthodologie, résultats, limites) à partir de vos PDF d'articles." },
              { title: "Filtres disciplinaires", desc: "Filtrez par période, langue, type de document, source (Cairn, PubMed...) et niveau académique." },
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
          <h2 className="text-3xl font-bold text-center mb-12">Adapté à toutes les disciplines</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { disc: "Sciences de la santé", details: "IFSI, médecine, pharmacie, kinésithérapie, maïeutique, orthophonie", format: "Vancouver" },
              { disc: "Psychologie & éducation", details: "Psychologie clinique, sciences de l'éducation, orthopédagogie, travail social", format: "APA 7" },
              { disc: "Sciences humaines & sociales", details: "Sociologie, anthropologie, science politique, géographie, économie", format: "APA 7 ou Chicago B" },
              { disc: "Histoire & droit", details: "Histoire contemporaine, droit privé, droit public, sciences politiques", format: "Chicago A" },
              { disc: "Lettres & langues", details: "Littérature française, comparée, études anglophones, traductologie, linguistique", format: "MLA 9" },
              { disc: "Sciences exactes & ingénierie", details: "Biologie, chimie, physique, informatique, sciences de l'ingénieur", format: "Vancouver ou APA 7" },
            ].map(({ disc, details, format }) => (
              <Card key={disc} className="border hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-4">
                  <p className="font-semibold mb-1">{disc}</p>
                  <p className="text-xs text-muted-foreground mb-2 leading-relaxed">{details}</p>
                  <Badge variant="secondary" className="text-xs">Format recommandé : {format}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pour quel type de travail ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Mémoire de Master",
                desc: "M1 (30 à 80 pages) ou M2 (80 à 150 pages) : mémoire de recherche, mémoire professionnel, TFE, rapport de stage avec volet théorique. Academik accélère la phase documentaire et bibliographique.",
                tags: ["Master 1", "Master 2", "TFE", "Mémoire pro"]
              },
              {
                icon: Search,
                title: "Thèse de doctorat",
                desc: "Thèse de doctorat (200 à 500 pages) ou thèse d'exercice (médecine, pharmacie, chirurgie dentaire) : Academik aide à la revue systématique, aux équations de recherche et à la bibliographie complète.",
                tags: ["Doctorat", "Thèse d'exercice", "HDR", "Revue systématique"]
              },
              {
                icon: Users,
                title: "Mémoire de spécialité",
                desc: "DU, DIU, master spécialisé, diplôme d'État : infirmiers spécialisés (IADE, IBODE, puéricultrice), sages-femmes, kinésithérapeutes, orthophonistes, psychomotriciens.",
                tags: ["DU/DIU", "IADE", "Sage-femme", "Kiné"]
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
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Prêt à accélérer votre mémoire ou thèse ?</h2>
          <p className="text-indigo-100 mb-8 text-lg">
            Rejoignez 12 000+ étudiants qui utilisent Academik pour gagner du temps sur les étapes documentaires de leur recherche.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Commencer maintenant — dès 4,99 € <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-indigo-200 text-sm mt-4">Sans abonnement · Paiement sécurisé · Résultats en moins de 2 minutes</p>
        </div>
      </section>

      {/* Partner banner */}
      <div className="py-5 px-4 bg-amber-50 border-y border-amber-100 text-center text-sm">
        <p className="text-muted-foreground">
          Besoin d'un accompagnement complet pour <strong>rédiger votre mémoire ou votre thèse</strong> ?{" "}
          <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="text-primary font-semibold underline underline-offset-2 hover:opacity-80">
            Rédacteur Mémoire
          </a>{" "}
          — coaching personnalisé et relecture par des experts académiques.
        </p>
      </div>

      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-semibold">Academik</span>
            <span>— Aide mémoire & thèse par IA</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/revue-litterature")}>Revue de littérature</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/bibliographie-apa")}>Bibliographie APA</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>Connexion</span>
            <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="hover:text-foreground">Rédacteur Mémoire</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
