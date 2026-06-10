import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  BookOpen, ChevronRight, Check, FileText, Search, Zap, Star,
  GraduationCap, Users, Clock, AlertCircle, ArrowRight, ChevronDown, ChevronUp,
  Link2, Library, Layers, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "Qu'est-ce qu'une bibliographie ?",
    a: "Une bibliographie est la liste complète et organisée de toutes les sources consultées ou citées dans un travail académique (mémoire, thèse, article, rapport). Elle permet au lecteur de retrouver les sources originales et démontre la rigueur scientifique du travail. Elle se distingue de la webographie (sources web) et des notes de bas de page (annotations ponctuelles)."
  },
  {
    q: "Quelle est la différence entre APA, Vancouver, MLA et Chicago ?",
    a: "Chaque norme correspond à un domaine : APA (sciences sociales, psychologie, éducation, santé) utilise un format auteur-date entre parenthèses. Vancouver (médecine, biologie) utilise des numéros entre crochets. MLA (littérature, sciences humaines) utilise auteur-page. Chicago (histoire, droit, sciences humaines) propose deux variantes : notes de bas de page ou auteur-date. Le choix dépend de la discipline et des exigences de votre université ou revue."
  },
  {
    q: "Comment éviter le plagiat dans sa bibliographie ?",
    a: "Pour éviter le plagiat, citez chaque source dès que vous reprenez une idée, un chiffre ou une formulation, même reformulée. Utilisez les guillemets pour les citations directes. Mentionnez systématiquement l'auteur, l'année et la page. Une bibliographie complète et précise est votre meilleure protection contre le plagiat involontaire."
  },
  {
    q: "Faut-il mettre toutes les sources dans la bibliographie ?",
    a: "Règle générale : la bibliographie doit contenir toutes les sources effectivement citées dans le texte — ni plus, ni moins. Les sources consultées mais non citées peuvent figurer dans une 'bibliographie complémentaire' distincte. Ne jamais mettre une source en bibliographie si elle n'est pas référencée dans le corps du texte (sauf mention contraire de votre directeur de mémoire)."
  },
  {
    q: "Comment trier les références dans une bibliographie ?",
    a: "En APA et MLA : classement alphabétique par nom de famille du premier auteur. En Vancouver : classement par ordre d'apparition dans le texte (numérotation). En Chicago : l'ordre dépend de la variante utilisée. Pour les mémoires universitaires français, le classement alphabétique est le standard, avec parfois un regroupement par type de source (ouvrages, articles, sites web, textes officiels)."
  },
  {
    q: "Puis-je générer ma bibliographie automatiquement avec Academik ?",
    a: "Oui. Academik génère automatiquement votre bibliographie dans les formats APA 7, Vancouver, MLA et Chicago. Décrivez votre sujet de recherche, et l'IA identifie les sources pertinentes dans Cairn.info, HAL, PubMed, Google Scholar et ScienceDirect, puis formate les références selon la norme choisie en quelques secondes."
  },
  {
    q: "Comment citer un site internet dans une bibliographie ?",
    a: "Pour un site web en APA 7 : Auteur, A. A. (Année, Jour Mois). Titre de la page. Nom du site. URL. En Vancouver : Auteur AA. Titre de la page [Internet]. Éditeur; Année [cité le JJ/MM/AAAA]. Disponible sur : URL. Toujours noter la date de consultation pour les sites web, car leur contenu peut évoluer."
  },
  {
    q: "Quelle est la différence entre bibliographie et références bibliographiques ?",
    a: "Les deux termes sont souvent interchangeables, mais dans le sens strict : les 'références bibliographiques' désignent uniquement les sources citées dans le texte, tandis que la 'bibliographie' peut inclure des sources consultées sans être explicitement citées. En pratique universitaire française, on parle souvent de 'bibliographie' pour désigner la liste finale des sources d'un travail."
  }
];

const FORMATS = [
  {
    name: "APA 7",
    discipline: "Sciences sociales, Psychologie, Santé",
    style: "Auteur-Date",
    example: "Dupont, M., & Martin, J. (2023). Méthodes de recherche qualitative. Presses Universitaires de France.",
    slug: "/bibliographie-apa",
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200"
  },
  {
    name: "Vancouver",
    discipline: "Médecine, Biologie, Sciences biomédicales",
    style: "Numéroté [1]",
    example: "1. Dupont M, Martin J. Méthodes de recherche qualitative. Paris : PUF; 2023. 312 p.",
    slug: "/bibliographie-vancouver",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200"
  },
  {
    name: "MLA 9",
    discipline: "Littérature, Langues, Sciences humaines",
    style: "Auteur-Page",
    example: "Dupont, Marie, et Jean Martin. Méthodes de Recherche Qualitative. PUF, 2023.",
    slug: "/bibliographie-mla",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200"
  },
  {
    name: "Chicago",
    discipline: "Histoire, Droit, Sciences humaines",
    style: "Notes ou Auteur-Date",
    example: "Dupont, Marie et Jean Martin. Méthodes de recherche qualitative. Paris : PUF, 2023.",
    slug: "/bibliographie-chicago",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200"
  }
];

const STEPS = [
  {
    num: "01",
    title: "Identifiez le format imposé par votre institution",
    content: "Avant de commencer, consultez le guide de style de votre université ou les consignes de votre directeur de mémoire. En France, APA 7 est dominant dans les sciences humaines et sociales, Vancouver en médecine et paramédical, MLA en lettres et langues. Certaines écoles de commerce imposent un format maison. Si aucun format n'est précisé, APA 7 est le choix par défaut le plus accepté.",
    icon: Search
  },
  {
    num: "02",
    title: "Notez vos sources au fur et à mesure",
    content: "L'erreur classique est d'attendre la fin de la rédaction pour constituer sa bibliographie. Notez chaque source dès sa consultation : auteur(s), titre complet, éditeur/revue, année, volume, numéro, pages, DOI ou URL. Utiliser un gestionnaire de références (Zotero, Mendeley) ou Academik dès le début de vos recherches vous évitera des heures de travail à la fin.",
    icon: FileText
  },
  {
    num: "03",
    title: "Vérifiez la fiabilité et la pertinence de chaque source",
    content: "Une bonne bibliographie n'est pas seulement complète, elle est aussi qualitative. Privilégiez les articles publiés dans des revues à comité de lecture (peer-reviewed), les ouvrages d'auteurs reconnus dans le domaine, et les publications récentes (sauf pour les sources fondatrices). Évitez Wikipédia comme source primaire, les sites sans auteur identifiable, et les blogs personnels non académiques.",
    icon: Award
  },
  {
    num: "04",
    title: "Appliquez le format de citation rigoureusement",
    content: "Chaque format a ses règles précises pour la ponctuation, les italiques, l'ordre des éléments et la mise en forme. Une virgule manquante ou un titre non mis en italique peut coûter des points. Utilisez un outil automatique comme Academik pour garantir la conformité au format APA 7, Vancouver, MLA ou Chicago, et vérifiez manuellement 2 à 3 références au hasard.",
    icon: Layers
  },
  {
    num: "05",
    title: "Organisez et relisez votre bibliographie finale",
    content: "Classez vos références selon les règles du format choisi (alphabétique pour APA/MLA, numéroté pour Vancouver). Vérifiez la cohérence : chaque citation dans le texte doit correspondre à une référence en bibliographie et vice versa. Relisez une dernière fois pour les fautes de frappe, les accents manquants et la cohérence de formatage (italiques, majuscules, ponctuation).",
    icon: Check
  }
];

const TYPES = [
  {
    type: "Livre / Ouvrage",
    apa: "Auteur, A. (Année). Titre du livre en italique. Éditeur.",
    example: "Bourdieu, P. (1979). La distinction. Les Éditions de Minuit."
  },
  {
    type: "Article de revue",
    apa: "Auteur, A., & Auteur, B. (Année). Titre de l'article. Nom de la Revue, volume(numéro), pages. https://doi.org/xxxxx",
    example: "Girel, M., & Paugam, S. (2022). Lien social et exclusion. Revue française de sociologie, 63(1), 5–28."
  },
  {
    type: "Thèse / Mémoire",
    apa: "Auteur, A. (Année). Titre de la thèse [Thèse de doctorat, Nom de l'université]. Base de données.",
    example: "Lebrun, C. (2021). Identités numériques chez les adolescents [Thèse de doctorat, Université Paris 8]. HAL."
  },
  {
    type: "Site internet",
    apa: "Auteur, A. (Année, Jour Mois). Titre de la page. Nom du site. URL",
    example: "Dupont, M. (2023, 15 mars). L'intelligence artificielle en éducation. Ministère de l'Éducation. https://..."
  },
  {
    type: "Rapport officiel",
    apa: "Organisme. (Année). Titre du rapport (N° de rapport). Éditeur. URL",
    example: "INSEE. (2023). Tableau de bord de l'économie française (Rapport n°47). INSEE. https://..."
  },
  {
    type: "Chapitre de livre collectif",
    apa: "Auteur, A. (Année). Titre du chapitre. Dans E. Éditeur (Dir.), Titre du livre (pp. xx–xx). Éditeur.",
    example: "Martin, J. (2022). La construction identitaire. Dans P. Dupont (Dir.), Psychologie sociale (pp. 45–72). Armand Colin."
  }
];

const ERRORS = [
  {
    error: "Mélanger les formats dans la même bibliographie",
    fix: "Choisissez un seul format et tenez-vous-y jusqu'à la fin. Si vous utilisez APA 7 pour les articles, utilisez APA 7 pour tous les types de sources."
  },
  {
    error: "Oublier le DOI ou l'URL pour les articles en ligne",
    fix: "Depuis APA 7, le DOI est obligatoire quand il existe. Pour les articles sans DOI, indiquez l'URL de la revue. Ne jamais laisser une référence sans moyen de la retrouver."
  },
  {
    error: "Mettre les titres d'articles entre guillemets au lieu des italiques (ou inversement)",
    fix: "En APA 7 : les titres de revues et de livres sont en italique ; les titres d'articles et de chapitres ne le sont pas. En MLA : c'est l'inverse pour les articles (entre guillemets)."
  },
  {
    error: "Classer les auteurs par prénom au lieu du nom de famille",
    fix: "Toujours classer alphabétiquement par le NOM DE FAMILLE du premier auteur. Dupont, Marie vient avant Martin, Jean — même si 'Marie' précède 'Jean' alphabétiquement."
  },
  {
    error: "Oublier les tirets de continuation pour un même auteur (APA)",
    fix: "En APA 7, si un même auteur apparaît plusieurs fois, remplacez son nom par un tiret long (———) à partir de la deuxième occurrence, en classant ses travaux du plus ancien au plus récent."
  },
  {
    error: "Inclure des sources non citées dans le texte",
    fix: "La bibliographie ne contient que les sources effectivement citées. Si vous voulez signaler des lectures complémentaires, créez une section séparée intitulée 'Pour aller plus loin' ou 'Lectures recommandées'."
  }
];

export default function CommentFaireBibliographie() {
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Comment Faire une Bibliographie : Guide Complet 2025 | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Guide complet pour faire une bibliographie parfaite : normes APA 7, Vancouver, MLA, Chicago. Exemples, erreurs à éviter, générateur automatique gratuit pour étudiants et chercheurs.");
    setMeta('meta[property="og:title"]', "content", "Comment Faire une Bibliographie : Guide Complet 2025 — Academik");
    setMeta('meta[property="og:description"]', "content",
      "Apprenez à faire une bibliographie correcte selon les normes APA 7, Vancouver, MLA et Chicago. Guide pas à pas avec exemples concrets et outil automatique.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/comment-faire-bibliographie";

    const hreflangs = [
      { lang: "fr-FR", href: "https://academik.fr/comment-faire-bibliographie" },
      { lang: "fr-BE", href: "https://academik.fr/comment-faire-bibliographie" },
      { lang: "fr-CH", href: "https://academik.fr/comment-faire-bibliographie" },
      { lang: "fr-CA", href: "https://academik.fr/comment-faire-bibliographie" },
      { lang: "x-default", href: "https://academik.fr/comment-faire-bibliographie" },
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
        "@type": "Article",
        "headline": "Comment Faire une Bibliographie : Guide Complet 2025",
        "description": "Guide complet pour rédiger une bibliographie académique parfaite selon les normes APA 7, Vancouver, MLA et Chicago.",
        "author": { "@type": "Organization", "name": "Academik" },
        "publisher": { "@type": "Organization", "name": "Academik", "url": "https://academik.fr" },
        "url": "https://academik.fr/comment-faire-bibliographie",
        "datePublished": "2025-01-01",
        "dateModified": "2025-06-01",
        "inLanguage": "fr-FR",
        "about": [
          { "@type": "Thing", "name": "bibliographie" },
          { "@type": "Thing", "name": "citation académique" },
          { "@type": "Thing", "name": "APA 7" },
          { "@type": "Thing", "name": "rédaction académique" }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": { "@type": "Answer", "text": f.a }
        }))
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://academik.fr" },
          { "@type": "ListItem", "position": 2, "name": "Guides", "item": "https://academik.fr/guides" },
          { "@type": "ListItem", "position": 3, "name": "Comment faire une bibliographie", "item": "https://academik.fr/comment-faire-bibliographie" }
        ]
      }
    ]);
    document.head.appendChild(script);
    document.documentElement.lang = "fr";
    return () => { script.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-background">

      {/* Nav */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">Academik</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/bibliographie-apa")}>APA 7</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/bibliographie-vancouver")}>Vancouver</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/bibliographie-mla")}>MLA</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/bibliographie-chicago")}>Chicago</span>
          </div>
          <Button onClick={() => setLocation("/connexion")} size="sm" data-testid="button-nav-cta">
            Essayer gratuitement <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-3 text-xs text-muted-foreground flex items-center gap-1">
        <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/")}>Accueil</span>
        <ChevronRight className="w-3 h-3" />
        <span>Guides</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Comment faire une bibliographie</span>
      </div>

      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-violet-50/60 to-background">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">📚 Guide complet · Mis à jour 2025</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
            Comment faire une <span className="text-primary">bibliographie</span> parfaite ?
          </h1>
          <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
            La bibliographie est souvent la partie du travail académique la plus sous-estimée — et la plus sanctionnée. Ce guide complet vous explique <strong>comment faire une bibliographie</strong> rigoureuse selon les normes APA 7, Vancouver, MLA et Chicago, avec des exemples concrets pour chaque type de source.
          </p>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Que vous rédigiez un <span className="cursor-pointer text-primary underline underline-offset-2" onClick={() => setLocation("/memoire-these")}>mémoire de master ou une thèse</span>, un article scientifique ou un rapport professionnel, ce guide couvre tout : la définition, le choix du format, les règles de mise en forme, les erreurs à éviter, et les outils pour automatiser le travail.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Générer ma bibliographie automatiquement <Zap className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => {
              document.getElementById("definition")?.scrollIntoView({ behavior: "smooth" });
            }}>
              Lire le guide complet
            </Button>
          </div>
          <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Lecture : 12 min</span>
            <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> 4 formats couverts</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Pour étudiants & chercheurs</span>
          </div>
        </div>
      </section>

      {/* Table des matières */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/10 bg-primary/5">
            <CardContent className="pt-6">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Library className="w-5 h-5 text-primary" />
                Table des matières
              </h2>
              <ol className="space-y-2 text-sm">
                {[
                  { num: "1", text: "Qu'est-ce qu'une bibliographie ?", anchor: "definition" },
                  { num: "2", text: "Quel format choisir selon votre discipline ?", anchor: "formats" },
                  { num: "3", text: "Comment faire une bibliographie : 5 étapes", anchor: "etapes" },
                  { num: "4", text: "Comment citer chaque type de source", anchor: "types" },
                  { num: "5", text: "Les 6 erreurs les plus courantes (et comment les éviter)", anchor: "erreurs" },
                  { num: "6", text: "Bibliographie pour un mémoire ou une thèse", anchor: "memoire" },
                  { num: "7", text: "Outils pour automatiser sa bibliographie", anchor: "outils" },
                  { num: "8", text: "Recherche bibliographique : trouver des sources fiables", anchor: "recherche" },
                  { num: "9", text: "Questions fréquentes", anchor: "faq" },
                ].map(item => (
                  <li key={item.num} className="flex items-start gap-2">
                    <span className="text-primary font-bold min-w-[20px]">{item.num}.</span>
                    <a href={`#${item.anchor}`} className="text-foreground hover:text-primary transition-colors cursor-pointer">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section 1 — Définition */}
      <section id="definition" className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">1. Qu'est-ce qu'une bibliographie ?</h2>
          <div className="prose max-w-none text-muted-foreground leading-relaxed space-y-4">
            <p>
              Une <strong className="text-foreground">bibliographie</strong> est la liste structurée et complète de toutes les sources utilisées dans un travail académique ou professionnel. Elle figure généralement en fin de document, après la conclusion, et permet à tout lecteur de retrouver les textes originaux cités ou consultés.
            </p>
            <p>
              En milieu universitaire, la bibliographie n'est pas une formalité administrative : elle est le reflet de la démarche scientifique. Une bibliographie bien construite démontre que l'auteur maîtrise les travaux existants dans son domaine, a confronté plusieurs sources, et s'appuie sur des références vérifiables. Elle protège également contre le plagiat, volontaire ou involontaire.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900 mb-1">Bibliographie vs Références bibliographiques vs Webographie</p>
                  <p className="text-amber-800 text-sm">
                    <strong>Bibliographie</strong> : l'ensemble des sources (livres, articles, sites). 
                    <strong> Références bibliographiques</strong> : uniquement les sources explicitement citées dans le texte. 
                    <strong> Webographie</strong> : sous-liste des sources issues du web. 
                    En pratique universitaire française, "bibliographie" est le terme générique le plus utilisé.
                  </p>
                </div>
              </div>
            </div>
            <p>
              Une bibliographie comprend systématiquement : le(s) nom(s) de l'auteur ou des auteurs, l'année de publication, le titre de l'œuvre ou de l'article, le nom de la revue ou de l'éditeur, les numéros de volume et de pages le cas échéant, et l'identifiant numérique (DOI ou URL) pour les sources en ligne.
            </p>
            <p>
              La <strong className="text-foreground">recherche bibliographique</strong> — c'est-à-dire la phase d'identification des sources pertinentes — précède la constitution de la bibliographie. Elle passe par des bases de données académiques comme <span className="cursor-pointer text-primary underline underline-offset-2" onClick={() => setLocation("/recherche-bibliographique")}>Cairn.info, HAL, PubMed ou Google Scholar</span>. Academik automatise cette phase en cherchant et sélectionnant les sources les plus pertinentes pour votre sujet.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 — Formats */}
      <section id="formats" className="py-12 px-4 bg-slate-50/70">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">2. Quel format bibliographique choisir selon votre discipline ?</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Il existe plusieurs normes de citation académique, chacune adaptée à des disciplines spécifiques. Le choix du format n'est pas anodin : utiliser Vancouver dans un mémoire de lettres ou APA dans une thèse de médecine peut entraîner des pénalités. Voici les quatre formats les plus utilisés dans l'enseignement supérieur francophone.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {FORMATS.map(f => (
              <Card key={f.name} className={`border-2 ${f.border} hover:shadow-md transition-shadow cursor-pointer`} onClick={() => setLocation(f.slug)}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`text-xl font-bold ${f.color}`}>{f.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{f.discipline}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">{f.style}</Badge>
                  </div>
                  <div className={`${f.bg} rounded p-3 mb-4`}>
                    <p className="text-xs font-mono text-slate-700 leading-relaxed">{f.example}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${f.color}`}>
                    <span>Guide complet {f.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 p-5 bg-white border rounded-lg">
            <h3 className="font-bold mb-3">Comment choisir le bon format ?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span><strong className="text-foreground">Demandez toujours à votre directeur de mémoire</strong> ou consultez le guide pédagogique de votre université — c'est la règle numéro un.</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span>Si vous soumettez un article à une revue, consultez les instructions aux auteurs (disponibles sur le site de la revue) : le format est presque toujours précisé.</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span>En l'absence de consignes : <strong className="text-foreground">APA 7</strong> est le format le plus polyvalent et accepté dans la plupart des disciplines.</span></li>
              <li className="flex items-start gap-2"><Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" /><span>Academik génère les quatre formats : passez de l'un à l'autre en un clic sans ressaisir les informations.</span></li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 3 — Étapes */}
      <section id="etapes" className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">3. Comment faire une bibliographie : 5 étapes</h2>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Voici le processus complet, de la première lecture à la bibliographie finale, pour n'oublier aucune étape et rendre un travail irréprochable.
          </p>
          <div className="space-y-8">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">{step.num}</span>
                </div>
                <div className="flex-1 pb-8 border-b last:border-b-0">
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 — Types de sources */}
      <section id="types" className="py-12 px-4 bg-slate-50/70">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">4. Comment citer chaque type de source (format APA 7)</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            La structure de la référence varie selon la nature de la source. Voici les 6 types de sources les plus courants en travail académique, avec leur format APA 7 et un exemple concret. Pour les autres formats (<span className="text-primary cursor-pointer underline underline-offset-2" onClick={() => setLocation("/bibliographie-vancouver")}>Vancouver</span>, <span className="text-primary cursor-pointer underline underline-offset-2" onClick={() => setLocation("/bibliographie-mla")}>MLA</span>, <span className="text-primary cursor-pointer underline underline-offset-2" onClick={() => setLocation("/bibliographie-chicago")}>Chicago</span>), consultez les guides dédiés.
          </p>
          <div className="space-y-4">
            {TYPES.map((t, i) => (
              <Card key={i} className="border hover:shadow-sm transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Badge className="bg-primary/10 text-primary border-0 text-xs">{t.type}</Badge>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="bg-slate-100 rounded p-3">
                      <p className="text-xs text-slate-500 mb-1 font-medium">FORMAT</p>
                      <p className="text-xs font-mono text-slate-700 leading-relaxed">{t.apa}</p>
                    </div>
                    <div className="bg-violet-50 rounded p-3">
                      <p className="text-xs text-violet-500 mb-1 font-medium">EXEMPLE</p>
                      <p className="text-xs font-mono text-violet-800 leading-relaxed">{t.example}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 bg-gradient-to-r from-primary/10 to-violet-50 rounded-xl p-6 text-center">
            <p className="text-lg font-bold mb-2">Trop de types de sources à mémoriser ?</p>
            <p className="text-muted-foreground mb-4 text-sm">Academik génère automatiquement la référence correcte pour n'importe quel type de source : article, livre, chapitre, rapport, thèse, site web, film, podcast…</p>
            <Button onClick={() => setLocation("/connexion")} data-testid="button-types-cta">
              Générer mes références automatiquement <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Section 5 — Erreurs */}
      <section id="erreurs" className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">5. Les 6 erreurs les plus courantes dans une bibliographie</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Ces erreurs sont récurrentes dans les copies et mémoires — et souvent sanctionnées. Voici comment les identifier et les corriger avant de rendre votre travail.
          </p>
          <div className="space-y-4">
            {ERRORS.map((e, i) => (
              <div key={i} className="flex gap-4 p-5 border rounded-xl hover:bg-slate-50/70 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-red-700 mb-1">✗ {e.error}</p>
                  <p className="text-sm text-muted-foreground"><span className="font-medium text-green-700">✓ Solution : </span>{e.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — Mémoire/Thèse */}
      <section id="memoire" className="py-12 px-4 bg-slate-50/70">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">6. Bibliographie pour un mémoire ou une thèse</h2>
          <div className="prose max-w-none text-muted-foreground leading-relaxed space-y-4">
            <p>
              La bibliographie d'un <span className="cursor-pointer text-primary underline underline-offset-2" onClick={() => setLocation("/memoire-these")}>mémoire de master ou d'une thèse de doctorat</span> obéit à des règles plus strictes que celle d'un simple devoir. La longueur attendue, le type de sources à mobiliser, et les exigences de format varient selon la discipline et l'établissement.
            </p>

            <div className="grid md:grid-cols-3 gap-4 my-6 not-prose">
              {[
                { niveau: "Licence (L3)", nb: "15 à 30 sources", types: "Manuels, articles de synthèse, quelques articles de recherche" },
                { niveau: "Master (M1/M2)", nb: "40 à 80 sources", types: "Majorité d'articles de recherche, ouvrages spécialisés, thèses" },
                { niveau: "Doctorat", nb: "100 à 400 sources", types: "Articles de recherche récents, monographies, littérature grise, sources primaires" },
              ].map(item => (
                <Card key={item.niveau} className="border">
                  <CardContent className="pt-5">
                    <p className="font-bold text-primary mb-1">{item.niveau}</p>
                    <p className="text-2xl font-bold mb-2">{item.nb}</p>
                    <p className="text-xs text-muted-foreground">{item.types}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p>
              Pour un mémoire de master, la bibliographie doit démontrer que vous maîtrisez l'état des connaissances dans votre domaine. Équilibrez entre <strong className="text-foreground">sources fondatrices</strong> (travaux de référence incontournables, même anciens) et <strong className="text-foreground">sources récentes</strong> (publiées dans les 5 dernières années) pour montrer que vous avez suivi les développements les plus récents du champ.
            </p>
            <p>
              Une bibliographie de thèse peut s'organiser en sous-sections par type de sources : ouvrages généraux, articles scientifiques, thèses et mémoires, sources primaires, sources institutionnelles, sources en ligne. Cette organisation facilite la lecture et démontre la maîtrise méthodologique.
            </p>
            <p>
              La <span className="cursor-pointer text-primary underline underline-offset-2" onClick={() => setLocation("/synthese-bibliographique")}>synthèse bibliographique</span> — analyse critique et commentée des sources — est une compétence distincte de la simple liste de références. Academik peut générer des synthèses thématiques à partir de vos sources identifiées.
            </p>
          </div>
        </div>
      </section>

      {/* Section 7 — Outils */}
      <section id="outils" className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">7. Outils pour automatiser sa bibliographie</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Faire une bibliographie manuellement est chronophage et source d'erreurs. Plusieurs outils permettent d'automatiser tout ou partie du processus. Voici une comparaison des principaux.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 border font-semibold">Outil</th>
                  <th className="text-left p-3 border font-semibold">Points forts</th>
                  <th className="text-left p-3 border font-semibold">Limites</th>
                  <th className="text-left p-3 border font-semibold">Formats</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-primary/5 font-medium">
                  <td className="p-3 border text-primary font-bold">Academik ✦</td>
                  <td className="p-3 border">IA recherche + formate automatiquement, bases FR (Cairn, HAL), synthèse, interface en français</td>
                  <td className="p-3 border">Crédits (à partir de 4,99 €)</td>
                  <td className="p-3 border">APA 7, Vancouver, MLA, Chicago</td>
                </tr>
                <tr>
                  <td className="p-3 border font-medium">Zotero</td>
                  <td className="p-3 border">Gratuit, plugin Word/LibreOffice, synchronisation cloud</td>
                  <td className="p-3 border">Courbe d'apprentissage, installation requise</td>
                  <td className="p-3 border">Tous formats (via CSL)</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border font-medium">Mendeley</td>
                  <td className="p-3 border">Réseau social académique, annotation PDF</td>
                  <td className="p-3 border">Interface lente, propriétaire Elsevier</td>
                  <td className="p-3 border">Tous formats</td>
                </tr>
                <tr>
                  <td className="p-3 border font-medium">CitationMachine</td>
                  <td className="p-3 border">Simple, immédiat, sans inscription</td>
                  <td className="p-3 border">Publicités, erreurs fréquentes à vérifier</td>
                  <td className="p-3 border">APA, MLA, Chicago</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3 border font-medium">BibTeX (LaTeX)</td>
                  <td className="p-3 border">Précis, idéal pour thèses en LaTeX</td>
                  <td className="p-3 border">Réservé aux utilisateurs LaTeX</td>
                  <td className="p-3 border">Tous formats (via style)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 bg-gradient-to-br from-violet-50 to-blue-50 border border-violet-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Pourquoi choisir Academik ?</h3>
                <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                  Contrairement aux outils classiques qui formatent des références que vous avez déjà trouvées, Academik <strong className="text-foreground">recherche ET formate</strong>. Décrivez votre sujet en langage naturel, et l'IA identifie les sources pertinentes dans Cairn, HAL, PubMed et Google Scholar, puis génère la bibliographie dans le format de votre choix — le tout en moins de 30 secondes.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {["Recherche automatique", "Cairn & HAL", "APA/Vancouver/MLA/Chicago", "Synthèse IA", "Équations de recherche"].map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
                <Button onClick={() => setLocation("/connexion")} data-testid="button-outils-cta">
                  Tester Academik — dès 4,99 € <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8 — Recherche bibliographique */}
      <section id="recherche" className="py-12 px-4 bg-slate-50/70">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">8. Recherche bibliographique : trouver des sources fiables</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Une bonne bibliographie commence par une bonne <span className="cursor-pointer text-primary underline underline-offset-2" onClick={() => setLocation("/recherche-bibliographique")}>recherche bibliographique</span>. Voici les bases de données les plus pertinentes selon votre discipline.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {[
              {
                name: "Cairn.info",
                desc: "La principale base de données de sciences humaines et sociales en français. Incontournable pour les recherches en sociologie, psychologie, droit, éducation, sciences politiques.",
                disciplines: "SHS, Droit, Éducation",
                type: "Payant (accès via université)"
              },
              {
                name: "HAL — Hyper Articles en Ligne",
                desc: "Archive ouverte française contenant des milliers de thèses, articles et rapports en accès libre. Excellent pour trouver des sources gratuitement et en open access.",
                disciplines: "Toutes disciplines",
                type: "Gratuit et open access"
              },
              {
                name: "PubMed",
                desc: "Référence absolue en médecine, biologie et sciences de la santé. Contient les articles du MEDLINE et nombreuses revues biomédicales. Accès libre pour la majorité des résumés.",
                disciplines: "Médecine, Biologie, Santé",
                type: "Gratuit (résumés)"
              },
              {
                name: "Google Scholar",
                desc: "Le moteur de recherche académique le plus exhaustif. Indexe toutes les disciplines. Idéal pour une première exploration et pour trouver les articles les plus cités d'un domaine.",
                disciplines: "Toutes disciplines",
                type: "Gratuit"
              },
              {
                name: "ScienceDirect (Elsevier)",
                desc: "Base de données scientifique majeure en sciences exactes, médecine, ingénierie. Accès souvent limité aux abonnés, mais les résumés sont accessibles.",
                disciplines: "Sciences, Médecine, Ingénierie",
                type: "Payant (accès via université)"
              },
              {
                name: "JSTOR",
                desc: "Archive numérique de revues académiques, principalement en sciences humaines et sociales. Accès via la plupart des universités françaises.",
                disciplines: "SHS, Histoire, Littérature",
                type: "Payant (accès via université)"
              }
            ].map(db => (
              <Card key={db.name} className="border hover:shadow-sm transition-shadow">
                <CardContent className="pt-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold">{db.name}</h3>
                    <Badge variant={db.type.startsWith("Gratuit") ? "default" : "secondary"} className="text-xs">
                      {db.type.startsWith("Gratuit") ? "Gratuit" : "Payant/Univ."}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 leading-relaxed">{db.desc}</p>
                  <p className="text-xs text-primary font-medium">{db.disciplines}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-white border rounded-xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Construire une équation de recherche efficace
            </h3>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Pour obtenir des résultats pertinents dans ces bases de données, il faut maîtriser les <strong className="text-foreground">opérateurs booléens</strong> : AND (toutes les conditions), OR (l'une ou l'autre), NOT (exclusion). Exemple pour un sujet sur le bien-être au travail :
            </p>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-400 mb-4">
              ("bien-être au travail" OR "qualité de vie au travail" OR "QVT") AND ("entreprise" OR "organisation") NOT "sport"
            </div>
            <p className="text-sm text-muted-foreground">
              Academik génère automatiquement ces équations de recherche pour votre sujet et les exécute simultanément sur toutes les bases de données — vous récupérez les sources les plus pertinentes sans rédiger une seule équation.
            </p>
          </div>
        </div>
      </section>

      {/* CTA central */}
      <section className="py-16 px-4 bg-primary text-white">
        <div className="max-w-3xl mx-auto text-center">
          <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Arrêtez de formater vos bibliographies à la main</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg leading-relaxed">
            Academik recherche, sélectionne et formate automatiquement vos références en APA 7, Vancouver, MLA ou Chicago. Des milliers d'étudiants et chercheurs en France, Belgique, Suisse et Canada lui font confiance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-cta-central">
              Générer ma bibliographie <Zap className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => setLocation("/")}>
              Découvrir toutes les fonctionnalités
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/60 mt-4">Sans abonnement · Dès 4,99 € · Résultats en moins de 30 secondes</p>
        </div>
      </section>

      {/* Section 9 — FAQ */}
      <section id="faq" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">9. Questions fréquentes sur la bibliographie</h2>
          <p className="text-muted-foreground mb-8">Les questions les plus posées par les étudiants et chercheurs.</p>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="border rounded-xl overflow-hidden">
                <button
                  className="w-full text-left p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  data-testid={`faq-toggle-${i}`}
                >
                  <span className="font-semibold pr-4">{item.q}</span>
                  {openFaq === i ? <ChevronUp className="w-5 h-5 flex-shrink-0 text-primary" /> : <ChevronDown className="w-5 h-5 flex-shrink-0 text-muted-foreground" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed border-t bg-slate-50/50">
                    <p className="pt-4">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Maillage interne — liens vers pages connexes */}
      <section className="py-12 px-4 bg-slate-50/70 border-t">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Link2 className="w-6 h-6 text-primary" />
            Guides bibliographiques complets
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Bibliographie APA 7", href: "/bibliographie-apa", desc: "Sciences sociales & santé" },
              { label: "Bibliographie Vancouver", href: "/bibliographie-vancouver", desc: "Médecine & biologie" },
              { label: "Bibliographie MLA", href: "/bibliographie-mla", desc: "Littérature & langues" },
              { label: "Bibliographie Chicago", href: "/bibliographie-chicago", desc: "Histoire & droit" },
              { label: "Revue de littérature", href: "/revue-litterature", desc: "Synthèse de sources" },
              { label: "Synthèse bibliographique", href: "/synthese-bibliographique", desc: "Analyse critique" },
              { label: "Recherche bibliographique", href: "/recherche-bibliographique", desc: "Trouver des sources" },
              { label: "Mémoire & thèse", href: "/memoire-these", desc: "Guide complet" },
              { label: "Réussir son mémoire de master", href: "/reussir-memoire-master", desc: "Méthodologie" },
            ].map(link => (
              <div
                key={link.href}
                className="bg-white border rounded-lg p-4 cursor-pointer hover:border-primary hover:shadow-sm transition-all group"
                onClick={() => setLocation(link.href)}
              >
                <p className="font-medium text-sm group-hover:text-primary transition-colors">{link.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{link.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setLocation("/")}>
            <BookOpen className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">Academik</span>
            <span>— Outil de recherche bibliographique par IA</span>
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/cgu")}>CGU</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/cgv")}>CGV</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/rgpd")}>RGPD</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/contact")}>Contact</span>
          </div>
          <p>© 2025 Academik · academik.fr</p>
        </div>
      </footer>
    </div>
  );
}
