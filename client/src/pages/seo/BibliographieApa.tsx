import { useEffect } from "react";
import { useLocation } from "wouter";
import { BookOpen, ChevronRight, Check, FileText, Search, Zap, Star, GraduationCap, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FAQ = [
  {
    q: "Qu'est-ce que le style APA 7 ?",
    a: "Le style APA (American Psychological Association) 7e édition est une norme de citation académique utilisée principalement en sciences sociales, psychologie, éducation et santé. Il définit le format des références bibliographiques, des citations dans le texte et la mise en page des travaux académiques."
  },
  {
    q: "Comment générer une bibliographie APA automatiquement ?",
    a: "Avec Academik, il suffit de décrire votre sujet de recherche ou de coller vos sources. Notre IA analyse les informations et génère automatiquement la bibliographie au format APA 7 avec les auteurs, années, titres, journaux et DOI correctement formatés."
  },
  {
    q: "Academik est-il gratuit ?",
    a: "Academik fonctionne avec un système de crédits. Vous pouvez démarrer avec un pack Starter dès 4,99 € pour 10 crédits. Chaque action (recherche, génération de bibliographie) coûte 1 crédit. Aucun abonnement mensuel — vous payez uniquement ce que vous utilisez."
  },
  {
    q: "Quelle est la différence entre APA, Vancouver et MLA ?",
    a: "APA est utilisé en sciences sociales et de la santé. Vancouver est la norme dans les sciences médicales et biomédicales (numérotation des références). MLA est utilisé en littérature et sciences humaines. Chicago est utilisé en histoire et sciences humaines. Academik génère les quatre formats."
  },
  {
    q: "Puis-je utiliser Academik pour ma thèse ou mon mémoire ?",
    a: "Absolument. Academik est conçu pour les étudiants en master, doctorat, ainsi que les chercheurs professionnels. Il génère des bibliographies conformes aux exigences universitaires en APA 7, Vancouver, MLA et Chicago."
  },
  {
    q: "Academik fonctionne-t-il pour les sources francophones (Cairn, HAL) ?",
    a: "Oui. Academik recherche dans les bases de données francophones comme Cairn.info, HAL (Hyper Articles en Ligne), ainsi que PubMed, Google Scholar et ScienceDirect pour trouver des sources académiques en français et en anglais."
  }
];

export default function BibliographieApa() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Générateur de Bibliographie APA 7 en Ligne — Gratuit | Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Générez automatiquement vos bibliographies au format APA 7 en quelques secondes. Outil gratuit pour étudiants et chercheurs. Compatible Cairn, HAL, PubMed, Google Scholar.");
    setMeta('meta[property="og:title"]', "content", "Générateur de Bibliographie APA 7 — Academik");
    setMeta('meta[property="og:description"]', "content",
      "Créez des bibliographies APA 7 parfaites instantanément grâce à l'IA. Idéal pour mémoires, thèses et articles scientifiques.");

    // Canonical + hreflang
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/bibliographie-apa";

    const hreflangs = [
      { lang: "fr-FR", href: "https://academik.fr/bibliographie-apa" },
      { lang: "fr-BE", href: "https://academik.fr/bibliographie-apa" },
      { lang: "fr-CH", href: "https://academik.fr/bibliographie-apa" },
      { lang: "fr-CA", href: "https://academik.fr/bibliographie-apa" },
      { lang: "x-default", href: "https://academik.fr/bibliographie-apa" },
    ];
    hreflangs.forEach(({ lang, href }) => {
      const existing = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
      if (existing) { existing.setAttribute("href", href); return; }
      const link = document.createElement("link");
      link.rel = "alternate"; link.setAttribute("hreflang", lang); link.href = href;
      document.head.appendChild(link);
    });

    // Schema.org JSON-LD
    const existing = document.getElementById("schema-seo-page");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "schema-seo-page";
    script.type = "application/ld+json";
    script.text = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Academik — Générateur de Bibliographie APA",
        "applicationCategory": "EducationApplication",
        "operatingSystem": "Web",
        "url": "https://academik.fr",
        "description": "Outil en ligne propulsé par l'IA pour générer automatiquement des bibliographies APA 7, Vancouver, MLA et Chicago.",
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
      {/* Nav */}
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
          <Badge variant="secondary" className="mb-4">✦ Norme APA 7e édition</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Générateur de{" "}
            <span className="text-primary">Bibliographie APA</span>{" "}
            en ligne
          </h1>
          <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
            Créez des bibliographies au format <strong>APA 7</strong> parfaitement formatées en quelques secondes.
            Notre IA recherche vos sources dans Cairn, HAL, PubMed, Google Scholar et génère automatiquement la liste de références conforme aux normes universitaires.
          </p>
          <p className="text-muted-foreground mb-8 text-sm">
            Utilisé par des étudiants en master, doctorants et chercheurs en France, Belgique, Suisse, Canada et Luxembourg.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => setLocation("/connexion")} className="gap-2" data-testid="button-hero-cta">
              Générer ma bibliographie APA <ChevronRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/")}>
              Voir toutes les fonctionnalités
            </Button>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Dès 4,99 €</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Sans abonnement</span>
            <span className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Résultats en secondes</span>
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

      {/* What is APA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Qu'est-ce que la norme APA 7 ?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                La norme <strong>APA (American Psychological Association) 7e édition</strong> est le standard de référence dans les sciences sociales, la psychologie, l'éducation, les sciences infirmières et de nombreuses disciplines académiques.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Elle définit précisément comment citer des articles scientifiques, des livres, des sites web, des thèses et d'autres sources. Une bibliographie APA correcte est indispensable pour valider un mémoire de master ou une thèse de doctorat.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Academik génère automatiquement vos références selon la 7e édition, la plus récente, intégrant les DOI, les URL et les nouvelles règles pour les sources numériques.
              </p>
            </div>
            <div className="space-y-3">
              <div className="bg-muted/40 rounded-lg p-4 font-mono text-sm border-l-4 border-primary">
                <p className="text-xs text-muted-foreground mb-2 font-sans">Exemple de référence APA 7 — Article de revue</p>
                Dupont, J., &amp; Martin, C. (2023). L'impact de l'IA sur la recherche académique. <em>Revue Française de Sciences Sociales, 45</em>(2), 112–134. https://doi.org/10.xxxx/xxxxx
              </div>
              <div className="bg-muted/40 rounded-lg p-4 font-mono text-sm border-l-4 border-violet-400">
                <p className="text-xs text-muted-foreground mb-2 font-sans">Exemple — Livre</p>
                Lefebvre, A. (2022). <em>Méthodologie de la recherche en sciences humaines</em> (3e éd.). Presses Universitaires de France.
              </div>
              <div className="bg-muted/40 rounded-lg p-4 font-mono text-sm border-l-4 border-green-400">
                <p className="text-xs text-muted-foreground mb-2 font-sans">Exemple — Source web</p>
                Institut National de la Santé. (2023, 15 mars). <em>Guide de prévention</em>. https://www.inserm.fr/guide
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Comment ça fonctionne ?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            En 3 étapes simples, obtenez une bibliographie APA 7 complète et prête à coller dans votre mémoire ou thèse.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: Search,
                title: "Décrivez votre sujet",
                desc: "Entrez votre thématique de recherche ou vos mots-clés. Academik interroge Cairn, HAL, PubMed, Google Scholar et ScienceDirect pour trouver les sources les plus pertinentes."
              },
              {
                step: "2",
                icon: Zap,
                title: "L'IA sélectionne et analyse",
                desc: "Notre IA propulsée par GPT-4o sélectionne les sources académiques de qualité, extrait les métadonnées (auteurs, année, journal, DOI) et vérifie leur pertinence."
              },
              {
                step: "3",
                icon: FileText,
                title: "Bibliographie APA générée",
                desc: "En quelques secondes, votre bibliographie APA 7 est formatée et prête à l'emploi. Copiez-la directement dans Word, Google Docs ou votre logiciel d'écriture."
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

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Tout ce dont vous avez besoin</h2>
          <p className="text-center text-muted-foreground mb-12">Au-delà de l'APA, Academik couvre tous vos besoins bibliographiques.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "APA 7e édition", desc: "Format le plus récent, compatible avec toutes les universités francophones et internationales." },
              { title: "Vancouver", desc: "Standard en médecine, pharmacie et sciences biomédicales. Numérotation automatique." },
              { title: "MLA 9", desc: "Utilisé en lettres, langues et sciences humaines. Format automatique." },
              { title: "Chicago 17", desc: "Pour l'histoire et les sciences humaines. Notes de bas de page incluses." },
              { title: "Sources francophones", desc: "Cairn.info, HAL, OpenEdition, Persée — les grandes bases de données françaises." },
              { title: "Synthèse littéraire", desc: "Confrontez et synthesisez automatiquement vos sources pour votre revue de littérature." },
              { title: "Fiches de lecture", desc: "Générez des fiches de lecture structurées à partir de vos PDF et articles." },
              { title: "Équations de recherche", desc: "Créez des équations booléennes pour vos recherches sur PubMed, Scopus et Web of Science." },
              { title: "Export immédiat", desc: "Copiez-collez en un clic dans Word, Google Docs, LaTeX ou votre logiciel d'écriture." },
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

      {/* Who is it for */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pour qui est fait Academik ?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Étudiants",
                desc: "Licence, Master 1 & 2, Doctorat. Idéal pour les mémoires, thèses IMRAD et travaux de fin d'études en France, Belgique, Suisse, Luxembourg et Canada.",
                tags: ["Mémoire", "Thèse", "TFE", "Rapport de stage"]
              },
              {
                icon: Search,
                title: "Chercheurs",
                desc: "Maîtres de conférences, professeurs, post-doctorants. Accélérez vos revues de littérature et assurez la conformité bibliographique de vos publications.",
                tags: ["Articles", "Revues", "Conférences", "HDR"]
              },
              {
                icon: Users,
                title: "Professionnels",
                desc: "Consultants, médecins, infirmiers, travailleurs sociaux. Produisez des bibliographies professionnelles pour vos rapports, formations et publications internes.",
                tags: ["Rapports", "Formations", "Protocoles", "Audits"]
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
      <section className="py-20 px-4 bg-gradient-to-r from-violet-600 to-violet-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Prêt à générer votre bibliographie APA ?</h2>
          <p className="text-violet-100 mb-8 text-lg">
            Rejoignez plus de 12 000 étudiants et chercheurs qui utilisent Academik pour leurs travaux académiques.
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
            <span>— Outil de recherche bibliographique IA</span>
          </div>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/")}>Accueil</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/revue-litterature")}>Revue de littérature</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/recherche-bibliographique")}>Recherche biblio</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/synthese-bibliographique")}>Synthèse biblio</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/reussir-memoire-master")}>Réussir son mémoire</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/connexion")}>Connexion</span>
            <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/en/apa-citation-generator")}>English</span>
            <a href="https://www.redacteurmemoire.com" target="_blank" rel="noopener" className="hover:text-foreground">Rédacteur Mémoire</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
