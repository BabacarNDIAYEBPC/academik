import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, GraduationCap, Users, Clock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "Qu'est-ce que le style bibliographique MLA ?",
    a: "Le style MLA (Modern Language Association) est une norme de citation académique utilisée principalement en littérature, langues, linguistique, sciences humaines et arts. Il est principalement adopté dans les universités américaines, canadiennes et européennes pour les travaux en lettres, études culturelles et traduction."
  },
  {
    q: "Quelle est la différence entre MLA 8 et MLA 9 ?",
    a: "La 9e édition MLA (2021) est la version actuelle. Par rapport à MLA 8, elle précise davantage les règles pour les sources numériques et en ligne, clarifie l'utilisation des URLs et DOI, et introduit de légères modifications sur les titres et l'indication des médiums. Academik génère des citations conformes à MLA 9."
  },
  {
    q: "Comment fonctionne le système auteur-page en MLA ?",
    a: "En MLA, la citation dans le texte indique le nom de l'auteur et le numéro de page entre parenthèses : (Dupont 45). Si le nom est déjà dans le texte, seul le numéro de page apparaît : (45). La bibliographie finale, appelée « Works Cited », liste toutes les sources par ordre alphabétique du nom d'auteur."
  },
  {
    q: "MLA est-il utilisé dans les universités francophones ?",
    a: "Le style MLA est surtout utilisé dans les cursus anglophones, mais il est également adopté dans certains départements de lettres, langues étrangères, études anglophones et littérature comparée des universités françaises, belges, suisses et canadiennes. Vérifiez toujours les consignes de votre département."
  },
  {
    q: "Comment citer un site web en MLA 9 ?",
    a: "En MLA 9, la citation d'un site web inclut : Nom, Prénom. « Titre de la page. » Nom du site, date de publication, URL. Date de consultation. Par exemple : Martin, Claire. « L'évolution du roman francophone. » Cairn.info, 15 mars 2023, www.cairn.info/article/xxx. Consulté le 22 mai 2026."
  },
  {
    q: "Academik peut-il générer une Works Cited complète en MLA ?",
    a: "Oui. Academik recherche vos sources dans Cairn, HAL, Google Scholar et ScienceDirect, puis génère automatiquement la page Works Cited complète au format MLA 9 avec tous les éléments requis : auteurs, titres, conteneurs, éditeurs, dates, numéros et localisateurs (DOI ou URL)."
  }
];

const EXAMPLES = [
  { type: "Article de revue", ref: `Dupont, Marie, et Jean Martin. « Vers une nouvelle lecture du roman mémoriel. » Revue de littérature comparée, vol. 95, no 2, 2023, p. 145-162. doi:10.3917/rlc.095.0145.` },
  { type: "Livre", ref: `Barthes, Roland. Le Degré zéro de l'écriture. Seuil, 1953.` },
  { type: "Chapitre d'ouvrage collectif", ref: `Lejeune, Philippe. « Le pacte autobiographique. » Formes de l'autobiographie, sous la dir. de Claude Burgelin, PUF, 2020, p. 23-56.` },
];

export default function BiblioMla() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Bibliographie MLA Automatique — Générateur MLA 9 en ligne | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Générez automatiquement votre bibliographie au format MLA 9 (Works Cited). Auteur-page, littérature, langues, sciences humaines. Pour mémoires et thèses en lettres et humanités.");
    setMeta('meta[property="og:title"]', "content", "Générateur de Bibliographie MLA 9 — Academik");
    setMeta('meta[property="og:description"]', "content",
      "Bibliographie MLA 9 en quelques secondes. Sources littéraires et humanistes : Cairn, HAL, Google Scholar. Works Cited complète générée automatiquement.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/bibliographie-mla";

    const hreflangs = [
      { lang: "fr-FR", href: "https://academik.fr/bibliographie-mla" },
      { lang: "fr-BE", href: "https://academik.fr/bibliographie-mla" },
      { lang: "fr-CH", href: "https://academik.fr/bibliographie-mla" },
      { lang: "fr-CA", href: "https://academik.fr/bibliographie-mla" },
      { lang: "x-default", href: "https://academik.fr/bibliographie-mla" },
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
        "name": "Academik — Générateur Bibliographie MLA 9",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "Outil IA pour générer automatiquement des bibliographies au format MLA 9 (Works Cited) pour les travaux en lettres et humanités.",
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
      <section className="py-20 px-4 text-center bg-gradient-to-b from-purple-50/60 to-background">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ MLA 9e édition · Modern Language Association</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Générateur de{" "}
            <span className="text-primary">Bibliographie MLA</span>{" "}
            en ligne
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Créez des pages <strong>Works Cited</strong> au format MLA 9 parfaitement conformes en quelques secondes.
            Notre IA recherche vos sources dans Cairn, HAL, Google Scholar et génère automatiquement la bibliographie avec auteur-page, conteneurs et localisateurs.
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Indispensable pour les mémoires et thèses en lettres, langues, linguistique, études culturelles et sciences humaines en France, Belgique, Suisse et Canada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Générer ma bibliographie MLA <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/bibliographie-apa")}>
              Voir aussi : Format APA 7
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> MLA 9e édition</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Works Cited complète</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Dès 4,99 €</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, val: "12 000+", label: "Étudiants & chercheurs" },
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

      {/* What is MLA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-4">Qu'est-ce que le style MLA 9 ?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Le <strong>style MLA</strong> (Modern Language Association) est la norme bibliographique de référence en littérature, langues, linguistique et sciences humaines. Sa 9e édition (2021) est la version actuelle, utilisée par la majorité des universités en Amérique du Nord et dans les départements de lettres européens.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                MLA utilise un système <strong>auteur-page</strong> dans le texte (Dupont 45) et une liste finale intitulée <strong>Works Cited</strong>, classée alphabétiquement par nom d'auteur. Chaque référence suit une structure de « conteneurs » imbriqués qui s'adapte à tous les types de sources.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Academik génère automatiquement vos références MLA 9 pour tous types de sources — articles, livres, chapitres, sites web — en quelques secondes.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Exemples de références MLA 9</p>
              {EXAMPLES.map(({ type, ref }) => (
                <Card key={type} className="border-l-4 border-primary border-t-0 border-b-0 border-r-0 rounded-l-none bg-muted/30">
                  <CardContent className="py-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase">{type}</p>
                    <p className="text-xs font-mono leading-relaxed">{ref}</p>
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
          <h2 className="text-3xl font-bold text-center mb-4">Comment générer votre Works Cited MLA ?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Academik automatise la mise en forme MLA 9 en trois étapes simples.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: Search, title: "Décrivez votre sujet", desc: "Saisissez votre thématique ou les titres de vos sources. L'IA recherche dans Cairn, HAL, Google Scholar, OpenEdition et les grandes bases de données humanistes." },
              { step: "2", icon: Zap, title: "L'IA formate en MLA 9", desc: "Chaque source est structurée selon le système de conteneurs MLA 9 : auteurs, titre, conteneur, autres contributeurs, version, numéro, éditeur, date, localisation." },
              { step: "3", icon: FileText, title: "Works Cited prête à coller", desc: "Votre page Works Cited alphabétique est générée instantanément, avec indentation en retrait de suspension (hanging indent), prête à intégrer dans votre travail." },
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
          <p className="text-center text-muted-foreground mb-12">Un outil complet pour tous vos besoins bibliographiques en lettres et sciences humaines.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Works Cited alphabétique", desc: "Liste de références classée par ordre alphabétique du nom d'auteur, avec indentation en retrait de suspension." },
              { title: "Système de conteneurs MLA 9", desc: "Structure imbriquée pour articles dans revues, chapitres dans ouvrages collectifs, pages sur sites web, etc." },
              { title: "Citation dans le texte", desc: "Format auteur-page correct : (Dupont 45), (Dupont et Martin 112), (« Titre » 45) pour les sources anonymes." },
              { title: "Sources numériques", desc: "Sites web, blogs, podcasts, tweets, vidéos YouTube, bases de données en ligne — tous formatés MLA 9." },
              { title: "Sources francophones", desc: "Cairn.info, HAL, OpenEdition, Persée, Gallica — les grandes bases de données littéraires et humanistes françaises." },
              { title: "Sources anglophones", desc: "JSTOR, Project MUSE, Google Scholar, MLA International Bibliography — accès aux sources anglophones majeures." },
              { title: "Recherche d'articles", desc: "Academik recherche les articles académiques sur votre sujet et les formate directement en MLA 9." },
              { title: "Revue de littérature", desc: "Synthèse et confrontation des sources trouvées pour alimenter votre argumentation et analyse littéraire." },
              { title: "Multi-formats inclus", desc: "En plus de MLA, Academik génère aussi en APA 7, Vancouver et Chicago — au choix sur la même recherche." },
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
                icon: Pencil,
                title: "Étudiants en lettres & langues",
                desc: "Licence, master, doctorat en littérature française, comparée, études anglophones, traductologie, linguistique : générez votre Works Cited MLA 9 pour vos mémoires et articles.",
                tags: ["Mémoire littérature", "DEA", "Master LEA", "Doctorat"]
              },
              {
                icon: GraduationCap,
                title: "Étudiants en sciences humaines",
                desc: "Philosophie, histoire de l'art, études culturelles, cinéma, musicologie, sciences de l'éducation : MLA est souvent requis dans ces disciplines, surtout dans les universités anglophones.",
                tags: ["Philosophie", "Histoire de l'art", "Études culturelles", "SHS"]
              },
              {
                icon: Users,
                title: "Chercheurs & enseignants-chercheurs",
                desc: "Préparez vos articles pour les revues littéraires et humanistes (PMLA, Poétique, Littérature) avec une Works Cited conforme aux exigences MLA des éditeurs internationaux.",
                tags: ["Article revue", "Communication", "Chapitre ouvrage", "HDR"]
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
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Prêt à générer votre bibliographie MLA ?</h2>
          <p className="text-purple-100 mb-8 text-lg">
            Rejoignez 12 000+ étudiants et chercheurs qui utilisent Academik pour leurs travaux académiques.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Commencer maintenant — dès 4,99 € <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-purple-200 text-sm mt-4">Sans abonnement · Paiement sécurisé · Résultats immédiats</p>
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
            <span>— Générateur Bibliographie MLA 9</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/bibliographie-apa")}>Format APA 7</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/bibliographie-vancouver")}>Format Vancouver</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>Connexion</span>
            <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="hover:text-foreground">Rédacteur Mémoire</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
