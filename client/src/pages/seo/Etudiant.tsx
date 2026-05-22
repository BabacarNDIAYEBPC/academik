import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, GraduationCap, Users, Clock, Target, Brain, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "Academik est-il adapté aux étudiants en licence ?",
    a: "Oui. Academik est conçu pour tous les niveaux académiques, de la licence au doctorat. Les étudiants en L3 utilisant Academik pour leurs travaux de recherche, leurs exposés et leurs dossiers trouveront une interface simple et des résultats immédiatement utilisables. Les filtres de niveau permettent d'ajuster la complexité des sources retournées."
  },
  {
    q: "Comment Academik m'aide-t-il à trouver des sources pour mes cours ?",
    a: "Vous saisissez votre sujet de cours ou votre question de recherche dans Academik. L'outil interroge automatiquement Cairn.info, HAL, Google Scholar, PubMed et ScienceDirect, puis vous retourne une liste de sources pertinentes avec leurs résumés. Vous pouvez ensuite les filtrer par date, langue, discipline ou type de document."
  },
  {
    q: "Quelle est la différence entre Academik et Google Scholar ?",
    a: "Google Scholar retourne une liste brute de résultats que vous devez trier manuellement. Academik analyse les résultats, génère une synthèse thématique, confronte les auteurs entre eux, et formate automatiquement la bibliographie dans le style requis (APA, Vancouver, MLA ou Chicago). C'est un assistant de recherche, pas un simple moteur de recherche."
  },
  {
    q: "Combien coûte Academik pour un étudiant ?",
    a: "Academik fonctionne sur un système de crédits sans abonnement. Le pack Starter (10 crédits, 4,99 €) est suffisant pour 10 recherches complètes. Chaque action IA (recherche, synthèse, bibliographie) coûte 1 crédit. Il n'y a pas d'abonnement mensuel — vous achetez uniquement ce dont vous avez besoin."
  },
  {
    q: "Academik génère-t-il des bibliographies conformes aux normes universitaires françaises ?",
    a: "Oui. Academik génère des bibliographies conformes aux normes APA 7, Vancouver (ICMJE), MLA 9 et Chicago 17, qui sont les quatre formats les plus utilisés dans les universités françaises, belges, suisses et canadiennes. Vérifiez simplement le format requis par votre directeur de mémoire ou votre enseignant."
  },
  {
    q: "Puis-je utiliser Academik pour un devoir de recherche de 2000 mots ?",
    a: "Absolument. Pour un devoir court (exposé, dossier, dissertation de 1000 à 5000 mots), une recherche Academik suffit généralement pour identifier les 5 à 15 sources pertinentes et générer la bibliographie correspondante. C'est aussi rapide qu'efficace pour les petits travaux universitaires."
  }
];

export default function Etudiant() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Outil de recherche académique pour étudiants — Bibliographie & Sources | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Academik aide les étudiants en licence, master et prépa à trouver des sources académiques et générer leurs bibliographies en APA, Vancouver, MLA ou Chicago. Résultats en moins de 2 minutes.");
    setMeta('meta[property="og:title"]', "content", "Outil IA pour étudiants — Recherche académique & Bibliographie | Academik");
    setMeta('meta[property="og:description"]', "content",
      "Trouvez des sources académiques fiables et générez votre bibliographie automatiquement. Academik, l'assistant IA pour tous les étudiants francophones.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/etudiant";

    const hreflangs = [
      { lang: "fr-FR", href: "https://academik.fr/etudiant" },
      { lang: "fr-BE", href: "https://academik.fr/etudiant" },
      { lang: "fr-CH", href: "https://academik.fr/etudiant" },
      { lang: "fr-CA", href: "https://academik.fr/etudiant" },
      { lang: "x-default", href: "https://academik.fr/etudiant" },
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
        "name": "Academik — Outil de recherche académique pour étudiants",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "Outil IA pour aider les étudiants à trouver des sources académiques et générer des bibliographies en APA, Vancouver, MLA ou Chicago.",
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
      <section className="py-20 px-4 text-center bg-gradient-to-b from-violet-50/60 to-background">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ Licence · Master · Prépa · Grande École</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            L'assistant IA pour{" "}
            <span className="text-primary">étudiants</span>{" "}
            qui veulent des sources fiables
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Fini les heures perdues sur Google à chercher des articles. Academik trouve les <strong>sources académiques pertinentes</strong> pour votre sujet, génère votre <strong>bibliographie formatée</strong> et rédige une <strong>synthèse de la littérature</strong> — en moins de 2 minutes.
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Utilisé par des milliers d'étudiants en licence, master et prépa dans toute la francophonie : France, Belgique, Suisse, Canada, Luxembourg, Monaco.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Commencer ma recherche <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/memoire-these")}>
              Voir : Aide mémoire & thèse
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
            { icon: FileText, val: "85 000+", label: "Bibliographies générées" },
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

      {/* Problems */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Vous reconnaissez-vous ?</h2>
          <p className="text-center text-muted-foreground mb-12">Les problèmes que rencontrent tous les étudiants pendant leurs recherches bibliographiques.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { prob: "« Je ne sais pas par où commencer »", sol: "Academik génère une liste de sources structurées dès que vous tapez votre sujet." },
              { prob: "« Je trouve des sources sur Google, mais pas sûr qu'elles soient académiques »", sol: "Academik interroge uniquement des bases scientifiques : Cairn, HAL, PubMed, Google Scholar." },
              { prob: "« La mise en forme de ma bibliographie me prend des heures »", sol: "Academik génère la bibliographie entière en APA, Vancouver, MLA ou Chicago en un clic." },
              { prob: "« Mon prof dit que mes sources ne sont pas assez récentes »", sol: "Filtrez par période (ex. 2019–2024) pour n'obtenir que les publications récentes." },
              { prob: "« Je ne sais pas comment rédiger ma revue de littérature »", sol: "Academik génère une synthèse thématique prête à adapter pour votre cadre théorique." },
              { prob: "« Je dois trouver 30 sources et je n'en ai trouvé que 5 »", sol: "Academik interroge simultanément 5+ bases de données et retourne jusqu'à 20 sources pertinentes." },
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
          <h2 className="text-3xl font-bold text-center mb-4">Comment ça marche ?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">Trois étapes pour passer du sujet vague à la bibliographie parfaite.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: Search, title: "Tapez votre sujet", desc: "Entrez votre question de recherche, votre titre de mémoire ou votre sujet de cours. Ajoutez des filtres si besoin : période, langue, discipline, type de source." },
              { step: "2", icon: Brain, title: "L'IA analyse et synthétise", desc: "Academik interroge Cairn, HAL, PubMed et Google Scholar, puis analyse les résultats et génère une synthèse des principales tendances, courants et débats." },
              { step: "3", icon: FileText, title: "Bibliographie prête en 1 clic", desc: "Choisissez votre format (APA 7, Vancouver, MLA 9, Chicago 17) et copiez votre bibliographie parfaitement mise en forme dans Word ou Google Docs." },
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
          <h2 className="text-3xl font-bold text-center mb-12">Pour tous vos travaux universitaires</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Exposés & dossiers",
                desc: "Trouvez rapidement 5 à 10 sources solides pour votre exposé de TD, votre dossier de cours ou votre note de synthèse. Bibliographie prête en quelques secondes.",
                tags: ["Exposé de TD", "Dossier", "Note de synthèse", "Commentaire de texte"]
              },
              {
                icon: GraduationCap,
                title: "Mémoire de master",
                desc: "M1 ou M2 : identifiez l'état de l'art sur votre sujet, structurez votre revue de littérature et générez votre bibliographie complète dans le format imposé par votre directeur.",
                tags: ["Mémoire M1", "Mémoire M2", "TFE", "Mémoire pro"]
              },
              {
                icon: Award,
                title: "Concours & grandes écoles",
                desc: "Note de synthèse, rapport de stage, travail d'étude et de recherche (TER) en prépa ou grande école : Academik structure rapidement votre veille bibliographique.",
                tags: ["Prépa", "Grande école", "Sciences Po", "TER"]
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
          <h2 className="text-3xl font-bold text-center mb-4">Toutes les fonctionnalités pour les étudiants</h2>
          <p className="text-center text-muted-foreground mb-12">Un seul outil pour toutes les étapes de votre recherche documentaire.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Recherche multi-bases", desc: "Cairn, HAL, PubMed, Google Scholar, ScienceDirect — interrogés simultanément selon votre discipline." },
              { title: "Bibliographie APA 7", desc: "Format le plus utilisé en SHS, psychologie et éducation. Généré automatiquement, conforme à l'édition 2020." },
              { title: "Bibliographie Vancouver", desc: "Format numéroté pour les filières de santé : IFSI, médecine, kinésithérapie, ergothérapie." },
              { title: "Bibliographie MLA 9", desc: "Works Cited pour les masters en lettres, langues, littérature et études anglophones." },
              { title: "Bibliographie Chicago 17", desc: "Notes de bas de page ou auteur-date pour l'histoire, le droit, les sciences politiques." },
              { title: "Synthèse de littérature", desc: "Analyse thématique des sources : principaux courants, points d'accord et de débat, lacunes." },
              { title: "Équations de recherche", desc: "Équations booléennes pour PubMed, Scopus, Cochrane — utiles en master santé ou pour les revues systématiques." },
              { title: "Filtres de recherche", desc: "Filtrez par date, langue (français/anglais), niveau (licence/master/doctorat), type de source." },
              { title: "Sauvegarde des recherches", desc: "Retrouvez toutes vos recherches sauvegardées dans votre espace personnel sur le tableau de bord." },
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

      {/* Pricing */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Un tarif étudiant accessible</h2>
          <p className="text-muted-foreground mb-10">Pas d'abonnement mensuel. Achetez uniquement ce dont vous avez besoin.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: "Starter", credits: "10 crédits", price: "4,99 €", desc: "Parfait pour un dossier ou une recherche ponctuelle" },
              { name: "Essentiel", credits: "30 crédits", price: "11,99 €", desc: "Idéal pour un mémoire ou un semestre complet", highlight: true },
              { name: "Pro", credits: "100 crédits", price: "29,99 €", desc: "Pour une thèse ou une année académique intense" },
            ].map(({ name, credits, price, desc, highlight }) => (
              <Card key={name} className={`border-2 ${highlight ? "border-primary" : "border-muted"}`}>
                <CardContent className="pt-6 text-center">
                  {highlight && <Badge className="mb-2 text-xs">Le plus populaire</Badge>}
                  <p className="font-bold text-lg">{name}</p>
                  <p className="text-3xl font-bold my-2">{price}</p>
                  <p className="text-sm font-semibold text-primary mb-2">{credits}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-6">1 crédit = 1 action IA (recherche, synthèse ou bibliographie)</p>
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
      <section className="py-20 px-4 bg-gradient-to-r from-violet-600 to-violet-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Prêt à trouver vos sources en 2 minutes ?</h2>
          <p className="text-violet-100 mb-8 text-lg">
            Rejoignez 12 000+ étudiants qui utilisent Academik pour gagner du temps sur leurs recherches bibliographiques.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Commencer maintenant — dès 4,99 € <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-violet-200 text-sm mt-4">Sans abonnement · Paiement sécurisé · Résultats immédiats</p>
        </div>
      </section>

      {/* Partner banner */}
      <div className="py-5 px-4 bg-amber-50 border-y border-amber-100 text-center text-sm">
        <p className="text-muted-foreground">
          Besoin d'aide pour <strong>rédiger votre mémoire ou votre thèse</strong> ?{" "}
          <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="text-primary font-semibold underline underline-offset-2 hover:opacity-80">
            Rédacteur Mémoire
          </a>{" "}
          — accompagnement personnalisé par des experts académiques.
        </p>
      </div>

      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-semibold">Academik</span>
            <span>— Outil académique pour étudiants</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/memoire-these")}>Mémoire & Thèse</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/revue-litterature")}>Revue de littérature</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>Connexion</span>
            <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="hover:text-foreground">Rédacteur Mémoire</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
