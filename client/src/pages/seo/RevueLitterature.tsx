import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, GraduationCap, Users, Clock, GitMerge, Brain, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "Qu'est-ce qu'une revue de littérature ?",
    a: "Une revue de littérature (ou revue de la littérature) est une analyse critique et synthétique des travaux scientifiques existants sur un sujet donné. Elle permet d'identifier l'état des connaissances actuelles, les débats en cours et les lacunes dans la recherche. C'est une étape incontournable dans tout mémoire, thèse ou article scientifique."
  },
  {
    q: "Comment Academik génère-t-il une revue de littérature ?",
    a: "Academik recherche des articles scientifiques dans Cairn, HAL, PubMed, Google Scholar et ScienceDirect selon votre thématique. L'IA analyse et compare les sources trouvées, identifie les thèmes convergents et divergents, puis rédige automatiquement une synthèse structurée avec confrontation des auteurs et mapping thématique."
  },
  {
    q: "Combien de temps faut-il pour générer une revue de littérature ?",
    a: "Avec Academik, une revue de littérature complète sur un sujet donné est générée en moins de 2 minutes. Le processus inclut la recherche de sources, l'analyse des contenus, la confrontation des points de vue et la rédaction de la synthèse."
  },
  {
    q: "Quelle est la différence entre revue narrative et revue systématique ?",
    a: "La revue narrative synthétise les travaux existants de manière thématique sans protocole de recherche strict. La revue systématique suit un protocole rigoureux (PRISMA) avec des critères d'inclusion/exclusion explicites, des équations de recherche et un processus reproductible. Academik peut vous aider dans les deux cas."
  },
  {
    q: "Academik peut-il générer des équations de recherche pour PubMed ?",
    a: "Oui. Academik génère automatiquement des équations de recherche booléennes adaptées à PubMed, Scopus, Web of Science et Cochrane. Ces équations incluent les MeSH terms appropriés, les opérateurs booléens (AND, OR, NOT) et les filtres de date et de langue."
  },
  {
    q: "Les sources trouvées par Academik sont-elles fiables ?",
    a: "Academik interroge exclusivement des bases de données académiques reconnues : Cairn.info, HAL, PubMed/MEDLINE, Google Scholar et ScienceDirect. Les sources sont des articles évalués par les pairs (peer-reviewed), des thèses et des ouvrages académiques. L'IA filtre les sources selon leur pertinence et leur qualité."
  }
];

export default function RevueLitterature() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Revue de Littérature Automatique IA — Générateur en ligne | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Générez automatiquement votre revue de littérature avec l'IA. Recherche de sources, synthèse, confrontation d'auteurs et mapping thématique en moins de 2 minutes. Pour mémoires et thèses.");
    setMeta('meta[property="og:title"]', "content", "Revue de Littérature Automatique IA — Academik");
    setMeta('meta[property="og:description"]', "content",
      "Créez une revue de littérature complète en quelques minutes grâce à l'IA. Sources académiques : Cairn, HAL, PubMed, Google Scholar.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/revue-litterature";

    const hreflangs = [
      { lang: "fr-FR", href: "https://academik.fr/revue-litterature" },
      { lang: "fr-BE", href: "https://academik.fr/revue-litterature" },
      { lang: "fr-CH", href: "https://academik.fr/revue-litterature" },
      { lang: "fr-CA", href: "https://academik.fr/revue-litterature" },
      { lang: "x-default", href: "https://academik.fr/revue-litterature" },
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
        "name": "Academik — Revue de Littérature IA",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "Outil IA pour générer automatiquement des revues de littérature, synthèses bibliographiques et équations de recherche.",
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
      <section className="py-20 px-4 text-center bg-gradient-to-b from-emerald-50/60 to-background">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ Propulsé par GPT-4o</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Revue de{" "}
            <span className="text-primary">Littérature</span>{" "}
            automatique par IA
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Générez une <strong>revue de littérature complète</strong> en moins de 2 minutes.
            Recherche de sources, confrontation d'auteurs, mapping thématique et synthèse rédigée — tout automatiquement grâce à l'intelligence artificielle.
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Indispensable pour les mémoires de master, thèses de doctorat et articles scientifiques en France, Belgique, Suisse, Canada et Luxembourg.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Générer ma revue de littérature <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/bibliographie-apa")}>
              Voir aussi : Bibliographie APA
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Moins de 2 minutes</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Sources vérifiées</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Dès 4,99 €</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, val: "12 000+", label: "Chercheurs & étudiants" },
            { icon: GitMerge, val: "40 000+", label: "Synthèses générées" },
            { icon: Star, val: "4,8/5", label: "Note moyenne" },
            { icon: Clock, val: "< 2 min", label: "Temps de génération" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              <p className="text-2xl font-bold">{val}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What is it */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Qu'est-ce qu'une revue de littérature ?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                La <strong>revue de littérature</strong> est une analyse critique et synthétique des publications scientifiques sur un sujet donné. Elle constitue le socle théorique de tout travail de recherche : mémoire de master, thèse de doctorat, article scientifique ou rapport professionnel.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Une bonne revue de littérature doit identifier l'état actuel des connaissances, confronter les positions des auteurs, repérer les consensus et les controverses, et mettre en évidence les lacunes dans la recherche existante.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Academik automatise ce processus fastidieux : en quelques minutes, il recherche, analyse et synthétise des dizaines de sources académiques pour vous.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Search, title: "Revue narrative", desc: "Synthèse thématique des travaux existants. Idéale pour les mémoires et thèses en sciences humaines et sociales." },
                { icon: ListOrdered, title: "Revue systématique", desc: "Protocole PRISMA rigoureux avec critères d'inclusion/exclusion. Standard en médecine et sciences de la santé." },
                { icon: Brain, title: "Revue thématique", desc: "Mapping conceptuel des thèmes principaux, sous-thèmes et relations entre les auteurs et leurs positions." },
              ].map(({ icon: Icon, title, desc }) => (
                <Card key={title} className="border-l-4 border-primary border-t-0 border-b-0 border-r-0 rounded-l-none">
                  <CardContent className="py-4 flex gap-3">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1">{title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Comment fonctionne la revue de littérature IA ?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Academik combine recherche automatisée et intelligence artificielle pour produire une synthèse académique de qualité en quelques minutes.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", icon: Search, title: "Recherche multi-bases", desc: "L'IA interroge Cairn, HAL, PubMed, Google Scholar et ScienceDirect selon votre thématique et vos critères de recherche." },
              { step: "2", icon: FileText, title: "Analyse des sources", desc: "Chaque source est analysée : méthodologie, résultats, conclusions, limites. L'IA extrait les informations clés." },
              { step: "3", icon: GitMerge, title: "Confrontation des auteurs", desc: "L'IA identifie les convergences, divergences et controverses entre les auteurs pour structurer le débat scientifique." },
              { step: "4", icon: Zap, title: "Synthèse rédigée", desc: "Une synthèse fluide et structurée est générée automatiquement, avec la bibliographie APA 7 ou Vancouver associée." },
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
          <h2 className="text-3xl font-bold text-center mb-4">Tout pour votre recherche académique</h2>
          <p className="text-center text-muted-foreground mb-12">Au-delà de la revue de littérature, Academik couvre toutes vos étapes de recherche.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Synthèse automatique", desc: "Confrontation des auteurs, mapping thématique et synthèse rédigée en style académique." },
              { title: "Équations de recherche", desc: "Génération d'équations booléennes pour PubMed, Scopus, Web of Science et Cochrane avec MeSH terms." },
              { title: "Bibliographie APA 7", desc: "Toutes vos sources formatées en APA 7, Vancouver, MLA ou Chicago en un clic." },
              { title: "Fiches de lecture", desc: "Générez des fiches de lecture structurées (résumé, méthodologie, limites) à partir de vos PDF." },
              { title: "Sources francophones", desc: "Cairn.info, HAL, OpenEdition, Persée — les grandes bases françaises, belges et québécoises." },
              { title: "Sources internationales", desc: "PubMed/MEDLINE, Google Scholar, ScienceDirect, Cochrane — accès aux publications mondiales." },
              { title: "Filtres avancés", desc: "Filtrez par période, langue, type de document (article, thèse, livre), niveau de preuve." },
              { title: "Mots-clés et MeSH", desc: "Identification automatique des mots-clés pertinents et des descripteurs MeSH pour votre sujet." },
              { title: "Export Word / PDF", desc: "Exportez votre revue de littérature directement dans Word ou Google Docs en un clic." },
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
                title: "Étudiants Master & Doctorat",
                desc: "Accélérez la rédaction de votre cadre théorique et de votre revue de littérature. Idéal pour les mémoires IMRAD, TFE, thèses de doctorat en France, Belgique, Suisse, Canada et Luxembourg.",
                tags: ["Mémoire M1/M2", "Thèse", "TFE", "IMRAD"]
              },
              {
                icon: Search,
                title: "Chercheurs & Enseignants",
                desc: "Accélérez vos revues systématiques, identifiez rapidement l'état de l'art sur un sujet et préparez vos articles pour les journaux peer-reviewed.",
                tags: ["Revue systématique", "Article", "HDR", "Grant"]
              },
              {
                icon: Users,
                title: "Professionnels de santé",
                desc: "Infirmiers, médecins, kinésithérapeutes, psychologues : produisez des revues de littérature pour vos mémoires de spécialité, DU et publications professionnelles.",
                tags: ["DU/DIU", "Protocoles EBP", "Spécialité", "Formation"]
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
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Prêt à générer votre revue de littérature ?</h2>
          <p className="text-emerald-100 mb-8 text-lg">
            Rejoignez 12 000+ étudiants et chercheurs qui utilisent Academik pour accélérer leur recherche académique.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Commencer maintenant — dès 4,99 € <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-emerald-200 text-sm mt-4">Sans abonnement · Paiement sécurisé · Résultats en moins de 2 minutes</p>
        </div>
      </section>

      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-semibold">Academik</span>
            <span>— Revue de littérature par IA</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/bibliographie-apa")}>Bibliographie APA</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>Connexion</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/en/literature-review")}>English</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
