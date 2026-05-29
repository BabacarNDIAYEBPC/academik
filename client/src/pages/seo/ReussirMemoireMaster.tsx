import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ChevronRight, Check, FileText, Search, BookOpen, GraduationCap, Users, Clock, Calendar, Target, Lightbulb, ArrowRight, Star, AlertCircle, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logoUrl from "@assets/logo_academik_minimal.png";
import heroImg from "@assets/memoire-master-hero.png";

const FAQ = [
  {
    q: "Combien de temps faut-il pour rédiger un mémoire de master ?",
    a: "Un mémoire de Master 1 se rédige généralement en 3 à 4 mois, un mémoire de Master 2 en 4 à 6 mois. Le temps varie selon la discipline, la disponibilité de l'étudiant et l'accès aux sources. La recherche bibliographique et la rédaction du cadre théorique représentent à elles seules 40 à 60 % du travail total. Des outils comme Academik permettent de réduire la phase bibliographique de 70 %."
  },
  {
    q: "Quelle structure pour un mémoire de master ?",
    a: "La structure classique d'un mémoire de master comprend : (1) Introduction avec problématique et hypothèses, (2) Cadre théorique / Revue de littérature, (3) Méthodologie, (4) Résultats, (5) Discussion, (6) Conclusion et perspectives, (7) Bibliographie, (8) Annexes. En sciences humaines et sociales, la structure peut varier. Certains mémoires suivent le format IMRAD (Introduction, Methods, Results, Discussion) notamment en santé."
  },
  {
    q: "Comment trouver un directeur de mémoire ?",
    a: "Identifiez les enseignants-chercheurs de votre établissement qui travaillent sur votre thématique. Lisez leurs publications récentes pour vous assurer que votre sujet s'inscrit dans leurs axes de recherche. Contactez-les par email avec un pitch de 10 lignes expliquant votre sujet, votre problématique provisoire et pourquoi vous souhaitez travailler avec eux. Proposez un premier rendez-vous exploratoire."
  },
  {
    q: "Combien de sources bibliographiques pour un mémoire ?",
    a: "Un mémoire de Master 1 cite généralement 30 à 50 sources, un Master 2 entre 50 et 100 sources. La qualité prime sur la quantité : une source doit être peer-reviewed, récente (moins de 10 ans sauf sources fondatrices) et directement en lien avec votre sujet. Academik vous aide à trouver les sources les plus pertinentes sur PubMed, Cairn, HAL et Google Scholar."
  },
  {
    q: "Quelle est la différence entre mémoire de recherche et mémoire professionnel ?",
    a: "Le mémoire de recherche vise à produire de nouvelles connaissances scientifiques : il suit une méthodologie rigoureuse (hypothèses, corpus, analyse). Le mémoire professionnel ou d'alternance articule expérience professionnelle et cadrage théorique : il analyse une situation réelle avec les outils académiques. Les deux nécessitent une solide bibliographie et une problématique clairement formulée."
  },
  {
    q: "Comment éviter le plagiat dans un mémoire ?",
    a: "Citez systématiquement toute idée empruntée (auteur, année, page). Distinguez citation directe (guillemets + page) et paraphrase (reformulation + auteur + année). Utilisez un logiciel anti-plagiat (Compilatio, Turnitin) avant de soumettre. Avec Academik, chaque synthèse générée est accompagnée des références bibliographiques complètes et formatées."
  }
];

const PLANNING = [
  { semaine: "Sem. 1-2", phase: "Choix du sujet & problématique", taches: ["Définir l'aire thématique", "Formuler une problématique provisoire", "Identifier un directeur de mémoire", "Cadrer le périmètre de la recherche"], couleur: "bg-blue-50 border-blue-200" },
  { semaine: "Sem. 3-6", phase: "Recherche bibliographique", taches: ["Interroger les bases de données (Academik)", "Appliquer les critères de sélection", "Lire et ficher les sources retenues", "Construire la grille d'analyse"], couleur: "bg-violet-50 border-violet-200" },
  { semaine: "Sem. 7-10", phase: "Cadre théorique & revue de littérature", taches: ["Synthétiser les sources (Academik)", "Rédiger l'état des connaissances", "Confronter les auteurs", "Identifier les lacunes et gap"], couleur: "bg-indigo-50 border-indigo-200" },
  { semaine: "Sem. 11-14", phase: "Méthodologie & terrain", taches: ["Choisir le paradigme et la méthode", "Construire les outils de collecte", "Mener les entretiens / enquêtes", "Analyser les données"], couleur: "bg-emerald-50 border-emerald-200" },
  { semaine: "Sem. 15-18", phase: "Rédaction & mise en forme", taches: ["Rédiger résultats et discussion", "Finaliser l'introduction et la conclusion", "Respecter les normes de présentation", "Vérifier la bibliographie"], couleur: "bg-amber-50 border-amber-200" },
  { semaine: "Sem. 19-20", phase: "Révision & soutenance", taches: ["Relire et corriger", "Préparer la soutenance (15-20 min)", "Anticiper les questions du jury", "Dépôt du mémoire"], couleur: "bg-red-50 border-red-200" },
];

const ERREURS = [
  { titre: "Sujet trop large", desc: "« L'impact des réseaux sociaux sur la société » est une question de thèse de doctorat, pas de mémoire. Délimitez temporellement, géographiquement et thématiquement : « L'usage de TikTok par les lycéens français dans leur parcours d'orientation professionnelle (2022-2024) »." },
  { titre: "Bibliographie Wikipedia & sites non académiques", desc: "Wikipedia n'est jamais une source acceptable dans un mémoire académique. Utilisez PubMed, Cairn, HAL, Google Scholar. Academik interroge uniquement les bases de données académiques reconnues et exclut les sources non peer-reviewed." },
  { titre: "Problématique formulée comme une question générale", desc: "« Qu'est-ce que le burn-out ? » n'est pas une problématique, c'est une question de définition. Une vraie problématique questionne un aspect non résolu : « Dans quelle mesure les dispositifs de prévention du burn-out mis en place depuis la loi El Khomri ont-ils modifié les pratiques managériales dans les hôpitaux publics français ? »" },
  { titre: "Rédiger sans plan détaillé", desc: "Commencer à rédiger sans plan détaillé au niveau du sous-sous-titre produit des textes incohérents et redondants. Construisez d'abord un plan au niveau III (parties > chapitres > sections) avant d'écrire une seule ligne de corps de texte." },
  { titre: "Laisser la bibliographie pour la fin", desc: "Formater la bibliographie en urgence la veille du rendu conduit à de nombreuses erreurs de citation. Gérez vos références au fil de la rédaction avec Zotero ou Academik, en appliquant le format imposé (APA 7, Vancouver, MLA ou Chicago) dès le début." },
];

export default function ReussirMemoireMaster() {
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Réussir son Mémoire de Master en 2025 — Guide complet méthode & outils | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Guide complet pour réussir son mémoire de master en 2025 : méthode, planning semaine par semaine, bibliographie, outils IA, ressources. Pour étudiants en master 1 et master 2.");
    setMeta('meta[property="og:title"]', "content", "Réussir son Mémoire de Master en 2025 — Guide complet | Academik");
    setMeta('meta[property="og:description"]', "content",
      "Méthode complète pour rédiger un mémoire de master réussi : planning 20 semaines, bibliographie, revue de littérature, outils IA. Ressources et accompagnement.");
    setMeta('meta[property="og:image"]', "content", "https://academik.fr/og-memoire-master.png");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/reussir-memoire-master";

    const hreflangs = [
      { lang: "fr-FR", href: "https://academik.fr/reussir-memoire-master" },
      { lang: "fr-BE", href: "https://academik.fr/reussir-memoire-master" },
      { lang: "fr-CH", href: "https://academik.fr/reussir-memoire-master" },
      { lang: "fr-CA", href: "https://academik.fr/reussir-memoire-master" },
      { lang: "x-default", href: "https://academik.fr/reussir-memoire-master" },
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
        "headline": "Réussir son Mémoire de Master en 2025 : Guide complet, méthode et outils",
        "description": "Guide méthodologique complet pour rédiger et soutenir un mémoire de master avec succès.",
        "image": "https://academik.fr/og-memoire-master.png",
        "author": { "@type": "Organization", "name": "Academik" },
        "publisher": { "@type": "Organization", "name": "Academik", "url": "https://academik.fr" },
        "url": "https://academik.fr/reussir-memoire-master",
        "inLanguage": "fr",
        "dateModified": new Date().toISOString().split("T")[0],
        "keywords": "mémoire master, rédiger mémoire, mémoire master 2, méthode mémoire, plan mémoire, bibliographie mémoire"
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
        "name": "Comment réussir son mémoire de master",
        "step": PLANNING.map(p => ({
          "@type": "HowToStep",
          "name": p.phase,
          "text": p.taches.join(". ")
        }))
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
            <img src={logoUrl} alt="Academik" className="w-7 h-7 object-contain" />
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
          <Badge variant="secondary" className="mb-4">✦ Guide complet — Master 1 & Master 2</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Réussir son{" "}
            <span className="text-primary">Mémoire de Master</span>{" "}
            en 2025
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Rédiger un mémoire de master est un exercice exigeant qui cumule plusieurs défis simultanés : choisir un sujet pertinent, construire une problématique originale, mener une recherche bibliographique exhaustive, produire un cadre théorique solide, collecter et analyser des données, puis synthétiser l'ensemble dans un document de 80 à 150 pages attendu par un jury.
          </p>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Ce guide complet vous accompagne de la <strong>définition du sujet à la soutenance</strong> avec un planning semaine par semaine, les outils indispensables, les erreurs à éviter et les ressources d'accompagnement recommandées.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Démarrer ma recherche bibliographique <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/recherche-bibliographique")}>
              Guide recherche bibliographique
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Planning 20 semaines</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Outils IA inclus</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Ressources d'accompagnement</span>
          </div>
        </div>
      </section>

      {/* Hero Image */}
      <section className="px-4 pb-4">
        <div className="max-w-4xl mx-auto">
          <img
            src={heroImg}
            alt="Étudiant en master rédigeant son mémoire — guide méthode Academik"
            className="w-full rounded-2xl shadow-md object-cover max-h-72"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 px-4 bg-white border-y mt-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: GraduationCap, val: "220 000+", label: "Mémoires soutenus/an en France" },
            { icon: Clock, val: "4-6 mois", label: "Durée moyenne Master 2" },
            { icon: FileText, val: "80-150 p.", label: "Volume moyen d'un mémoire" },
            { icon: Star, val: "4,8/5", label: "Satisfaction Academik" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="w-5 h-5 text-primary" />
              <p className="text-2xl font-bold">{val}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pourquoi difficile */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Pourquoi le mémoire de master est-il si difficile ?</h2>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Le mémoire de master est souvent le premier vrai exercice de <strong>recherche autonome</strong> auquel est confronté un étudiant. Contrairement aux dissertations ou aux rapports de stage, il n'existe pas de « bonne réponse » — le jury évalue votre capacité à poser une question pertinente, à mobiliser les connaissances existantes de façon critique et à produire une analyse originale.
              </p>
              <p>
                La difficulté tient à la conjonction de plusieurs exigences simultanées : rigueur méthodologique, maîtrise de la littérature académique, capacité rédactionnelle, gestion du temps sur plusieurs mois, et souvent, conciliation avec un stage ou un emploi.
              </p>
              <p>
                S'y ajoutent les <strong>pièges spécifiques de la recherche bibliographique</strong> : identifier les sources pertinentes parmi des millions d'articles, gérer les doublons entre bases de données, citer correctement selon le format imposé (APA 7, Vancouver, MLA ou Chicago), et construire une revue de littérature qui confronte vraiment les auteurs plutôt que de les résumer l'un après l'autre.
              </p>
              <p>
                C'est précisément pour répondre à ces difficultés qu'Academik a été conçu : automatiser la recherche bibliographique multi-sources, générer les fiches de lecture, produire la synthèse comparative et formater la bibliographie finale en un clic.
              </p>
            </div>
            <div className="space-y-3">
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-primary" />Ce que le jury évalue</h3>
                <ul className="space-y-2">
                  {[
                    "La pertinence et l'originalité de la problématique",
                    "La maîtrise de la littérature scientifique",
                    "La cohérence et la rigueur méthodologique",
                    "La qualité de l'analyse et de l'argumentation",
                    "La clarté et la qualité rédactionnelle",
                    "La conformité des citations et de la bibliographie",
                    "La capacité à prendre du recul critique",
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
                  <span><strong>Conseil :</strong> Lisez les mémoires primés de votre établissement des deux dernières années. Ils constituent le meilleur modèle de ce qui est attendu dans votre discipline et votre université.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Choisir le sujet */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Étape 1 : Choisir et délimiter son sujet de mémoire</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Le choix du sujet est la décision la plus importante de tout le processus. Un mauvais sujet — trop vaste, trop traité, trop peu documenté ou en décalage avec les axes de recherche de votre directeur — peut condamner un mémoire même bien rédigé.
          </p>
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {[
              { titre: "Un sujet qui vous passionne", desc: "Vous allez passer 4 à 6 mois sur ce sujet. L'ennui est l'ennemi de la persévérance. Choisissez quelque chose qui vous intrigue vraiment, même si cela vous semble « inhabituel ».", icon: "❤️" },
              { titre: "Un sujet documenté", desc: "Avant de vous engager, vérifiez qu'il existe suffisamment de littérature académique sur le sujet. Une recherche rapide sur Academik vous donnera une première idée du volume de sources disponibles.", icon: "📚" },
              { titre: "Un sujet délimité", desc: "Délimitez votre sujet sur trois axes : temporel (ex : 2018-2024), géographique (France, Europe, une région) et thématique (un aspect précis du phénomène). Plus c'est précis, plus c'est faisable.", icon: "🎯" },
            ].map(({ titre, desc, icon }) => (
              <Card key={titre} className="border-0 shadow-sm">
                <CardContent className="pt-5">
                  <span className="text-2xl mb-3 block">{icon}</span>
                  <h3 className="font-semibold mb-2">{titre}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border bg-blue-50/60 border-blue-100">
            <CardContent className="pt-5">
              <h3 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-primary" /> La méthode de l'entonnoir pour formuler votre problématique</h3>
              <p className="text-sm text-muted-foreground mb-3">Partez du plus large pour aller au plus précis :</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Thème général", ex: "Le bien-être au travail" },
                  { label: "Domaine spécifique", ex: "Le burn-out dans les professions de santé" },
                  { label: "Contexte ciblé", ex: "Le burn-out infirmier en milieu hospitalier public français" },
                  { label: "Question de recherche", ex: "Dans quelle mesure les dispositifs de prévention du burn-out mis en place depuis 2018 ont-ils réduit le taux d'épuisement chez les infirmiers de CHU ?" },
                ].map(({ label, ex }) => (
                  <div key={label} className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-semibold text-primary">{label} : </span>
                      <span className="text-xs text-muted-foreground">{ex}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Planning */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Planning sur 20 semaines : de la problématique à la soutenance</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Un mémoire de Master 2 se réalise en 20 semaines si l'on respecte ce découpage. Adaptez les durées à votre rythme et aux contraintes de votre programme.
          </p>
          <div className="space-y-4">
            {PLANNING.map(p => (
              <Card key={p.semaine} className={`border ${p.couleur} border-opacity-60`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="shrink-0">
                      <Badge variant="outline" className="font-mono text-xs whitespace-nowrap">{p.semaine}</Badge>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-2">{p.phase}</h3>
                      <div className="flex flex-wrap gap-2">
                        {p.taches.map(t => (
                          <span key={t} className="text-xs bg-white/70 border rounded-md px-2 py-1 text-muted-foreground">{t}</span>
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

      {/* Recherche bibliographique avec Academik */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Étape 2 : La recherche bibliographique avec Academik</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            La recherche bibliographique est le socle de votre mémoire. Elle vous permet de cerner l'état des connaissances existantes, de positionner votre sujet par rapport à la littérature et de justifier la pertinence de votre problématique. C'est aussi l'étape la plus chronophage : sans outil adapté, interroger manuellement PubMed, Cairn, HAL, ScienceDirect et Google Scholar peut prendre des semaines.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Comment Academik accélère cette étape</h3>
              <ul className="space-y-3">
                {[
                  { t: "Multi-sources simultané", d: "Une seule requête interroge PubMed, Cairn, HAL, ScienceDirect et OpenAlex en moins de 30 secondes." },
                  { t: "Re-classement par pertinence (IA)", d: "GPT-4o score chaque résultat selon sa pertinence thématique — fini les articles hors sujet." },
                  { t: "Déduplication automatique", d: "Les articles présents sur plusieurs bases ne s'affichent qu'une fois." },
                  { t: "Fiches de lecture générées", d: "Pour chaque article sélectionné : résumé structuré, méthodologie, résultats clés, apport théorique." },
                  { t: "Synthèse comparative", d: "Confrontation automatique des sources — convergences, divergences, gaps identifiés." },
                  { t: "Bibliographie formatée en 1 clic", d: "APA 7, Vancouver, MLA ou Chicago — avec DOI vérifiés." },
                ].map(({ t, d }) => (
                  <li key={t} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-1" />
                    <div>
                      <span className="text-sm font-semibold">{t}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <div className="bg-white rounded-xl p-5 border shadow-sm">
                <p className="text-xs text-muted-foreground mb-1 font-semibold">Sans Academik</p>
                <div className="space-y-1.5 mb-4">
                  {["Interroger PubMed (30 min)", "Interroger Cairn (30 min)", "Interroger HAL (20 min)", "Déduplication manuelle (1h)", "Lecture des résumés (2h)", "Fiches de lecture (3-5h)", "Rédaction de la synthèse (6-10h)", "Formatage bibliographie (2h)"].map(item => (
                    <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-300 shrink-0" /> {item}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-semibold text-red-500">⏱ 15 à 20 heures de travail</p>
              </div>
              <div className="bg-primary/5 rounded-xl p-5 border border-primary/20 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1 font-semibold">Avec Academik</p>
                <div className="space-y-1.5 mb-4">
                  {["1 requête → 5 bases (30 sec)", "Résultats re-classés par IA (auto)", "Sélection des sources (15 min)", "Fiches de lecture auto (2 min)", "Synthèse comparative (2 min)", "Bibliographie formatée (1 clic)"].map(item => (
                    <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-green-500 shrink-0" /> {item}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-semibold text-green-600">⏱ 2 à 3 heures au total</p>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-biblio-cta">
              Lancer ma recherche bibliographique <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Revue de littérature */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Étape 3 : Rédiger la revue de littérature</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            La revue de littérature (ou cadre théorique) est le chapitre le plus scruté par les jurys. Elle doit démontrer que vous maîtrisez votre champ disciplinaire et que vous avez identifié les grands débats, les auteurs clés et les lacunes que votre recherche cherche à combler.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-3">Structure recommandée</h3>
              <div className="space-y-2">
                {[
                  { n: "1", t: "Contextualisation", d: "Posez le contexte historique, social ou scientifique de votre problématique." },
                  { n: "2", t: "Définition des concepts clés", d: "Définissez chaque concept central en convoquant les auteurs de référence (évitez Wikipedia)." },
                  { n: "3", t: "État des connaissances", d: "Synthèse thématique (pas auteur par auteur) des principales études et théories." },
                  { n: "4", t: "Confrontation des auteurs", d: "Identifiez convergences et divergences. Montrez les débats théoriques actifs." },
                  { n: "5", t: "Gap de recherche", d: "Montrez ce qui reste à explorer et comment votre recherche y répond." },
                ].map(({ n, t, d }) => (
                  <div key={n} className="flex gap-3 items-start">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary shrink-0">{n}</span>
                    <div>
                      <span className="text-sm font-semibold">{t} — </span>
                      <span className="text-xs text-muted-foreground">{d}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Ce qu'Academik génère automatiquement</h3>
              <div className="space-y-2">
                {[
                  "Résumé structuré de chaque article sélectionné",
                  "Carte thématique des grands axes de la littérature",
                  "Confrontation des auteurs avec formulation des débats",
                  "Identification des consensus scientifiques",
                  "Mise en évidence des lacunes et gaps de recherche",
                  "Bibliographie complète formatée en APA 7, Vancouver, MLA ou Chicago",
                ].map(item => (
                  <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {item}
                  </div>
                ))}
              </div>
              <button onClick={() => setLocation("/synthese-bibliographique")}
                className="mt-4 flex items-center gap-2 text-sm text-primary font-semibold hover:underline">
                <ArrowRight className="w-4 h-4" /> Voir le guide complet : Synthèse bibliographique
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Erreurs courantes */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Les 5 erreurs qui font échouer un mémoire</h2>
          <p className="text-center text-muted-foreground mb-10">Identifiées par les directeurs de mémoire et les membres de jury.</p>
          <div className="space-y-4">
            {ERREURS.map((e, i) => (
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

      {/* Ressources & partenaires */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Ressources et accompagnement recommandés</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Au-delà des outils, plusieurs plateformes spécialisées peuvent vous accompagner à des étapes clés de votre mémoire.
          </p>
          <div className="grid md:grid-cols-3 gap-6">

            {/* Academik */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs mb-2">Recherche & bibliographie</Badge>
                <h3 className="font-bold text-lg mb-2">Academik</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Recherche bibliographique multi-sources (PubMed, Cairn, HAL, ScienceDirect), génération de synthèses comparatives, fiches de lecture et bibliographies formatées en APA 7, Vancouver, MLA et Chicago. L'outil indispensable pour la phase de revue de littérature.
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {["Bibliographie auto", "Synthèse IA", "Export Word"].map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
                <Button size="sm" className="w-full" onClick={() => setLocation("/connexion")}>
                  Essayer Academik — dès 4,99 €
                </Button>
              </CardContent>
            </Card>

            {/* Rédacteur Mémoire */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5 text-violet-600" />
                </div>
                <Badge variant="secondary" className="text-xs mb-2">Rédaction & accompagnement</Badge>
                <h3 className="font-bold text-lg mb-2">Rédacteur Mémoire</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Vous avez vos sources mais vous bloquez sur la rédaction ? <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="text-primary font-semibold hover:underline">Rédacteur Mémoire</a> propose un accompagnement personnalisé par des experts académiques : relecture, correction, structuration et coaching méthodologique pour mémoires de master et thèses. Idéal si vous manquez de temps ou si votre français académique a besoin d'être renforcé.
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {["Relecture", "Coaching", "Correction", "Méthodologie"].map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
                <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener">
                  <Button size="sm" variant="outline" className="w-full">
                    Voir redacteurmemoire.com →
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Excellence Catalane */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5 text-amber-600" />
                </div>
                <Badge variant="secondary" className="text-xs mb-2">Soutien scolaire & coaching</Badge>
                <h3 className="font-bold text-lg mb-2">Excellence Catalane</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Pour les étudiants du sud de la France et de la région catalane, <a href="https://www.excellence-catalane.fr" target="_blank" rel="noopener" className="text-primary font-semibold hover:underline">Excellence Catalane</a> offre un accompagnement académique de proximité : soutien méthodologique, coaching pour la soutenance, préparation aux concours et suivi personnalisé. Une ressource précieuse pour les étudiants qui souhaitent un accompagnement humain et local.
                </p>
                <div className="flex flex-wrap gap-1 mb-4">
                  {["Coaching", "Soutenance", "Méthodologie", "Région catalane"].map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
                </div>
                <a href="https://www.excellence-catalane.fr" target="_blank" rel="noopener">
                  <Button size="sm" variant="outline" className="w-full">
                    Voir excellence-catalane.fr →
                  </Button>
                </a>
              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* Marketlens encart */}
      <section className="py-10 px-4 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <Badge className="mb-3 bg-blue-500/20 text-blue-300 border-0">💡 Pour les chercheurs & doctorants</Badge>
            <h3 className="text-2xl font-bold mb-3">Valorisez vos recherches sur les réseaux sociaux</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">
              Une fois votre mémoire ou vos articles publiés, la <strong>visibilité de vos travaux</strong> dépend aussi de votre présence en ligne. <a href="https://www.marketlens.fr" target="_blank" rel="noopener" className="text-blue-400 font-semibold hover:underline">Marketlens.fr</a> est un outil IA de création et de publication de contenu sur les réseaux sociaux, conçu pour les professionnels qui souhaitent communiquer efficacement leur expertise sans y passer des heures. Idéal pour les doctorants, post-doctorants et chercheurs qui souhaitent construire leur présence académique en ligne.
            </p>
            <a href="https://www.marketlens.fr" target="_blank" rel="noopener">
              <Button variant="outline" size="sm" className="border-slate-600 text-white hover:bg-slate-800">
                Découvrir Marketlens.fr →
              </Button>
            </a>
          </div>
          <div className="shrink-0 hidden md:block">
            <div className="w-24 h-24 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <BarChart3 className="w-12 h-12 text-blue-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Soutenance */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Préparer la soutenance orale</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            La soutenance dure généralement 30 à 45 minutes : 15 à 20 minutes d'exposé, puis 15 à 25 minutes de questions du jury. C'est votre chance de montrer que vous maîtrisez votre sujet au-delà du texte écrit.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Structure de l'exposé (15-20 min)</h3>
              <div className="space-y-2">
                {[
                  { t: "Introduction (2 min)", d: "Accrochez le jury avec un fait, une statistique ou une citation qui illustre l'enjeu de votre sujet." },
                  { t: "Problématique & hypothèses (2 min)", d: "Reformulez votre question de recherche et vos hypothèses de travail en termes accessibles." },
                  { t: "Méthodologie (3 min)", d: "Expliquez vos choix méthodologiques et pourquoi ils étaient adaptés à votre problématique." },
                  { t: "Résultats clés (5 min)", d: "Présentez vos 3 à 5 résultats les plus significatifs avec des supports visuels si possible." },
                  { t: "Discussion (3 min)", d: "Interprétez vos résultats, confrontez-les à la littérature, discutez les limites." },
                  { t: "Conclusion (2 min)", d: "Répondez à votre problématique et ouvrez sur des perspectives de recherche futures." },
                ].map(({ t, d }) => (
                  <div key={t} className="border-l-2 border-primary/30 pl-3">
                    <p className="text-sm font-semibold">{t}</p>
                    <p className="text-xs text-muted-foreground">{d}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Questions fréquentes des jurys</h3>
              <div className="space-y-2">
                {[
                  "Pourquoi avez-vous choisi cette méthodologie plutôt qu'une autre ?",
                  "Comment avez-vous sélectionné vos sources bibliographiques ?",
                  "Quelles sont les principales limites de votre recherche ?",
                  "Si c'était à refaire, que changeriez-vous dans votre méthode ?",
                  "Comment vos résultats s'articulent-ils avec les travaux de [auteur cité] ?",
                  "Quelles pistes de recherche votre travail ouvre-t-il ?",
                  "Qu'est-ce qui différencie votre approche de celle de [auteur] ?",
                ].map(q => (
                  <div key={q} className="flex items-start gap-2">
                    <span className="text-primary text-sm shrink-0 font-bold">Q.</span>
                    <p className="text-sm text-muted-foreground">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Maillage interne */}
      <section className="py-12 px-4 bg-muted/20 border-y">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-center mb-6">Approfondir avec Academik</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Recherche bibliographique", path: "/recherche-bibliographique" },
              { label: "Synthèse bibliographique", path: "/synthese-bibliographique" },
              { label: "Revue de littérature", path: "/revue-litterature" },
              { label: "Bibliographie APA 7", path: "/bibliographie-apa" },
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
          <h2 className="text-3xl font-bold text-center mb-12">Questions fréquentes sur le mémoire de master</h2>
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
          <h2 className="text-3xl font-bold mb-4">Commencez dès maintenant avec Academik</h2>
          <p className="text-violet-100 mb-8 text-lg">
            Lancez votre recherche bibliographique en moins de 30 secondes. PubMed, Cairn, HAL, ScienceDirect interrogés simultanément. Bibliographie APA 7 formatée en un clic.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-footer-cta">
            Démarrer mon mémoire — dès 4,99 € <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-violet-200 text-sm mt-4">Sans abonnement · Export Word · Résultats en 30 secondes</p>
        </div>
      </section>

      <div className="py-5 px-4 bg-amber-50 border-y border-amber-100 text-center text-sm">
        <p className="text-muted-foreground">
          Besoin d'un accompagnement personnalisé pour rédiger votre mémoire ?{" "}
          <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="text-primary font-semibold underline underline-offset-2 hover:opacity-80">
            Rédacteur Mémoire
          </a>{" "}
          · Coaching académique par des experts — France, Belgique, Suisse, Canada
        </p>
      </div>

      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="Academik" className="w-5 h-5 object-contain" />
            <span className="font-semibold">Academik</span>
            <span>— Outil de recherche bibliographique IA</span>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/")}>Accueil</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/recherche-bibliographique")}>Recherche biblio</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/synthese-bibliographique")}>Synthèse</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/revue-litterature")}>Revue de littérature</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>Connexion</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
