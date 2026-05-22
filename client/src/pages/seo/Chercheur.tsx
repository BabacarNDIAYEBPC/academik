import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, Users, Clock, Microscope, Globe, BarChart3, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "Academik est-il utile pour les chercheurs confirmés ?",
    a: "Oui. Academik est conçu aussi bien pour les doctorants que pour les chercheurs et enseignants-chercheurs confirmés. La recherche multi-bases simultanée (Scopus, WoS, PubMed, HAL, JSTOR) et la génération d'équations booléennes avancées avec termes MeSH sont particulièrement utiles pour la veille bibliographique et la préparation d'articles."
  },
  {
    q: "Academik peut-il m'aider à rédiger une revue systématique ?",
    a: "Oui. Academik génère des équations de recherche booléennes pour PubMed, Scopus, Web of Science et Cochrane (incluant les termes MeSH), conformément aux recommandations PRISMA. Il propose également une synthèse structurée des résultats pour alimenter votre revue systématique ou méta-analyse."
  },
  {
    q: "Academik formate-t-il les bibliographies selon les normes des revues scientifiques ?",
    a: "Academik génère les bibliographies en APA 7, Vancouver (ICMJE), MLA 9 et Chicago 17. Ces quatre formats couvrent la grande majorité des revues scientifiques francophones et internationales. Pour les exigences spécifiques d'une revue (Nature, Lancet, PLOS ONE), vérifiez le guide auteur de la revue et adaptez si nécessaire."
  },
  {
    q: "En quoi Academik est-il différent de Zotero ou Mendeley ?",
    a: "Zotero et Mendeley sont des gestionnaires de références bibliographiques : ils stockent et formatent vos sources. Academik est un assistant de recherche IA : il cherche des sources, les analyse, les confronte et en génère une synthèse rédigée. Les deux outils sont complémentaires — Academik pour découvrir et analyser, Zotero pour gérer."
  },
  {
    q: "Academik peut-il m'aider pour ma veille bibliographique ?",
    a: "Oui. En enregistrant vos recherches, vous pouvez revenir régulièrement sur un sujet pour identifier les publications récentes. Academik retourne les publications des 5 dernières années par défaut et permet de filtrer jusqu'à 2020 ou toute autre année de référence de votre choix."
  },
  {
    q: "Academik est-il adapté aux chercheurs en sciences humaines et sociales ?",
    a: "Absolument. Academik interroge Cairn.info (la base de référence en SHS francophones), HAL, JSTOR et Google Scholar, qui sont les principales bases pour les sciences humaines et sociales. Il génère les formats Chicago 17 (système A pour les notes) et MLA 9, qui sont les normes en SHS."
  }
];

export default function Chercheur() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Outil de recherche bibliographique pour chercheurs — IA académique | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Academik aide les chercheurs et enseignants-chercheurs à effectuer leur veille bibliographique, préparer leurs revues systématiques et générer leurs bibliographies en APA, Vancouver, MLA ou Chicago.");
    setMeta('meta[property="og:title"]', "content", "Outil IA pour chercheurs — Veille bibliographique & Revue systématique | Academik");
    setMeta('meta[property="og:description"]', "content",
      "Veille bibliographique, revues systématiques et bibliographies formatées pour chercheurs. Academik interroge Scopus, PubMed, WoS, HAL et Cairn simultanément.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/chercheur";

    const hreflangs = [
      { lang: "fr-FR", href: "https://academik.fr/chercheur" },
      { lang: "fr-BE", href: "https://academik.fr/chercheur" },
      { lang: "fr-CH", href: "https://academik.fr/chercheur" },
      { lang: "fr-CA", href: "https://academik.fr/chercheur" },
      { lang: "x-default", href: "https://academik.fr/chercheur" },
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
        "name": "Academik — Outil IA pour chercheurs",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "Outil IA pour chercheurs : veille bibliographique, revues systématiques, équations booléennes, bibliographies en APA/Vancouver/MLA/Chicago.",
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
      <section className="py-20 px-4 text-center bg-gradient-to-b from-teal-50/60 to-background">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ Doctorat · Post-doc · Enseignant-chercheur · HDR</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            L'assistant IA de{" "}
            <span className="text-primary">veille bibliographique</span>{" "}
            pour chercheurs
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Academik accélère votre veille bibliographique, vos <strong>revues systématiques</strong> et la préparation de vos <strong>articles scientifiques</strong>. Interrogation simultanée de Scopus, PubMed, Web of Science, HAL et Cairn — avec génération d'équations booléennes conformes PRISMA.
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Conçu pour les chercheurs, doctorants, post-doctorants et enseignants-chercheurs dans toutes les disciplines académiques.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Commencer ma veille <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/revue-litterature")}>
              Voir : Revue de littérature IA
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Multi-bases simultané</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Équations PRISMA</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Dès 4,99 €</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, val: "12 000+", label: "Utilisateurs académiques" },
            { icon: FileText, val: "40 000+", label: "Synthèses générées" },
            { icon: Star, val: "4,8/5", label: "Note moyenne" },
            { icon: Clock, val: "< 2 min", label: "Par veille" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              <p className="text-2xl font-bold">{val}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pour quels travaux de recherche ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Microscope,
                title: "Revue systématique & méta-analyse",
                desc: "Generez vos équations booléennes pour PubMed, Scopus, Cochrane et Web of Science avec termes MeSH. Synthèse structurée des études pour votre protocole PRISMA.",
                tags: ["PRISMA", "Méta-analyse", "Revue Cochrane", "Revue HAS"]
              },
              {
                icon: Globe,
                title: "Article scientifique & communication",
                desc: "Préparez l'état de l'art de votre article de recherche. Academik identifie les publications clés, les auteurs de référence et les débats actuels dans votre domaine.",
                tags: ["Article original", "Letter", "Review article", "Communication"]
              },
              {
                icon: BookMarked,
                title: "Thèse de doctorat & HDR",
                desc: "Structurez votre revue de littérature, identifiez les lacunes dans la littérature existante et générez votre bibliographie complète dans le format imposé par votre comité de thèse.",
                tags: ["Doctorat", "Post-doc", "HDR", "Rapport de recherche"]
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

      {/* Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Fonctionnalités avancées pour chercheurs</h2>
          <p className="text-center text-muted-foreground mb-12">Un outil conçu pour répondre aux exigences de la recherche académique professionnelle.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Interrogation multi-bases", desc: "Scopus, Web of Science, PubMed, HAL, Cairn, JSTOR, ScienceDirect — toutes les grandes bases interrogées simultanément." },
              { title: "Équations booléennes", desc: "Génération d'équations booléennes complexes avec termes MeSH pour PubMed, syntaxe Scopus, WoS et Cochrane." },
              { title: "Conformité PRISMA", desc: "Structure de recherche conforme aux recommandations PRISMA 2020 pour les revues systématiques et méta-analyses." },
              { title: "Bibliographies multi-formats", desc: "APA 7, Vancouver ICMJE, Chicago 17 (A et B), MLA 9 — les quatre normes majeures des revues scientifiques." },
              { title: "Confrontation bibliographique", desc: "Mapping thématique, confrontation des auteurs, identification des convergences et divergences dans la littérature." },
              { title: "Synthèse rédigée", desc: "Synthèse de la littérature rédigée en français, structurée par thèmes, prête à intégrer dans votre section Introduction ou Discussion." },
              { title: "Fiches de lecture", desc: "Analyse structurée (résumé, méthodologie, résultats, biais, limites) à partir de vos PDF d'articles pour une lecture critique." },
              { title: "Veille par sujet", desc: "Sauvegardez vos recherches et revenez régulièrement pour identifier les nouvelles publications sur vos sujets de veille." },
              { title: "Filtres experts", desc: "Filtrez par période, langue, type d'article (essai clinique, cohorte, revue, méta-analyse), facteur d'impact et base de données." },
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

      {/* Comparison */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Academik vs les outils existants</h2>
          <p className="text-center text-muted-foreground mb-10">Pourquoi Academik complète vos outils de recherche habituels.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 pr-4 font-semibold">Fonctionnalité</th>
                  <th className="text-center py-3 px-4 font-semibold text-primary">Academik</th>
                  <th className="text-center py-3 px-4 font-semibold">Zotero / Mendeley</th>
                  <th className="text-center py-3 px-4 font-semibold">Google Scholar</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Recherche multi-bases simultanée", true, false, false],
                  ["Équations booléennes avancées (MeSH)", true, false, false],
                  ["Synthèse thématique rédigée", true, false, false],
                  ["Confrontation bibliographique", true, false, false],
                  ["Génération bibliographie auto", true, true, false],
                  ["Gestion d'une bibliothèque perso", false, true, false],
                  ["Import PDF et métadonnées", false, true, false],
                  ["Accès aux textes intégraux", false, false, "partiel"],
                ].map(([feat, acad, zot, gs]) => (
                  <tr key={String(feat)} className="border-b hover:bg-muted/20">
                    <td className="py-3 pr-4">{feat}</td>
                    <td className="text-center px-4">{acad === true ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="text-center px-4">{zot === true ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="text-center px-4">{gs === true ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : gs === "partiel" ? <span className="text-xs text-muted-foreground">partiel</span> : <span className="text-muted-foreground">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, a }) => (
              <Card key={q} className="border bg-white">
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
      <section className="py-20 px-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Prêt à accélérer votre veille bibliographique ?</h2>
          <p className="text-teal-100 mb-8 text-lg">
            Rejoignez les chercheurs et enseignants-chercheurs qui utilisent Academik pour gagner du temps sur leur documentation scientifique.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Commencer maintenant — dès 4,99 € <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-teal-200 text-sm mt-4">Sans abonnement · Paiement sécurisé · Résultats en moins de 2 minutes</p>
        </div>
      </section>

      {/* Partner banner */}
      <div className="py-5 px-4 bg-amber-50 border-y border-amber-100 text-center text-sm">
        <p className="text-muted-foreground">
          Besoin d'un <strong>accompagnement pour vos étudiants en mémoire ou thèse</strong> ?{" "}
          <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="text-primary font-semibold underline underline-offset-2 hover:opacity-80">
            Rédacteur Mémoire
          </a>{" "}
          — coaching personnalisé et relecture académique par des experts.
        </p>
      </div>

      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-semibold">Academik</span>
            <span>— Outil IA pour chercheurs</span>
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
