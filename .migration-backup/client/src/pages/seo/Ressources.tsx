import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  BookOpen, ChevronRight, FileText, Search, GraduationCap,
  Users, Library, Globe, ArrowRight, Layers, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SECTIONS = [
  {
    icon: FileText,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    title: "Générateurs de bibliographie",
    desc: "Créez automatiquement vos listes de références dans tous les formats académiques reconnus.",
    links: [
      { label: "Comment faire une bibliographie", href: "/comment-faire-bibliographie", badge: "Guide pilier", hot: true },
      { label: "Bibliographie APA 7", href: "/bibliographie-apa", badge: "Le + demandé" },
      { label: "Bibliographie Vancouver", href: "/bibliographie-vancouver", badge: "Médecine" },
      { label: "Bibliographie MLA 9", href: "/bibliographie-mla", badge: "Lettres" },
      { label: "Bibliographie Chicago 17", href: "/bibliographie-chicago", badge: "Histoire" },
    ]
  },
  {
    icon: Search,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    title: "Recherche & Synthèse bibliographique",
    desc: "Trouvez les meilleures sources académiques et synthétisez-les en quelques minutes.",
    links: [
      { label: "Recherche bibliographique", href: "/recherche-bibliographique" },
      { label: "Synthèse bibliographique", href: "/synthese-bibliographique" },
      { label: "Revue de littérature", href: "/revue-litterature" },
    ]
  },
  {
    icon: GraduationCap,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    title: "Mémoire, thèse & rédaction académique",
    desc: "Guides complets pour réussir vos travaux universitaires de niveau master et doctorat.",
    links: [
      { label: "Mémoire et thèse : guide complet", href: "/memoire-these" },
      { label: "Réussir son mémoire de master", href: "/reussir-memoire-master" },
    ]
  },
  {
    icon: Users,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    title: "Par profil utilisateur",
    desc: "Des ressources adaptées à chaque profil académique.",
    links: [
      { label: "Academik pour les étudiants", href: "/etudiant" },
      { label: "Academik pour les chercheurs", href: "/chercheur" },
    ]
  },
  {
    icon: Globe,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    title: "English resources",
    desc: "All Academik guides and tools available in English for international users.",
    links: [
      { label: "APA Citation Generator", href: "/en/apa-citation-generator" },
      { label: "Literature Review Tool", href: "/en/literature-review" },
      { label: "Vancouver Citation", href: "/en/vancouver-citation" },
      { label: "MLA Citation Generator", href: "/en/mla-citation" },
      { label: "Chicago Citation", href: "/en/chicago-citation" },
      { label: "Dissertation Help", href: "/en/dissertation-help" },
      { label: "For Students", href: "/en/students" },
      { label: "For Researchers", href: "/en/researchers" },
    ]
  },
];

const KEYWORDS = [
  "bibliographie APA 7", "générateur de bibliographie", "comment faire une bibliographie",
  "bibliographie Vancouver", "bibliographie MLA", "bibliographie Chicago",
  "revue de littérature", "synthèse bibliographique", "recherche bibliographique",
  "mémoire de master", "thèse de doctorat", "citation académique",
  "références bibliographiques", "normes de citation", "APA 7e édition",
  "format Vancouver médecine", "style MLA humanités", "Chicago auteur-date",
  "Cairn bibliographie", "HAL sources académiques", "PubMed citations",
  "Google Scholar français", "ScienceDirect références", "état de l'art",
  "bibliographie automatique IA", "outil recherche bibliographique",
  "équation de recherche booléenne", "sources primaires secondaires",
  "peer-reviewed articles français", "open access HAL thèse",
];

export default function Ressources() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "Ressources & Guides Bibliographiques — Academik";
    const setMeta = (sel: string, attr: string, val: string) => {
      const el = document.querySelector(sel);
      if (el) el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content",
      "Tous les guides Academik : bibliographie APA, Vancouver, MLA, Chicago, revue de littérature, mémoire, recherche bibliographique. Ressources gratuites pour étudiants et chercheurs.");
    setMeta('meta[property="og:title"]', "content", "Ressources bibliographiques — Academik");
    setMeta('meta[property="og:description"]', "content",
      "Hub de ressources académiques : générateurs de bibliographie, guides mémoire, revue de littérature, recherche bibliographique.");

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = "https://academik.fr/ressources";

    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (!robotsMeta) { robotsMeta = document.createElement("meta"); robotsMeta.name = "robots"; document.head.appendChild(robotsMeta); }
    robotsMeta.content = "index, follow";

    const existing = document.getElementById("schema-seo-page");
    if (existing) existing.remove();
    const script = document.createElement("script");
    script.id = "schema-seo-page";
    script.type = "application/ld+json";
    script.text = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Ressources & Guides Bibliographiques — Academik",
        "description": "Hub de ressources pour la recherche bibliographique académique : bibliographie APA, Vancouver, MLA, Chicago, revue de littérature, mémoire.",
        "url": "https://academik.fr/ressources",
        "publisher": { "@type": "Organization", "name": "Academik", "url": "https://academik.fr" },
        "inLanguage": "fr-FR"
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://academik.fr" },
          { "@type": "ListItem", "position": 2, "name": "Ressources", "item": "https://academik.fr/ressources" }
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
          <Button onClick={() => setLocation("/connexion")} size="sm" data-testid="button-nav-cta">
            Essayer gratuitement <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 py-3 text-xs text-muted-foreground flex items-center gap-1">
        <span className="cursor-pointer hover:text-foreground" onClick={() => setLocation("/")}>Accueil</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Ressources</span>
      </div>

      {/* Hero */}
      <section className="py-14 px-4 bg-gradient-to-b from-violet-50/60 to-background">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">📖 Bibliothèque de ressources</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
            Tous vos guides <span className="text-primary">bibliographiques</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed max-w-2xl mx-auto">
            Retrouvez ici l'ensemble des ressources Academik pour maîtriser la bibliographie académique, la recherche de sources, la rédaction de mémoire et la revue de littérature.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm text-muted-foreground">
            {["APA 7", "Vancouver", "MLA", "Chicago", "Revue de littérature", "Mémoire", "Thèse", "Recherche bibliographique"].map(tag => (
              <Badge key={tag} variant="outline" className="font-normal">{tag}</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title} className={`border-2 ${section.border} rounded-2xl overflow-hidden`}>
              <div className={`${section.bg} px-6 py-4 flex items-start gap-3`}>
                <section.icon className={`w-6 h-6 ${section.color} mt-0.5 flex-shrink-0`} />
                <div>
                  <h2 className={`text-lg font-bold ${section.color}`}>{section.title}</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{section.desc}</p>
                </div>
              </div>
              <div className="bg-white divide-y">
                {section.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-sm group-hover:text-primary transition-colors">{link.label}</span>
                      {link.badge && (
                        <Badge variant={link.hot ? "default" : "secondary"} className="text-xs">{link.badge}</Badge>
                      )}
                    </div>
                    <ArrowRight className={`w-4 h-4 ${section.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nuage de mots-clés SEO */}
      <section className="py-12 px-4 bg-slate-50/70 border-t">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Tous les sujets couverts</h2>
          </div>
          <p className="text-muted-foreground text-sm mb-6">
            Academik couvre l'ensemble des besoins en recherche bibliographique académique — du générateur automatique à la synthèse de littérature.
          </p>
          <div className="flex flex-wrap gap-2">
            {KEYWORDS.map((kw) => (
              <span
                key={kw}
                className="bg-white border border-slate-200 rounded-full px-3 py-1 text-sm text-slate-700 hover:border-primary hover:text-primary transition-colors cursor-default"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats rapides */}
      <section className="py-10 px-4 bg-white border-y">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { val: "12 000+", label: "Étudiants & chercheurs" },
            { val: "85 000+", label: "Bibliographies générées" },
            { val: "4 formats", label: "APA · Vancouver · MLA · Chicago" },
            { val: "< 30 sec", label: "Temps moyen de génération" },
          ].map(s => (
            <div key={s.label} className="flex flex-col items-center gap-1">
              <p className="text-2xl font-bold text-primary">{s.val}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 bg-primary text-white text-center">
        <div className="max-w-2xl mx-auto">
          <Library className="w-10 h-10 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold mb-3">Prêt à générer votre bibliographie ?</h2>
          <p className="text-primary-foreground/80 mb-6">
            Décrivez votre sujet en quelques mots, Academik recherche les sources et génère votre bibliographie dans le format de votre choix.
          </p>
          <Button size="lg" variant="secondary" onClick={() => setLocation("/connexion")} data-testid="button-ressources-cta">
            Commencer — dès 4,99 € <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          <p className="text-xs text-primary-foreground/50 mt-3">Sans abonnement · APA / Vancouver / MLA / Chicago</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-white text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-5 mb-3 flex-wrap text-xs">
          <a href="/cgu" className="hover:text-foreground transition-colors">CGU</a>
          <a href="/cgv" className="hover:text-foreground transition-colors">CGV</a>
          <a href="/rgpd" className="hover:text-foreground transition-colors">RGPD</a>
          <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
        </div>
        © {new Date().getFullYear()} Academik · academik.fr
      </footer>
    </div>
  );
}
