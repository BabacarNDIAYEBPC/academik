import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, GraduationCap, Users, Clock, GitCompare, Map, Layers, ArrowRight, Lightbulb, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logoUrl from "@assets/logo_academik_minimal.png";

const FAQ = [
  {
    q: "Qu'est-ce qu'une synthèse bibliographique ?",
    a: "Une synthèse bibliographique est un texte académique qui analyse, confronte et intègre les résultats de plusieurs sources scientifiques autour d'une thématique commune. Contrairement à un simple résumé ou une liste annotée, la synthèse crée une vision d'ensemble cohérente en identifiant convergences, divergences, évolutions et lacunes dans la littérature existante."
  },
  {
    q: "Quelle est la différence entre une synthèse bibliographique et une revue de littérature ?",
    a: "La revue de littérature (ou état de l'art) est le produit final : un chapitre structuré qui intègre l'ensemble des connaissances sur un sujet. La synthèse bibliographique est l'opération intellectuelle qui permet de construire cette revue : confronter les auteurs entre eux, dégager des thèmes transversaux, identifier les consensus et les débats. Academik réalise automatiquement cette synthèse à partir de vos sources sélectionnées."
  },
  {
    q: "Comment structurer une synthèse bibliographique ?",
    a: "Une synthèse bibliographique efficace s'organise généralement en trois grandes parties : (1) les convergences et consensus dans la littérature, (2) les divergences et débats théoriques entre auteurs, (3) les lacunes et pistes de recherche futures. Cette structure thématique est préférable à une organisation chronologique ou par auteur."
  },
  {
    q: "Combien de sources faut-il pour une synthèse bibliographique ?",
    a: "Pour un mémoire de Master, 20 à 50 sources constituent une base solide. Pour une thèse de doctorat ou une revue systématique, comptez 80 à 200 sources minimum. L'essentiel est que les sources couvrent les différents courants théoriques, les études empiriques majeures et les publications récentes de référence dans votre domaine."
  },
  {
    q: "Academik peut-il générer une synthèse à partir de mes sources ?",
    a: "Oui. Academik analyse vos sources sélectionnées et génère automatiquement une synthèse structurée en français : résumé de chaque article, confrontation thématique, cartographie des courants théoriques et identification des gaps. Le résultat est exportable en Word (docx) pour intégration directe dans votre mémoire."
  },
  {
    q: "Comment éviter le plagiat dans une synthèse bibliographique ?",
    a: "Pour éviter le plagiat, citez systématiquement chaque idée empruntée (auteur, année, page). N'utilisez les citations directes qu'avec parcimonie — préférez la paraphrase avec citation. Avec Academik, chaque élément de la synthèse est relié à ses sources avec les références bibliographiques correctement formatées."
  }
];

const TYPES_SYNTHESE = [
  {
    type: "Synthèse narrative",
    icon: "📖",
    desc: "Forme classique de la revue de littérature. Analyse qualitative et discursive des sources, organisée par thèmes. Idéale pour les SHS, l'éducation, le droit, la philosophie.",
    quand: "Mémoires, thèses en SHS",
    avantages: ["Flexible et argumentative", "Permet les nuances", "Valorise l'analyse critique"],
  },
  {
    type: "Revue systématique",
    icon: "🔬",
    desc: "Protocole rigoureux et reproductible. Suit le diagramme PRISMA. Inclut critères d'inclusion/exclusion explicites et évaluation de la qualité méthodologique des études.",
    quand: "Thèses en santé, sciences",
    avantages: ["Haute rigueur scientifique", "Reproductible", "Reconnue internationalement"],
  },
  {
    type: "Méta-analyse",
    icon: "📊",
    desc: "Analyse statistique combinant les résultats quantitatifs de plusieurs études. Permet de calculer une taille d'effet globale. Niveau de preuve le plus élevé en médecine.",
    quand: "Recherches biomédicales",
    avantages: ["Puissance statistique", "Haut niveau de preuve", "Synthèse quantitative"],
  },
  {
    type: "Scoping review",
    icon: "🗺️",
    desc: "Cartographie l'étendue d'un domaine de recherche. Moins restrictive que la revue systématique. Idéale pour explorer un nouveau champ ou identifier les lacunes de recherche.",
    quand: "Nouveaux sujets de recherche",
    avantages: ["Exploratoire", "Couvre un large périmètre", "Identifie les gaps"],
  },
];

const ETAPES_SYNTHESE = [
  {
    num: "01",
    titre: "Rassembler et trier vos sources",
    desc: "Commencez par regrouper toutes vos sources dans un gestionnaire bibliographique (Zotero, Mendeley, Academik). Lisez les résumés pour exclure les sources non pertinentes. Organisez par thèmes, par auteurs ou par courants théoriques. Visez une couverture représentative : ne sélectionnez pas uniquement les sources qui confirment votre hypothèse.",
    conseil: "💡 Conservez une trace de toutes les sources consultées, même celles exclues. Cela peut être exigé dans votre méthodologie."
  },
  {
    num: "02",
    titre: "Lire de façon analytique",
    desc: "Pour chaque source, notez : (1) la thèse principale ou hypothèse de l'auteur, (2) la méthodologie utilisée, (3) les résultats clés, (4) les limites reconnues, (5) les liens avec votre sujet. Utilisez un tableau comparatif avec une ligne par article et des colonnes par critère d'analyse. Cette grille de lecture systématique est la base de votre synthèse.",
    conseil: "💡 Academik génère automatiquement des fiches de lecture structurées pour chaque article, en analysant le PDF ou les métadonnées."
  },
  {
    num: "03",
    titre: "Identifier les thèmes transversaux",
    desc: "En comparant vos fiches de lecture, identifiez les grands thèmes récurrents qui traversent la littérature. Ces thèmes deviendront les sections principales de votre synthèse. Chaque thème doit être illustré par plusieurs auteurs — évitez les sections monographiques (un thème = un seul auteur) qui constituent une annotation, pas une synthèse.",
    conseil: "💡 La cartographie thématique d'Academik visualise automatiquement les axes thématiques, courants théoriques et auteurs clés de vos sources."
  },
  {
    num: "04",
    titre: "Confronter les auteurs et positions",
    desc: "La valeur d'une synthèse tient à la confrontation des auteurs : qui s'accorde ? Qui s'oppose ? Sur quels points ? Pourquoi ? Formulez explicitement les débats : « Si Dupont (2019) affirme que..., Martin (2021) nuance en montrant que... »  ou « Ces résultats divergent selon le contexte culturel (Lepage, 2018 ; Cohen, 2020) ». Cette mise en dialogue est ce qui distingue une synthèse d'une simple annotation.",
    conseil: "💡 La fonction 'Confrontation' d'Academik génère automatiquement l'analyse comparative de vos sources sélectionnées."
  },
  {
    num: "05",
    titre: "Identifier les consensus et les lacunes",
    desc: "Après avoir cartographié les accords et désaccords, identifiez ce qui fait consensus dans la communauté scientifique et, plus important encore, les zones d'ombre : aspects peu étudiés, contradictions non résolues, populations sous-représentées, contextes non explorés. Ces lacunes justifient votre propre recherche et constituent le cœur de votre problématique.",
    conseil: "💡 Formulez explicitement les lacunes : « À notre connaissance, aucune étude n'a examiné... ce qui justifie... »"
  },
  {
    num: "06",
    titre: "Rédiger la synthèse",
    desc: "Rédigez votre synthèse de manière thématique (et non source par source). Chaque paragraphe traite un aspect du thème en convoquant plusieurs auteurs. Utilisez des connecteurs logiques (cependant, en revanche, de même, bien que) pour marquer les relations entre les positions. Chaque affirmation doit être étayée par une référence. Concluez chaque section par un point de synthèse.",
    conseil: "💡 Évitez la structure « Auteur A dit X. Auteur B dit Y. » — préférez « Sur ce point, deux positions s'affrontent : X (A, 2020 ; B, 2021) vs Y (C, 2019) »."
  },
  {
    num: "07",
    titre: "Citer et formater la bibliographie",
    desc: "Chaque source citée dans le texte doit figurer en bibliographie finale. Utilisez un format homogène (APA 7, Vancouver, MLA ou Chicago selon votre discipline). Academik génère la bibliographie complète et formatée en un clic à partir de vos sources sélectionnées, en vérifiant les DOI et les métadonnées.",
    conseil: "💡 Une bibliographie bien formatée donne immédiatement une impression de sérieux académique. C'est souvent la première chose que regarde un jury."
  }
];

const EXPRESSIONS_UTILES = [
  { cat: "Convergences", exemples: ["Plusieurs auteurs s'accordent sur...", "Ce résultat est confirmé par...", "Un consensus émerge dans la littérature...", "Ces données convergent avec celles de..."] },
  { cat: "Divergences", exemples: ["À l'inverse, Dupont (2021) soutient que...", "Ces résultats contrastent avec ceux de...", "Cette position est contestée par...", "La littérature est partagée sur ce point..."] },
  { cat: "Lacunes", exemples: ["À notre connaissance, aucune étude n'a...", "La littérature reste lacunaire sur...", "Cette question demeure peu explorée...", "Des recherches complémentaires sont nécessaires..."] },
  { cat: "Transitions", exemples: ["Néanmoins, ces travaux présentent des limites...", "Dans cette perspective, il convient de...", "Ce résultat invite à reconsidérer...", "Au regard de ces éléments..."] },
];

export default function SyntheseBibliographique() {
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Comment faire une Synthèse Bibliographique — Guide complet | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Guide complet pour rédiger une synthèse bibliographique : méthode en 7 étapes, types de synthèses, expressions utiles, outil IA Academik. Pour mémoires, thèses et revues.");
    setMeta('meta[property="og:title"]', "content", "Synthèse Bibliographique — Guide complet | Academik");
    setMeta('meta[property="og:description"]', "content",
      "Maîtrisez la synthèse bibliographique : narrative, systématique, méta-analyse. 7 étapes, expressions académiques, génération automatique par IA.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/synthese-bibliographique";

    const existing = document.getElementById("schema-seo-page");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "schema-seo-page";
    script.type = "application/ld+json";
    script.text = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Academik — Synthèse Bibliographique par IA",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "Outil en ligne propulsé par l'IA pour générer une synthèse bibliographique thématique, une revue de littérature et un état de l'art structuré.",
        "offers": { "@type": "Offer", "price": "4.99", "priceCurrency": "EUR" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "reviewCount": "118" }
      },
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Comment faire une Synthèse Bibliographique — Guide complet",
        "description": "Guide méthodologique pour réaliser une synthèse bibliographique académique de qualité.",
        "author": { "@type": "Organization", "name": "Academik" },
        "publisher": { "@type": "Organization", "name": "Academik", "url": "https://academik.fr" },
        "url": "https://academik.fr/synthese-bibliographique",
        "inLanguage": "fr",
        "dateModified": new Date().toISOString().split("T")[0],
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
        "@type": "HowTo",
        "name": "Comment rédiger une synthèse bibliographique",
        "step": ETAPES_SYNTHESE.map(e => ({
          "@type": "HowToStep",
          "name": e.titre,
          "text": e.desc
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
            <img src={logoUrl} alt="Academik" className="w-7 h-7 object-contain" />
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
          <Badge variant="secondary" className="mb-4">✦ Guide méthodologique — Mémoire & Thèse</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Comment rédiger une{" "}
            <span className="text-primary">Synthèse Bibliographique</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            La synthèse bibliographique est l'une des compétences les plus exigeantes — et les plus valorisées — dans l'enseignement supérieur. Elle ne consiste pas à résumer des articles les uns après les autres, mais à <strong>croiser, confronter et intégrer</strong> les connaissances existantes pour construire un état de l'art original et critique.
          </p>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Ce guide vous explique <strong>ce qu'est une vraie synthèse bibliographique</strong>, les différents types (narrative, systématique, méta-analyse), la méthode en 7 étapes et comment Academik automatise cette démarche grâce à l'IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Générer ma synthèse avec l'IA <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/recherche-bibliographique")}>
              Voir le guide recherche bibliographique
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Synthèse en français</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Export Word</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Dès 4,99 €</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, val: "12 000+", label: "Utilisateurs actifs" },
            { icon: FileText, val: "85 000+", label: "Synthèses générées" },
            { icon: Star, val: "4,8/5", label: "Satisfaction" },
            { icon: Clock, val: "< 60 sec", label: "Par synthèse" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              <p className="text-2xl font-bold">{val}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Définition */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-4">Synthèse vs. Résumé vs. Annotation</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Beaucoup d'étudiants confondent ces trois exercices distincts. Voici la différence fondamentale :
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-red-300 pl-4">
                  <p className="font-semibold text-sm">❌ Résumé source par source</p>
                  <p className="text-xs text-muted-foreground mt-1">« Dupont (2018) dit X. Martin (2019) dit Y. Lefebvre (2020) dit Z. » — pas de mise en relation, pas d'analyse comparative. C'est une bibliographie annotée, pas une synthèse.</p>
                </div>
                <div className="border-l-4 border-amber-400 pl-4">
                  <p className="font-semibold text-sm">⚠️ Annotation bibliographique</p>
                  <p className="text-xs text-muted-foreground mt-1">Résumé de chaque source avec un bref commentaire critique. Utile comme outil de travail intermédiaire, mais insuffisant pour une revue de littérature académique.</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="font-semibold text-sm">✅ Vraie synthèse bibliographique</p>
                  <p className="text-xs text-muted-foreground mt-1">Organisation par thèmes transversaux, confrontation explicite des auteurs, identification des consensus et divergences. Les auteurs servent d'arguments pour construire votre propre analyse.</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Ce qu'attend un jury d'une synthèse</h3>
                <ul className="space-y-2">
                  {[
                    "Une organisation thématique (pas auteur par auteur)",
                    "La confrontation explicite de plusieurs auteurs",
                    "L'identification des consensus scientifiques",
                    "La mise en évidence des débats et contradictions",
                    "Le repérage des lacunes de la littérature",
                    "Un regard critique sur la qualité des études citées",
                    "Des citations correctement formatées (APA, Vancouver…)",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-xs text-blue-700 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                  <span><strong>Règle d'or :</strong> Dans une synthèse, <em>votre voix</em> structure le texte. Les auteurs apportent les arguments. Vous orchestrez le dialogue entre eux.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Types de synthèse */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Les différents types de synthèses bibliographiques</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Le type de synthèse attendu varie selon votre discipline, votre niveau d'études et votre problématique de recherche.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {TYPES_SYNTHESE.map(t => (
              <Card key={t.type} className="border-0 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{t.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg">{t.type}</h3>
                        <Badge variant="secondary" className="text-xs">{t.quand}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{t.desc}</p>
                      <div className="space-y-1">
                        {t.avantages.map(a => (
                          <p key={a} className="text-xs flex items-center gap-1.5 text-muted-foreground">
                            <Check className="w-3.5 h-3.5 text-green-500" /> {a}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 7 étapes */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Les 7 étapes pour rédiger une synthèse bibliographique</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Une synthèse bibliographique se construit progressivement. Voici la méthode pas à pas, utilisée par les chercheurs et enseignée dans les universités francophones.
          </p>
          <div className="space-y-5">
            {ETAPES_SYNTHESE.map(e => (
              <Card key={e.num} className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="bg-violet-50 p-6 flex items-center justify-center md:w-24 shrink-0">
                      <span className="text-3xl font-black text-violet-200">{e.num}</span>
                    </div>
                    <div className="p-6 flex-1">
                      <h3 className="font-bold text-lg mb-2">{e.titre}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">{e.desc}</p>
                      <p className="text-xs text-amber-700 bg-amber-50 rounded px-3 py-2 border border-amber-100">{e.conseil}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Expressions utiles */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Expressions académiques pour une synthèse réussie</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Le vocabulaire de la synthèse académique est codifié. Ces formulations marquent les relations logiques entre les sources et montrent votre maîtrise de l'exercice.
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            {EXPRESSIONS_UTILES.map(({ cat, exemples }) => (
              <Card key={cat} className="border">
                <CardContent className="pt-5">
                  <h3 className="font-semibold mb-3 text-sm text-primary">{cat}</h3>
                  <ul className="space-y-2">
                    {exemples.map(ex => (
                      <li key={ex} className="text-sm text-muted-foreground bg-muted/30 rounded px-3 py-1.5 font-mono">{ex}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Academik en action */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Academik génère votre synthèse automatiquement</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            L'IA d'Academik (GPT-4o) analyse vos sources sélectionnées et produit une synthèse bibliographique structurée en français, prête à intégrer dans votre mémoire.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {[
              {
                icon: Search,
                title: "Résumé par article",
                desc: "Pour chaque article sélectionné, Academik génère une fiche de lecture : problématique, méthodologie, résultats clés, apport au domaine et limites. Fondement de votre grille d'analyse comparative."
              },
              {
                icon: GitCompare,
                title: "Confrontation des sources",
                desc: "Academik identifie les convergences et divergences entre vos sources, formule les débats théoriques et met en évidence les positions contradictoires. La matière brute de votre synthèse."
              },
              {
                icon: Map,
                title: "Cartographie thématique",
                desc: "Identification des grands axes thématiques, des courants théoriques dominants et des auteurs centraux. Visualisez la structure de la littérature dans votre domaine en un coup d'œil."
              }
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-slate-50 rounded-xl p-6 border">
            <h3 className="font-semibold mb-4 text-center">Exemple de synthèse générée par Academik</h3>
            <div className="bg-white rounded-lg p-5 border font-sans text-sm text-muted-foreground leading-relaxed space-y-3">
              <p><strong>Thème : Burn-out et qualité de vie au travail chez les infirmiers</strong></p>
              <p>La littérature scientifique s'accorde sur la prévalence élevée du burn-out dans les professions infirmières, avec des taux allant de 25 % à 40 % selon les études (Dupont et al., 2020 ; Maslach &amp; Leiter, 2022). Cependant, des divergences apparaissent quant aux facteurs explicatifs : si la charge de travail est systématiquement citée (Lefebvre, 2019 ; Schneider &amp; Koch, 2021), d'autres auteurs insistent sur le rôle du soutien managérial (Martin, 2020) et du sentiment de cohérence (Antonovsky, dans Caron, 2018).</p>
              <p>Plusieurs études récentes nuancent ce tableau en montrant que les interventions organisationnelles — notamment la réduction du ratio patients/infirmier — ont un effet protecteur significatif (Bernard &amp; Allard, 2023). À l'inverse, Cohen et al. (2022) soulignent que les interventions centrées sur l'individu (mindfulness, résilience) produisent des effets limités si les conditions structurelles ne sont pas modifiées.</p>
              <p className="text-xs text-primary">→ [La synthèse continue sur 800 à 1500 mots selon le nombre de sources…]</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pour qui */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pour quel niveau et quelle discipline ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Master & Doctorat",
                desc: "La synthèse bibliographique est une composante centrale du mémoire de master (chapitre 2) et de la thèse (état de l'art). Academik vous aide à construire un état des connaissances rigoureux en SHS, santé, droit, sciences de l'éducation, psychologie.",
                tags: ["Master 1 & 2", "Doctorat", "HDR", "État de l'art"]
              },
              {
                icon: Search,
                title: "Sciences médicales & santé",
                desc: "Revues systématiques, méta-analyses, scoping reviews. Academik suit la méthodologie PRISMA et génère des synthèses conformes aux standards des revues médicales indexées (MEDLINE, Cochrane).",
                tags: ["Médecine", "Infirmiers", "Pharmacie", "PRISMA"]
              },
              {
                icon: Users,
                title: "Sciences humaines & sociales",
                desc: "Sociologie, psychologie, sciences de l'éducation, travail social. Academik maîtrise les normes APA 7 et Chicago, et génère des synthèses narratives structurées adaptées aux SHS francophones.",
                tags: ["APA 7", "Chicago", "Sociologie", "Éducation"]
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

      {/* Liens internes */}
      <section className="py-12 px-4 bg-muted/20 border-y">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-center mb-6">Complétez votre démarche avec Academik</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Recherche bibliographique", path: "/recherche-bibliographique" },
              { label: "Revue de littérature", path: "/revue-litterature" },
              { label: "Bibliographie APA 7", path: "/bibliographie-apa" },
              { label: "Mémoire & Thèse", path: "/memoire-these" },
            ].map(({ label, path }) => (
              <button key={path} onClick={() => setLocation(path)}
                className="flex items-center justify-between gap-2 p-3 rounded-lg border bg-white hover:border-primary/50 hover:shadow-sm transition-all text-sm font-medium text-left">
                {label}
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes sur la synthèse bibliographique</h2>
          <div className="space-y-3">
            {FAQ.map(({ q, a }, i) => (
              <Card key={i} className="border cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-semibold text-sm">{q}</h3>
                    <ChevronRight className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-90" : ""}`} />
                  </div>
                  {openFaq === i && <p className="text-sm text-muted-foreground leading-relaxed mt-3 pt-3 border-t">{a}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-violet-600 to-violet-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Générez votre synthèse bibliographique maintenant</h2>
          <p className="text-violet-100 mb-8 text-lg">
            Sélectionnez vos sources, laissez Academik analyser, confronter et synthétiser. Obtenez une revue de littérature structurée en français, exportable en Word.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Commencer — dès 4,99 € <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-violet-200 text-sm mt-4">Sans abonnement · Export Word · Résultats en moins de 60 secondes</p>
        </div>
      </section>

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
            <img src={logoUrl} alt="Academik" className="w-5 h-5 object-contain" />
            <span className="font-semibold">Academik</span>
            <span>— Synthèse bibliographique par IA</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/")}>Accueil</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/recherche-bibliographique")}>Recherche biblio</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>Connexion</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
