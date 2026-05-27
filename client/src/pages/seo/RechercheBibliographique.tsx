import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, GraduationCap, Users, Clock, Database, Filter, Target, AlertCircle, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logoUrl from "@assets/logo_academik_minimal.png";

const FAQ = [
  {
    q: "Qu'est-ce qu'une recherche bibliographique ?",
    a: "Une recherche bibliographique est une démarche méthodique qui consiste à identifier, localiser et sélectionner des documents (articles scientifiques, ouvrages, rapports) pertinents pour répondre à une question de recherche. Elle constitue la première étape incontournable de tout travail académique : mémoire, thèse, revue de littérature ou article scientifique."
  },
  {
    q: "Quelles bases de données utiliser pour une recherche bibliographique ?",
    a: "Les principales bases de données académiques sont : PubMed (sciences médicales et biomédicales), Google Scholar (multidisciplinaire), HAL (archives ouvertes françaises), Cairn (sciences humaines et sociales francophones), ScienceDirect (Elsevier), Scopus et Web of Science. Academik interroge simultanément ces sources pour vous donner les résultats les plus pertinents."
  },
  {
    q: "Comment construire une équation de recherche ?",
    a: "Une équation de recherche utilise des opérateurs booléens (AND, OR, NOT) pour combiner des mots-clés. Par exemple : « burn-out AND infirmiers AND (France OR Europe) ». Academik génère automatiquement les équations de recherche adaptées à vos bases de données cibles (PubMed, Scopus, Web of Science)."
  },
  {
    q: "Combien d'articles faut-il dans une bibliographie ?",
    a: "Cela dépend du type de travail : 20 à 30 sources pour un mémoire de licence, 40 à 80 pour un master, 100 à 200+ pour une thèse de doctorat. Pour une revue systématique, il n'y a pas de limite — l'exhaustivité prime. La qualité et la pertinence des sources priment sur la quantité."
  },
  {
    q: "Quelle est la différence entre recherche bibliographique et revue de littérature ?",
    a: "La recherche bibliographique est la phase de collecte et d'identification des sources. La revue de littérature est l'étape suivante : elle analyse, synthétise et confronte les sources trouvées pour construire un état des connaissances. Academik vous accompagne dans les deux étapes."
  },
  {
    q: "Comment gérer les doublons dans une recherche bibliographique ?",
    a: "Lors d'une recherche multi-bases, il est fréquent de trouver les mêmes articles sur plusieurs plateformes. Academik déduplique automatiquement les résultats par DOI et titre pour vous présenter une liste nette, sans doublons."
  }
];

const ETAPES = [
  {
    num: "01",
    titre: "Définir la question de recherche",
    desc: "Avant tout, formulez précisément votre question de recherche. Utilisez la méthode PICO (Population, Intervention, Comparaison, Outcome) en santé, ou SPIDER en sciences sociales. Une question bien définie guide l'ensemble de la démarche et détermine vos mots-clés.",
    exemples: ["Méthode PICO", "Méthode SPIDER", "Analyse PESTS", "Framework FINER"]
  },
  {
    num: "02",
    titre: "Identifier les mots-clés et synonymes",
    desc: "Listez tous les termes liés à votre sujet en français ET en anglais (la majorité des articles scientifiques sont publiés en anglais). Incluez synonymes, termes génériques et spécifiques, sigles et abréviations. Consultez les thesaurus disciplinaires (MeSH pour la médecine, Thésaurus Rameau pour les SHS).",
    exemples: ["Termes MeSH", "Thésaurus Rameau", "DeCS (santé)", "Synonymes EN/FR"]
  },
  {
    num: "03",
    titre: "Construire les équations de recherche",
    desc: "Combinez vos mots-clés avec les opérateurs booléens AND (intersection), OR (union) et NOT (exclusion). Utilisez les troncatures (* ou $) pour les variations morphologiques. Délimitez les expressions exactes avec des guillemets. Adaptez la syntaxe à chaque base de données.",
    exemples: ["Opérateur AND", "Opérateur OR", "Troncature *", "Guillemets"]
  },
  {
    num: "04",
    titre: "Interroger les bases de données",
    desc: "Lancez vos équations sur les bases pertinentes pour votre discipline. En sciences médicales : PubMed, Cochrane, EMBASE. En SHS : Cairn, HAL, JSTOR. En sciences exactes : ScienceDirect, SpringerLink, IEEE. Notez vos résultats dans un tableau de traçabilité.",
    exemples: ["PubMed", "Cochrane", "Cairn", "Web of Science"]
  },
  {
    num: "05",
    titre: "Appliquer les critères de sélection",
    desc: "Filtrez les résultats selon vos critères d'inclusion et d'exclusion : période de publication (ex : 2015-2025), langue, type de document (articles originaux, méta-analyses, revues systématiques), zone géographique, population étudiée. Documentez chaque étape dans un diagramme PRISMA si nécessaire.",
    exemples: ["PRISMA flow", "Critères PICO", "Période 2015-2025", "Peer-reviewed"]
  },
  {
    num: "06",
    titre: "Évaluer la qualité des sources",
    desc: "Évaluez chaque source retenue : la revue est-elle indexée (MEDLINE, SCOPUS) ? Quel est son facteur d'impact ? Les auteurs sont-ils reconnus dans le domaine ? L'article a-t-il subi une relecture par les pairs (peer-review) ? En SHS, vérifiez si la revue est classée FNRS, HCERES ou AERES.",
    exemples: ["Peer-review", "Facteur d'impact", "Classement HCERES", "Indice h"]
  },
  {
    num: "07",
    titre: "Gérer et citer les références",
    desc: "Importez vos références dans un logiciel de gestion bibliographique (Zotero, Mendeley, EndNote) ou utilisez Academik pour les citer automatiquement en APA 7, Vancouver, MLA ou Chicago. Vérifiez que chaque citation dans le texte correspond à une référence en bibliographie.",
    exemples: ["Zotero", "Mendeley", "APA 7", "Vancouver"]
  }
];

const BASES_DONNEES = [
  { nom: "PubMed / MEDLINE", domaine: "Médecine, sciences biomédicales", langue: "Anglais majoritaire", acces: "Gratuit", icon: "🔬" },
  { nom: "Cairn.info", domaine: "SHS, droit, éducation (francophone)", langue: "Français", acces: "Mixte", icon: "📚" },
  { nom: "HAL", domaine: "Toutes disciplines (archives ouvertes)", langue: "FR & EN", acces: "Gratuit", icon: "🔓" },
  { nom: "ScienceDirect", domaine: "Sciences exactes, médecine, ingénierie", langue: "Anglais", acces: "Abonnement", icon: "⚗️" },
  { nom: "Google Scholar", domaine: "Toutes disciplines", langue: "Multilingue", acces: "Gratuit", icon: "🔍" },
  { nom: "Scopus / Web of Science", domaine: "Toutes disciplines (haute qualité)", langue: "Anglais majoritaire", acces: "Abonnement", icon: "🏆" },
  { nom: "Cochrane Library", domaine: "Médecine basée sur les preuves", langue: "Anglais", acces: "Gratuit partiel", icon: "💊" },
  { nom: "JSTOR", domaine: "Lettres, SHS, histoire", langue: "Multilingue", acces: "Abonnement", icon: "📜" },
];

const ERREURS_COURANTES = [
  { titre: "Trop peu de bases interrogées", desc: "Se limiter à Google Scholar fait manquer des milliers d'articles indexés uniquement sur Cairn, PubMed ou Scopus. Une recherche rigoureuse couvre au minimum 3 à 5 bases disciplinaires." },
  { titre: "Mots-clés trop spécifiques", desc: "Des termes trop précis donnent peu de résultats. Commencez large, puis affinez. Utilisez la troncature (* ou $) pour couvrir toutes les formes d'un mot : « infirmier* » capture infirmier, infirmière, infirmiers, infirmières." },
  { titre: "Ignorer les synonymes anglais", desc: "La majorité de la littérature scientifique mondiale est publiée en anglais. Ne pas inclure les équivalents anglais de vos concepts revient à ignorer la majorité des sources disponibles." },
  { titre: "Omettre la traçabilité", desc: "Ne pas documenter ses recherches (bases interrogées, équations utilisées, nombre de résultats, date) rend la démarche non reproductible. C'est une faiblesse majeure pour une thèse ou une revue systématique." },
  { titre: "Confondre quantité et qualité", desc: "Accumuler 500 références non lues est contre-productif. Une bonne sélection de 40 à 80 sources rigoureusement lues et évaluées vaut mieux qu'une bibliographie gonflée d'articles superficiellement consultés." },
];

export default function RechercheBibliographique() {
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Comment faire une Recherche Bibliographique — Méthode complète | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Guide complet pour réussir votre recherche bibliographique : méthode étape par étape, bases de données, équations booléennes, critères de sélection. Outil IA Academik.");
    setMeta('meta[property="og:title"]', "content", "Recherche Bibliographique — Méthode complète | Academik");
    setMeta('meta[property="og:description"]', "content",
      "Maîtrisez la recherche bibliographique : 7 étapes, bases de données (PubMed, Cairn, HAL), équations booléennes, critères PRISMA. Guide pour étudiants et chercheurs.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/recherche-bibliographique";

    const existing = document.getElementById("schema-seo-page");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "schema-seo-page";
    script.type = "application/ld+json";
    script.text = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "Comment faire une Recherche Bibliographique — Méthode complète",
        "description": "Guide méthodologique complet pour réaliser une recherche bibliographique académique rigoureuse.",
        "author": { "@type": "Organization", "name": "Academik" },
        "publisher": { "@type": "Organization", "name": "Academik", "url": "https://academik.fr" },
        "url": "https://academik.fr/recherche-bibliographique",
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
        "name": "Comment faire une recherche bibliographique",
        "step": ETAPES.map(e => ({
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
      <section className="py-20 px-4 text-center bg-gradient-to-b from-blue-50/60 to-background">
        <div className="max-w-3xl mx-auto">
          <Badge variant="secondary" className="mb-4">✦ Guide méthodologique complet</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Comment faire une{" "}
            <span className="text-primary">Recherche Bibliographique</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            La recherche bibliographique est le fondement de tout travail académique sérieux. Qu'il s'agisse d'un mémoire de master, d'une thèse de doctorat, d'un article scientifique ou d'une revue systématique, la qualité de votre bibliographie reflète la rigueur de votre démarche scientifique.
          </p>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Ce guide vous présente les <strong>7 étapes d'une recherche bibliographique réussie</strong>, les bases de données incontournables, la construction d'équations booléennes et les erreurs à éviter. Academik automatise et accélère chacune de ces étapes grâce à l'intelligence artificielle.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Lancer ma recherche avec l'IA <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/revue-litterature")}>
              En savoir plus sur la revue de littérature
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> 5 bases de données</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Résultats pertinents</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Dès 4,99 €</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: Users, val: "12 000+", label: "Chercheurs & étudiants" },
            { icon: Database, val: "5 bases", label: "Interrogées simultanément" },
            { icon: Star, val: "4,8/5", label: "Satisfaction utilisateurs" },
            { icon: Clock, val: "< 30 sec", label: "Par recherche" },
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
              <h2 className="text-3xl font-bold mb-4">Qu'est-ce que la recherche bibliographique ?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                La <strong>recherche bibliographique</strong> désigne l'ensemble des démarches méthodiques permettant d'identifier, localiser, sélectionner et évaluer les documents pertinents sur un sujet donné. Elle est distincte de la simple navigation sur internet : elle repose sur des <strong>bases de données scientifiques indexées</strong>, des <strong>équations de recherche structurées</strong> et des <strong>critères de sélection explicites</strong>.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Dans le cadre d'un <strong>mémoire de master ou d'une thèse de doctorat</strong>, la recherche bibliographique suit généralement un protocole formalisé (PRISMA pour les revues systématiques) qui garantit la reproductibilité et l'exhaustivité de la démarche.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                En France, au Canada et en Belgique, les établissements d'enseignement supérieur exigent que la bibliographie soit issue de sources vérifiées, peer-reviewed (évaluées par les pairs) et récentes. Academik vous aide à construire cette bibliographie en interrogeant en temps réel les grandes bases académiques.
              </p>
            </div>
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Objectifs d'une recherche bibliographique</h3>
                <ul className="space-y-2">
                  {[
                    "Identifier l'état des connaissances sur un sujet",
                    "Repérer les publications fondatrices et les auteurs clés",
                    "Éviter de réinventer ce qui a déjà été étudié",
                    "Justifier la pertinence de votre problématique",
                    "Construire un cadre théorique solide",
                    "Constituer la bibliographie de votre travail académique",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <p className="text-xs text-amber-700 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                  <span><strong>Bon à savoir :</strong> Une recherche bibliographique rigoureuse représente en moyenne 20 à 40% du temps total consacré à un mémoire ou une thèse. Academik réduit ce temps de 70 à 80%.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 étapes */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Les 7 étapes d'une recherche bibliographique réussie</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Suivez cette méthode progressive pour construire une bibliographie exhaustive, rigoureuse et académiquement reconnue.
          </p>
          <div className="space-y-6">
            {ETAPES.map((e) => (
              <Card key={e.num} className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="bg-primary/5 p-6 flex items-center justify-center md:w-24 shrink-0">
                      <span className="text-3xl font-black text-primary/40">{e.num}</span>
                    </div>
                    <div className="p-6 flex-1">
                      <h3 className="font-bold text-lg mb-2">{e.titre}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">{e.desc}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {e.exemples.map(ex => (
                          <Badge key={ex} variant="secondary" className="text-xs">{ex}</Badge>
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

      {/* Bases de données */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Les bases de données académiques incontournables</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Chaque discipline a ses bases de référence. Une recherche bibliographique complète en interroge au minimum trois à cinq selon votre domaine.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-primary/5 border-b">
                  <th className="text-left p-3 font-semibold">Base de données</th>
                  <th className="text-left p-3 font-semibold">Domaine</th>
                  <th className="text-left p-3 font-semibold">Langue</th>
                  <th className="text-left p-3 font-semibold">Accès</th>
                </tr>
              </thead>
              <tbody>
                {BASES_DONNEES.map((b, i) => (
                  <tr key={b.nom} className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                    <td className="p-3 font-medium">{b.icon} {b.nom}</td>
                    <td className="p-3 text-muted-foreground">{b.domaine}</td>
                    <td className="p-3 text-muted-foreground">{b.langue}</td>
                    <td className="p-3">
                      <Badge variant={b.acces === "Gratuit" ? "outline" : b.acces === "Abonnement" ? "secondary" : "outline"}
                        className={b.acces === "Gratuit" ? "text-green-600 border-green-300" : ""}>
                        {b.acces}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            Academik interroge simultanément PubMed, HAL, Cairn, ScienceDirect et Google Scholar pour vous fournir les résultats les plus pertinents.
          </p>
        </div>
      </section>

      {/* Équations booléennes */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Construire des équations de recherche booléennes</h2>
          <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
            Les opérateurs booléens sont le langage des bases de données académiques. Maîtrisez-les pour des résultats précis et exhaustifs.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { op: "AND", couleur: "bg-blue-50 border-blue-200", desc: "Intersection — les deux termes doivent être présents", ex: "burn-out AND infirmiers", result: "Articles contenant les deux" },
              { op: "OR", couleur: "bg-green-50 border-green-200", desc: "Union — au moins l'un des termes doit être présent", ex: "infirmier OR soignant OR nurse", result: "Articles avec l'un ou l'autre" },
              { op: "NOT", couleur: "bg-red-50 border-red-200", desc: "Exclusion — exclut les documents contenant ce terme", ex: "stress NOT professionnel", result: "Exclut le terme suivant" },
            ].map(({ op, couleur, desc, ex, result }) => (
              <Card key={op} className={`border ${couleur}`}>
                <CardContent className="pt-5">
                  <p className="text-2xl font-black mb-2">{op}</p>
                  <p className="text-sm text-muted-foreground mb-3">{desc}</p>
                  <div className="bg-white/80 rounded p-2 font-mono text-xs mb-1">{ex}</div>
                  <p className="text-xs text-muted-foreground">{result}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border bg-slate-50">
            <CardContent className="pt-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Exemple d'équation pour PubMed — Burn-out infirmier</h3>
              <div className="font-mono text-sm bg-white rounded-lg p-4 border leading-relaxed">
                ("burnout" OR "burn out" OR "burn-out" OR "professional exhaustion") AND ("nurses" OR "nursing staff" OR "infirmier*") AND ("France" OR "Europe" OR "Belgium" OR "Switzerland") AND ("2015"[PDAT] : "2025"[PDAT])
              </div>
              <p className="text-xs text-muted-foreground mt-3">→ Academik génère automatiquement ce type d'équation adaptée à chaque base de données cible.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Erreurs courantes */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Les 5 erreurs à éviter</h2>
          <p className="text-center text-muted-foreground mb-10">Ces erreurs sont récurrentes chez les étudiants et peuvent faire rejeter un mémoire ou une thèse.</p>
          <div className="space-y-4">
            {ERREURS_COURANTES.map((e, i) => (
              <Card key={i} className="border-l-4 border-l-red-400 border-r border-t border-b">
                <CardContent className="pt-4 pb-4 flex items-start gap-4">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">{e.titre}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{e.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comment Academik aide */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Comment Academik automatise votre recherche bibliographique</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Plutôt que d'interroger chaque base de données une par une, Academik centralise tout en une seule requête et re-classe les résultats par pertinence grâce à l'IA.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: Search,
                title: "Saisissez votre sujet",
                desc: "Entrez votre thématique, vos mots-clés ou votre question de recherche. Choisissez vos bases de données cibles parmi Google Scholar, PubMed, HAL, Cairn et ScienceDirect. Définissez la période et la langue."
              },
              {
                step: "2",
                icon: Database,
                title: "Academik interroge les bases",
                desc: "En moins de 30 secondes, Academik interroge simultanément toutes les bases sélectionnées, déduplique les résultats et les fait scorer par GPT-4o selon leur pertinence par rapport à votre question."
              },
              {
                step: "3",
                icon: FileText,
                title: "Obtenez vos sources + bibliographie",
                desc: "Recevez une liste d'articles pertinents avec leurs URLs réels. Sélectionnez ceux qui vous intéressent, puis générez automatiquement la bibliographie en APA 7, Vancouver, MLA ou Chicago en un clic."
              }
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 relative">
                  <Icon className="w-6 h-6 text-primary" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">{step}</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pour qui */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pour quel type de travail ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Mémoire & Thèse",
                desc: "Master 1, Master 2, Doctorat. La recherche bibliographique est évaluée en tant que telle par les jurys. Academik vous aide à construire une bibliographie exhaustive et traçable selon les normes PRISMA.",
                tags: ["Master 1 & 2", "Doctorat", "PRISMA", "Revue systématique"]
              },
              {
                icon: Search,
                title: "Articles & Publications",
                desc: "Chercheurs, post-doctorants, maîtres de conférences. Accélérez vos revues de littérature pour vos articles. Identifiez les gaps dans la littérature existante pour positionner vos contributions.",
                tags: ["Revue de littérature", "Gap analysis", "State of the art", "Review article"]
              },
              {
                icon: Users,
                title: "Rapports & Formations",
                desc: "Professionnels de santé, formateurs, cadres supérieurs. Produisez des bibliographies solides pour vos rapports institutionnels, protocoles cliniques, guides de pratique et supports de formation.",
                tags: ["Protocoles", "EBP", "Rapports", "Formations"]
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
          <h3 className="text-lg font-semibold text-center mb-6">Allez plus loin avec Academik</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Revue de littérature", path: "/revue-litterature" },
              { label: "Synthèse bibliographique", path: "/synthese-bibliographique" },
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
          <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes</h2>
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
          <h2 className="text-3xl font-bold mb-4">Lancez votre recherche bibliographique maintenant</h2>
          <p className="text-violet-100 mb-8 text-lg">
            Interrogez PubMed, HAL, Cairn, ScienceDirect et Google Scholar en une seule requête. Obtenez des sources pertinentes, réelles, avec URLs vérifiées.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Commencer gratuitement — dès 4,99 € <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-violet-200 text-sm mt-4">Sans abonnement · Paiement sécurisé · Résultats en moins de 30 secondes</p>
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
            <span>— Recherche bibliographique par IA</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/")}>Accueil</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/revue-litterature")}>Revue de littérature</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>Connexion</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
