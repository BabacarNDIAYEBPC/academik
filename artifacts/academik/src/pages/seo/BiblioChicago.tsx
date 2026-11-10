import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, GraduationCap, Users, Clock, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "Qu'est-ce que le style Chicago ?",
    a: "Le style Chicago (Chicago Manual of Style, 17e édition) est une norme bibliographique utilisée principalement en histoire, sciences politiques, économie, droit et certaines branches des sciences humaines. Il propose deux systèmes : les notes de bas de page avec bibliographie (système A, utilisé en histoire et humanités) et le système auteur-date (système B, utilisé en sciences sociales)."
  },
  {
    q: "Quelle est la différence entre Chicago système A (notes) et système B (auteur-date) ?",
    a: "Le système A (Notes & Bibliographie) utilise des notes de bas de page numérotées pour les citations dans le texte, et une bibliographie finale classée alphabétiquement. C'est la norme en histoire, lettres et droit. Le système B (Auteur-Date) utilise des citations parenthétiques (Dupont 2020, 45) dans le texte et une liste de références finale. Il est utilisé en sciences sociales et certaines sciences."
  },
  {
    q: "Comment Academik génère-t-il les notes de bas de page Chicago ?",
    a: "Academik génère automatiquement les notes de bas de page au format Chicago 17e édition pour vos sources. Pour la première citation complète et les citations abrégées (Ibid., Op. cit.), ainsi que la bibliographie finale correspondante. Vous pouvez choisir entre le système A (notes) et le système B (auteur-date)."
  },
  {
    q: "Le style Chicago est-il utilisé dans les universités françaises ?",
    a: "Oui, Chicago est adopté dans plusieurs disciplines françaises, notamment en histoire (très répandu), en sciences politiques, en droit, et en économie. Les grandes écoles et universités françaises l'imposent souvent dans ces filières. En histoire notamment, Chicago système A (notes de bas de page) est la norme de facto."
  },
  {
    q: "Comment citer une archive ou un document primaire en Chicago ?",
    a: "En Chicago système A (notes), une archive se cite : Nom de l'auteur ou institution, « Titre du document, » date, cote, Nom du fonds, Nom de l'institution de conservation, ville. Ex : Archives nationales, « Rapport de gendarmerie sur les troubles de juin 1848, » juin 1848, cote F/7/2345, Fonds Police générale, Archives nationales, Paris."
  },
  {
    q: "Academik peut-il générer des notes de bas de page en Turabian ?",
    a: "Oui. Le style Turabian est une adaptation du Chicago Manual of Style pour les travaux universitaires. Academik génère les citations dans les deux formats : Chicago 17e édition et Turabian 9e édition, qui suivent les mêmes règles de base avec quelques adaptations mineures pour les mémoires et thèses."
  }
];

const EXAMPLES_A = [
  { type: "Note (première citation)", ref: `1. Marie Dupont, Histoire de la Révolution française (Paris : Seuil, 2019), 45.` },
  { type: "Note (citation abrégée)", ref: `2. Dupont, Histoire de la Révolution, 112.` },
  { type: "Bibliographie", ref: `Dupont, Marie. Histoire de la Révolution française. Paris : Seuil, 2019.` },
];

export default function BiblioChicago() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Bibliographie Chicago Automatique — Notes & Auteur-Date | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Générez automatiquement votre bibliographie au format Chicago 17e édition. Notes de bas de page (système A) ou auteur-date (système B). Pour mémoires et thèses en histoire, droit, sciences politiques.");
    setMeta('meta[property="og:title"]', "content", "Générateur Bibliographie Chicago 17 — Academik");
    setMeta('meta[property="og:description"]', "content",
      "Bibliographie Chicago 17 en quelques secondes. Notes de bas de page ou auteur-date. Idéal pour histoire, sciences politiques, droit, économie.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/bibliographie-chicago";

    const hreflangs = [
      { lang: "fr-FR", href: "https://academik.fr/bibliographie-chicago" },
      { lang: "fr-BE", href: "https://academik.fr/bibliographie-chicago" },
      { lang: "fr-CH", href: "https://academik.fr/bibliographie-chicago" },
      { lang: "fr-CA", href: "https://academik.fr/bibliographie-chicago" },
      { lang: "x-default", href: "https://academik.fr/bibliographie-chicago" },
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
        "name": "Academik — Générateur Bibliographie Chicago 17",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "Outil IA pour générer automatiquement des bibliographies au format Chicago 17e édition, système notes ou auteur-date.",
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
      <section className="py-20 px-4 text-center bg-gradient-to-b from-amber-50/60 to-background">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ Chicago 17e édition · Notes & Auteur-Date</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Générateur de{" "}
            <span className="text-primary">Bibliographie Chicago</span>{" "}
            en ligne
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Créez des bibliographies et des <strong>notes de bas de page</strong> au format Chicago 17e édition en quelques secondes.
            Notre IA gère les deux systèmes : notes & bibliographie (histoire, droit) et auteur-date (sciences sociales).
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Indispensable pour les mémoires et thèses en histoire, sciences politiques, droit, économie et sciences humaines en France, Belgique, Suisse et Canada.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Générer ma bibliographie Chicago <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/bibliographie-apa")}>
              Voir aussi : Format APA 7
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Chicago 17e édition</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Notes & Auteur-date</span>
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

      {/* Two systems */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Chicago : deux systèmes, une seule norme</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Le Chicago Manual of Style propose deux systèmes distincts selon votre discipline. Academik maîtrise les deux.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">Système A — Notes & Bibliographie</p>
                    <p className="text-xs text-muted-foreground">Histoire, lettres, droit, arts</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Les sources sont citées en <strong>notes de bas de page numérotées</strong>. La bibliographie finale classe toutes les sources par ordre alphabétique d'auteur.
                </p>
                <div className="space-y-2">
                  {EXAMPLES_A.map(({ type, ref }) => (
                    <div key={type} className="bg-muted/40 rounded p-2">
                      <p className="text-xs font-semibold text-muted-foreground mb-0.5 uppercase">{type}</p>
                      <p className="text-xs font-mono leading-relaxed">{ref}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-muted">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-bold">Système B — Auteur-Date</p>
                    <p className="text-xs text-muted-foreground">Sciences sociales, économie, politique</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Les sources sont citées dans le texte avec <strong>parenthèses auteur-date</strong> : (Dupont 2020, 45). La liste de références finale est classée alphabétiquement.
                </p>
                <div className="space-y-2">
                  <div className="bg-muted/40 rounded p-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-0.5 uppercase">Citation dans le texte</p>
                    <p className="text-xs font-mono">(Dupont 2020, 45)</p>
                  </div>
                  <div className="bg-muted/40 rounded p-2">
                    <p className="text-xs font-semibold text-muted-foreground mb-0.5 uppercase">Référence finale</p>
                    <p className="text-xs font-mono leading-relaxed">Dupont, Marie. 2020. Histoire de la Révolution française. Paris : Seuil.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Comment générer votre bibliographie Chicago ?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">Academik automatise la mise en forme Chicago 17 en trois étapes simples.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", icon: Search, title: "Décrivez votre sujet", desc: "Saisissez votre thématique ou vos sources. L'IA interroge JSTOR, Google Scholar, Cairn, HAL, Gallica, archives.org et les bases de données en histoire et sciences humaines." },
              { step: "2", icon: Zap, title: "L'IA formate en Chicago 17", desc: "Chaque source est mise en forme selon votre système choisi (A ou B) : notes numérotées ou références parenthétiques, avec format spécifique pour archives, manuscrits, sources primaires." },
              { step: "3", icon: FileText, title: "Notes & bibliographie prêtes", desc: "Vos notes de bas de page numérotées et votre bibliographie finale sont générées instantanément, prêtes à coller dans votre traitement de texte." },
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
          <p className="text-center text-muted-foreground mb-12">Un outil complet pour tous vos besoins bibliographiques en histoire et sciences humaines.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Notes de bas de page", desc: "Génération des notes numérotées (première citation complète + citations abrégées Ibid./Op. cit.) en Chicago système A." },
              { title: "Bibliographie finale", desc: "Liste alphabétique des références en format Chicago 17, avec ponctuation et mise en forme correctes (tirets pour même auteur)." },
              { title: "Système auteur-date", desc: "Références parenthétiques (Dupont 2020, 45) et liste de références finale en Chicago système B pour les sciences sociales." },
              { title: "Sources primaires & archives", desc: "Format spécifique pour documents d'archives, manuscrits, correspondances, sources non publiées et collections spéciales." },
              { title: "Sources numériques", desc: "Sites web, bases de données, e-books, documents PDF en ligne — tous formatés selon Chicago 17 avec URL et date d'accès." },
              { title: "Turabian 9e édition", desc: "Adaptation Chicago pour les travaux universitaires : Academik génère aussi au format Turabian, très utilisé dans les mémoires anglophones." },
              { title: "Recherche d'articles", desc: "Academik recherche les articles sur JSTOR, Cairn, HAL, Google Scholar et les formate directement en Chicago 17." },
              { title: "Revue de littérature", desc: "Synthèse et confrontation des sources trouvées pour alimenter votre cadre théorique et votre argumentation historique." },
              { title: "Multi-formats inclus", desc: "En plus de Chicago, Academik génère aussi en APA 7, Vancouver et MLA 9 — au choix sur la même recherche." },
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
                icon: Landmark,
                title: "Étudiants en histoire & sciences politiques",
                desc: "Licence, master, doctorat en histoire, géographie, sciences politiques, relations internationales : Chicago système A (notes) est la norme. Générez vos notes de bas de page et bibliographie en quelques secondes.",
                tags: ["Mémoire histoire", "Master RI", "Doctorat", "Agrégation"]
              },
              {
                icon: GraduationCap,
                title: "Étudiants en droit & économie",
                desc: "Droit privé, droit public, économie, gestion : Chicago système A ou B selon les départements. Academik génère les deux pour les mémoires de master et thèses de doctorat.",
                tags: ["Mémoire droit", "Master économie", "Thèse droit", "Sciences de gestion"]
              },
              {
                icon: Users,
                title: "Chercheurs & enseignants-chercheurs",
                desc: "Préparez vos articles pour les revues d'histoire et de sciences sociales (Annales, Revue historique, RFSP) avec une bibliographie Chicago conforme aux exigences des éditeurs.",
                tags: ["Article revue", "Monographie", "HDR", "Communication"]
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
      <section className="py-20 px-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Prêt à générer votre bibliographie Chicago ?</h2>
          <p className="text-amber-100 mb-8 text-lg">
            Rejoignez 12 000+ étudiants et chercheurs qui utilisent Academik pour leurs travaux académiques.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Commencer maintenant — dès 4,99 € <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-amber-200 text-sm mt-4">Sans abonnement · Paiement sécurisé · Résultats immédiats</p>
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
            <span>— Générateur Bibliographie Chicago 17</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/bibliographie-apa")}>Format APA 7</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/bibliographie-mla")}>Format MLA 9</span>
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
